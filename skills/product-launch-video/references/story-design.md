# Story design — product-launch narrative method

> The method behind **Step 3 (Storyboard + Script)**. You (the orchestrator) read it to write `STORYBOARD.md` + `SCRIPT.md`. It governs **what the video says and in what order** — the narrative layer. It does NOT cover how a frame looks (effects / assets / composition → `visual-design.md`) or the file syntax (→ `hyperframes-core` `storyboard-format.md` + `script-format.md`). Adding a palette / effect / asset rule here? Wrong home.

## What you produce

Two plan-layer files (file shapes live in `hyperframes-core`; this defines what goes _in_ them):

- **`STORYBOARD.md`** — the skeleton. Frontmatter (`format` from the chosen aspect · `message` the one-line thesis · `arc` the narrative arc · `audience` · optional `music:` a BGM mood phrase like "tense build → triumphant" that audio retrieves a track by — omit it and audio derives the query from `message`/`arc`), then one `## Frame N — <name>` per beat:

  ```
  ## Frame 3 — The problem
  - scene: a 20-minute timer spins on a stack of rejected takes
  - voiceover: "The old way? Prompt, wait twenty minutes, get something that misses."
  - transition_in: crossfade
  - status: outline
  - src: compositions/frames/03-problem.html
  - type: pain_point
  - persuasion: Pain agitation
  - beat: frustration

  Establish the pain we remove — the cost of the old way, felt before the product appears.
  ```

  `scene` = the one-line contact-sheet caption; `voiceover` = the narration guide; `transition_in` = a transition type from the registry (below); `type` / `persuasion` / `beat` ride as metadata. The prose beneath is the frame's **narrative role + key message**. List the frame's `asset_candidates` too (you read `capture/`, so you pick which real assets are relevant — see below). Leave `effects` / composition and the focal-asset call to visual-design (Step 4); set a rough `duration` estimate — audio later overwrites it with the real voice length. Also write each frame's planned `src` (`compositions/frames/NN-<slug>.html` — `NN` = zero-padded frame number, `<slug>` a short kebab from the title) and `status: outline`: the lifecycle starts at `outline`, and the **orchestrator** advances it (`built` → `animated`) as the frame gets built — you never advance it, and `src` is the planned path (the file need not exist yet).

- **`SCRIPT.md`** — the locked narration: one `## Line N — <label> (Frame N)` per spoken frame, the spoken text indented (that indented text is all TTS reads). Silent frames get no line.

## Core principle

A website is an information layout; a video is an emotional journey. Sequence comes from narrative design, **never page order** — reorder, merge, omit, restructure the captured content freely. `capture/` is your source of facts and assets, not a story template.

## Set the register from `frame.md`

Before choosing an arc, read the project's `frame.md` (the adopted design-truth) — its mood / aesthetic / voice tunes the narrative to the same channel as the visuals:

| `frame.md` signal                                  | Tunes                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| overall mood / `principle` / tone                  | script tone — restrained & joke-free vs warm & disarming vs sharp-but-plain |
| display-type character (loud/tight vs editorial)   | hook rhythm — short triplets vs longer anaphora lines                       |
| aesthetic / material (spectacle/glass vs flat B2B) | archetype bias — Feature-Benefit Cascade vs PAS / BAB                       |

Register is a **soft** input — it narrows choices; the final archetype call comes from what the product actually is (the captured content).

## Provided-script modes

When the user pasted a script (`user_script.txt` + a `VO_MODE`):

- **restructure** (default): treat it as raw material — rewrite into punchy per-frame narration (1-2 sentences, ≤20 words), reorder / merge / omit to fit the archetype.
- **verbatim**: the user's words are fixed — segment into frame-sized chunks at sentence / paragraph boundaries, copy each **unchanged** into `SCRIPT.md` (you may split one long sentence at a clause boundary, never edit words). The ≤20-word budget and the voice-quality rewriting below are **suspended**. **Duration follows the script** (~2.5 words/sec); total length follows the full script — no 60-90s cap. You still design every frame's `type` / role / `transition_in`; infer the archetype that best fits the script's _existing_ arc.

## Choose ONE archetype

Pick one outer arc (name a compound only deliberately). Each is a complete emotional journey — don't mix top-level frameworks.

