# organized-ai-shorts (v0.2.0)

Two lanes under one plugin.

**Lane A, reference-driven.** `reel-ingestion-and-variation` ingests existing
Shorts and Reels, derives structure, and produces materially original
Organized AI variants. Unchanged from v0.1.

**Lane B, generation-driven.** The Organized Motion pipeline. A brief fans
into generated shots, every shot is gated by TwelveLabs before composition,
survivors are composed with GSAP and rendered by HyperFrames.

Both lanes converge on the same output contract: `manifest.json`, original
script, beat-timed shot list, rendered MP4, contact sheet, QA frames.

## Skills

| Skill | Lane | Purpose |
|---|---|---|
| `reel-ingestion-and-variation` | A | Ingest references, derive patterns, produce variants |
| `motion-brief` | B | Turn an idea into a six-beat shot list JSON |
| `generation-router` | B | Choose the generator per shot and submit |
| `footage-intel` | B | TwelveLabs indexing, gating, archive retrieval |
| `3d-asset-lane` | B | Meshy text/image to 3D, GLB into the vault |
| `motion-comp` | B | timeline.json to GSAP and Three.js composition |
| `render-qa` | B | HyperFrames render, contact sheet, QA frames |

## Commands

`/motion-brief` `/motion-generate` `/motion-render`

## Install

Copy into `.claude/plugins/organized-ai-shorts/` in any Organized Codebase
project, or add the repo as a plugin marketplace entry.
