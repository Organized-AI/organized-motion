import type { Env, ShotBrief } from "../types";
import type { GeneratorAdapter, PollResult } from "./types";

/**
 * OpenArt Director has no public REST API. It exposes an OAuth MCP server
 * at https://mcp.openart.ai/mcp, which makes it agent-in-the-loop rather
 * than headless.
 *
 * Do NOT drive the OpenArt web UI with Playwright. Community wrappers that
 * do this ship placeholder DOM selectors because the UI changes, and that
 * breakage lands in your production pipeline.
 *
 * Instead: direct OpenArt in an agent session, export the file, and register
 * it here. The vault treats it identically to an API-generated asset once
 * ingested, so downstream planes never learn the difference.
 */
export const manualIngestAdapter: GeneratorAdapter = {
  name: "manual",

  estimateCost(): number {
    return 0;
  },

  async submit(_env: Env, shot: ShotBrief): Promise<string> {
    return `manual:${shot.briefId}:${shot.shotIndex}`;
  },

  async poll(env: Env, externalJobId: string): Promise<PollResult> {
    const staged = await env.MOTION_CACHE.get(`ingest:${externalJobId}`, "json");
    if (!staged) return { status: "running", raw: null };
    const s = staged as { assetKey: string; mediaType: string };
    return {
      status: "succeeded",
      mediaUrl: `r2://${s.assetKey}`,
      mediaType: s.mediaType,
      costCredits: 0,
      raw: staged,
    };
  },
};
