# Step 3: Storyboard + Script

Marketing videos are made concept-first. **The order is: message → narrative arc → beats that serve the arc → the visual content (captured assets + composed elements) and techniques that bring each beat to life.** Captured assets (SVG logos, brand illustrations, hero art, product photos, diagrams, screenshots, captured video clips) and composed visuals (divs / CSS / SVG / Canvas / GSAP) are both first-class beat content — the agent decides per beat which serves the meaning best, often combining both. The constraint is only that you shouldn't _start_ from the asset inventory ("we have these screenshots, let's build a slideshow"). Start from the message, then for each beat decide: what visual content (captured? composed? both?) carries this beat, and what technique animates it.

**Read `capture/extracted/asset-descriptions.md` before writing beats.** Know what's in the capture. The brand's actual visual identity — its real logo, its real illustrations, its real gradients, its real hero art, its real product photography, its real diagrams — is what makes the video feel like _this_ brand and not a generic dark cinematic template. The unique benefit of website-to-hyperframes is that you already HAVE the brand's real assets; leverage them when they serve a beat's meaning. Beats will weave captured assets and composed motion in varied proportions: some beats lean captured (a hero photo with kinetic type on top), some lean composed (a UI built from divs with the brand's real data), most layer both.

## First decision: CONCEPT

Before pacing, before beats, before anything else — write the concept block at the top of `STORYBOARD.md`. Carry forward what was decided in Step 2's brief:

```markdown
**Message:** [the ONE thing this video must communicate — one sentence]
**Arc:** [Problem→Solution / Reveal / Demonstration / Vibe / Comparison — and a one-sentence shape of how it unfolds]
**Audience:** [who's watching, where they're watching — TikTok scrollers, LinkedIn viewers, embedded on landing page]
**Brand voice:** [confident / playful / clinical / urgent / premium — pulled from DESIGN.md]
**Why this matters now:** [GTM context if relevant — launch, feature ship, brand reposition, ongoing demo]
```

If any of those rows are blank, the storyboard cannot land. Go back to the brief — don't substitute "show the kanban" for a message.

**The single-sentence test:** _"What makes this video different from a generic [video type] for any [industry] brand?"_ If you can't answer it from the rows above, the concept isn't sharp enough. Sharpen it before writing pacing or beats.

### Optional: name a story archetype as the structural spine

The Arc field above (Problem→Solution / Reveal / Demonstration / Vibe / Comparison) is the **primary frame** for w2h. It works for any video type — social ads, brand reels, tours, launches, demos.

If the user explicitly wants a **launch-style** or **persuasion-heavy** reel — a product launch trailer, a category-creation announcement, a transformation story — the five named archetypes below give the storyboard a more specific structural spine. They are optional and SECONDARY to the Arc field. Pick one only when the user's brief reads as persuasion-led, not when it's a general brand piece.

Every entry below is equal-weight — none is preferred. Pick the one whose structural shape matches the brief.

- **PAS** (Pain → Agitate → Solve) — open on a named pain, intensify briefly, reveal the product as relief. Applies when the brief frames a structural friction the audience already feels.
- **BAB** (Before → After → Bridge) — show the friction state, contrast with the desired state, walk through the workflow steps that bridge them. Applies when the transformation steps are the proof.
- **Future-Pacing** — open in the future/desired state, reverse-engineer the product's role in getting there. Applies when the brief frames an aspirational outcome.
- **Demo-Loop** — open mid-product-use; the cycle of action → result is the structure. Applies when the brief frames the product itself as the demonstration.
- **Feature-Benefit-Cascade** — rapid sequence of feature → benefit pairs (~3–5s each), building cumulative surface. Applies when the brief lists 3–5 distinct features.

If you pick an archetype, **write it on the same line as the Arc field** so the worker reads both: `**Arc:** Demonstration / Demo-Loop — three workflow loops, each ending in a "ship" moment.`

Skip the archetype entirely for general brand reels, social ads without a sales motion, atmospheric pieces, and "show what it is" videos. The Arc field alone is enough.

---

## Second decision: PACING

With the concept locked, pick the pacing that serves it. This determines beat count, beat duration, and architecture — every downstream choice flows from here.

Read the message and arc from the concept block above plus the style direction from Step 2's brief. Map to one of these:

| User says                                                   | Pacing       | Beat count | Beat duration | Architecture                                               |
| ----------------------------------------------------------- | ------------ | ---------- | ------------- | ---------------------------------------------------------- |
| "fast", "punchy", "rapid cuts", "energetic", "social ad"    | **Fast**     | 8–15       | 0.7–1.8s      | Single-file stacked beats, hard cuts                       |
| "demo", "walkthrough", "product tour", "show features"      | **Moderate** | 4–6        | 3–5s          | Sub-compositions, CSS crossfades                           |
| "cinematic", "premium", "slow", "let it breathe", "elegant" | **Slow**     | 3–4        | 5–8s          | Sub-compositions, long crossfades                          |
| "launch", "announcement", "story", "narrative"              | **Arc**      | 5–7        | varies        | Slow opener → building middle → fast peak → resolved close |

**Write your pacing choice at the top of STORYBOARD.md.** Example: `**Pacing: Fast** — 12 beats, stacked divs, hard cuts.`

If the user said "dark cinematic feel" — that's SLOW, not fast. If they said "rapid cuts, bold typography" — that's FAST. Don't default to moderate when the prompt gives you a clear signal.

---

## Music Fetch (only if Step 2 Q5 said yes — do this BEFORE writing per-beat timing)

If Step 2 Q5 picked "Yes, music bed" (or auto-decide chose yes), **fetch the track now, before timing any beats.** Music has structure (builds, peaks, drops, fills) that the video's rhythm should honor — a build at 22s wants beat N to land at 22s, not at 18s. Search → pick → analyze → THEN write beat timing. Doing this after the storyboard is the wrong order: you'd end up with beats that don't align to the track's structural moments.

Skip this section entirely if Step 2 said no music (the storyboard's Global Direction has no `**Music file:**` line and Step 5 skips the music wire-up cleanly).

**1. Describe the mood in one line.** Informed by Step 2 brief style + video type + Arc choice. Search by feel + function, not by filename:

- e.g. `"moody ambient pad with slow build for a brand reel"`
- e.g. `"upbeat lo-fi reel bed under voice"`
- e.g. `"tense synth drone rising for product launch"`
- e.g. `"warm acoustic guitar cozy"` / `"epic cinematic orchestral swell"` / `"minimal piano introspective"`

See [`background-music.md`](background-music.md) "Search prompts that work" for more shapes.

**2. Search the catalog.** Pull 5 candidates:

```bash
npx tsx packages/cli/src/cli.ts music search "<your mood line>" --limit 5
```

Returns `id`, `name`, `description`, `duration`, `score` per candidate.

**3. Pick a track.** In collaborative mode: present the top 3-5 candidates to the user (one line each: `id` + `name` + `duration` + first ~80 chars of description) and ask them to pick. In auto mode: pick the highest-score candidate whose `duration` is ≥ the planned video duration (so the track covers the whole video without looping).

**4. Download + analyze.** This is the load-bearing step:

```bash
npx tsx packages/cli/src/cli.ts music add <chosen-id>
```

This writes the track to `assets/music/<id>.<ext>` AND prints the analysis — LUFS / true peak / **peak time** / onset / tail / **loudness sparkline** (e.g. `shape ▁▂▅█▇▃▁`). The sparkline shows energy contour over time — read it to know WHERE the track builds, drops, breaks. Each block roughly maps to `t ≈ (i + 0.5) / length × duration`.

**5. Record in the storyboard's Global Direction** (the template above). Three lines:

```markdown
**Music file:** assets/music/<id>.<ext>
**Music direction:** <mood + volume rule, e.g. "moody ambient pad sits at 0.45 under VO, lifts to 0.75 for the 2s pre-CTA stretch">
**Music structure:** sparkline=▁▂▅█▇▃▁ · peak=Xs · duration=Ds · suggested-trim=<head>s-<tail>s
```

**6. Time beats against the structure** (when you write the per-beat sequence below):

- If the music has a build at 22s → schedule a hero/reveal/peak beat to land at 22s.
- If the music drops at 35s → that's a CTA-friendly silence; schedule the CTA there.
- If the music is even/ambient with no notable peaks → treat it as a bed; time beats against VO + visual rhythm instead.
- If the music has a clear intro (first N seconds quiet, sparkline starts at `▁▁`), VO start timing can wait for the intro to settle — e.g. VO starts at the first `▂` block.

In Step 5, the music is already on disk — beat workers read `**Music file:**` from STORYBOARD.md Global Direction and the orchestrator embeds it as the BGM lane (track 11) without re-fetching.

**When music drives (Step 2 said yes music + no VO — visual-only / brand-reel mode):** the music IS the structural spine of the video. The sparkline maps to beat structure directly: `▁` blocks → beats start or breathe; `▂▅` → builds where motion accelerates; `█` peaks → anchor reveals / hero moments / brand-mark landings; `▇▃` → cool-downs hold the final frame. The music's duration IS the video duration (trim its tail in the storyboard's audio embed if your beats end sooner; extend or repeat the file in Step 5 if your beats run longer than the track). VO start timing doesn't apply. Beat timing comes from the sparkline, not from a script.

---

## Technique-pick checklist (REQUIRED, do this BEFORE writing beat copy)

For every beat you plan, name **2–4 techniques** it will use. A beat with one technique is a slideshow frame — if you can't name two, redesign that beat.

Pick from the inventory in [capabilities.md](capabilities.md) and implementation patterns in [techniques.md](../../hyperframes/references/techniques.md). Examples of composable beats:

```
Beat 3: composed kanban (4 cards-as-divs per column) + counter chip on In-Progress + back.out entrance stagger
  techniques: layered panels (capabilities §1), counter via tl.set (techniques #15),
              GSAP stagger with back.out(1.7) (techniques #4)
  customize:  real project name "Atlas Q3", brand purple #5b3fff, realistic backlog items
```

**Customize is the actual deliverable** — what makes this beat THIS brand's beat. Brand colors, real content, narration-sync timing. Generic "show the kanban" with no concrete techniques, no customize plan, no brand-specific data = lazy thinking. Beats must be invented from this brand's identity, not assembled from generic UI shapes.

---

**Re-read these files before writing:**

- **DESIGN.md** — your color palette, font rules, components, Do's/Don'ts. Every visual must be grounded in this brand identity. If it says "white backgrounds with purple accent" — plan light scenes, not dark moody ones.
- **[visual-vocabulary.md](visual-vocabulary.md)** — translate the user's style direction into concrete dimension values (pacing, density, transitions, mood, motion, audio). Note any per-beat overrides the user requested.
- **Asset discovery — re-view the contact sheets, every cell, no skimming.** Step 0 has you do the initial cell-by-cell view of all THREE contact-sheet types; here in Step 3 you re-open each sheet to assign specific cells to specific beats. The three sheets are paginated — view ALL pages of each:
  - `capture/screenshots/contact-sheet-*.jpg` — page-scroll screenshots. Each cell labeled with scroll percentage. Tells you WHERE on the page each section lives and what visually anchored it.
  - `capture/assets/contact-sheet-*.jpg` — downloaded raster images grid. Each cell labeled with filename.
  - `capture/assets/svgs/contact-sheet-*.jpg` — SVGs rendered as thumbnails. Each cell labeled with content-hash filename (e.g. `logo-a3f5b2e1.svg`, `svg-7c4e0f9d.svg` — filenames are content-addressable hashes, not semantic names; the thumbnail IS the source of truth for what's inside).
  
  **For each beat you write below, before assigning an asset to it: open the relevant contact-sheet page(s) and visually pick the cell.** Do not assign assets from memory — your Step 0 viewing was thorough but specific beat decisions need specific lookup. **Do not skim the sheets** — past agents have reported "viewed the contact sheets" after one scroll and later placed a beat against an asset whose actual content didn't match what they thought it was. Open the cell, name what you see, then decide.
  
  When the contact-sheet thumbnail is too small to judge fine detail (e.g. a partner-logo set where you need to confirm which company is which), **open the individual file** for the specific candidate. Also read `capture/extracted/asset-descriptions.md` for one-line Gemini captions of each asset — captions are usually correct after the SVG-rasterize fix but the contact sheet remains authoritative when in doubt. **Empty Gemini caption ≠ broken asset:** sharp can fail to rasterize exotic SVGs (external web fonts, `<foreignObject>`, complex filters) that Chrome still renders fine at video time. If a caption is empty for an SVG, view the contact-sheet thumbnail (rendered by Chrome, never hallucinated) or open the SVG file directly to assess — don't skip the asset just because its caption is empty.
  
  **The decision of whether a beat uses the captured asset, a composed visual built from divs/CSS/SVG/Canvas, or both layered is made per beat based on what serves THAT beat's meaning** (see Per-Beat Direction below).
  
  **Never use the contact sheets themselves as content in the video** — they have grid labels and headers baked in. Same for the scroll-screenshot files in `capture/screenshots/`: they are raw browser captures meant for the agent to UNDERSTAND the site, not to place in compositions. (Individual product screenshots from `capture/assets/` are fine when a beat's meaning is the product itself; the no-use rule is only for the contact-sheet and scroll-screenshot files.)
- **[techniques.md](../../hyperframes/references/techniques.md)** — 20 visual techniques with code patterns. Pick for beats, these are starting points to adapt, not templates to copy.
- **[text-effects.md](../../hyperframes/references/text-effects.md)** — 24 named text animation effects bundled in the repo. Read the catalog now and assign a specific effect ID to every headline, label, and copy element in every beat — not generic "fades in" descriptions.

The storyboard is the creative north star. It tells the engineer exactly what to build for each beat — mood, camera, animations, transitions, assets, appearance, sound. Write it as if you're briefing a motion designer who's never seen the website.

**Incorporate the user's specific requests.** If they asked for "a 3D MacBook reveal" — that's in the storyboard. If they said "surprise me" — go ambitious, but just stay within the style direction.

Save as `STORYBOARD.md` in the project directory.

---

## Consider: Would Research Improve This Video?

Before diving into beats, pause and think: **would focused research make this video meaningfully better?**

This is NOT always needed. A simple social ad for a SaaS product probably doesn't need market research. But some videos benefit from context the website alone doesn't provide:

**Research when:**

- The video is for a competitive market — look at how competitors present their product, what visual language the industry uses, what trends are hot
- The video represents a company/product you know little about — search for reviews, press coverage, user opinions, company history to understand what matters to their audience
- The user asked for something specific to their field — a fintech launch video benefits from understanding how Stripe, Ramp, Mercury position themselves visually
- The video needs to reference real-world data, trends, or context not on the website

**Skip research when:**

- It's a straightforward brand reel or social ad from a clear website
- The user gave very specific creative direction ("I want exactly X, Y, Z")
- The website already contains all the context needed (features, stats, testimonials)

**What to research:** Competitor videos in the space, trending visual styles for the industry, audience expectations, any company context that helps you make better creative decisions. A 2-minute web search can give you the edge between a generic video and one that feels like it was made by someone who understands the market.

---

## Global Direction

Every STORYBOARD.md starts with global settings:

```markdown
**Format:** 1920×1080
**Audio:** [TTS provider] voiceover + [music yes/no, from Step 2 Q5] + SFX
**VO direction:** [voice character — e.g., "mid-age male, calm confident delivery,
Apple keynote register — economy of words, silence between sentences is a feature"]
**Music file:** [only if music = yes — path to the track fetched in Music Fetch below, e.g., `assets/music/a3f5b2e1.mp3`]
**Music direction:** [only if music = yes — one line of mood/volume rule, e.g., "moody ambient pad, sits at ~0.45 under VO, lifts to ~0.75 in the 2s pre-CTA stretch"]
**Music structure:** [only if music = yes — copied verbatim from `music add` analysis: `sparkline=▁▂▅█▇▃▁ · peak=Xs · duration=Ds · suggested-trim=<head>s-<tail>s`. Use this to time beats against the track's builds/drops.]
**Style basis:** DESIGN.md (brand colors, fonts, components from the captured site)
```

**Global guardrails** — read [video-composition.md](../../hyperframes/references/video-composition.md) first. It defines the medium rules: density, color presence, scale, frame composition, and how design.md is brand truth not layout spec. Then apply these capture-specific additions:

- Captured assets and composed visuals are both load-bearing — the agent decides per beat which to use, and most beats correlate both. See the Asset & Brand Floor section below for the required floor (brand mark + signature visual) and the variation principle (don't repeat the same content-source pattern across beats).
- Use different techniques from techniques.md — not across the whole video, per beat. Don't default to basic fade/scale/opacity. The HyperFrames toolkit (read [`techniques.md`](../../hyperframes/references/techniques.md) and [`capabilities.md`](capabilities.md) for the full catalog) — equal-weight options the agent picks from per beat:

  **Content-carrying (brand-true) techniques:**
  - **SVG path drawing** — logo / diagram / icon draws itself stroke-by-stroke (stroke-dashoffset). Best for brand-mark reveals, connector lines, hand-drawn-feel openers.
  - **HTML-in-Canvas (`drawElementImage`)** — live HTML/CSS captured as a GPU texture at 60fps. Powers iPhone/MacBook mockups with REAL captured screens inside (`vfx-iphone-device` block), liquid glass refraction over UI (`vfx-liquid-glass`), shatter, portal reveal, magnetic distortion.
  - **Video compositing** — REAL captured `<video>` clips played inline, masked, overlaid (capture downloads `<video src>` sources to `assets/`). Use when the brand's actual moving product footage exists.
  - **Lottie animation** — captured or external `.lottie` / `.json` plays as overlay/background. Many sites ship Lottie files; use them rather than recreating their motion in CSS.
  - **Three.js custom scenes** — full 3D when registry VFX blocks aren't enough (rotating product, sphere, orbit, particle field). More setup than the VFX blocks; only when needed.

  **Composed motion + typography:**
  - **Per-word kinetic typography** — text animates word-by-word with stagger timing (see [`text-effects.md`](../../hyperframes/references/text-effects.md) catalog of 24 named effects: soft-blur-in, mask-reveal-up, kinetic-center-build, shared-axis, line-by-line-slide, etc.).
  - **Variable font axis animation** — weight / width / slant / optical-size morph over time (premium typography, wordmark reveals).
  - **Character-by-character typing** — terminal lines, search bars, code blocks (steps() easing for discrete reveals).
  - **Counter animations** — discrete `tl.set(el, {textContent})` at timestamps (numbers ramping, stats).
  - **CSS 3D transforms** — card flips, perspective grids, folding panels.
  - **Clip-path reveal masks** — content slides through a fixed window (image wipes, headline reveals).
  - **Camera moves** — push-in (dolly), pull-back, parallax pan, orbit, rack focus, `leading-line-camera-traversal` (world canvas larger than viewport, camera pans across following hand-drawn lines). See "Named motion patterns" further below.
  - **GSAP MotionPathPlugin** — element follows an SVG `<path d="…"/>` curve through space (orbital motion, spirals, complex entrances — see `bezier-motion-path` motion pattern below).
  - **Velocity-matched transitions** — outgoing blur/translate matches incoming for seamless beat handoffs (see `whip-pan` + `match-cut-handoff` motion patterns).
  - **Drifters** — looping background elements (floating particles, slow gradient orbs, ambient marks) at independent intervals for continuous depth behind primary content.

  **Audio-driven (when music or VO is present):**
  - **Audio-reactive animation** — bass / mid / treble → scale / glow / shape via `<hf-audio-reactive>`. Highest payoff in music-led / no-VO videos.

  **GPU effects (powerful, optional, rare):**
  - **Shader transitions** — WebGL effects between beats (chromatic, domain-warp, light-leak, swirl, etc.). Max 1-2 per video; **zero is fine and common**. Use only on truly hero "wow" beat boundaries.
  - **WebGL Fragment Shader Art** — full GPU generative backgrounds (FBM domain warp, cosine palettes). Atmospheric hero scenes; not most beats.
  - **30+ CSS scene transitions** — named patterns (push, scale, dissolve, blur, 3D flip, light-leak, distortion, grid, mechanical, destruction) lighter than shader transitions but more personality than crossfade.

  Each beat should feel like its own visual world; vary the technique across beats (per the variation principle below). Pick from the catalog above based on what THIS beat's concept needs.

**Music direction details** (only if Step 2 Q5 said yes):

- Step 2 already locked the yes/no decision. Here, expand the one-line `**Music direction:**` global line above into the mood the agent will use as the `hyperframes music search` query.
- Describe the mood by feel (Step 5 searches the catalog by meaning, not by filename): `"moody ambient pad slow build"`, `"upbeat lo-fi reel bed"`, `"tense synth drone rising"`, `"warm acoustic cozy"`, `"epic cinematic orchestral swell"`, `"minimal piano introspective"`, `"glitchy electronic future-tech"`.
- Note volume rule (no auto-ducking — see [`background-music.md`](background-music.md)): BGM 0.4–0.6 under VO; 0.7–0.9 if pure-music. State if the bed lifts/drops across the video (e.g., "lifts to ~0.75 for the 2s pre-CTA stretch where there's no narration").
- Example: "Minimal electronic ambient pad. Already playing when the video starts. Sits at ~0.45 under VO; lifts to ~0.75 in the 2s pre-CTA stretch where there's no narration."

---

## Required Capabilities Discovery

Before writing any beats, scan what's installed locally so you can use existing blocks rather than reinventing them. Run:

```bash
# What's already installed in registry/blocks/ — VFX blocks (vfx-iphone-device,
# vfx-liquid-glass, vfx-shatter, vfx-portal, etc.) and shader transitions
# (chromatic, domain-warp, flash, glitch, ripple, swirl, thermal, etc.) live here.
ls registry/blocks/ 2>/dev/null || echo "No blocks installed yet"

# Browse the full catalog of installable blocks
npx tsx packages/cli/src/cli.ts catalog --type block 2>/dev/null | head -40
```

If you need a VFX block (e.g. for an iPhone/MacBook mockup hero, a liquid-glass refraction, a portal reveal) install it with `npx tsx packages/cli/src/cli.ts add <name>` — these are powerful for specific hero treatments. Don't over-install: only add blocks you'll actually use in a specific beat. Most videos ship without any registry-installed blocks at all; the core techniques (SVG path drawing, kinetic typography, CSS 3D, canvas procedural art, camera moves, captured-asset use) carry the majority of beats.

**Shader transitions are optional and rare.** Most videos ship without any shader transitions — CSS crossfades and hard cuts (both free, deterministic, GPU-cheap) cover 90%+ of inter-beat transitions cleanly. Reach for a shader transition only when a beat boundary is a true "wow" moment that earns the production-value bump. When you do use one, the available shader names from `registry/blocks/` follow a naming pattern: the block name (`domain-warp-dissolve`) differs from the runtime shader name (`domain-warp`, no `-dissolve` suffix). After installing a block, open its showcase HTML to find the actual shader name used in `HyperShader.init()`, then delete the showcase file (demo-only, pollutes `compositions/` with lint warnings).

#### Canonical declaration format (auto-derived by `w2h-prep` — only if you actually use shader transitions)

If — and only if — the video genuinely needs one or two shader transitions, declare them in a dedicated section of STORYBOARD.md so `w2h-prep` can emit them in `group_spec.json` automatically. **Most videos skip this section entirely.** Use this exact bullet format (case-insensitive on the shader name; `duration` is optional, defaults to `0.5`):

```markdown
## Shader Transitions

- between beat-1-hero and beat-2-features: shader=domain-warp, duration=0.5
- between beat-4-demo and beat-5-cta: shader=flash-through-white, duration=0.4
```

Rules:
- **Beat ids must match `compositions/beat-N-<slug>.html` filenames** (drop the `.html`).
- **Declare only the boundaries with a shader** — `w2h-prep` fills the remaining adjacent beat pairs with vanilla CSS crossfades (no `shader` field).
- **Maximum 2 shader transitions per video** — keep them load-bearing (hero reveal, CTA punch). More than 2 flattens their impact and the engine starts struggling at GPU init.
- If you don't declare a `## Shader Transitions` section, `w2h-prep` omits the `shader_transitions` field entirely and `assemble-index.mjs` falls through to a vanilla GSAP timeline (no HyperShader). That's the safe default — most videos don't need shader transitions.

### HTML-in-Canvas — plan for it here, build in Step 5

The `drawElementImage` Chrome API captures any live HTML/CSS as a GPU-accelerated texture at 60fps. This is HyperFrames' highest-impact capability — it lets you render captured product screenshots or UI through:

- **3D geometry** — a rotating iPhone or laptop model, a sphere, a curved surface
- **WebGL shaders** — liquid glass refraction, shatter into fragments, portal reveal, noise distortion
- **Post-processing** — bloom, depth-of-field, film grain, color grading

When planning beats, decide which ones deserve an HTML-in-Canvas treatment vs. a standard GSAP animation. If you want it, name it in the storyboard — Step 5 will read [`../../hyperframes/references/html-in-canvas-patterns.md`](../../hyperframes/references/html-in-canvas-patterns.md) for implementation. You don't need to specify the API details here.

### SFX assignment — happens here, not in Step 5

SFX come from HeyGen's global catalog via the `hyperframes sfx` CLI — **not** a bundled file set. The full model (when to use them, the five families, the volume hierarchy, the trim/anchor recipe) lives in [`../../hyperframes/references/sound-effects.md`](../../hyperframes/references/sound-effects.md); read it. This step only decides _which moments get sound and what kind_ — Step 5 searches the catalog and wires the clips.

**Browse first, then assign by function — not by filename.** Run `hyperframes sfx list` to see what families exist (impacts, whooshes, risers, memes, stingers, ambiences, …). For each beat that earns a sound, specify it by _what it does + how it feels_ (the catalog is searched by meaning), the moment, and a volume:

- a punchy transition whoosh at `0.2s`, volume `0.3` — on the hero image snapping in
- a soft success chime at `3.8s`, volume `0.5` — on the logo appearing

**Less is more.** Most beats need zero SFX; one per beat is typical (see the global doc's "count beats, not animations"). Never place SFX on shader transitions — they're already an audio-visual event.

**Placement, trimming, and chains are all in the global doc — don't restate per-file timing here.** Step 5 follows it: `sfx add` measures each clip (peak, onset/tail, loudness), then trims dead air and anchors hits/risers precisely. (This replaces the old "peak at start/end, never trim" rules — catalog clips aren't a fixed hand-tuned set, so trimming to the _measured_ onset/tail is how you avoid late or cut-off sounds.)

**Volume under narration:** HyperFrames has no auto-ducking — keep SFX at 0.2–0.3 under VO. Note the intended volume per entry so Step 5 wires it.

**Access:** the catalog is free but needs a HeyGen API key. If it isn't set when Step 5 runs `sfx`, ask the user for one (free at https://app.heygen.com/developers/api) or build without SFX — never silently drop them.

### Architecture Constraint: Each Beat is an Independent Composition

Each beat is built as a separate HTML file (`compositions/beat-N.html`). These are loaded independently — they do NOT share state, WebGL contexts, Three.js scenes, or DOM elements with other beats. This means:

- **No "persistent" elements across beats** — you can't have a MacBook model that stays on screen while only the screen content changes between beats 2, 3, 4. Each beat loads its own MacBook from scratch. If you want visual continuity, each beat must independently set up the element at the same position/rotation, so it APPEARS continuous.
- **No shared 3D scenes** — each beat that uses Three.js creates its own renderer, scene, and camera. If beats 2 and 3 both show a rotating laptop, they each load the model independently and must start from matching positions.
- **Shader transitions happen between beats** (in index.html), not within beats. Don't plan a shader transition "inside" a beat.

Plan your storyboard within these constraints. If you describe "the MacBook stays in place while content swaps," you need to specify that each beat independently recreates the MacBook at the same position — not that it persists.

### Device Mockups: Use the Registry Block

If the storyboard calls for a MacBook or iPhone mockup, use the pre-built `vfx-iphone-device` registry block — it has both **iPhone 15 Pro Max AND MacBook Pro** GLTF models with live HTML-in-Canvas screens, camera choreography, and glass lens morphing. Install with `npx tsx packages/cli/src/cli.ts add vfx-iphone-device`.

Do NOT hand-code a Three.js device scene from scratch. The registry block handles UV mapping, screen textures, lighting, and camera angles correctly. Hand-coded versions consistently produce broken screen textures, wrong UV flipping, and path resolution bugs. Use the block.

---

## Per-Beat Direction

Each beat is a SHOT, not a layout. Write what the CAMERA does and what the FRAME reveals — not "what's positioned where on the page."

### A beat is a shot — pick the framing before writing CSS

Every beat header should declare its shot type in the first line. **Shot types:**

| Shot                  | Use for                                                                                  | What the frame contains                                               |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Extreme close-up**  | a single card / number / character / cursor / button as the entire subject               | one element fills 60–90% of frame, everything else blurred or absent  |
| **Close-up**          | a small UI region (a single column, a card stack, a chart, a code block)                 | the subject fills 40–60% of frame with depth-layered context behind   |
| **Medium**            | a section of UI — kanban with 3 columns, chat with 3 messages, dashboard with 2-3 panels | the subject fills 60–80% of frame, edges of nearby UI bleed in        |
| **Wide**              | full UI assembly visible — only when the WHOLE thing is the point                        | full UI at 70–90% scale with deliberate negative space                |
| **Over-the-shoulder** | viewer "behind" the user — cursor / hands / device foreground, UI midground              | foreground element bottom 1/3, UI fills upper 2/3 with parallax depth |
| **Dutch angle**       | tension, urgency, "something's off"                                                      | the frame is tilted 4–8°, content composed to feel unstable           |

**The "wide shot" trap:** _Every_ beat at wide framing looks like a screenshot in CSS. Most product-demo videos should be 60% close-up + close-up + 20% medium + 10% wide + 10% extreme close-up. Wide is the rare establishing shot, not the default.

### Camera motion is the subject, not the elements

In website thinking: elements animate in, then sit still while the user reads. In video thinking: the camera moves THROUGH the scene. The composition shifts.

Every beat needs at least one camera-style move. Pick from:

- **Dolly in** — composition scales 1.0 → 1.08 over the beat duration, slight x/y drift
- **Dolly out / pull-back** — composition scales 1.15 → 1.0, revealing more context
- **Push** — fast scale-up (1.0 → 1.05, ~0.5s power3.out) on a key moment
- **Parallax pan** — background drifts opposite to foreground at different speeds
- **Orbit** — the subject rotates in 3D, or the camera circles it
- **Rack focus** — blur shifts from one element to another (background blurs as foreground sharpens)

If a beat has NO camera-style move and elements only animate inward at the start, it will read as a webpage with entrance animations. That's not a video beat.

### Forbidden patterns (the video-as-webpage failures)

These appear in nearly every iteration where sub-agents revert to website thinking. Refuse to write any beat that includes:

- ❌ **macOS / browser window chrome** as a frame around the content — traffic-light dots, URL bars, browser tabs, breadcrumbs — UNLESS the beat IS specifically about that chrome (e.g., "the macOS window itself is the subject of the shot")
- ❌ **Sidebars, navigation rails, page headers, page footers** unless the beat demonstrates navigation as its concept
- ❌ **"Centered card / panel / window with 60–120px margin on all sides"** — that's the standard webpage layout; videos use the full frame and meaningful negative space
- ❌ **"Hold with breathing" micro-animations** where elements move y: ±1–2px or scale 1.01 — invisible at video resolution; this is sub-agents pretending the beat has motion when it doesn't
- ❌ **Settled holds longer than 1.5s** with no continuous camera or compositional change — fix by adding camera dolly, depth-layer parallax, or new sub-elements entering mid-beat
- ❌ **Hover-state demonstrations** — videos have no hover; if the brand has a hover effect to communicate, find a way to show the BEFORE and AFTER as discrete frames, not a hover simulation
- ❌ **Tooltips and modal cards "for context"** that explain what something is — videos communicate through visual language, not popup hint text

### Required for every beat (the floor for video grammar)

Every beat must specify, in its visual description:

1. **Shot type** (one of the six above)
2. **Camera move** (which one, when it starts, how long it lasts)
3. **Depth strategy** (what's in foreground / midground / background, how they parallax)
4. **Motion magnitudes** that read at video scale (30px+ y/x movements, scale changes ≥0.05, opacity transitions ≥0.5)
5. **The shot's purpose** — what specifically is the viewer supposed to feel or notice in this 3–5 seconds?

---

### Existing beat-level fields (below) layer on top of the shot grammar above

Each beat is a WORLD, not a layout. Write what the viewer EXPERIENCES before you write CSS specs.

**Motion verbs** — every animated element gets one. Pick from the beat's concept, not from an energy bucket:

- **Impact:** SLAMS, CRASHES, PUNCHES, DROPS, SHATTERS
- **Directional:** SLIDES, PUSHES, WIPES, CUTS
- **Reveals:** DRAWS, FILLS, GROWS, ASSEMBLES, COUNTS UP
- **Organic:** FLOATS, DRIFTS, BREATHES, PULSES, ORBITS
- **Mechanical:** TYPES ON, CLICKS, LOCKS IN, SNAPS, STEPS

**Transition decision matrix** — pick per beat-boundary:

| CSS crossfade (the default) | Hard cut | Shader transition (rare — opt-in only) |
|---|---|---|
| Continuous motion between beats, editorial pacing. Cheap, GPU-light, deterministic. | Rapid-fire lists, percussive edits, comedy timing. Free, instant. | Hero reveals, logo unveils, "wow" moments. Max 1-2 per video; **zero is fine and common**. More than 2 flattens their impact + raises GPU init risk. |

Most videos use only CSS crossfades + hard cuts and ship beautifully. Reach for a shader transition only when a specific beat boundary EARNS the production-value bump (hero reveal at beat-1, CTA punch at the closer). If a video has no obvious "wow" boundary, skip shaders entirely. Mix shader and CSS crossfade in one HyperShader composition by omitting `shader` on any transition entry in the storyboard's `## Shader Transitions` block.

**Rhythm** — declare your scene rhythm before implementing: fast-fast-SLOW-fast-SHADER-hold. The rhythm comes from the brand and content, not a template.

Use the pacing you decided at the top of this step. The beat count, duration, and architecture are already set.

**Cut the video to match the narration length** — if the script produces 22 seconds of audio, the video should be 24 seconds with a 2-second CTA hold, not 30 seconds with 8 seconds of dead silence. Empty time at the end where nothing is happening loses the viewer.

**Frame-filling rule:** When describing visuals per beat, specify sizes as FRAME FILL PERCENTAGES, not pixels. "Product screenshot fills 80% of frame" not "600px wide card."

**Pick what serves each beat: compose from divs/CSS/SVG/Canvas, use the captured asset, or — most often — layer both.** Pure composition or pure capture rarely produces the strongest beat; they tend to correlate. Some beats lean composed (a kanban built from divs with the brand's real colors, real project names, animated entrances no screenshot can deliver). Some beats lean captured (a hero illustration push-in, a product photo with parallax depth, a brand diagram drawing in via stroke-dashoffset, a captured video clip as the bed). Most beats layer both (composed UI with captured brand marks stamped in; captured hero photo with kinetic type on top; a 46-SVG partner-logo grid composed as one component using the actual captured logos; a captured screenshot in a 3D MacBook mockup with composed glow). The agent decides per beat what THIS concept needs — none of the three is the "default." **The wrong move is doing the same pattern across every beat.** Vary it across the video: different framings, different motion patterns, different content-source proportions. Keep one stylistic spine (the brand's colors, fonts, tonal register from DESIGN.md — it's one story across the reel) but **vary the technique per beat** so the viewer keeps watching. The video should feel **alive in every frame** — motion that's continuous and tangible, **like things exist in a physical world**.

**Asset use isn't spamming when the concept needs it.** A 46-SVG grid of partner-company logos is one beat's primary content, not spam. Two captured assets layered in a beat (logo + hero photo) is normal. Multiple icons composed into a feature grid using the brand's real captured SVGs is normal. The spam rule applies to assets that DON'T serve any beat's meaning — those don't appear. The "use it / compose it / combine both" decision is per-beat judgment; trust the agent to read the beat's concept and pick what makes that beat awesome.

**Opener default: fast intro to stop the scrollers.** Even a cinematic video should start with a punch — a logo strike, a kinetic word build, a particle burst, a captured hero illustration push-in, a 3D-rotating product photo, a typed-on terminal line, an SVG path drawing itself — anything that lands inside the first 1.0–1.5 seconds. (Shader bloom is also valid here but optional; the non-shader openers above are equally punchy and cheaper.) Slow intros work for prestige trailers; videos shipping anywhere social or feed-based need a hook that beats the 1.5-second scroll threshold. Plan the opener as the most ambitious beat in the storyboard, not the gentlest one.

**Named hook patterns** — pick one and write it into the opener beat's concept. Each is a known scroll-stopper; the choice depends on the brand and the message:

| Hook                       | When to use                                                            | Example shape                                                                  |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Shocking statistic**     | A number that contradicts assumption, or that the viewer must verify   | `"82% of teams ship slower than they think."`                                  |
| **Imagine**                | Future-state aspiration that pulls the viewer into a desired scenario  | `"Imagine your team ships on Monday, not Friday."`                             |
| **Direct address**         | Speak straight to the viewer's role, no setup                          | `"Designers — stop pasting Figma comments into Slack."`                        |
| **Pain validation**        | Name the unspoken frustration the audience already feels               | `"You opened 14 tabs to plan one sprint. Again."`                              |
| **Visceral metaphor**      | A physical / sensory image that maps to an abstract product behavior   | `"Your roadmap is a bonfire. Most teams pour gasoline on it."`                 |
| **Rhetorical question**    | A question with an implied answer that creates investment in the next beat | `"What if context-switching cost you nothing?"`                                |
| **Category announcement**  | Stake a new category or repositioning that the rest of the video earns | `"This is the first IDE built for AI handoffs."`                               |
| **Visual spectacle**       | The shot itself is the hook — no copy, no claim, just a striking image | A logo dissolving into a particle storm; a product 3D-rotating through liquid glass |
| **Question invitation**    | Invite the viewer to participate (a poll, a comparison, a self-rating) | `"How many tools did you use this morning? Count them. We'll wait."`           |
| **Trend positioning**      | Anchor to a cultural / market shift the viewer is already aware of     | `"Every AI tool ships an agent now. Most of them lie. We don't."`              |
| **Contradiction-reveal**   | Attack a belief the viewer holds; the video is the proof              | `"You were taught to write tests first. Nobody on a real team does that."`     |
| **Time-stamped urgency**   | Drop the viewer into a moment-in-time scene already in motion         | `"Tuesday, 9:47 AM. You have 13 minutes before standup. Zero lines written."`  |
| **Aftermath open**         | Start in the resolved/peak state; rewind chronology shows how         | Team high-fiving on the closing frame, then `"Eight hours earlier."` smash-cut |
| **Negative space**         | First 1.0–1.5s intentionally empty (silence, black, single fixed dot) | 1.2s of pure black with one faint heartbeat SFX, then full-hero reveal         |

Pick one — every entry above is a known scroll-stopper, none is "better" than another. The right choice is whichever fits the brand voice, the platform, and the message at hand. **Don't combine more than one hook per opener** — stacking fragments the cold-open and loses the scroll.

**CTA / closing beats** are consistently the weakest. Agents treat them as "logo + tagline + done." A good CTA should: make the logo entrance an event (SVG path draw, scale with overshoot, or anything awesome really), have continuous background motion, and hold only 2-3 seconds after the last spoken word — NOT 8-10 seconds of silence.

**VO start timing — decide here, not in Step 5.** When does the narration actually begin relative to the first visual? Options: (a) VO starts over the visual intro (heard before content settles — creates urgency), (b) VO starts after the visual intro settles (viewer sees the opening, then hears the voice — creates drama), (c) a few seconds of music-only visual before VO enters. None of these is a default — pick based on the brand and the opening beat's concept. State the intended narration start time explicitly in the storyboard's Global Direction, e.g. `**Narration start:** 0.8s (after hero intro settles)`. Step 5 wires this as the audio element's `data-start`.

**Concept-first beats.** Every beat starts with its CONCEPT — not "what technique to use" but "what does this scene should show, what did the previous showed and what will the next show...?" What idea is being communicated? The crazy and interesting concept drives every technical decision.

In the capture pipeline, each beat includes:

### Concept

What does this scene REPRESENT in terms of previous (if exists) and next scenes? Not "show features" but a specific idea and logic.

### VO cue

Which narration line plays over this beat (Also keep in mind the whole narration of the video to understand and keep in mind the flow).

### Visual description

What the viewer sees — described cinematically, not as CSS specs. Use camera language and production motion designer vocabulary (pan, zoom, drift, settle, and more of those words). Think in layers — what's supposed to happen in the foreground, midground, background simultaneously?

**For beats where a captured asset is the primary visual** (a homepage-reveal where the literal site IS the subject; a hero illustration push-in; a product photo with kinetic type on top; a brand diagram drawing itself in; a captured video clip as the bed; a grid built from real partner-company SVGs): specify which asset(s), how much of the frame each fills (%), and where text/labels go relative to safe zones. Don't blindly center text over busy product UI. **Vary across the reel** — a video where every beat is asset-as-primary is a slideshow; a video where every beat is composed-from-divs is generic; varying the content-source proportion per beat (some captured-primary, some composed-primary, most layered) is what keeps the video alive.

### Visual content + technique

Two things, both required for every beat:

**Primary visual content** — what's in frame and carrying the beat. Could be:

- **Composed from scratch** (divs / CSS / SVG / Canvas) — describe markup structure, the techniques powering it (cite [capabilities.md](capabilities.md) sections + [techniques.md](../../hyperframes/references/techniques.md) entries), key animation events. E.g. "Composed kanban: 3 column divs, 4 cards each, drag-and-drop with `back.out(1.7)` entrance stagger, counter chip on In-Progress incrementing via `tl.set()`."
- **A captured asset** (image / SVG / icon / logo / video / screenshot from `capture/assets/`) — name the asset path, frame-fill %, treatment, motion (e.g. `capture/assets/hero-illustration.png` fills 70% of frame, push-in dolly scale 1.0 → 1.08 over the beat, slight parallax y-drift).
- **Both layered** — composed UI with captured brand marks stamped in; captured hero photo as bed with kinetic type on top; a partner-logo grid composed from N captured SVGs; a captured diagram drawing in stroke-dashoffset while composed labels animate alongside. Describe each layer and how they interact.

Use as many captured assets as the beat's concept genuinely needs. A 46-SVG partner-logo grid is one beat's primary content, not spam. Two assets layered (logo + hero photo) is normal. Zero captured assets when the beat is pure kinetic typography or an abstract reveal is also fine. **Decision is per-beat, by the agent, based on what makes THIS beat awesome.**

**Brand-inflect:** brand colors from DESIGN.md, real product data (project names, real metrics, real product copy — not placeholder labels), narration-sync moments. Make this beat THIS brand's beat, not a generic UI demo. One stylistic spine across the reel; varied technique per beat.

Write this section for THIS project's actual brand and assets — not from memory.

### Text Animations

Every text element in this beat must name a specific effect from `skills/hyperframes/references/text-effects.md`. Read the catalog, pick what fits the brand and this beat's mood — don't default to the same effect every beat.

Format (FORMAT EXAMPLES of structure, not prescriptions — pick based on brand/mood/context):

- `[element — e.g. "main headline"]`: `[effect-id]` — `skills/hyperframes/assets/text-effects/specs/[id].json`
- `[element — e.g. "eyebrow label"]`: `[effect-id]` — `skills/hyperframes/assets/text-effects/specs/[id].json`

The sub-agent reads the named JSON spec and implements from `showcase.library_adapters.gsap`. No creative decisions at build time. **Source lookup:** the 24 specs are bundled locally at `skills/hyperframes/assets/text-effects/specs/<id>.json` (resolve relative to the worktree root). If the upstream `pixel-point/animate-text` skill is loaded, equivalent specs are also at `.agents/skills/animate-text/assets/specs/<id>.json` — prefer whichever resolves first.

### Beat Timing

Two numbers Step 5 needs to wire `data-start` and `data-duration` correctly:

- **HyperShader transition in at:** `[time]s` (the `time:` value in the transitions array for the transition INTO this beat — or 0 for beat 1)
- **GSAP timeline duration:** `[duration]s` (how long this beat's internal animations run — when does the last tween end?)

Example: `Transition in at: 4.2s · GSAP duration: 5.5s` → Step 5 sets `data-start="4.2" data-duration="5.5"`.

### Animation Sequence — must span the ENTIRE beat

A beat is a SCENE with internal life, not a single entrance followed by a static hold. Things should be happening throughout the entire duration — new elements appearing, existing elements transforming, camera drifting, details revealing, sub-moments unfolding.

If your animation sequence only has events in the first 2 seconds and the beat lasts longer, the rest is dead air. Plan moments across the full duration. Nothing should sit unchanged for more than ~2 seconds — if an element is on screen, give it continuous motion (drift, breathe, pulse, parallax).

Describe the feel precisely: "snappy overshoot bounce settling into place" → back.out; "slow heavy drift" → power1.inOut. Vague adjectives are useless.

### Named motion patterns — write these into the storyboard, the worker implements

The storyboard names a pattern by ID; the beat worker reads the row and codes the GSAP shape. **Every entry below is equal-weight** — none is preferred or "best" for any category. Pick the one that matches the beat's intent, not the one that reads richest in this doc. The format is uniform: mechanism + one concrete number/constraint.

- **`stillness-before-climax`** — 0.3–0.75s pause between a major action and its confirmation. Schedule the gap explicitly in the per-beat choreography (`trigger at 2.2s · response at 2.95s`).
- **`exit-75-percent`** — exit duration ≈ 0.75 × entry duration. Entry 0.8s → exit 0.6s. Not 50% (flash), not 100% (sluggish).
- **`multiplicative-breathing`** — continuous ±2–5% scale layered on the settled scale via `scale = final * (1 + sin(t * freq) * amp)`, `onUpdate` reads `tl.time()`. Not yoyo (overwrites baseline). Minimum amplitude ±6px or ±2–5%.
- **`leading-line-camera-traversal`** — world canvas larger than 1920×1080 (e.g. 6000×3000); the "camera" is a GSAP tween on `.world` `transform: translate(x, y)` between named coordinates. Centering formula: `translate(-cx + 960, -cy + 540)`. Optional SVG paths draw between camera moves to suggest the route.
- **`match-cut-handoff`** — adjacent beats share an element at the seam (beat N exit pose = beat N+1 entry pose, same screen position + scale). The crossfade hides the shape change; the eye reads continuity. Storyboard names both poses explicitly.
- **`whip-pan`** — between-beat transition: beat N exits with 0.15s directional blur sweep; beat N+1 enters with mirrored 0.15s sweep from the opposite side. Wired by orchestrator, not HyperShader. Total seam ≈ 0.3s.
- **`earned-hold`** — 0.6–1.2s of zero motion on a single hero element, with music attenuated −6 to −10 dB. Storyboard declares the duration; the worker writes no tweens across that window.
- **`settling-overshoot`** — entering element overshoots target by 5–8px (or 4–8% scale), then jitters back at decreasing amplitude over ~0.3s. Two stacked tweens: arrival with `back.out(2)` + follow-up `elastic.out(1, 0.4)` on a small delta.
- **`custom-cubic-bezier-ease`** — define a `CustomEase` via cubic-bezier coordinates when standard GSAP eases (power1–4, expo, elastic, back, sine) don't carry the intended personality. Storyboard names the coords: `CustomEase.create("hero-in", "M0,0 C0.6,-0.28 0.735,0.045 1,1")`. Worker registers it once and references by name in tweens.
- **`bezier-motion-path`** — element follows a curve through space, not a straight line. GSAP `MotionPathPlugin` reads an SVG `<path d="…"/>` and tweens the element along it. Storyboard names the path id and traversal duration; the path itself can be drawn beat-side or imported from `capture/assets/`.

---

## Asset & Brand Floor (verify after beats are written)

Your beats are now conceptually defined, each with its primary visual content (captured / composed / both) and technique. **Now**, do a single pass to verify the floor + the variation principle. This is a check, not a rewrite — assets were already woven into beats during beat-writing.

### The brand floor (REQUIRED — main agent checks at Step 5)

Two hard rules. The deliverable fails the brand-floor check if they're missing:

1. **The brand mark (logo / wordmark SVG) appears in the opener AND the closer beat.** A brand video that doesn't show the brand mark in the first and last frame is failing its job. The only exception is when STORYBOARD.md explicitly overrides this with a written reason (e.g., "opener is pure kinetic typography to delay brand reveal until beat 3 for narrative tension"). If you override, write the reason in that beat's Visual content section so the verifier sees it.

2. **The site's signature visual appears somewhere in the video.** Every captured site has one — the gradient wave, the hero illustration, the distinctive product UI mark, the wordmark animation, the hero photograph, the signature diagram. Whatever a viewer who knows the brand would point at and say "that's them." Find it during Step 0; place it in at least one beat as primary content or a meaningful layer.

### The variation check

Scan the beats you wrote. Is every beat's primary visual the same TYPE (all captured photos / all composed UIs / all kinetic typography over a captured bed)? If yes, the reel will feel flat — fix it by re-balancing one or two beats. **Vary the content source** (some captured-primary, some composed-primary, most layered) alongside varying motion patterns, framing, scale, and depth. Keep ONE stylistic spine across the reel (brand colors, fonts, tonal register — it's one story) but vary the technique per beat so the viewer stays watching.

### Asset use table

List every captured asset that appears in your beats:

| Asset                          | Type     | Where (beat #)  | Role                                                                            |
| ------------------------------ | -------- | --------------- | ------------------------------------------------------------------------------- |
| stripe-logo.svg                | SVG      | Beat 1 + Beat N | Primary opener (stroke-draw), closer (hold)                                     |
| hero-illustration.png          | Image    | Beat 2          | Primary (push-in dolly, parallax y-drift)                                       |
| partner-logos/*.svg (46 files) | SVG grid | Beat 4          | Primary grid component — all 46 captured logos animated in 0.04s stagger       |
| wave-fallback-desktop.png      | Gradient | Beat 3 bg layer | Layer behind composed dashboard (ambient depth wash)                            |
| datavizstatic3x.png            | Data viz | Beat 5          | Layer with composed counter overlay animating real numbers                      |

One row per asset used. Assets that didn't fit any beat's meaning simply don't appear in the table — no "SKIP" rows needed. The question isn't "use or skip every captured asset"; it's "which assets serve the beats I wrote, and where do they appear." If a beat would benefit from an asset you haven't placed, add it; if a beat doesn't need one, leave it composed.

**Reminder of the principle:** captured asset use, composed visual use, and layered combinations are all valid; the agent picks per beat what serves THIS beat's meaning. Spam = adding assets that serve no beat's meaning. Multiplicity (46-logo grid, multiple icons in a feature row, etc.) = legitimate when the concept needs it.

---

## Production Architecture

Include this file tree at the bottom of the storyboard:

```
project/
├── index.html                    root — VO + underscore + beat orchestration
├── DESIGN.md                     brand reference (from Step 1)
├── SCRIPT.md                     narration text (from Step 3)
├── STORYBOARD.md                 THIS FILE — creative north star
├── transcript.json               word-level timestamps (from Step 4)
├── narration.wav                 TTS audio (from Step 4)
├── capture/                      captured website data (from Step 0)
│   ├── screenshots/
│   ├── assets/
│   │   ├── svgs/
│   │   ├── fonts/
│   │   ├── lottie/
│   │   └── videos/
│   ├── extracted/
│   │   ├── tokens.json
│   │   ├── design-styles.json
│   │   ├── visible-text.txt
│   │   ├── asset-descriptions.md
│   │   ├── animations.json
│   │   ├── assets-catalog.json
│   │   └── detected-libraries.json
│   ├── AGENTS.md
│   └── CLAUDE.md
└── compositions/
    ├── beat-1-hook.html
    ├── beat-2-features.html
    ├── ...
    └── captions.html
```

---

## Example: Beat-by-Beat Format

The two beats below are from the real Claude Design × HyperFrames production video. They show the expected level of specificity — exact timing, exact GSAP values, exact animation sequences.

**Why only 2 beats are shown:** Earlier versions of this reference showed all 10 beats, and agents pattern-matched from them regardless of the brand being captured. Moodboard layouts, capabilities grids, and orbital letter closers started appearing in every video. The concepts in those beats are specific to HyperFrames as a product — they should not appear in a video about a fintech tool or a wellness app. Only two beats are shown here to demonstrate the format level, not to suggest these specific techniques.

### BEAT 1 — LIGHT BALL OPENER (0:00–0:03)

**Concept:** No title card, no fade from black. A single point of warm light appears in total darkness. It blooms into a horizon-spanning glow. The viewer leans in before a single word is spoken.

**Visual:** Deep black canvas (#050507) with grain overlay (mix-blend-mode: overlay, 0.12 opacity) and extended vignette (inset: -200px for long falloff). The `.ball-core` is a 40px radial-gradient orb (white center → accent → transparent). Animation sequence:

- 0.0s: Orb appears tiny (scale: 0.15, opacity: 0→1, 0.18s, expo.out)
- 0.18s: Orb grows continuously (scale: 0.4→1.4, 0.7s, power1.in). Simultaneously the `.ball-halo` (140% width, 70% height ellipse, accent-tinted radial-gradient, blur: 60px) blooms in (scale: 0.4→1, opacity: 0→1, 0.55s, sine.out)
- 0.65s: Orb keeps growing as it fades (scale: 1.4→8, opacity: 1→0, 0.4s, power2.in) — the point of light dissolves into pure glow. Halo expands further (scale: 1→1.25, opacity: 0.85)
- 0.85s: Horizontal beam line emerges from center (scaleX: 0→1, 0.4s, expo.out) with warm box-shadow glow (0 0 24px 1px rgba(255,240,220,0.4))
- 1.0s: Title "Claude Design × HyperFrames" fades up above the line (opacity: 0→1, y: 14→0, 0.7s, power3.out). Ampersand in italic accent color.
- 1.3s: Date subtitle appears below the line (0.6s, power2.out). Monospace font, 0.32em letter-spacing, uppercase.
- 2.2s: Bottom credit line fades in ("This entire video was made with HyperFrames in Claude Design")
- 3.0–4.4s: Hold — halo breathes (opacity drifts to 0.55, scale to 1.4, sine.inOut), headline drifts slightly (y: -3px)
- 4.4s: Everything fades to black together (0.6s, power2.in)

Corner marks (monospace, 11px, 0.45 opacity) at top-left and bottom-right for editorial feel.

**SFX:** Deep ambient bass pad already playing from frame 1.

---

_(Beats 2–9 intentionally omitted. See above for why.)_

### BEAT 10 — ORBITAL LETTERS / CLOSE (example of a closing beat spec)

**VO:** (resolving — the brand name assembles)

**Concept:** Individual letterforms of "HYPER FRAMES" burst in from alternating sides, each with rotation and offset. They bounce into place with back.out(2.0) overshoot. An accent line draws itself across the width. An orbit ring expands with a glowing dot tracing a full 360° rotation. A tagline types itself out: "HTML in. Video out." with deliberate pauses after each word. Everything breathes after assembly — letters float gently, glow pulses, connector lines shimmer.

**Visual:** Deep black. Center glow: 900px radial-gradient orb (accent #e8a769 at 0.35 → 0.12 → 0.025 → transparent), blur(100px).

**Animation sequence:**

- 0.1s: 12 character elements ("H Y P E R [space] F R A M E S") enter staggered 0.06s apart, each from y: 80 with alternating x offset (odd: -30, even: +30) and rotation: -15. Landing: back.out(2.0), 0.7s — gives each letter a satisfying overshoot bounce.
- 1.0s: Accent SVG line draws across the full 1920px width (strokeDashoffset: 1920→0, 0.6s, power3.out). #e8a769 stroke, 2px.
- 1.0s: Glow breathes in (opacity: 0→0.2, sine.inOut, 0.4s), then back to 0.1.
- 1.4s: Orbit ring (600px circle, 1px border rgba(accent, 0.3)) expands from scale: 0.5 to 1.0 (expo.out, 0.5s). A glowing orbit dot (8px, accent color, box-shadow glow) on the ring traces a full 360° rotation over 2.5s (linear easing — constant speed).
- 1.25s onward: Letters begin a subtle float — alternating directions (y: ±2px, sine.inOut, 1.4s, yoyo, repeat 1), staggered 0.04s. Keeps the assembled word feeling alive.
- 1.8s: Tagline types itself in monospace (24px, accent color, 0.15em letter-spacing): "HTML" (pause 0.2s), " in." (pause 0.25s), " Video" (pause 0.1s), " out." — each segment at 0.03s per character using steps(N) easing for discrete character appearance.
- 1.8s onward: Glow continues gentle breathing (opacity: 0.1→0.14, sine.inOut, 1.2s, yoyo, repeat 1).

**SFX:** Soft chime on letter assembly completion. Silence under the tagline typing — let it land.

---

## Write the Narration Script (same step — write alongside the storyboard)

The script and storyboard are one step. Every beat already has a VO cue — the script is just all those VO cues assembled into a single document. As you write each beat, write its narration line. Then assemble them into `SCRIPT.md`.

The script serves the storyboard — write words that fit the visual plan, not the other way around. Reference real product features, real stats, and real components from `capture/extracted/visible-text.txt`. Use exact numbers.

**Script length depends on the creative direction, not a formula.** A cinematic video with dramatic pauses and visual-only moments might have 40 words across 30 seconds. A rapid feature showcase might pack 100 words into 30 seconds. The storyboard's pacing and style (from Step 2's brief) determine how much narration vs. silence the video needs. Some beats are narrated; some are pure visual. Let the creative plan drive the word count, not the other way around.

The key constraint: don't pad with dead silence where nothing is happening. If a beat has no narration, something visual must be carrying the viewer's attention. Empty frames = lost viewers.

Save as `SCRIPT.md` in the project directory.

**Script writing rules:**

- ~2.5 words/sec natural pace. 15s = ~37 words, 30s = ~75 words.
- Use contractions ("it's", "you'll"). Read it out loud — if it sounds robotic, rewrite.
- Write numbers as spoken: `$1.9T` → "nearly two trillion dollars", `API` → "A P I", `10x` → "ten times"
- **Hook first** — bold claim, provocative question, contrast, or shocking number. Never "Welcome to..." or "Introducing..."
- Structure: Hook → Story → Proof → CTA. 15s ads can skip Story.

---

## User Review Gate

After writing the storyboard AND the script, present BOTH to the user for review. The storyboard and script are coupled — the user needs to see them together to judge whether the video works.

### How to Present

Summarize the plan clearly. Don't dump the full STORYBOARD.md — give the user a beat-by-beat overview they can scan in 30 seconds:

> **Here's what I've planned for your [duration] [type]:**
>
> **Beat 1 (0:00–0:04):** [one sentence — what happens visually + what the narration says]
> **Beat 2 (0:04–0:10):** [one sentence]
> **Beat 3 (0:10–0:18):** [one sentence] _(hero beat — 3D MacBook reveal with bloom effect)_
> ...
> **Beat N (closing):** [one sentence — CTA/logo]
>
> **Style:** [dimension summary — e.g., "Cinematic pacing, dark mood, dramatic transitions for hero, clean for the rest"]
> **Narration:** [first and last line of the script]
> **Total duration:** [X]s with [N] beats
>
> **Does this match what you envisioned?** I can adjust: beats, pacing, specific effects, the script tone, or anything else. Or if this looks good, I'll proceed to voice generation.

### What to do with feedback

- **"Looks good" / approval** → proceed to Step 4 (VO)
- **Specific feedback** ("make beat 3 longer", "change the opening to be faster", "I don't want the typing effect") → update STORYBOARD.md and SCRIPT.md, re-present
- **Major direction change** ("actually I want it more playful, not cinematic") → revisit Step 2's brief dimensions, rewrite storyboard
- **Iterate until the user is satisfied.** This is the cheapest place to make changes — changing a storyboard beat costs 30 seconds. Changing a built composition costs 5 minutes.

### Gate

Both STORYBOARD.md and SCRIPT.md exist AND the user has explicitly approved the plan.
