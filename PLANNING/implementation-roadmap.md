# Implementation Roadmap

Phase order. No durations: sequence is the real constraint.

## Phase 0. Bootstrap
Organized Codebase applied. `.claude/` plugin components wired, including the
extended `organized-ai-shorts` plugin. Cloudflare resources provisioned via
`scripts/bootstrap-cloudflare.sh`. Ids pasted into `wrangler.toml`.

**Exit:** `wrangler deploy` succeeds and `/health` returns ok.

## Phase 1. Asset vault
D1 migration applied. R2 prefix convention live. Every write records
provenance, cost, and license state.

**Exit:** a manually uploaded file is retrievable through `/asset/*` and has a
license row.

## Phase 2. Generation router
`GeneratorAdapter` interface with Higgsfield, Meshy, and manual ingest
implementations. Queue consumer running the submit, poll, ingest state
machine. Cost ceiling enforced before submit.

**Exit:** `POST /brief` with one shot produces an MP4 in the vault.

## Phase 3. Meshy 3D lane
Text-to-3D preview then refine chained. Image-to-3D seeded from a Higgsfield
still. GLB landing under `glb/`. Meshy MCP wired into `.claude/`.

**Exit:** a GLB loads in the Three.js layer of the composition stage.

## Phase 4. TwelveLabs gate
Auto-index on generation success. Rubric scoring. Threshold at 65 with
bounded prompt-mutation regeneration. `POST /search` live over the archive.

**Exit:** a deliberately weak prompt gets gated and regenerated once, then
stops at the cap rather than looping.

## Phase 5. Composition
`GET /timeline/:briefId` emits survivors only. GSAP timeline paused and
seek-driven. Three.js GLB layer. Caption system. Beat ribbon showing real
duration and real gate scores.

**Exit:** preview at `?brief=` plays a full cut and the ribbon flags gated
beats before playback.

## Phase 6. Render and delivery
HyperFrames render at 9:16, then 1:1 and 16:9. RenderSession DO resumable.
QA frame set and contact sheet. `manifest.json` with `creative_id`.

**Exit:** two consecutive renders of the same brief are frame identical.

## Phase 7. Plugin consolidation
`organized-ai-shorts` v0.2.0 shipping both lanes. Six new skills, three
commands, two agents, cost-ceiling hook. Published to the Organized AI
plugin marketplace.

**Exit:** the plugin installs clean into a fresh Organized Codebase project.

## Phase 8. Measurement loop
`creative_id` propagated into Meta and Google Ads. GTM dataLayer push on
delivery. Cron pulls performance and writes `observed_*` onto scores.

**Exit:** gate threshold moved off 65 based on observed thumbstop correlation
rather than taste.

## Dependencies to resolve before Phase 2

1. Higgsfield plan tier. The public model catalogue and the API-accessible
   catalogue differ. Confirm which motion presets your key unlocks.
2. Meshy plan. The Playground and full endpoint set are gated to Pro, Studio,
   and Enterprise. Free tier will not carry Phase 3.
3. Artlist Enterprise API. Sales conversation required. Phase 1 treats Artlist
   as a manual vault until granted.
4. TwelveLabs index id. Reuse the Organized Cuts index or create a dedicated
   one, but decide before Phase 4 so archive retrieval spans both.
