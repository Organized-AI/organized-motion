---
description: Submit a shot list to the Organized Motion Worker and watch the generation queue
argument-hint: [path to brief json]
---

Submit this brief to the Organized Motion pipeline: $ARGUMENTS

1. Validate against `SPECIFICATIONS/shot-brief.md`. Reject anything missing
   `generator`, `aspect`, or `durationSeconds`.
2. Confirm the total credit estimate with the user before any paid call.
3. `POST $MOTION_BASE/brief` with the payload. Capture the `briefId`.
4. Poll `GET $MOTION_BASE/brief/<briefId>` and report status transitions.
5. Report per shot: generator, status, cost, composite gate score.
6. Flag any shot marked `gated` with the model's notes and ask whether to
   accept the regeneration or rewrite the beat.

Never bypass the cost ceiling. If a job is dropped for breaching it, say so
plainly rather than resubmitting.
