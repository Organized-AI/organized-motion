import type { Env, ShotBrief, GeneratorName } from "../types";

export type JobStatus = "running" | "succeeded" | "failed";

export interface PollResult {
  status: JobStatus;
  /** Populated only when status is succeeded. */
  mediaUrl?: string;
  mediaType?: string;
  costCredits?: number;
  raw: unknown;
}

/**
 * Every generator implements this. Swapping Higgsfield for another model
 * provider must not require changes anywhere else in the pipeline.
 */
export interface GeneratorAdapter {
  readonly name: GeneratorName;
  /** Returns the provider-side job id. */
  submit(env: Env, shot: ShotBrief): Promise<string>;
  poll(env: Env, externalJobId: string): Promise<PollResult>;
  /** Estimated credits, checked against the ceiling before submit. */
  estimateCost(shot: ShotBrief): number;
}