| Archetype                     | When                                                                             | Arc (beat shape)                                                    | Product reveal        | Examples                |
| ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------- | ----------------------- |
| **Pain-Agitate-Solve (PAS)**  | audience already feels the pain; B2B broken workflows; strong data point         | V-curve: anxiety → peak tension → relief → confidence → empowerment | **late, 33-71%**      | Alpha, Madison          |
| **Future Pacing**             | new category / paradigm; "imagine" framing; aspirational                         | no valley: curiosity → anchoring → reassurance → awe → empowerment  | **very early, ~17%**  | AgentGPT                |
| **Demo Loop**                 | UI self-explanatory; "show don't tell"; 3+ distinct queries                      | shallow: urgency → relief → demo rhythm → confidence → action       | **early, ~22%**       | GWI                     |
| **Before-After-Bridge (BAB)** | workflow tool; value is the process; 3+ steps                                    | friction → recognition → relief → process confidence → motivation   | **early-mid, 17-38%** | Kyvos, DeskLog          |
| **Feature-Benefit Cascade**   | feature-rich; mid/lower funnel; desire-driven (NFT / luxury / SaaS); 5+ features | steady climb: curiosity → desire → status / urgency → action        | **earliest, frame 1** | Vibe.co, Elemental Soul |

Beat order per archetype (rough % of runtime):

- **PAS** — hook 5-15% → pain_point 10-20% → benefit_highlight (tease the solution concept, not the product) → product_intro → feature_showcase (3+ frames) 25-50% → cta.
- **Future Pacing** — "Imagine…" hook → branding (name it) → pain_point (bold removal promise) → feature_showcase → benefit_highlight (mechanism) → feature_showcase (output) → benefit_highlight (self-improving loop) → cta.
- **Demo Loop** — hook (urgency question) → product_intro → feature_showcase (niche query) → feature_showcase (different domain) → benefit_highlight (trust claim) → cta.
- **BAB** — pain/hook (friction) → benefit_highlight (tease the After) → product_intro (product as bridge) → feature_showcase ×3 (bridge steps; last is the WOW) → benefit_highlight (crystallize the After as a metric) → cta.
- **Cascade** — hook (brand / spectacle) → product_intro → [feature_showcase → benefit_highlight] ×3-6 (≈1:1, never stack 4 features before a benefit) → benefit_highlight (climax tier) → cta (drop date / signup).

**Compound** — real videos layer an inner rhythm inside an outer arc. Write `arc` as `"<outer> with <inner>"` (e.g. `"PAS with Feature-Benefit progression"`). Feature-Benefit Cascade is the most common inner rhythm. `branding` is its own beat (philosophical positioning / category claim), distinct from `product_intro` and `cta`.

## Per-frame narrative — the five fields

Every frame names all five (vague benefits forbidden):

- `type` — `hook | pain_point | product_intro | feature_showcase | benefit_highlight | social_proof | branding | cta`.
- **narrativeRole** (in the prose) — the frame's job in the story, not what's on screen.
- **keyMessage** (in the prose) — the one thing the viewer should remember.
- `persuasion` — a named technique from the catalog (combine if several are active).
- `beat` — the emotional beat (one word / short compound).

### Hook strategy — pick one for the opening 3-5s (the highest-leverage moment)

| Strategy                              | When                                                       | Example                                                       |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **Shocking statistic**                | a credible data point quantifies industry-level pain       | "50% of companies still rely on paper checks" (PayCloud)      |
| **Imagine / future-pacing**           | the product creates a new category or paradigm             | "Imagine next generation AI for the enterprise" (AgentGPT)    |
| **Direct address / character hail**   | the audience is clearly defined and tribe-like             | "Hey, sales pro." (JustCall)                                  |
| **Pain validation**                   | the audience already knows the pain; say it back           | "Tired of clueless conversations?" (JustCall)                 |
| **Visceral metaphor**                 | the pain is abstract and needs to become embodied          | "Goodbye to long airport queues… dinosaurs of the past" (HRS) |
| **Rhetorical question**               | open a cognitive gap that drives curiosity                 | "Need answers about your audience, now?" (GWI)                |
| **Category announcement**             | the product _is_ the category; make it memorable           | "Cloud BI Acceleration" (Kyvos)                               |
| **Visual spectacle / world-building** | the aesthetic itself is the pitch (crypto, NFT, lifestyle) | "Welcome to the Ultraverse"; "Fire" (Elemental Soul)          |
| **Question / invitation**             | creator-tool / democratization narrative                   | "Got something to create?" (Artinals)                         |
| **Trend positioning**                 | ride a cultural wave; novelty is the hook                  | "Introducing the future of influencer marketing" (Skye)       |

