import type { Env, MotionJob } from "../types";
import { getAdapter } from "../adapters";
import { assertUnderCeiling, CostCeilingExceeded } from "../lib/cost";
import { newId } from "../lib/id";
import { assetKey, ingestFromUrl } from "../vault/r2";
import {
  getGeneration, insertGeneration, insertScore, insertShot, updateGeneration,
} from "../vault/db";
import { analyzeAgainstBrief, indexAsset } from "../understanding/twelvelabs";

const GATE_THRESHOLD = 65;
const MAX_POLL_ATTEMPTS = 60;
const MAX_REGENERATIONS = 2;

export async function handleBatch(
  batch: MessageBatch<MotionJob>,
  env: Env,
): Promise<void> {
  for (const msg of batch.messages) {
    try {
      await handleOne(msg.body, env);
      msg.ack();
    } catch (err) {
      if (err instanceof CostCeilingExceeded) {
        console.error(String(err));
        msg.ack(); // deliberate: do not retry into more spend
        continue;
      }
      console.error("motion job failed", err);
      msg.retry();
    }
  }
}

async function handleOne(job: MotionJob, env: Env): Promise<void> {
  switch (job.kind) {
    case "submit": {
      const { shot } = job;
      const adapter = getAdapter(shot.generator);
      await assertUnderCeiling(env, shot.briefId, adapter.estimateCost(shot));

      const generationId = newId("gen");
      const externalJobId = await adapter.submit(env, shot);

      await insertGeneration(env, {
        id: generationId,
        brief_id: shot.briefId,
        generator: shot.generator,
        external_job_id: externalJobId,
        status: "running",
        asset_key: null,
        cost_credits: 0,
        prompt: shot.prompt,
        provenance_json: JSON.stringify(shot),
      });
      await insertShot(env, shot, generationId);
      await env.MOTION_JOBS.send(
        { kind: "poll", generationId, attempt: 0 },
        { delaySeconds: 20 },
      );
      return;
    }

    case "poll": {
      const gen = await getGeneration(env, job.generationId);
      if (!gen || !gen.external_job_id) return;
      const adapter = getAdapter(gen.generator);
      const result = await adapter.poll(env, gen.external_job_id);

      if (result.status === "running") {
        if (job.attempt >= MAX_POLL_ATTEMPTS) {
          await updateGeneration(env, gen.id, { status: "failed" });
          return;
        }
        await env.MOTION_JOBS.send(
          { kind: "poll", generationId: gen.id, attempt: job.attempt + 1 },
          { delaySeconds: Math.min(20 * 2 ** Math.floor(job.attempt / 5), 300) },
        );
        return;
      }

      if (result.status === "failed") {
        await updateGeneration(env, gen.id, { status: "failed" });
        return;
      }

      const shot = JSON.parse(gen.provenance_json);
      const isMesh = result.mediaType === "model/gltf-binary";
      const key = assetKey(
        isMesh ? "glb" : "raw",
        gen.brief_id,
        gen.id,
        isMesh ? "glb" : "mp4",
      );

      if (result.mediaUrl && !result.mediaUrl.startsWith("r2://")) {
        await ingestFromUrl(env, result.mediaUrl, key, result.mediaType ?? "video/mp4");
      }
      await updateGeneration(env, gen.id, {
        status: "succeeded",
        asset_key: key,
        cost_credits: result.costCredits ?? 0,
      });

      // 3D assets skip the video gate. Video goes straight to indexing.
      if (!isMesh) {
        await env.MOTION_JOBS.send({ kind: "index", generationId: gen.id });
      }
      void shot;
      return;
    }

    case "index": {
      const gen = await getGeneration(env, job.generationId);
      if (!gen?.asset_key) return;
      const publicUrl = `https://motion.organizedai.vip/asset/${gen.asset_key}`;
      const taskId = await indexAsset(env, publicUrl);
      await env.MOTION_CACHE.put(`tl:${gen.id}`, taskId, { expirationTtl: 86400 });
      await env.MOTION_JOBS.send(
        { kind: "score", generationId: gen.id },
        { delaySeconds: 60 },
      );
      return;
    }

    case "score": {
      const gen = await getGeneration(env, job.generationId);
      if (!gen) return;
      const videoId = await env.MOTION_CACHE.get(`tl:${gen.id}`);
      if (!videoId) return;

      const scores = await analyzeAgainstBrief(env, videoId, gen.prompt);
      await insertScore(env, gen.id, scores);

      if (scores.composite >= GATE_THRESHOLD) return;

      // GATE FAILURE. Mutate the prompt with the model's own note and requeue,
      // bounded by regeneration count and the brief cost ceiling.
      const shot = JSON.parse(gen.provenance_json);
      const attempts = Number(
        (await env.MOTION_CACHE.get(`regen:${shot.briefId}:${shot.shotIndex}`)) ?? 0,
      );
      await updateGeneration(env, gen.id, { status: "gated" });
      if (attempts >= MAX_REGENERATIONS) return;

      const note = (scores.raw as { notes?: string })?.notes ?? "";
      await env.MOTION_CACHE.put(
        `regen:${shot.briefId}:${shot.shotIndex}`,
        String(attempts + 1),
        { expirationTtl: 86400 },
      );
      await env.MOTION_JOBS.send({
        kind: "submit",
        shot: { ...shot, prompt: `${shot.prompt}. ${note}`.trim() },
      });
      return;
    }
  }
}
