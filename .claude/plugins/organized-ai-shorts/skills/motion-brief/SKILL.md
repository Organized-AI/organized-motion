---
name: motion-brief
description: Turn a raw idea, repo, product, or transcript into a beat-timed shot list JSON that the Organized Motion generation pipeline can execute. Use when the user asks to plan a short, script a reel, build a shot list, or says "brief this" for video. Produces the input contract for /motion-generate.
---

# Motion Brief

The pipeline executes shots, not vibes. This skill converts an idea into a
`ShotBrief[]` that the generation router can fan into a queue.

## Beat structure

Default to the Organized AI six-beat structure. Times are the 22 second
default; scale proportionally for 20 to 30 second cuts.

| Beat | Window | Job |
|---|---|---|
| hook | 0 to 1.5s | Arrest attention. One visual claim, no setup. |
| evidence | 1.5 to 5s | Show the artifact. Repo, terminal, dashboard, product. |
| mechanism | 5 to 10s | How it actually works. The part other channels skip. |
| value | 10 to 16.5s | What the builder gets. Concrete, not aspirational. |
| payoff | 16.5 to 21s | The result on screen. |
| cta | 21 to 22.5s | One action. |

Apply the `hook-em` skill to the hook and cta beats if it is available.

## Generator selection per beat

- **hook, payoff**: `higgsfield`. Highest motion quality demand, worth the credits.
- **evidence**: usually screen capture or `manual` ingest, not generated.
- **mechanism**: `meshy` if the concept is a system or object that reads better
  in 3D; `higgsfield` otherwise.
- **value, cta**: composition and typography carry these. Generate a plate only
  if the beat needs motion behind text.

## Output contract

Emit JSON matching `SPECIFICATIONS/shot-brief.md`:

```json
{
  "title": "string",
  "shots": [{
    "shotIndex": 0,
    "beat": "hook",
    "prompt": "concrete visual description, camera move, lighting, subject",
    "aspect": "9:16",
    "durationSeconds": 1.5,
    "generator": "higgsfield",
    "motionPreset": "optional provider preset id",
    "referenceImageUrl": "optional, triggers image-to-video"
  }]
}
```

## Prompt discipline

Generation models reward concrete nouns and camera language, and punish
adjectives. Write "macro push-in on a mechanical keyboard, single lime key
lit, shallow depth" rather than "a beautiful cinematic shot of coding."

State the camera move explicitly. If you do not, the model picks one, and
your cuts will fight each other.

## Cost awareness

Sum `durationSeconds` across generated shots before emitting. If the estimate
exceeds the brief ceiling, cut generated shots rather than shortening them.
A one second generated clip costs nearly as much as a five second one and is
far more likely to fail the gate.

Then hand off: `POST /brief` on the Organized Motion Worker, or `/motion-generate`.
