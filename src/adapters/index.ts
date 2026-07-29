import type { GeneratorName } from "../types";
import type { GeneratorAdapter } from "./types";
import { higgsfieldAdapter } from "./higgsfield";
import { meshyAdapter } from "./meshy";
import { manualIngestAdapter } from "./manual-ingest";

const registry: Record<GeneratorName, GeneratorAdapter> = {
  higgsfield: higgsfieldAdapter,
  meshy: meshyAdapter,
  manual: manualIngestAdapter,
};

export function getAdapter(name: GeneratorName): GeneratorAdapter {
  const a = registry[name];
  if (!a) throw new Error(`unknown generator: ${name}`);
  return a;
}

export type { GeneratorAdapter, PollResult } from "./types";
