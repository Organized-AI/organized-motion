# YouTube Cartoon Channel Base Template

A reusable base template for turning a high-performing faceless cartoon channel pattern into a repeatable production system.

## Source reference

This template was distilled from the YouTube video below and normalized into a reusable operating pattern.

- Title: `I Created a Viral Cartoon Anime Channel with Claude`
- Creator: `DIGITAL INCOME PROJECT`
- URL: <https://www.youtube.com/watch?v=6hhaDDRvpyo>
- Source angle: build a recurring cartoon show through fixed style, asset libraries, locked voices, short shot assembly, and packaging research

## What this template is for

Use this when you want Organized Motion to plan or build a channel system with:

- a recurring niche and world
- persistent characters
- persistent locations
- one locked visual style
- one locked voice per recurring character
- episode generation from reusable assets instead of fresh prompts every time

This is a planning template, not a claim that the source video alone proves every production detail.

## Core thesis

The channel is not a sequence of one-off clips. It is a reusable asset pipeline:

1. choose a niche with endless story fuel
2. lock the visual style
3. build character sheets
4. build location sheets
5. lock voices
6. script episodes
7. break episodes into short shots
8. generate shots from the asset library
9. assemble and package consistently
10. save every new asset back into the library

## Directly supported by the source

These points are explicitly supported by the transcript:

- the workflow is centered on Higgsfield for generation and Claude for scripting and prompt expansion
- one fixed style string is reused across all prompts
- characters are created in two stages: approved design, then multi-view reference sheet
- recurring locations are created as reusable sheets with multiple angles
- each recurring character gets one locked voice
- scenes are assembled from character sheet + location sheet + voice + shot prompt
- episodes are scripted, then broken into scenes, then broken into shots of 30 seconds or less
- when a generation is close but wrong, reroll before rewriting the prompt
- any new set or character created during episode production goes back into the library
- titles and thumbnails should be based on proven outliers, not AI-only guessing

## Inferred but likely

These are reasonable operating assumptions but not fully specified in the video:

- lightweight editing still happens after generation for trims, captions, music, and sound effects
- the asset library should live in a structured folder or catalog, not just in chat history
- the system is optimized for short-form first, then reposted or adapted across YouTube and Instagram

## Unknown or not shown

- the exact editor used for assembly
- the exact prompt library unless the linked Notion doc is inspected separately
- the exact publishing cadence
- the exact analytics thresholds used to keep or kill a format

## Channel setup template

### 1. Niche definition

Fill these before any generation starts:

- niche:
- recurring conflict:
- audience fantasy:
- platform priority: `YouTube Shorts | Instagram Reels | both`
- monetization lane: `ads | offers | sponsorship | affiliate | mixed`
- content boundary: what the show will not cover

### 2. Style lock

Collect 3 to 5 visual references and write one style string.

Template:

```text
<format>, <line quality>, <shading model>, <palette>, <proportions>, <lighting behavior>, <overall mood>
```

Example:

```text
2D cartoon, bold clean outlines, flat cel shading, saturated warm palette, slightly exaggerated proportions, clean studio-style lighting, playful but dramatic sports energy
```

Rules:

- use the exact same style string in every asset prompt
- do not paraphrase it mid-project
- change it only by versioning the whole show style

### 3. Character library template

Each recurring character gets two artifacts.

#### Artifact A: approved design prompt

Fields:

- role in the show
- age range
- body type
- skin tone
- face shape
- hair
- outfit
- signature accessory
- personality traits that affect performance or expression
- framing requirements: `full body, front facing, plain background, flat lighting`

#### Artifact B: reference sheet

Required views:

- full body front
- full body rear
- front close-up
- 90 degree profile close-up

Rules:

- no text in the image
- reuse the exact outfit block verbatim
- this is the source of truth for all future shots

Suggested file naming:

```text
characters/
  striker/
    approved-design.md
    sheet-front-rear-closeups.png
  coach/
    approved-design.md
    sheet-front-rear-closeups.png
```

### 4. Location library template

List 3 to 5 recurring sets first. Most channels need fewer locations than they think.

