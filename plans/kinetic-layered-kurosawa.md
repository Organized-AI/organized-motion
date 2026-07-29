# kinetic-layered-kurosawa

Claude Code plan file for Organized Motion.

## Objective

Ship a creative asset pipeline where video understanding gates generation
before composition, and real ad performance tunes the gate.

## Non-negotiables

- Cloudflare Workers Assets. Never Pages.
- One `GeneratorAdapter` interface. Providers are swappable in one file.
- Cost ceiling enforced before every paid submit. Ack and drop on breach.
- Composition deterministic. Preview and render produce identical frames.
- OpenArt never scraped. Manual ingest lane only.
- No time estimates in any generated document. No em dashes.

## Phase order

0. Bootstrap. Organized Codebase applied, CF resources provisioned.
1. Asset vault. D1 schema, R2 prefixes, provenance and license on every row.
2. Generation router. Adapter interface, Higgsfield, Meshy, manual ingest,
   queue state machine, cost ceiling.
3. Meshy 3D lane. Preview then refine chained, GLB into the vault, MCP wired.
4. TwelveLabs gate. Index on arrival, rubric scoring, bounded regeneration,
   archive search.
5. Composition. timeline.json contract, GSAP seek-driven timeline, Three.js
   GLB layer, caption system, beat ribbon.
6. Render. HyperFrames 9:16 first, RenderSession DO, QA frame set, manifest.
7. Plugin. organized-ai-shorts v0.2.0 with both lanes.
8. Measurement. creative_id propagation, cron performance pull, threshold
   retune on observed thumbstop.

## Open decisions

- Higgsfield plan tier versus the model slugs actually in use.
- Meshy tier: Playground and full endpoints are Pro and above.
- Artlist Enterprise API: sales-gated, manual vault until granted.
- TwelveLabs index: shared with Organized Cuts or dedicated.
- Gate threshold 65 is a placeholder until Phase 8 supplies real correlation.

## Surfaces

- `motion.organizedai.vip` composition stage and API
- `guide.organizedai.vip/organized-motion`
- `wiki.organizedai.vip/organized-motion`
- `arch.organizedai.vip/organized-motion`
- `visual.organizedai.vip/organized-motion`

Register via the `organizedai-vanity-deploy` skill after Phase 6.