### Persuasion catalog — name the technique (not a vague benefit)

| Family                       | Techniques                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pain / Friction**          | Pain agitation · Cognitive overload representation · Negative framing & contrast · Agitation by visual clutter · Contrast (chaos vs clean)           |
| **Authority**                | Authority bias · Authority by association with logos · Expert authority · Statistical proof / hard metrics · Brand authority                         |
| **Social**                   | Social proof · Bandwagon · Social belonging · Status seeking · Gamification + social proof · In-group signaling (insider terms)                      |
| **Reduction**                | Friction reduction · Risk reversal (free trial) · Simplification · Cognitive ease · Frictionless adoption                                            |
| **Vision**                   | Aspiration / innovation bias · Future pacing · Pain removal (bold absolutes) · Trend exploitation                                                    |
| **Proof**                    | Demonstration of capability · Visual proof of mechanics · Demonstrated efficiency · Show don't tell · Live-action preview                            |
| **Value**                    | Value stacking · Value-centric positioning · Feature-to-benefit translation · Price anchoring · Empirical proof & concrete numbers · Cost-efficiency |
| **Empowerment**              | Empowerment & control · Risk reduction · Ownership clarity · Creative empowerment                                                                    |
| **Scarcity** (crypto-native) | Scarcity & temporal urgency (drop dates) · Exclusivity (tier scarcity) · FOMO · Anchoring via explicit pricing                                       |
| **Structure**                | Rule of three · Direct address / audience segmentation · Audience filtering                                                                          |
| **Personality**              | Humor / personality injection · Cultural reference / insider beat                                                                                    |

Escape hatch: if a frame's persuasion maps to nothing, name a new technique inline **and explain its mechanism** (e.g. "Subtractive proof: removing the chaos visually instead of explaining why the new UI is clean"). Never write generic "show benefits."

### Emotional beats — specific, not "positive" / "happy"

- **Negative valley** (hook / pain_point): anxiety · frustration · overwhelm · tension · urgency · skepticism · cognitive overload · FOMO
- **Pivot** (product_intro / branding): relief · curiosity · intrigue · aspiration · clarity
- **Build** (feature_showcase / benefit_highlight): trust · confidence · control · power · awe · empowerment · foresight · excitement · playfulness · ease · prestige · desire · belonging · reassurance
- **Resolution** (cta / final beats): triumph · motivation · urgency-to-act · peace of mind · inevitability

Compound beats are often strongest ("Excitement _and_ foresight") — write both when two feelings are active.

## Named moves — optional craft (how to make a frame _land_)

The archetype tells you which arc; these tell you how a frame lands. Apply as they fit.

