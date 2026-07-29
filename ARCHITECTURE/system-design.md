# Organized Motion: System Design

## Three planes plus a loop

```
                        ORGANIZED MOTION
   ┌──────────────────────────────────────────────────────────────┐
   │  BRIEF PLANE                                                 │
   │  motion-brief skill -> six-beat shot list JSON                │
   │  hook / evidence / mechanism / value / payoff / cta           │
   └───────────────────────────┬──────────────────────────────────┘
                               v  POST /brief
   ┌──────────────────────────────────────────────────────────────┐
   │  GENERATION PLANE          (CF Queue: motion-jobs)           │
   │  one GeneratorAdapter interface, three implementations       │
   │                                                              │
   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
   │  │ HIGGSFIELD │  │  OPENART   │  │   MESHY    │  │ARTLIST │  │
   │  │  REST API  │  │  MCP/OAuth │  │  REST+MCP  │  │ vault  │  │
   │  │  t2v / i2v │  │  Director  │  │  text->3D  │  │ music  │  │
   │  │  batch     │  │  hero cut  │  │  img->3D   │  │  SFX   │  │
   │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └───┬────┘  │
   │        │ poll          │ manual        │ webhook     │       │
   │        │               │ ingest        │             │       │
   │   [ assertUnderCeiling runs before every paid submit ]       │
   └────────┼───────────────┼───────────────┼─────────────┼───────┘
            v               v               v             v
   ┌──────────────────────────────────────────────────────────────┐
   │  ASSET VAULT       R2: raw/ glb/ audio/ render/              │
   │                    D1: briefs shots generations scores       │
   │                        licenses renders creatives            │
   │  every row carries provenance, cost, and license state       │
   └───────────────────────────┬──────────────────────────────────┘
                               v
   ┌──────────────────────────────────────────────────────────────┐
   │  UNDERSTANDING PLANE  (TwelveLabs)                           │
   │                                                              │
   │   index on arrival -> analyze against brief                  │
   │   ┌──────────────────────────────────────────────┐           │
   │   │ GATE   motion .3  on_brief .3  hook .4       │           │
   │   │ composite >= 65 -> compose                   │           │
   │   │ composite <  65 -> mutate prompt, resubmit   │           │
   │   │                    bounded by regen cap      │           │
   │   └──────────────────────────────────────────────┘           │
   │   also: semantic retrieval across the whole archive          │
   └───────────────────────────┬──────────────────────────────────┘
                               v  GET /timeline/:briefId
   ┌──────────────────────────────────────────────────────────────┐
   │  COMPOSITION PLANE   (Workers Assets, deterministic)         │
   │                                                              │
   │   timeline.json -> GSAP Timeline (paused, seek-driven)       │
   │                    Three.js OrthoCam(16,12,16) <- Meshy GLB  │
   │                    captions, beat ribbon, brand tokens       │
   │                    Artlist bed aligned to beats              │
   └───────────────────────────┬──────────────────────────────────┘
                               v  window.__motion.seek(t)
   ┌──────────────────────────────────────────────────────────────┐
   │  RENDER PLANE   HyperFrames HTML -> MP4                      │
   │                 9:16 first, then 1:1 and 16:9                │
   │                 DO RenderSession holds frame state, resumable │
   └───────────────────────────┬──────────────────────────────────┘
                               v
   ┌──────────────────────────────────────────────────────────────┐
   │  MEASUREMENT LOOP  (cron)                                    │
   │  Meta CAPI + GTM-T3SL8JPK + sGTM GTM-MJ4JHD38 + GA4          │
   │  creative_id joins ad performance back onto scores           │
   │  observed_cpa / observed_ctr / observed_thumbstop            │
   │            └────────> retunes the gate threshold             │
   └──────────────────────────────────────────────────────────────┘
```

## Why the gate sits in the middle

Render time and human review time are the expensive resources, not generation
credits. Scoring after composition means you have already paid both before
learning a shot was weak. Scoring on arrival means a bad hook costs one
generation and nothing else.

It also makes regeneration automatic and bounded rather than manual and
open-ended: the model that rejected the shot supplies the note that mutates
the prompt for the retry.

## Why the adapter interface matters

Video model providers change fast. Pricing shifts, models retire, better
options appear. The adapter boundary means switching providers is one file,
and nothing in the vault, gate, composition, or render layers learns about it.

Meshy retired `meshy-4` outright. Assume every provider will do the same.

## Failure modes designed against

| Failure | Guard |
|---|---|
| Regeneration loop burning credits | Hard ceiling, ack-and-drop, no retry |
| Provider URL expiry | Everything ingested to R2 before it is depended on |
| Long render dying at 90 percent | RenderSession DO, resumable frame state |
| Preview and render disagreeing | Deterministic seek, no wall-clock, no unseeded random |
| UI-scraping integration breaking | OpenArt goes through manual ingest, never Playwright |
| Content ID claim after publish | License row required per third-party asset key |
