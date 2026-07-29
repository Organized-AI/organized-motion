# Wrangler CLI Prerequisites

MCP can read KV, D1, and R2 and list Workers. It cannot create queues, set
secrets, run D1 migrations, perform R2 object operations, deploy, or manage
Workers Assets. Those require the Wrangler CLI.

```bash
wrangler d1 create organized-motion
wrangler r2 bucket create organized-motion-assets
wrangler kv namespace create MOTION_CACHE
wrangler queues create motion-jobs
wrangler queues create motion-jobs-dlq

wrangler secret put HIGGSFIELD_API_KEY
wrangler secret put HIGGSFIELD_SECRET
wrangler secret put MESHY_API_KEY
wrangler secret put TWELVELABS_API_KEY
wrangler secret put TWELVELABS_INDEX_ID
wrangler secret put ARTLIST_API_KEY
wrangler secret put WEBHOOK_SIGNING_SECRET

wrangler d1 migrations apply organized-motion --remote
wrangler deploy
wrangler triggers deploy
```

Paste the `database_id` and KV `id` returned by the create commands into
`wrangler.toml` before the first deploy.

Account `691fe25d377abac03627d6a88d3eeac9`, zone
`446a0461f84d37aba20abc5834480783`.

Never use Cloudflare Pages deploy. Static and doc surfaces ship as Workers
Assets via the `[assets]` block, routed on a custom subdomain.
