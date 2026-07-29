import type { Env } from "../types";

/**
 * The understanding plane sits in the MIDDLE of the pipeline, not at the end.
 *
 * Conventional stacks generate, edit, publish, and use video understanding
 * afterwards as a search tool. Here every generated shot is indexed the
 * moment it lands and scored against the brief BEFORE anything reaches
 * composition. Bad generations die cheap.
 */

export interface GateScores {
  motion: number;
  onBrief: number;
  hook: number;
  composite: number;
  raw: unknown;
}

const RUBRIC = `You are grading a single generated video shot against a creative brief.
Return ONLY a JSON object, no prose and no markdown fences, with keys:
  motion_quality  0-100  temporal coherence, artifact freedom, camera intent
  on_brief        0-100  does it depict what the brief asked for
  hook_match      0-100  does the first 1.5 seconds arrest attention
  notes           short string, what would you change in the prompt`;

export async function indexAsset(env: Env, videoUrl: string): Promise<string> {
  const res = await fetch(`${env.TWELVELABS_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.TWELVELABS_API_KEY,
    },
    body: JSON.stringify({
      index_id: env.TWELVELABS_INDEX_ID,
      video_url: videoUrl,
    }),
  });
  if (!res.ok) throw new Error(`twelvelabs index ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { _id?: string; id?: string };
  const id = json._id ?? json.id;
  if (!id) throw new Error("twelvelabs index returned no task id");
  return id;
}

export async function analyzeAgainstBrief(
  env: Env,
  videoId: string,
  briefPrompt: string,
): Promise<GateScores> {
  const res = await fetch(`${env.TWELVELABS_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.TWELVELABS_API_KEY,
    },
    body: JSON.stringify({
      video_id: videoId,
      prompt: `${RUBRIC}\n\nBRIEF: ${briefPrompt}`,
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`twelvelabs analyze ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: string };
  const parsed = JSON.parse(String(json.data ?? "{}").replace(/```json|```/g, "").trim());

  const motion = Number(parsed.motion_quality ?? 0);
  const onBrief = Number(parsed.on_brief ?? 0);
  const hook = Number(parsed.hook_match ?? 0);

  // Hook is weighted hardest. A technically clean shot that does not
  // arrest attention in the first beat is worthless on a vertical feed.
  const composite = Math.round(motion * 0.3 + onBrief * 0.3 + hook * 0.4);

  return { motion, onBrief, hook, composite, raw: parsed };
}

/** Semantic retrieval across the whole archive, generated and shot alike. */
export async function search(env: Env, query: string, limit = 10) {
  const res = await fetch(`${env.TWELVELABS_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.TWELVELABS_API_KEY,
    },
    body: JSON.stringify({
      index_id: env.TWELVELABS_INDEX_ID,
      query_text: query,
      search_options: ["visual", "audio"],
      page_limit: limit,
    }),
  });
  if (!res.ok) throw new Error(`twelvelabs search ${res.status}: ${await res.text()}`);
  return res.json();
}
