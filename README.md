# Organized Motion

Higgsfield + OpenArt + Meshy + Artlist + TwelveLabs + GSAP + HyperFrames,
orchestrated on Cloudflare Workers and packaged into the
`organized-ai-shorts` Claude Code plugin.

## Quick start

```bash
pnpm install
bash scripts/bootstrap-cloudflare.sh   # creates D1/R2/KV/Queues, sets secrets, deploys
```

Paste the returned D1 `database_id` and KV `id` into `wrangler.toml` before
the first deploy.

## Use it

```bash
# 1. plan
claude --dangerously-skip-permissions
/motion-brief https://github.com/Organized-AI/organized-motion

# 2. generate
/motion-generate ./brief.json

# 3. preview the gate before spending render time
open "https://motion.organizedai.vip/?brief=brief_xxx"

# 4. render
/motion-render brief_xxx 9:16
```

## Endpoints

| Route | Purpose |
|---|---|
| `POST /brief` | Fan a shot list into the generation queue |
| `GET /brief/:id` | Generation status with gate scores |
| `GET /timeline/:briefId` | timeline.json for composition, survivors only |
| `GET /asset/*` | Stream an asset from the vault |
| `POST /search` | Semantic retrieval across the archive |
| `POST /ingest` | Register an OpenArt Director export |
| `POST /webhook/meshy` | Meshy task completion |

See `ARCHITECTURE/system-design.md` for the full picture and
`PLANNING/implementation-roadmap.md` for phase order.
