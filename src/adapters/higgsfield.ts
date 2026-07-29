import type { Env, ShotBrief } from "../types";
import type { GeneratorAdapter, PollResult } from "./types";

/**
 * Higgsfield is the programmatic spine of the generation plane.
 * Async submit then poll. Verify the exact request shape and model slugs
 * against your plan tier before first production run: the publicly listed
 * model catalogue and the API-accessible catalogue are not identical.
 */
export const higgsfieldAdapter: GeneratorAdapter = {
  name: "higgsfield",

  estimateCost(shot: ShotBrief): number {
    // Rough guard, not billing truth. Replace with tier-accurate table.
    return Math.ceil(shot.durationSeconds) * 5;
  },

  async submit(env: Env, shot: ShotBrief): Promise<string> {
    const mode = shot.referenceImageUrl ? "image2video" : "text2video";
    const res = await fetch(`${env.HIGGSFIELD_BASE_URL}/v1/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "hf-api-key": env.HIGGSFIELD_API_KEY,
        "hf-secret": env.HIGGSFIELD_SECRET,
      },
      body: JSON.stringify({
        params: {
          prompt: shot.prompt,
          motions: shot.motionPreset ? [{ id: shot.motionPreset }] : undefined,
          input_images: shot.referenceImageUrl
            ? [{ type: "image_url", image_url: shot.referenceImageUrl }]
            : undefined,
          enhance_prompt: true,
          aspect_ratio: shot.aspect,
          duration: shot.durationSeconds,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`higgsfield submit ${res.status}: ${await res.text()}`);
    }
    const body = (await res.json()) as { id?: string; job_set_id?: string };
    const id = body.id ?? body.job_set_id;
    if (!id) throw new Error("higgsfield submit returned no job id");
    return id;
  },

  async poll(env: Env, externalJobId: string): Promise<PollResult> {
    const res = await fetch(
      `${env.HIGGSFIELD_BASE_URL}/v1/job-sets/${externalJobId}`,
      {
        headers: {
          "hf-api-key": env.HIGGSFIELD_API_KEY,
          "hf-secret": env.HIGGSFIELD_SECRET,
        },
      },
    );
    if (!res.ok) {
      throw new Error(`higgsfield poll ${res.status}: ${await res.text()}`);
    }
    const raw = (await res.json()) as any;
    const job = raw?.jobs?.[0] ?? raw;
    const state = String(job?.status ?? "").toLowerCase();

    if (["completed", "succeeded", "success"].includes(state)) {
      return {
        status: "succeeded",
        mediaUrl: job?.results?.raw?.url ?? job?.output?.media_url?.[0],
        mediaType: "video/mp4",
        costCredits: job?.consumed_credits ?? 0,
        raw,
      };
    }
    if (["failed", "error", "canceled"].includes(state)) {
      return { status: "failed", raw };
    }
    return { status: "running", raw };
  },
};
