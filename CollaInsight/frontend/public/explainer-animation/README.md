# CollainSight — Animated Explainer

A standalone, dependency-free motion graphic that tells the CollainSight story in
~38 seconds: conversations move fast → knowledge gets scattered → AI reads and
understands it → relationships become visible → the knowledge graph grows →
insights emerge → teams collaborate better → CollainSight.

This is **not** a website, landing page, or UI mockup. It's a self-contained
animated asset (HTML + CSS + vanilla JS + inline SVG) meant to be embedded in a
page or captured as a marketing video.

## Quick start

Any static file server works — SVG `getTotalLength()` and the Google Fonts
`<link>` both need `http(s)://`, so opening `index.html` via `file://` will
mostly work but path-draw lengths and remote fonts are more reliable served:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open the served URL. The animation autoplays once and holds on the final
CollainSight card; click **Replay** or one of the progress dots to play again
or jump to a scene.

## Embedding

Drop the whole `explainer-animation/` folder into a page and either:

- **iframe** it: `<iframe src="explainer-animation/index.html" style="border:0;width:100%;aspect-ratio:16/9"></iframe>`
- or inline it: copy `index.html`'s `<main class="stage">` markup directly into
  a page that already loads `styles.css` and `script.js`. The `.stage` element
  is a `16:9` box that fills its parent's width — wrap it in a container to
  control final size.

## How it's built

- **No React, no Canvas, no WebGL, no animation libraries.** Every visual is
  hand-authored SVG; every motion is CSS (`@keyframes`, `stroke-dasharray`/
  `stroke-dashoffset`, `offset-path`, `transform`, `opacity`, gradients) driven
  by one small vanilla-JS timeline.
- **One clock, one source of truth.** `script.js` runs a single
  `requestAnimationFrame` loop. Every frame it computes, per scene: a crossfade
  opacity (0 → 1 → hold → 0 across a 0.7s overlap with its neighbor) and a
  subtle Ken Burns `scale()` — this is what gives the cinematic "no hard cuts"
  feel without a video file.
- **One-shot animations restart cleanly.** When a scene's start time is
  crossed, `triggerEnter()` removes and re-adds the scene's `.is-active`
  class (forcing a reflow in between). Every CSS rule that reads
  `.scene.is-active …` — path draws, staggered node/card entrances, ring
  rotations — restarts from frame zero. This also makes the scene-dot
  seek control safe: jumping to any scene replays its entrance instead of
  showing it mid-animation or already finished.
- **Path lengths are measured once, at load,** via `getTotalLength()` and
  exposed as the `--len` CSS custom property so `stroke-dasharray` /
  `stroke-dashoffset` never uses a guessed magic number.
- **Counters** (`[data-counter-to]` + `data-counter-suffix`) animate with an
  ease-out cubic in `script.js` and re-run every time their scene enters.

## Storyboard & timeline

| # | Scene | Start | Duration | Beat |
|---|-------|-------|----------|------|
| 1 | The Problem | 0.0s | 4.5s | A wavy "stream" carries message-chips; several tumble off and fade — knowledge falling through the cracks |
| 2 | Scattered Knowledge | 4.5s | 4.5s | Irregular colored "shard" fragments drift with no connections |
| 3 | AI Analyzes | 9.0s | 4.5s | A rotating AI core sweeps a scan beam; each shard it touches crossfades into a clean node |
| 4 | Relationships Become Visible | 13.5s | 4.5s | Edges hand-draw between nodes; pulse-dots travel the new connections |
| 5 | Knowledge Graph Grows | 18.0s | 5.0s | Graph expands, breathes gently; counter ticks 0 → 128 "knowledge items organized" |
| 6 | Insights Emerge | 23.0s | 5.0s | Three glass cards rise with staggered delay, each with an animated counter |
| 7 | Better Collaboration | 28.0s | 4.5s | Five abstract person-nodes converge; edges thicken/brighten; a sync pulse marks alignment |
| 8 | CollainSight | 32.5s | 5.5s | The real brand mark draws itself, gradient-fills, wordmark rises in, tagline settles, holds for replay |

Total: **38 seconds** (spec range: 30–45s). Scene transitions overlap by 0.7s.

## Asset list

All visuals are original geometric vector work tied to CollainSight's actual
brand system (`docs/product/12_UI_UX_SPECIFICATION.md`) — no stock icon sets,
illustrations, or emoji.

