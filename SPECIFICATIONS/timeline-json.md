# timeline.json specification

The only interface between the understanding plane and composition. Emitted
by `GET /timeline/:briefId`. Contains gate survivors only.

```ts
interface Timeline {
  briefId: string;
  aspect: "9:16" | "1:1" | "16:9";
  totalDuration: number;         // seconds
  clips: Clip[];
  brand: BrandTokens;
}

interface Clip {
  id: string;                    // generation id, carries provenance
  beat: string;
  src: string;                   // /asset/<r2 key>
  start: number;                 // absolute seconds on the timeline
  duration: number;
  score: number;                 // composite gate score, drives ribbon fill
  caption?: string;              // may contain <em> for the one lime word
  glb?: string;                  // optional Three.js layer asset
}

interface BrandTokens {
  bg: string; accent: string; warn: string; font: string;
}
```

## Invariants

- `start` is absolute, never relative. Relative offsets make renders
  order-dependent and therefore non-deterministic.
- Clips are ordered by `start` and do not overlap except for the 0.28s
  crossfade window handled by the composition layer.
- `score` is carried through purely so the beat ribbon can display it. The
  composition layer never filters on it; filtering already happened.
- `id` is the generation id so any frame can be traced back to its prompt,
  provider, and cost.

## Render hook

The composition surface exposes:

```js
window.__motion = {
  seek(t),            // deterministic, sets video currentTime explicitly
  duration,           // total seconds
  load(timelineJson), // rebuild
  ready()             // true once a timeline is loaded and buffered
}
```

HyperFrames must await `ready()` before frame zero and drive `seek(t)` per
frame with the GSAP timeline paused.
