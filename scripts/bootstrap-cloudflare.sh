#!/usr/bin/env bash
# Wrangler CLI Prerequisites. MCP cannot create these.
# Run once, then paste the returned ids into wrangler.toml.
set -euo pipefail

echo "==> D1"
wrangler d1 create organized-motion || true

echo "==> R2"
wrangler r2 bucket create organized-motion-assets || true

echo "==> KV"
wrangler kv namespace create MOTION_CACHE || true

echo "==> Queues"
wrangler queues create motion-jobs || true
wrangler queues create motion-jobs-dlq || true

echo "==> Secrets (interactive)"
for s in HIGGSFIELD_API_KEY HIGGSFIELD_SECRET MESHY_API_KEY \
         TWELVELABS_API_KEY TWELVELABS_INDEX_ID ARTLIST_API_KEY \
         WEBHOOK_SIGNING_SECRET; do
  echo "--- $s"
  wrangler secret put "$s"
done

echo "==> Migrations"
wrangler d1 migrations apply organized-motion --remote

echo "==> Deploy (Workers Assets, never Pages)"
wrangler deploy

cat <<'NOTE'

Next:
  wrangler triggers deploy
  Route motion.organizedai.vip to this Worker in the dashboard or via
  the organizedai-vanity-router, then register guide/wiki/arch surfaces
  with the organizedai-vanity-deploy skill.
NOTE
