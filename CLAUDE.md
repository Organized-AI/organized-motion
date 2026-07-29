# Organized Motion

Creative asset pipeline on Cloudflare Workers. A brief fans into generated
shots, every shot is gated by TwelveLabs before composition, survivors are
composed with GSAP and rendered by HyperFrames.

Bootstrapped from Organized Codebase. Plugin components live in
`.claude/plugins/organized-ai-shorts/`.

## The architectural thesis

The understanding plane sits in the **middle** of the pipeline, not at the end.
Conventional stacks generate, edit, publish, and use video understanding
afterwards as a search tool. Here every shot is indexed on arrival and scored
against the brief before anything reaches render. Bad generations die cheap.

Phase 8 closes the loop: real ad performance flows back onto gate scores by
`creative_id`, so thresholds tune on CPA rather than taste.

## Surface rules

- **Higgsfield** is the programmatic generator. REST, submit then poll.
- **Meshy** is the 3D lane. REST, webhooks, official MCP.
- **OpenArt Director** is OAuth MCP only, agent-in-the-loop. Never scrape its
  UI with Playwright. Use the manual ingest lane instead.
- **Artlist** Enterprise API is sales-gated. Until granted, it is a licensed
  vault in R2 with metadata in D1.
- **TwelveLabs** is the gate and the archive retrieval layer.

## Build rules

- Cloudflare Workers Assets only. Never CF Pages.
- Wrangler CLI required for queues, secrets, D1 migrations, R2 object ops,
  Workers Assets deploy, and KV key ops. MCP cannot do these.
- All secrets via `wrangler secret put`. Never committed.
- Adding a generator means one file in `src/adapters/` plus a registry entry.
  Nothing downstream changes. Preserve that boundary.
- Composition must be deterministic. No wall-clock time, no unseeded random.
- No time estimates in generated documentation. Phase order only.
- No em dashes in generated copy.

## Cost safety

`assertUnderCeiling` runs before every paid submit. On breach the job is
acked and dropped, never retried. A regeneration loop against a paid video
model is the most expensive failure mode here, and retry semantics are how it
happens quietly. Do not add automatic ceiling raises.

## Layout

```
src/adapters/       generator adapters behind one interface
src/queue/          submit, poll, index, score state machine
src/understanding/  TwelveLabs gate and search
src/vault/          D1 and R2 access
src/do/             RenderSession durable object
public/             composition stage, Workers Assets
migrations/         D1 schema
```
