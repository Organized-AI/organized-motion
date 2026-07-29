#!/usr/bin/env bash
# Smoke test the full pipeline against a deployed Worker.
set -euo pipefail
BASE="${MOTION_BASE:-https://motion.organizedai.vip}"

echo "==> health"
curl -sf "$BASE/health" | head -c 200; echo

echo "==> submit a one-shot brief"
BRIEF=$(curl -sf -X POST "$BASE/brief" -H 'content-type: application/json' -d '{
  "title": "qa smoke",
  "shots": [{
    "shotIndex": 0, "beat": "hook",
    "prompt": "close macro push-in on a dark terminal screen, lime cursor blinking",
    "aspect": "9:16", "durationSeconds": 5, "generator": "higgsfield"
  }]
}' | sed -n 's/.*"briefId":"\([^"]*\)".*/\1/p')
echo "brief: $BRIEF"

echo "==> poll brief status (ctrl-c to stop)"
for _ in $(seq 1 20); do
  curl -sf "$BASE/brief/$BRIEF" | head -c 400; echo
  sleep 15
done

echo "==> timeline"
curl -sf "$BASE/timeline/$BRIEF" | head -c 600; echo