| Move                                      | Mechanism                                                                                                              | Fits                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Continuous-sentence recruitment / cascade | Split one sentence across 2-3 frame cuts so the completing word lands on a beat ("…like / yours.").                    | any (recruitment in hook, cascade in body) |
| Dual-register pain stack                  | Two adjacent pain frames hitting different anxieties — mental load _then_ financial cost.                              | PAS, BAB                                   |
| Specialist personification chain          | Name the product as a person → verb-anthropomorphize → pronoun at climax ("Meet Madison" → "she's driving customers"). | any named product                          |
| Price-anchor after cost-pain              | Reveal the price one frame after a cost-pain frame; the viewer does the contrast math.                                 | PAS, BAB                                   |
| Analytics-as-triumph                      | Set the analytics/reporting frame's beat to "triumph"; frame the dashboard as proof of victory, not a summary.         | any demo body                              |
| Tribal / domain vocabulary saturation     | 1-3 audience-native terms per line to prove in-group fluency ("F&I", "signal vs noise").                               | PAS, BAB, niche audiences                  |
| Cultural-ritual climax                    | Elevate a community-bonding feature (not the most utilitarian) to the longest frame.                                   | PAS / community products                   |
| Passive-solution positioning              | Frame the product as something that happens with zero behavior change ("whenever you open a new tab").                 | PAS, Future Pacing                         |
| Founder-voice product intro               | "That's why we made X" — builder-to-peer, not marketing-speak.                                                         | any reveal                                 |
| Inverted pacing for relief                | Front-load short pain frames, expand back-half frames — the slowdown after the reveal _is_ the relief.                 | PAS                                        |
| "Imagine X → product → Imagine no [pain]" | Vision hook + early brand + pain-named-by-removal, as a 3-frame opening.                                               | Future Pacing                              |
| Mythological-register naming              | Reserve high-register words ("Omniscient", "Self-learning") for 2-3 hero frames; the contrast makes them land.         | Future Pacing, Cascade                     |
| Implicit-objection cascade                | Pair each feature with the buyer-anxiety it secretly answers; demonstrate the answer without naming the fear.          | Future Pacing, B2B BAB                     |
| Two-stage close                           | A `branding` frame (philosophical summary) then a `cta` frame (direct action).                                         | any                                        |
| Two-stage product reveal                  | Separate the `branding` frame (who makes it) from the `product_intro` frame (what's available).                        | BAB, Cascade                               |
| Query → result loop                       | Show input (effort) and output (reward) every demo cycle, mimicking the real tool UX.                                  | Demo Loop                                  |
| Micro-to-macro expansion                  | Start with a specific niche query, broaden to "any market" to show scale.                                              | Demo Loop, Future Pacing                   |
| Verb-brand association                    | Use the product name as an action verb ("Spark your next idea").                                                       | any                                        |
| Category-concept preamble                 | Sell the bridge concept across 3-4 frames before naming the brand.                                                     | BAB                                        |
| Effort-reversal beat                      | 4-6 words, parallel structure ("We Plug. You Play.").                                                                  | BAB                                        |
| Removed-pain list as risk reversal        | A `pain_point` frame whose script lists _removed_ worries ("Without worrying about…") — names pain only to dismiss it. | BAB, late PAS                              |
| Poetic pain-validation hook               | 3-sentence prose: ideal state → operational steps in domain vocab → pivot on "Because when it doesn't."                | BAB                                        |
| Contrast-via-transition                   | Morph the chaotic visual into the clean logo on the seam itself (`dissolve` / `zoom`), not a split-screen.             | BAB, PAS reveal                            |
| "How?" bridge opener                      | Open the first feature frame with "How?" — names the bridge walk as the answer.                                        | BAB                                        |
| Wow-climax-then-CTA                       | Put the most ambitious capability in the penultimate frame so the biggest idea is fresh at the CTA.                    | BAB, Cascade                               |
| Brand-category-tagline hook               | Brand + category claim in one declarative frame-1 line, no verb ("Vibe.co. All-in-one TV Ad Platform.").               | Cascade                                    |
| Rule-of-three pillar beat                 | Name 3 core capabilities as monosyllabic imperatives ("Target. Deliver. Measure.").                                    | Cascade, any                               |
| Authority anchor at midpoint              | Name credibility partners / concrete numbers (600+ channels; CNN/ESPN) at the midpoint.                                | Cascade                                    |
| Stratified tier reveal                    | Cascade N equivalents at one tier → unify into an ecosystem → reveal a premium tier the audience didn't know existed.  | Cascade / collectibles                     |
| Single-word cascade                       | 4+ consecutive one-word scripts anchored by visual signatures ("Fire / Water / Earth / Air").                          | Cascade                                    |
| Color-as-content transitions              | When each frame owns a color, let the next frame's color lead the `dissolve`.                                          | Cascade                                    |
| Drop-date FOMO climax                     | Temporal scarcity (a specific date) + platform lock ("only available on X").                                           | Cascade / launches                         |

## Transitions — name the registry type

Each frame's `transition_in` is **how it arrives from the previous frame**: name a transition **type** from the registry directly. The injector stamps the concrete GSAP — that's the harness's job, never yours:

| type             | feel                                                  | when                                       |
| ---------------- | ----------------------------------------------------- | ------------------------------------------ |
| `cut`            | hard switch, no blend                                 | type / tone shift, high-energy beats       |
| `crossfade`      | plain opacity dissolve                                | calm, neutral hand-off                     |
| `blur-crossfade` | blur + soft scale dissolve (masks a bg clash)         | safe default between differing backgrounds |
| `push-slide`     | directional push (suffix ` LEFT`/`RIGHT`/`UP`/`DOWN`) | forward flow, "next panel" of a demo       |
| `zoom-through`   | scale + blur through to the next focal point          | high-energy punch into a reveal            |
| `squeeze`        | old compresses left, new expands from the right       | stylized, kinetic beat                     |

Pick **2-3 types for the whole video** and repeat them — repetition reads as professional. Optional suffix: a direction for `push-slide` (`push-slide LEFT`) or a duration (`crossfade 0.4s`). Frame 1 has no previous frame; `cut` there is a placeholder (no real opening transition).

## Script voice quality bar

Strong scripts are memorable, sharp, voiced: anaphora ("goodbye to queues, goodbye to chaos, goodbye to dinosaurs of the past" — HRS); concrete specificity (a real user story grounding an abstract capability — Skye); imperative triplets ("Target. Deliver. Measure." — Vibe.co); humor as a confidence signal (JustCall IQ); cultural / insider signaling ("Presenting: the GM button." — Alpha); disarming specificity ("…Designers, Agencies, Grandma." — ZapBG).

**Weak (avoid):** noun-phrase bullet lists ("Seamless experience. Real-time communication."); a generic single-word bridge as a whole frame ("Or…"); vague capability claims ("streamline your workflow"); marketing-speak without grounding ("unlock the power of next-generation AI"). Say what it does for a _person_, not an abstract category.

**Empty / silent frames are allowed** — set the spoken line empty when the visual itself carries the meaning (a drag-and-drop demo, a leaderboard). Then narrativeRole + persuasion must carry what the words don't.

## UI demo is a sequence, not a single frame

A real UI demo is **3+ consecutive `feature_showcase` / `benefit_highlight` frames** on the same product surface (often 40-60% of runtime), seams in a consistent type (`push-slide` / `crossfade`) so it reads as "same surface, next panel." A single isolated demo frame rarely persuades.

## Asset candidates — name the real assets each frame can use

`visual-design` and the frame workers **never read `capture/`** — so every asset a frame might use must be named on its `## Frame N` block here. An asset you don't name is **lost** to the rest of the pipeline. You are the single reader of the library; you forward a curated list.

What exists: `capture/extracted/asset-descriptions.md` (one line per downloaded asset, often with a vision caption) + the contact sheets `capture/**/contact-sheet-*.jpg` — **open the contact sheets** to actually see the assets. The text inventory often repeats one description across visually distinct files; the montage is how you tell them apart and write a truthful description.

Per frame, list 0+ candidates on a single `- asset_candidates:` line, `;`-separated — each candidate is `public/<basename>` (the `<basename>` from `capture/assets/`; **only candidates named here are staged into `public/` at build** — the rest never reach the project) then `—` then a ≤25-word description (what's in it · approx dimensions · dark/light · photo vs UI vs icon):

```
- asset_candidates: public/dashboard-hero.png — main product UI, feature timeline, dark, ~1920×1080; public/timeline-icon.svg — standalone timeline glyph, supporting motif
```

One line, `;` between candidates — the storyboard parser keeps only single-line `- key: value` metadata; a nested sub-list silently falls into free-text narrative and is lost to the build.

- **Coverage** — spread _different_ assets across frames (don't reuse one hero throughout, except a genuine hero carried through a continuous demo sequence). Use **most** of the inventory's content assets; a real screenshot / photo / chart named by no frame is wasted.
- **List more, not fewer** — 2-3 candidates per visual frame; visual-design decides focal vs supporting. Best-fit first (downstream favors the first when ambiguous).
- **Content only** — real screenshots / UI / photos / charts / infographics. Skip chrome & decoration (fonts, favicon, social / app-store badges, logo-lockup variants, tiny <~100px icons) unless a frame needs one narratively (e.g. a logo wall for social proof).
- **`[video]` is your highest-value asset — prefer it as the hero.** A `[video]` entry (these lead the asset list) is a real moving clip → for a product whose value IS motion (an avatar / generator / live UI demo), a clip shows what a static portrait can't. Make it the frame's hero or full-bleed background, not an afterthought — **don't default to stills when a fitting clip exists**. Cite its `.mp4`; the worker renders a muted `<video>`. `[video-still]` = only a static frame was captured → cite the `.png`, treat it as a still image.
- **Real files only** — choose from what actually downloaded (verify against `capture/assets/`); a fabricated basename is a fatal downstream error.
- A frame with a visual hero needs ≥1 candidate; a pure-typography / title frame names none.

## Before you finish — checklist

- One outer archetype (an inner-rhythm compound is fine); the emotional arc matches its pattern (not monotone).
- Sequence is driven by narrative, not page order.
- Every frame has all five fields; `persuasion` is a named technique; `beat` is specific.
- The hook uses a named strategy.
- At least one UI-demo **sequence** (3+ consecutive feature / benefit frames on one surface).
- `transition_in` on every frame, a registry type (or `cut`); only 2-3 types across the whole video.
- `SCRIPT.md` has a locked line per spoken frame; any silent frame is intentional.
- Most of the inventory's content assets are named on some frame as `asset_candidates`; none valuable is wasted; pure-typography frames name none.
