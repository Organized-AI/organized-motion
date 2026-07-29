export interface Env {
  MOTION_DB: D1Database;
  MOTION_ASSETS: R2Bucket;
  MOTION_CACHE: KVNamespace;
  MOTION_JOBS: Queue<MotionJob>;
  RENDER_SESSION: DurableObjectNamespace;
  ASSETS: Fetcher;

  HIGGSFIELD_BASE_URL: string;
  MESHY_BASE_URL: string;
  TWELVELABS_BASE_URL: string;
  ARTLIST_BASE_URL: string;
  MOTION_COST_CEILING_CREDITS: string;
  GTM_CONTAINER_ID: string;
  GA4_MEASUREMENT_ID: string;

  // wrangler secret put
  HIGGSFIELD_API_KEY: string;
  HIGGSFIELD_SECRET: string;
  MESHY_API_KEY: string;
  TWELVELABS_API_KEY: string;
  TWELVELABS_INDEX_ID: string;
  ARTLIST_API_KEY: string;
  WEBHOOK_SIGNING_SECRET: string;
}

export type Aspect = "9:16" | "1:1" | "16:9";

/** A single shot request. The unit of work for the generation plane. */
export interface ShotBrief {
  briefId: string;
  shotIndex: number;
  beat: "hook" | "evidence" | "mechanism" | "value" | "payoff" | "cta";
  prompt: string;
  aspect: Aspect;
  durationSeconds: number;
  referenceImageUrl?: string;
  motionPreset?: string;
  generator: GeneratorName;
}

export type GeneratorName = "higgsfield" | "meshy" | "manual";

export type MotionJob =
  | { kind: "submit"; shot: ShotBrief }
  | { kind: "poll"; generationId: string; attempt: number }
  | { kind: "index"; generationId: string }
  | { kind: "score"; generationId: string };

export interface GenerationRecord {
  id: string;
  brief_id: string;
  generator: GeneratorName;
  external_job_id: string | null;
  status: "queued" | "running" | "succeeded" | "failed" | "gated";
  asset_key: string | null;
  cost_credits: number;
  prompt: string;
  provenance_json: string;
  created_at: string;
}
