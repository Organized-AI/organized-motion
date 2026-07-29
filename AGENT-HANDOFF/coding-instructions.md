# Coding instructions

## Boundaries that must not erode

**The adapter boundary.** Adding a generator is one file in `src/adapters/`
plus a registry entry. If a change requires touching the vault, gate,
composition, or render layers to add a provider, the boundary has broken.
Fix the boundary instead of threading the change through.

**The timeline contract.** Composition reads `timeline.json` and nothing else.
It must never call a generation API, query D1, or filter on gate scores.

**Determinism.** No `Date.now`, `performance.now`, or `Math.random` in
`public/`. Seed any variation from `clip.id`.

## Cost safety is not negotiable

`assertUnderCeiling` before every paid submit. On breach, ack and drop. Never
retry into more spend, never auto-raise the ceiling, never add a "just this
once" bypass. If an agent proposes raising the ceiling as the fix for repeated
gate failures, that is the wrong diagnosis and should be refused.

## Cloudflare rules

- Workers Assets, never CF Pages.
- Wrangler CLI for queues, secrets, D1 migrations, R2 object ops, deploy, and
  KV key ops. MCP cannot do these.
- Every plan document includes an explicit Wrangler CLI Prerequisites section.

## Writing style for generated docs

No time estimates. Phase order carries the sequencing information; day and
week counts are guesses that go stale immediately.

No em dashes.