For each set, create:

- wide establishing view
- reverse angle
- key-area close-up

Location prompt inputs:

- set name
- mood brief
- history / wear / atmosphere
- lighting rules
- style string

Suggested file naming:

```text
locations/
  dressing-room/
    mood-brief.md
    sheet-3views.png
  pitch/
    mood-brief.md
    sheet-3views.png
```

### 5. Voice library template

Each recurring character gets one locked voice.

Fields:

- character name
- voice source: `stock AI | custom AI | recorded human`
- tone
- pitch / age impression
- speaking rhythm
- comic behavior notes
- source clip path or voice id

Rules:

- keep the same voice for the same character across episodes
- if you swap voices, version it explicitly and treat it as a production change

### 6. Episode planning template

#### Episode concept

- episode title concept:
- hook in one sentence:
- conflict:
- payoff:
- CTA or ending button:

#### Script flow

1. hook
2. setup
3. escalation
4. twist or conflict peak
5. payoff
6. tag or CTA

#### Scene breakdown

For each scene, fill:

- scene id
- location
- characters present
- dramatic purpose
- beat in plain English

#### Shot breakdown

For each shot, fill:

- shot id
- scene id
- duration, max 30 seconds
- subject
- camera move
- action
- emotion
- dialogue
- required character sheet ids
- required location sheet id
- required voice id

## Prompt expansion workflow

Use plain-English beats as the human-authored control layer, then expand them into generation prompts.

### Human beat template

```text
The coach rants at the whiteboard. The striker interrupts with a naive question. The room turns tense, then comedic.
```

### Expanded prompt requirements

Every expanded shot prompt should make these explicit:

- who is visible
- where it happens
- camera framing or move
- action
- emotion
- dialogue or speech intent
- continuity with the existing style string and asset sheets

## Generation rules

- never generate a recurring character without a reference sheet
- never generate a recurring location from scratch once the set library exists
- reroll before rewriting when a result is close but wrong
- short cartoon shots can tolerate hard cuts better than long awkward clips
- any mid-episode asset worth reusing gets promoted into the library before the session ends

## Packaging template

### Title research

Before publishing, collect 10 to 20 outlier titles from the exact niche.

Track:

- title pattern
- emotional trigger
- named character or rivalry
- event frame
- curiosity frame

Do not ask AI alone for a viral title. Use real winners as the reference class.

### Thumbnail template

Inputs:

- existing character asset from the library
- same style string
- one expressive pose or close-up
- 1280x720 output
- 0 to 3 words of text

Checklist:

- readable at phone size
- same visual world as the video itself
- obvious emotional state
- one focal point

### Caption and metadata template

- platform:
- primary keyword cluster:
- supporting keyword cluster:
- short CTA:
- series tag or recurring show tag:

## Organized Motion mapping

This source workflow maps onto Organized Motion as follows:

- **Brief plane**: turn episode structure into a shot list using the standard beat order where useful
- **Generation plane**: treat character sheets, location sheets, and voices as source assets for shot creation
- **Understanding plane**: gate shots for on-brief alignment, motion clarity, and hook strength before render
- **Composition plane**: assemble approved shots with captions, SFX, and music into the final timeline
- **Measurement loop**: feed real performance back into title, thumbnail, hook, and shot-level decisions

## Minimal operating loop

1. maintain the asset library
2. plan one episode
3. expand beats into shot prompts
4. generate short shots
5. gate survivors
6. assemble timeline
7. package from proven niche outliers
8. publish
9. review performance
10. update the library and packaging rules

## Reusable checklist

- [ ] niche selected
- [ ] style string locked
- [ ] 3 to 5 references saved
- [ ] all recurring characters have sheets
- [ ] all recurring locations have sheets
- [ ] each recurring character has a locked voice
- [ ] episode script drafted
- [ ] every shot names required assets
- [ ] packaging references collected from real outliers
- [ ] new assets promoted back into the library

## Build boundary

This template captures the operating system behind the source workflow. It does not by itself validate provider pricing, licensing status, moderation risk, or platform monetization policy. Those must be checked per niche and per asset source before production use.
