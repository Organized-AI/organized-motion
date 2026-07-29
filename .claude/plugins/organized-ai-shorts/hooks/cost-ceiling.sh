#!/usr/bin/env bash
# Blocks a shell call that would hit a paid generation endpoint while the
# current brief is already at or over its credit ceiling.
#
# The pipeline enforces this server side too. This hook exists so an agent
# improvising a curl outside the queue cannot route around it.

set -uo pipefail
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || echo "")

case "$CMD" in
  *higgsfield*|*api.meshy.ai*|*platform.higgsfield*)
    STATE="${MOTION_STATE_FILE:-$HOME/.claude/organized-motion-spend.json}"
    if [ -f "$STATE" ]; then
      OVER=$(python3 - "$STATE" <<'PY'
import json,sys
try:
    d=json.load(open(sys.argv[1]))
    print("1" if float(d.get("spent",0)) >= float(d.get("ceiling",500)) else "0")
except Exception:
    print("0")
PY
)
      if [ "$OVER" = "1" ]; then
        echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Organized Motion cost ceiling reached for this brief. Raise it deliberately with wrangler kv key put ceiling:<briefId>, or stop."}}'
        exit 0
      fi
    fi
    ;;
esac

exit 0
