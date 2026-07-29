import type { Env } from "../types";
import { spendSoFar } from "../vault/db";

export class CostCeilingExceeded extends Error {
  constructor(briefId: string, spent: number, ceiling: number) {
    super(`brief ${briefId} at ${spent} credits, ceiling ${ceiling}. Halting.`);
    this.name = "CostCeilingExceeded";
  }
}

/**
 * Hard fail, never silent retry. A runaway regeneration loop against a
 * paid video model is the most expensive failure mode in this pipeline.
 */
export async function assertUnderCeiling(
  env: Env,
  briefId: string,
  estimate: number,
): Promise<void> {
  const ceiling = Number(env.MOTION_COST_CEILING_CREDITS ?? 500);
  const override = await env.MOTION_CACHE.get(`ceiling:${briefId}`);
  const effective = override ? Number(override) : ceiling;
  const spent = await spendSoFar(env, briefId);
  if (spent + estimate > effective) {
    throw new CostCeilingExceeded(briefId, spent + estimate, effective);
  }
}
