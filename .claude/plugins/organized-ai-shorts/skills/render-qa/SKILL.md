---
name: render-qa
description: Render the composition to MP4 with HyperFrames across aspect ratios, then produce contact sheets, QA frames, and the delivery manifest. Use when exporting a finished cut, checking a render for artifacts, producing platform variants, or preparing assets for ad upload.
---

# Render QA

## Render

HyperFrames turns the HTML composition into MP4. Requires Node 22+ and FFmpeg.

```bash
npm install -g hyperframes
hyperframes render public/index.html?brief=<briefId> --out dist/<briefId>/
```

Render 9:16 first. It is the primary format and the one where safe-area
mistakes are most visible. Only after it passes QA should you render 1:1 and
16:9, because a composition fix means re-rendering everything.

The `RenderSession` Durable Object holds frame state, so a long render
resumes rather than restarting. One instance per brief and aspect pair.

## QA frame set

Pull frames at four fixed points, every time:

| Frame | Checking for |
|---|---|
| hook (0.5s) | Does the first impression land with sound off |
| midpoint | Caption legibility against the busiest background |
| payoff | Is the claim actually visible on screen |
| final frame | CTA readable, no partial fade, no orphan caption |

Generate a contact sheet across the full cut. Scan it for repeated
compositions: two adjacent shots with the same framing read as a mistake even
when both scored well individually.

## Platform checks

- Captions inside the low-center safe area, clear of platform UI overlays.
- No text within 12 percent of any edge on 9:16.
- Audio bed present and ducked under any voiceover.
- File under platform size limits before upload.

## Delivery manifest

Emit `manifest.json` alongside the MP4 containing: brief id, render id,
aspect, duration, clip list with generation ids, gate scores, cost in credits,
license rows for every third-party asset, and the `creative_id` that will
carry into the ad platform.

That last field is what closes the loop. Without it, Phase 8 cannot join ad
performance back to gate scores, and the threshold never learns anything.

## License check before publish

Query the `licenses` table for every asset key in the render. Artlist rows
must carry a download date and Clearlist status. If any third-party asset has
no license row, stop and resolve it before delivery rather than after a
Content ID claim.
