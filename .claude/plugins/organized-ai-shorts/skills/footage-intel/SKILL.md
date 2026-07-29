---
name: footage-intel
description: TwelveLabs indexing, gate scoring, and semantic retrieval across the footage archive. Use when scoring generated shots against a brief, searching archive or workshop footage for a specific moment, tuning gate thresholds, or diagnosing why shots are being rejected.
---

# Footage Intel

The understanding plane sits in the **middle** of the pipeline, not the end.

Most creative stacks generate, edit, publish, then use video understanding
afterwards as a search tool. Here every generated shot is indexed the moment
it lands and scored against the brief before anything reaches composition.
Bad generations die cheap, before render time is spent on them.

## The gate

Three sub-scores, one composite:

| Score | Weight | Question |
|---|---|---|
| motion_quality | 0.3 | Temporal coherence, artifact freedom, camera intent |
| on_brief | 0.3 | Does it depict what the brief asked for |
| hook_match | 0.4 | Does the first 1.5 seconds arrest attention |

Hook carries the heaviest weight deliberately. A technically clean shot that
does not stop a thumb is worthless on a vertical feed.

Default threshold is 65. Below it the shot is marked `gated`, the model's own
`notes` field is appended to the prompt, and the shot is resubmitted, bounded
by `MAX_REGENERATIONS` (2) and the brief cost ceiling.

## Tuning the threshold

Do not tune it by feel. Phase 8 writes `observed_cpa`, `observed_ctr`, and
`observed_thumbstop` back onto the `scores` table, joined on `creative_id`.
Once fifty or so creatives have run, correlate `composite` against
`observed_thumbstop` and move the threshold to where the correlation actually
breaks. Until then, 65 is a placeholder, and say so rather than defending it.

## Archive retrieval

`POST /search` runs semantic search across everything indexed, generated
shots and shot footage alike. This is how workshop multicam footage on the T7
becomes usable b-roll without anyone scrubbing it manually. Same index that
Organized Cuts uses.

Query with visual language, not metadata language. "hands typing while a
terminal scrolls errors" retrieves; "workshop_take_04" does not.

## When shots keep failing the gate

Check in this order:
1. Is the prompt abstract? Abstract prompts fail `on_brief` because there is
   nothing concrete to match.
2. Is the duration under two seconds? Short generations score badly on motion
   coherence across most providers.
3. Is the same beat failing every time? The brief is wrong, not the generator.
   Rewrite the beat rather than burning three regenerations on it.
