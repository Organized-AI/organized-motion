---
name: generation-router
description: Choose the right generation surface per shot and submit it. Covers Higgsfield REST, Meshy REST, and the OpenArt Director manual ingest lane. Use when submitting shots for generation, debugging a stuck generation job, or deciding which video tool to use for a given piece of work.
---

# Generation Router

Three surfaces, three very different integration shapes. Picking wrong here
is the most common way this pipeline breaks.

## Surface map

| Surface | Integration | Headless | Use for |
|---|---|---|---|
| Higgsfield | REST, submit then poll, `cloud.higgsfield.ai` | Yes | Batch shot generation, variants, i2v from stills |
| Meshy | REST `api.meshy.ai/openapi/v2`, bearer, webhooks | Yes | 3D props, characters, objects, GLB out |
| OpenArt Director | OAuth MCP `mcp.openart.ai/mcp` | No | Hero narrative pieces up to five minutes, character consistency |
| Artlist | Enterprise API, sales-gated | Yes when granted | Licensed music beds, SFX, Clearlist protection |

## The OpenArt rule

OpenArt Director has no public REST API. It exposes an OAuth MCP server, which
makes it agent-in-the-loop.

**Do not drive the OpenArt web UI with Playwright.** Community wrappers exist
and they ship placeholder DOM selectors precisely because the UI moves. That
breakage lands in production.

Correct pattern: direct OpenArt inside an agent session using the MCP
connector, export the file, then register it through the manual ingest lane
(`POST /ingest`, then `PUT /ingest/upload`). Once in the vault it is
indistinguishable from an API-generated asset to every downstream plane.

Reach for Director when the piece needs sustained character and brand
consistency across a long cut. Reach for Higgsfield when you need forty
variants of a two second hook.

## Adapter contract

Every generator implements `GeneratorAdapter` in `src/adapters/types.ts`:
`submit`, `poll`, `estimateCost`. Adding a fourth provider means adding one
file and one registry entry. Nothing downstream changes. Preserve this.

## Cost ceiling

`assertUnderCeiling` runs before every submit. On breach the job is acked and
dropped, never retried. A regeneration loop against a paid video model is the
most expensive failure mode in this system, and retry semantics are how it
happens silently.

Override per brief: `wrangler kv key put ceiling:<briefId> 800 --binding MOTION_CACHE --remote`

## Debugging a stuck job

1. `SELECT * FROM generations WHERE status = 'running' ORDER BY created_at` in D1.
2. Check `external_job_id` against the provider directly with curl.
3. Poll backoff caps at 300s and MAX_POLL_ATTEMPTS at 60. Past that the job
   is marked failed rather than looping forever.
4. If the provider succeeded but the vault is empty, the R2 ingest failed.
   Provider URLs expire, so re-poll will not help. Resubmit.
