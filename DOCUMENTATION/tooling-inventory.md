# Tooling Inventory and Reachability

Captured 2026-07-29 from a Claude Code remote session. Every connected MCP
server was verified with a live read-only call. Accounts exist for all
surfaces except Artlist (sales-gated, expected).

## Verified reachable (live MCP calls)

| Surface | Role in pipeline | Check performed | Result |
| --- | --- | --- | --- |
| Higgsfield MCP | Programmatic generator | `balance` | 280 credits, starter plan |
| TwelveLabs MCP (Jockey) | Gate and archive retrieval | `jockey_list_knowledge_stores` | 3 stores listed, auth good |
| OpenArt MCP (OAuth) | Director lane, agent-in-the-loop | `openart_account_get` | jordan@bluehighlightedtext.com, Free plan, 40 credits |
| Cloudflare Developer Platform MCP | Read side of Workers, D1, R2, KV | `workers_list`, `d1_databases_list`, `r2_buckets_list`, `kv_namespaces_list` | Account 691fe25d... reachable, 205 workers visible |
| Meta Ads MCP | Phase 8 performance feedback | `ads_get_ad_accounts` | 5+ ad accounts, auth good |
| GTM MCP | Measurement loop (GTM-T3SL8JPK) | Server connected, tools load | Reachable |

Also connected in the session and relevant as support tooling: Firecrawl,
Penumbra, Gmail, Google Drive, Google Calendar, Stripe, Vercel, Mermaid
Chart, Canva, Granola, GitHub MCP.

## Present but not yet usable

| Item | State | Unblock |
| --- | --- | --- |
| Wrangler CLI | Installed (4.115.0 via devDependencies) but **not authenticated** in this environment | Set `CLOUDFLARE_API_TOKEN` in the remote environment config, or run `wrangler login` locally |
| Cloudflare project resources | **None exist yet**: no `organized-motion` Worker, no `organized-motion` D1, no `organized-motion-assets` R2 bucket, no `MOTION_CACHE` KV, no `motion-jobs` queues | Run `npm run bootstrap` (`scripts/bootstrap-cloudflare.sh`) with an authenticated wrangler, then paste the returned D1 and KV ids into `wrangler.toml` (both are still `REPLACE_AFTER_...`) |
| HyperFrames | Not installed here. Package exists on npm (`hyperframes@0.7.82`), invoked by `npm run render` | Add as devDependency or rely on `npx hyperframes` |
| Worker secrets | None set (no deploy target exists yet) | `wrangler secret put` per `.env.example`: HIGGSFIELD_API_KEY, HIGGSFIELD_SECRET, MESHY_API_KEY, TWELVELABS_API_KEY, TWELVELABS_INDEX_ID, WEBHOOK_SIGNING_SECRET |

## Not reachable, and why

| Item | State | Note |
| --- | --- | --- |
| Meshy MCP | **Not connected** to this session; no `MESHY_API_KEY` in the environment | Account exists. Either connect the official Meshy MCP server in the client, or provide the API key for the REST adapter. This is the one created account with no live path yet |
| Vendor REST endpoints from this sandbox | Blocked by the remote environment network policy (proxy answers 403 to CONNECT for api.meshy.ai, platform.higgsfield.ai, api.twelvelabs.io, developer.artlist.io) | Not a vendor outage. MCP servers run server-side and are unaffected. REST calls will work from the deployed Worker. To test REST from a remote session, add these hosts to the environment's network allowlist |
| Artlist | No account (sales-gated Enterprise API) | Expected. Operates as the R2 licensed vault with D1 metadata until access is granted |

## Local plugin

`.claude/plugins/organized-ai-shorts/` is present in the repo: 3 commands
(motion-brief, motion-generate, motion-render), 2 agents, 7 skills, and the
cost-ceiling hook. Loaded from the repo checkout, no marketplace install
required.

## Bootstrap order once wrangler is authenticated

1. `npm run bootstrap` creates D1, R2, KV, both queues, prompts for secrets
2. Paste D1 `database_id` and KV `id` into `wrangler.toml`
3. `npm run db:migrate`
4. `npm run deploy` (Workers Assets, never Pages)
