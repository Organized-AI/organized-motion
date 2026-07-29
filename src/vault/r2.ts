import type { Env } from "../types";

export type Lane = "raw" | "glb" | "audio" | "render";

export function assetKey(lane: Lane, briefId: string, id: string, ext: string): string {
  return `${lane}/${briefId}/${id}.${ext}`;
}

/**
 * Pull a provider-hosted result into the vault. Provider URLs expire;
 * anything the pipeline depends on downstream must live in R2.
 */
export async function ingestFromUrl(
  env: Env,
  url: string,
  key: string,
  contentType: string,
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`vault ingest failed ${res.status} for ${url}`);
  }
  await env.MOTION_ASSETS.put(key, res.body, {
    httpMetadata: { contentType },
  });
}

export async function signedRead(env: Env, key: string): Promise<R2ObjectBody | null> {
  return env.MOTION_ASSETS.get(key);
}
