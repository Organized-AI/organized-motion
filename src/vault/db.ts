import type { Env, GenerationRecord, ShotBrief } from "../types";

export async function insertGeneration(
  env: Env,
  gen: Omit<GenerationRecord, "created_at">,
): Promise<void> {
  await env.MOTION_DB.prepare(
    `INSERT INTO generations
      (id, brief_id, generator, external_job_id, status, asset_key,
       cost_credits, prompt, provenance_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      gen.id, gen.brief_id, gen.generator, gen.external_job_id, gen.status,
      gen.asset_key, gen.cost_credits, gen.prompt, gen.provenance_json,
    )
    .run();
}

export async function updateGeneration(
  env: Env,
  id: string,
  patch: Partial<Pick<GenerationRecord, "status" | "asset_key" | "cost_credits" | "external_job_id">>,
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  if (!sets.length) return;
  vals.push(id);
  await env.MOTION_DB.prepare(
    `UPDATE generations SET ${sets.join(", ")} WHERE id = ?`,
  ).bind(...vals).run();
}

export async function getGeneration(env: Env, id: string) {
  return env.MOTION_DB.prepare(`SELECT * FROM generations WHERE id = ?`)
    .bind(id)
    .first<GenerationRecord>();
}

export async function insertShot(env: Env, shot: ShotBrief, generationId: string) {
  await env.MOTION_DB.prepare(
    `INSERT INTO shots (brief_id, shot_index, beat, aspect, duration_s, generation_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(shot.briefId, shot.shotIndex, shot.beat, shot.aspect, shot.durationSeconds, generationId)
    .run();
}

export async function insertScore(
  env: Env,
  generationId: string,
  scores: { motion: number; onBrief: number; hook: number; composite: number; raw: unknown },
) {
  await env.MOTION_DB.prepare(
    `INSERT INTO scores
      (generation_id, motion_quality, on_brief, hook_match, composite, raw_json, scored_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      generationId, scores.motion, scores.onBrief, scores.hook, scores.composite,
      JSON.stringify(scores.raw),
    )
    .run();
}

export async function spendSoFar(env: Env, briefId: string): Promise<number> {
  const row = await env.MOTION_DB.prepare(
    `SELECT COALESCE(SUM(cost_credits), 0) AS total FROM generations WHERE brief_id = ?`,
  ).bind(briefId).first<{ total: number }>();
  return row?.total ?? 0;
}
