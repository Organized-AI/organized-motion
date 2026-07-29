import type { Env, ShotBrief } from "../types";
import type { GeneratorAdapter, PollResult } from "./types";

/**
 * Meshy 3D lane. Two-step for text-to-3D: preview (geometry) then refine
 * (texturing). This adapter submits preview; the queue consumer chains
 * refine on success. Webhooks are supported and preferred over polling
 * at volume.
 */
export const meshyAdapter: GeneratorAdapter = {
  name: "meshy",

  estimateCost(): number {
    return 20;
  },

  async submit(env: Env, shot: ShotBrief): Promise<string> {
    const isImage = Boolean(shot.referenceImageUrl);
    const path = isImage ? "/image-to-3d" : "/text-to-3d";
    const body = isImage
      ? {
          image_url: shot.referenceImageUrl,
          ai_model: "latest",
          should_remesh: true,
          target_formats: ["glb"],
        }
      : {
          mode: "preview",
          prompt: shot.prompt,
          ai_model: "latest",
          topology: "quad",
          should_remesh: true,
          target_formats: ["glb"],
        };

    const res = await fetch(`${env.MESHY_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MESHY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`meshy submit ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { result?: string };
    if (!json.result) throw new Error("meshy submit returned no task id");
    return json.result;
  },

  async poll(env: Env, externalJobId: string): Promise<PollResult> {
    const res = await fetch(`${env.MESHY_BASE_URL}/text-to-3d/${externalJobId}`, {
      headers: { Authorization: `Bearer ${env.MESHY_API_KEY}` },
    });
    if (!res.ok) throw new Error(`meshy poll ${res.status}: ${await res.text()}`);
    const raw = (await res.json()) as any;

    if (raw.status === "SUCCEEDED") {
      return {
        status: "succeeded",
        mediaUrl: raw?.model_urls?.glb,
        mediaType: "model/gltf-binary",
        costCredits: raw?.consumed_credits ?? 0,
        raw,
      };
    }
    if (raw.status === "FAILED" || raw.status === "CANCELED") {
      return { status: "failed", raw };
    }
    return { status: "running", raw };
  },
};
