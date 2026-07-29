---
description: Turn an idea, repo, or transcript into a beat-timed shot list for the Organized Motion pipeline
argument-hint: [idea or repo url or transcript path]
---

Use the `motion-brief` skill to convert this into a shot list: $ARGUMENTS

Steps:
1. Identify the single builder-useful claim. One short, one claim.
2. Write the six beats (hook, evidence, mechanism, value, payoff, cta).
3. Assign a generator per shot per the generation-router surface map.
4. Write concrete visual prompts with explicit camera moves. No adjective piles.
5. Sum the credit estimate and compare against the brief ceiling.
6. Emit the `{ title, shots[] }` JSON and show the estimate.

Do not submit anything. Stop at the JSON and wait for confirmation.
