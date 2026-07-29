---
description: Render a gated timeline to MP4 with HyperFrames and run the QA frame set
argument-hint: [briefId] [aspect]
---

Render this brief: $ARGUMENTS

1. `GET $MOTION_BASE/timeline/<briefId>`. Confirm every clip is a gate survivor.
2. Preview at `motion.organizedai.vip/?brief=<briefId>` and check the beat
   ribbon for amber segments before spending render time.
3. Render 9:16 first with HyperFrames. Node 22+ and FFmpeg required.
4. Pull the QA frame set: hook at 0.5s, midpoint, payoff, final frame.
5. Generate the contact sheet and scan for repeated compositions.
6. Only after 9:16 passes, render 1:1 and 16:9.
7. Verify a license row exists for every third-party asset key in the render.
8. Emit `manifest.json` with the `creative_id` that carries into the ad platform.

Use the `render-qa` and `motion-comp` skills.
