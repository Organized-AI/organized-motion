---
name: 3d-asset-lane
description: Meshy text-to-3D and image-to-3D generation, remeshing, rigging, and GLB delivery into the asset vault for Three.js composition. Use when a shot needs a 3D prop, character, or system object rather than generated video, or when building architectural or systems visuals for a short.
---

# 3D Asset Lane

Meshy is the cleanest integration of the four generation surfaces: bearer
auth, async task endpoints, webhook support, an official MCP server, and
published skill files for Claude Code. Start here when you want something
working quickly.

## When 3D beats video generation

- The subject is an **object or system** rather than a scene. Architecture
  diagrams, hardware, protocol topologies.
- You need the **same asset across multiple shots** at different angles.
  Generate once, re-camera in Three.js, get perfect consistency for free.
- The shot needs **deterministic motion**. A GSAP-driven camera orbit repeats
  exactly; a generated pan does not.

## Workflow

Text to 3D is two steps. Preview generates untextured geometry; refine
textures it. The queue consumer chains them.

```
POST /text-to-3d   { mode: "preview", prompt, ai_model: "latest",
                     topology: "quad", should_remesh: true,
                     target_formats: ["glb"] }
  -> task id -> poll until SUCCEEDED
POST /text-to-3d   { mode: "refine", preview_task_id }
  -> GLB url -> ingest to R2 under glb/<briefId>/<genId>.glb
```

Image to 3D is one step and takes a Higgsfield still as input, which is how
you keep a generated character consistent between the video and 3D lanes.

## Plan gating

The API Playground and full endpoint set are gated to Pro, Studio, and
Enterprise. A free tier key will not carry this lane. Confirm the tier before
building against endpoints you cannot call.

`meshy-4` is retired. Use `meshy-6` or `latest`.

## Handoff to composition

GLB lands in R2 under the `glb/` prefix and is loaded by the Three.js layer in
`public/index.html`. Scene defaults follow the Organized AI architectural
standard: `OrthographicCamera(16,12,16)`, `FogExp2`, lime key light on
near-black.

Keep `target_polycount` low enough that the GLB loads inside the render
budget. A prop that stalls the HyperFrames render is worse than a simpler prop.

## MCP

Meshy ships an official MCP server. Wire it into `.claude/` so an agent can
generate props mid-conversation rather than round-tripping through the queue
for one-offs.
