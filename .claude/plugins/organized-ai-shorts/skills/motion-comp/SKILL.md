---
name: motion-comp
description: Compose gated shots into a finished cut using GSAP timelines, a Three.js GLB layer, captions, and an audio bed. Use when assembling clips into a sequence, editing timeline.json, adjusting cut timing or captions, or debugging why a preview and a render disagree.
---

# Motion Comp

Composition is deterministic. A browser preview and a HyperFrames render must
produce identical frames, which means nothing in this layer may depend on
wall-clock time, network latency, or random values.

## The contract

`timeline.json` is the only interface between the understanding plane and
composition. The Worker generates it at `GET /timeline/:briefId` from gated
survivors only.

```json
{
  "briefId": "brief_x",
  "aspect": "9:16",
  "totalDuration": 22.0,
  "clips": [{
    "id": "gen_01", "beat": "hook", "src": "/asset/raw/...",
    "start": 0.0, "duration": 1.5, "score": 88,
    "caption": "text with <em>one lime word</em>"
  }],
  "brand": { "bg": "#050608", "accent": "#B7FF3C", "warn": "#FFCC4D" }
}
```

## GSAP rules for deterministic render

- Build the timeline `paused: true`. HyperFrames drives
  `window.__motion.seek(t)` frame by frame.
- Position every tween absolutely on the timeline, never with relative
  offsets that depend on insertion order.
- Set `video.currentTime` explicitly on seek. Do not rely on video playback.
- No `Math.random()`. If you need variation, seed it from `clip.id`.
- Respect `prefers-reduced-motion` in the preview surface only. The render
  ignores it.

## Caption system

Bold white fragment, translucent black pill, maximum six words per chunk, one
highlighted keyword in lime, low-center safe area. This is the Organized AI
default and it survives platform compression better than thin type.

Captions cut on the beat, not on the word. Time them to `clip.start + 0.06`
so the visual lands first.

## The beat ribbon

The composition surface renders a ribbon under the stage where each segment
is a shot: width is real duration, fill height is the gate score, amber means
gated. This is not decoration. It lets you see a weak beat before you press
play, which is the whole point of running the gate early.

## When preview and render disagree

1. Something reads wall-clock time. Search for `Date.now`, `performance.now`,
   `requestAnimationFrame` outside the seek path.
2. A font has not loaded at frame zero. Preload in `<head>` and await
   `document.fonts.ready` before signalling render-ready.
3. A video element has not buffered. HyperFrames must wait on
   `window.__motion.ready()`.