| Asset | Where | Notes |
|---|---|---|
| Background grid + ambient orbs | `bg-grid`, `bg-orb-blue`, `bg-orb-cyan` | Runs continuously under every scene for camera continuity |
| Message stream + chips | `scene1-stream-path`, `scene1-packet-*` | `offset-path` motion; some chips drop off via a second keyframe |
| Knowledge shards | `scene2-shard-*`, `assets/svg/shard-fragment.svg` | 5 colors mapped to the product's knowledge-type taxonomy |
| AI core | `scene3-ai-core`, `-core-ring-outer/inner`, `-core-hex`, `-core-nucleus`, `-scan-beam` | Counter-rotating rings + pulsing hex + rotating scan wedge |
| Graph nodes/edges | `scene4-node-*`, `scene4-edge-*`, `scene5-node-*`, `scene5-edge-*` | Shared layout grows from 8 to 14 nodes between scenes 4 → 5 |
| Insight card icons | `assets/svg/icon-trend.svg`, `icon-link.svg`, `icon-spark.svg` | Original geometric marks — ascending arrow, interlocking capsules, four-point spark |
| Person nodes | `assets/svg/person-node.svg`, `scene7-person-*` | Circle + arc abstraction, not a stock avatar |
| Brand mark, wordmark & graph accent | `scene8-mark-stroke/fill`, `scene8-wordmark-fill`, `scene8-graph-accent`, `assets/svg/logo-mark.svg`, `assets/svg/logo-accent-graph.svg` | Exact mark, wordmark, and graph accent path data from `assests/New Logo collainsight - full name.svg` — draws in via stroke, then fills with the brand gradient |

> **Logo source of truth:** the mark, wordmark, and graph accent are copied exactly from
> `assests/New Logo collainsight - full name.svg`. If that file changes again, re-sync `scene8-mark-stroke`,
> `scene8-mark-fill`, `scene8-wordmark-fill`, and `scene8-graph-accent` in `index.html` (and
> `assets/svg/logo-mark.svg` / `assets/svg/logo-accent-graph.svg`) directly from it.

## Folder structure

```
explainer-animation/
├── index.html            # scene markup (8 inline <svg> scenes + HUD)
├── styles.css             # brand tokens, layout, all @keyframes
├── script.js               # timeline clock, path-draw setup, counters, HUD wiring
├── assets/
│   └── svg/
│       ├── logo-mark.svg          # exact brand icon, standalone/editable
│       ├── logo-accent-graph.svg  # exact brand graph accent (edges & nodes)
│       ├── icon-trend.svg
│       ├── icon-link.svg
│       ├── icon-spark.svg
│       ├── shard-fragment.svg     # reusable "scattered knowledge" fragment
│       └── person-node.svg        # reusable abstract person node
└── README.md
```

The files in `assets/svg/` are standalone, independently editable copies of
the same path data used inline in `index.html` (inlining is required at
runtime so `script.js` can measure/animate them directly — an `<img>` or
external `<object>` reference can't be driven by the outer stylesheet/script
the way this project needs).

## Accessibility & performance

- `prefers-reduced-motion: reduce` is fully respected: continuous ambient
  motion (orbs, rings, scan beam, breathing graph, twinkle) is disabled, path
  draws resolve instantly, counters snap straight to their final value, and
  scene transitions become a plain 300ms opacity crossfade with no Ken Burns
  scale.
- The whole animation has one text alternative — a hidden narrative paragraph
  (`#sr-narrative`) — and every decorative scene is `aria-hidden`, so screen
  readers get one coherent summary instead of dozens of unlabeled shapes.
- All motion is GPU-friendly (`opacity`/`transform`); nothing is animated via
  layout-triggering properties except the one-time `getTotalLength()` read at
  load.

## Known limitation (flagged up front, not discovered after the fact)

`offset-path` (the CSS motion-path feature used for the traveling message
chips in Scene 1 and the pulse-dots in Scene 4) has strong but not universal
support. On a browser without it, those elements simply stay at their path's
start point instead of traveling — everything else in the animation is
unaffected. There is no polyfill included, in keeping with the "no external
libraries" constraint; if you need to support such a browser, replace the
`offset-path` rules in `styles.css` with an SMIL `<animateMotion>` fallback.

## Self-review performed

- Verified in a Chromium browser: all 8 scenes play in order, crossfades
  overlap with no black flash or hard cut, counters animate and land on the
  correct final values, replay and scene-dot seeking both restart entrance
  animations correctly (no elements stuck mid-transition), and the console is
  free of errors/warnings.
- Confirmed total runtime (38s) sits inside the requested 30–45s window and
  every individual scene sits inside the requested 3–5s window (Scenes 5 and
  6 run 5.0s, the rest run 4.5s).
- Confirmed there are no duplicate element `id`s across the document (each
  scene's shared shapes — e.g. Scene 5's base graph — reuse Scene 4's
  positions as unlabeled `class`-only elements rather than duplicate ids).
