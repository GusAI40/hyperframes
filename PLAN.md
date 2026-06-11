# w2h Skill — Steal+Adapt Plan (Sessions 17+)

**Author:** Claude (Opus 4.7) for Ular Kimsanov
**Drafted:** 2026-06-11
**Worktree:** `/Users/ularkimsanov/Desktop/hyperframes-w2h-v3`
**Branch:** `feat/w2h-restructure-v3`

---

## The verify-first rule (NEW — applies to EVERY phase, EVERY task)

Before starting ANY phase or task within a phase, I MUST:

1. **Read every related file in our worktree end-to-end** — the file I'm about to touch + every file it imports/references + every consumer downstream that would be affected.
2. **Read every upstream source I'm porting from end-to-end** — full file, not a snippet. `git show origin/feat/product-launch-v2:<path>` for plv2 imports; `git show 995dbb4f:<path>` for SFX-branch imports.
3. **Map the integration explicitly** — write down (in chat or in TodoWrite) which existing files will change, what their downstream consumers are, what the rollback looks like if it goes wrong.
4. **Only then start typing**.

This rule exists because Sessions 13/15 made architectural changes (FRAME.md → no DESIGN.md) without re-reading enough downstream context, and the result was a session of wasted work + a revert. Verify-first prevents that pattern.

**No exception. No "this one's small."** Especially when stealing patterns from plv2 — that codebase was written for a different identity and copying without reading the surrounding context produces subtle drift.

---

## Locked decisions (user-confirmed 2026-06-11)

1. **Music command shape:** `hyperframes music` (Option A — parallel command, cleaner UX).
2. **Bundled SFX deletion:** YES — `skills/website-to-hyperframes/assets/sfx/*` (20 mp3s + manifest.json + CREDITS.md) gets removed as part of the SFX-branch merge. The runtime-catalog flow replaces them.
3. **Branch audit before starting:** quick scan for any `feat/music-*` / `feat/*-audio-*` branches that might already exist. If nothing else relevant, proceed to PHASE 0a.

---

## Identity preservation (the non-negotiable spine)

Everything below is filtered through this. If a steal violates this, it's adapt-not-copy or skip.

Our `website-to-hyperframes` skill is:
1. **URL-in / video-out, capture-first** — start from a real website; the video draws from REAL captured assets (colors, fonts, components, photos, SVGs). No "pick a preset" upfront.
2. **Brand-fidelity over genre purity** — accepts ANY video type from the same URL (social ad, product tour, brand reel, launch teaser, feature announcement). Not launch-biased.
3. **VIDEO, not webpage rebuilt in divs** (Step -1) — cinematic grammar: framing, depth, camera, scale.
4. **Linear 7-step flow** with autonomous-mode exception, cell-experiment-tested (33+ real runs).
5. **Creative Tension Principle** answered FROM the captured assets, not from a lookup table.

`product-launch-video` (plv2) is a RELATED-BUT-DIFFERENT skill (launch-narrative oriented, preset-based). We mine its quality patterns; we do NOT adopt its identity.

---

## Plan summary (sequenced, ~12-15 hr total)

| Phase | What | Cost | Identity risk |
|---|---|---|---|
| **0** | Merge `feat/sfx-audio-search` (commit `995dbb4f`) + add music parity | ~2-3 hr | none — pure capability addition |
| **A** | Universal quality gates: `derive-context-pack` + `check-compositions` + `validate` | ~3-4 hr | none |
| **B** | Worker prompt rigor: absorb `hyperframes-scene` + `hyperframes-finalize` into our refs | ~2-3 hr | none |
| **C** | `prep.mjs` full upgrade from stub | ~3-4 hr | low |
| **D** | Story craft adapt: hook taxonomy + named-pause + 75%-exit + OPTIONAL archetypes | ~2-3 hr | medium (kept primary narrative-arc, archetypes are secondary) |
| **E** | Deferred / skip (presets, phases, build-design, audio.mjs, etc.) | n/a | see § E |

**Checkpoint pauses:** after Phase 0, A, B (identity-adjacent), and D. User reviews before next phase.

---

## PHASE 0 — Merge `feat/sfx-audio-search` + music parity

**Why first:** the branch REMOVES `assets/sfx/*` (20 mp3s + manifest.json) and switches the skill to runtime catalog search. Doing this before Phase A means our new scripts (PHASE A) don't get written against soon-to-vanish bundled-SFX assumptions.

### 0a — Manual file-by-file merge of commit `995dbb4f`

The cherry-pick can't auto-merge because we modified the same files in sessions 13/16. Applying manually:

**Clean adds (no conflict — apply verbatim):**
- `packages/cli/src/commands/sfx.ts` (dispatcher)
- `packages/cli/src/commands/sfx/{add,analyze,analyze.test,auth,catalog-manifest,catalog-manifest.test,inspect,list,search,state}.ts` (10 files)
- `skills/hyperframes/references/sound-effects.md` (183 lines, the new reference doc)
- `packages/cli/src/cloud/_gen/{client,types}.ts` (regenerated cloud client — `AudioContentType = "music" | "sound_effects"` now exposed)
- `packages/cli/src/cli.ts` (register sfx subcommand — light edit)
- `packages/cli/src/help.ts` (add sfx help-group entry)
- `skills/hyperframes/SKILL.md` (mention SFX in description)
- `skills/hyperframes/references/beat-direction.md` (link sound-effects.md)
- `skills/hyperframes/references/techniques.md` (light updates — w2h-side conflict possible from our M3 work; merge by hand)
- `skills/hyperframes/references/video-composition.md` (light update)

**Deletes:**
- `skills/website-to-hyperframes/assets/sfx/*` — all 20 mp3 files + CREDITS.md + manifest.json. The manifest swap I did earlier today (97 lines of agent-facing descriptions) becomes moot — descriptions live in the HeyGen catalog now.

**Real conflicts (resolve thoughtfully — read commit's intent + our state):**
- `skills/website-to-hyperframes/references/step-3-storyboard.md` — commit replaces "use bundled SFX from `sfx/`" with "search the catalog when the storyboard names a beat that needs SFX." Our session-13/16 edits to this file (FRAME.md revert prose + file tree) need to coexist with the new SFX flow.
- `skills/website-to-hyperframes/references/step-5-build.md` — commit replaces the `## 1. Copy SFX to project` section with `## 1. Search + add SFX from catalog`. Our session-13/16 edits (landmines + assembler section + dispatch prompt template) need to coexist.

### 0b — Music parity

The cloud API already exposes `AudioContentType = "music" | "sound_effects"`. Options:

- **Option A (cleaner):** add a new `hyperframes music` command — parallel CLI to `sfx`, reuses analysis/auth/state modules.
- **Option B (lighter):** add a `--type music` flag to `hyperframes sfx`. Smaller diff. Confusing UX (user expects music to be its own thing).

**Recommendation: A.** Music's discovery flow is different from SFX (bed-style, longer, ducks under VO) and deserves its own command surface. The implementation reuses 90% of the SFX command code.

### 0c — `references/background-music.md` (new, ~80 lines)

- When music helps (brand reels, atmospheric pieces) vs hurts (most product demos)
- Volume hierarchy: BGM 0.4–0.6 under VO 1.0; pure-music 0.7–0.9
- Duck-on-narration rule (drop BGM 6-10 dB when VO is active)
- Motif rule for music (one bed per scene, not stacked)
- Search prompts that work (semantic, by feel: "moody ambient", "upbeat lo-fi", "tense synth pad")

### 0d — Smoke verification

- `npx tsx packages/cli/src/cli.ts sfx list` — works, shows catalog families
- `npx tsx packages/cli/src/cli.ts sfx search "whoosh"` — works (prompts for free key if missing)
- `npx tsx packages/cli/src/cli.ts music search "ambient pad"` — works
- 88+ tests still pass
- `bun test packages/cli/src/commands/sfx/*.test.ts` — runs the bundled tests

**Pause for user review** before Phase A.

---

## PHASE A — Universal quality gates

### A1 — `derive-context-pack.mjs` + `lib/capture-meta.mjs` (~30 min)

- Port `scripts/derive-context-pack.mjs` (266 LOC) verbatim into `skills/website-to-hyperframes/scripts/`
- Port `scripts/lib/capture-meta.mjs` (39 LOC) verbatim
- Adapt: rename `context_pack.md` output to live at `capture/context_pack.md`; reference `capture/extracted/*` paths consistently
- Wire into `step-0-capture.md` as a Step 0.5 (auto-runs after `capture` completes)
- Wire into beat dispatch packet — workers read `capture/context_pack.md` instead of 5 separate JSON files

### A2 — `check-compositions.mjs` (~1 hr)

- Port `scripts/check-compositions.mjs` (503 LOC)
- Adapt selectors for our beat naming: `b<N>-*` (we use this) vs plv2's `s<N>-*`
- Drop any plv2-specific wrapper-ancestor checks that don't apply
- Wire into `preflight-finalize.mjs` (already exists, ported in Session 7) as a NEW gate before lint
- Smoke against cell-A airbnb fixture

### A3 — `validate.mjs` (~1 hr)

- Port `scripts/validate.mjs` (717 LOC) — dispatcher with `narrator` + `section` subcommands
- Adapt schemas:
  - plv2's `narrator_scripts.json` → our `SCRIPT.md` (markdown, not JSON — schema = "must have hook line + 3-7 beats + CTA closer")
  - plv2's `section_plan.md` → our `STORYBOARD.md` (validate beat count matches estimated duration / total ≤ 60s for social / etc.)
- Wire into Step 3 (post-storyboard) and Step 4 (post-script) as self-validation loops

### A4 — Smoke + verification

- All 4 new scripts pass `node --check`
- 88+ tests still pass
- Run `check-compositions` against an existing cell-A fixture, verify it surfaces realistic issues

**Pause for user review** before Phase B.

---

## PHASE B — Worker prompt rigor

### B1 — Absorb `hyperframes-scene.md` into `beat-builder-guide.md` (~1.5 hr)

Read plv2's `agents/hyperframes-scene.md` (436 LOC). Extract patterns and merge with our existing `beat-builder-guide.md` (375 LOC):

- **Pre-write cheat sheet** — our 6 items; plv2's 4 are sharper. Merge to 5-7 best.
- **14 numbered constraints** — our `## Rules` block has ~15 rules; plv2 has 14 numbered. Reconcile: keep ours' identity (continuity-heavy w2h) but adopt plv2's:
  - GSAP transform alias whitelist (`xPx/yPx/sx/sy/rot`)
  - CSS-baked vs GSAP transform mutual-exclusion rule
  - Macro-camera scale-headroom (`maxScale = 0.88 * W / r.width`)
  - Primary-handoff-before-enter rule
- **Tier-A shared-element bridge protocol** — w2h doesn't have multi-act bridges in the plv2 sense; SKIP wholesale. But the underlying *element-handoff* protocol (when a logo or card carries between beats) is useful — adapt.
- **Skip:** the "scene wall-off" framing. w2h is continuity-heavy — workers CAN read sibling beat files. Our current rule stays.

### B2 — Absorb `hyperframes-finalize.md` Step 3.5 into `step-6-validate.md` (~1 hr)

Read plv2's `agents/hyperframes-finalize.md` (251 LOC). Extract:

- **Step 3.5 — Mandatory Visual Inspection Checklist** (5 categories): illegibility / out-of-bounds / competing-primaries / cramped-frame / seam-jank. Direct port — these failure modes are universal across video genres.
- **Brief-digest fast-path** — `preflight_clean===true` → skip detailed read. Adopt — saves time when gates clean.
- **Edit-ready `edit_old`/`edit_new` triage** rule — adopt. Mechanically apply, don't re-derive.
- **The framing line** quoted verbatim: *"the eye is fragile (rate-limit prone, end-of-pipeline, subjective), so a structured pass over five concrete failure categories matters more than freeform 'does it look right.'"*

### B3 — Verification

- Both reference files re-parse cleanly
- 88+ tests still pass
- Word-count check: didn't bloat by more than 30%

**Pause for user review** before Phase C — this is identity-adjacent (worker contract changes; user should eyeball).

---

## PHASE C — `prep.mjs` full upgrade

### C1 — Read plv2's `prep.mjs` (1010 LOC) end-to-end + diff against our 280-LOC stub (~30 min)

### C2 — Port the upgrade (~2-3 hr)

**Take:**
- Anchor-walk through STORYBOARD.md (replaces our regex extraction)
- Per-beat `start_s` / `estimatedDuration_s` / `duration_s` derivation
- Transitions[] inference from storyboard prose
- Asset / font / SFX copy into `public/` (we may need to adapt — we currently use `capture/assets/` not `public/`)
- `font_face_css` aggregation (already in our stub but plv2's is more robust)
- `voice` auto-detection (already in our stub)

**Drop:**
- cap=2 grouping (plv2-specific; we're single-group continuity-heavy)
- Tier-A bridge logic (plv2-specific)
- Multi-act dispatch packet ingestion (plv2-specific)

### C3 — Smoke against cell-A airbnb fixture (~30 min)

- Replace existing stub
- Confirm group_spec.json shape is unchanged from downstream consumer perspective (captions.mjs / assemble-index.mjs / preflight-finalize.mjs all still work)

---

## PHASE D — Story craft adapt-not-copy

### D1 — Universal extracts into `step-3-storyboard.md` (~1.5 hr)

Add — these are genre-universal:

- **Named hook types** (10): shocking-statistic / imagine / direct-address / pain-validation / visceral-metaphor / rhetorical-question / category-announcement / visual-spectacle / question-invitation / trend-positioning. Each with one-line "when to use" + example.
- **"Stillness Before Climax"** named beat (0.3-0.75s pause between major action and confirmation).
- **"Exit = 75% of Entry"** named rule (with reasoning: entry is deliberate; departure is swift but not abrupt).
- **"Multiplicative breathing > yoyo"** rule (with the `scale = final * (1 + Math.sin(t*freq)*amp)` form).

### D2 — Optional archetypes (~1 hr)

Add as a SECONDARY section in `step-3-storyboard.md`. NOT primary. Wording: *"If the user explicitly wants a launch-style or persuasion-heavy reel, these archetypes give the storyboard a named structural spine. For general videos (social ads, brand reels, demos, tours), the narrative-arc options above (Problem→Solution / Reveal / Demonstration / Vibe / Comparison) are the primary frame."*

- **PAS** (Problem-Agitate-Solution) — when product solves a clear pain
- **Future-Pacing** — when the brand sells aspirational outcome
- **Demo-Loop** — when the product itself is the hook
- **BAB** (Before-After-Bridge) — transformation story
- **Feature-Benefit-Cascade** — when product has 3-5 distinct features

### D3 — SKIP

- Plv2's persuasion-family framing (Pain/Authority/Social/Cognitive/Hedonic) — wrong identity layer; pulls us toward sales-copy. Our Step -1 says "viral hook" not "sales pitch."

---

## PHASE E — Deferred / skip with explicit reasoning

| Item | Decision | Why |
|---|---|---|
| **19 style-presets** | DEFER | Philosophical question — capture-first vs preset-first is an identity question. Revisit AFTER Phases 0/A/B/C/D land. Possible future role: presets as FALLBACK when capture is thin (brochure-only sites), not the default path. |
| **`audio.mjs` + `wait-bgm.mjs`** | DEFER | Detached BGM only matters when we generate music. Music search (PHASE 0b) covers the user's need for now. Revisit if music GENERATION is on the table. |
| **`transitions.mjs` + `lib/transition-registry.mjs`** | DEFER | Our assembler handles transitions via `shader_transitions` field. Plv2's injection system is for THEIR `section_plan.md` flow. Not blocking. |
| **`build-design.mjs`** (2941 LOC) + **`emit-chunks.mjs`** | SKIP | Tied to preset-scoring system. Adopt only if we change identity to preset-first. |
| **`phases/` architecture** | SKIP | Linear 7-step flow is OUR pattern, just stabilized. Restructure risk doesn't pay off. |
| **`site_dna` register** | DEFER | Depends on build-design. Useful concept but presupposes the preset system. |
| **`check-bridge` subcommand** of transitions.mjs | DEFER | Plv2 uses for multi-act handoffs; we're single-act/continuity-heavy. Revisit if we add bridge-style transitions. |

---

## Sequence + checkpoints

```
PHASE 0 (sfx + music)  →  pause for user review
PHASE A (quality gates)  →  pause for user review
PHASE B (worker prompts)  →  pause for user review (identity-adjacent)
PHASE C (prep.mjs)        →  continue
PHASE D (story craft)     →  pause for user review (final)
                          →  ready for fresh-session real-URL test
```

After PHASE D, the worktree is at a state worth committing + pushing. We'll do that as a clean commit chain (probably 4-5 logical commits, one per phase + one for capture-layer work from earlier sessions).

---

## Open questions for the user BEFORE starting PHASE 0

1. **Music command shape** — `hyperframes music search` (parallel command, Option A) OR `hyperframes sfx search --type music` (single command with flag, Option B)? Recommend A.
2. **SFX file deletion** — are you OK with `skills/website-to-hyperframes/assets/sfx/` going away entirely? The branch's intent is clear (runtime catalog), but I want to confirm before deleting bundled assets.
3. **Order** — start PHASE 0 immediately on confirmation, OR audit any other related branches first (e.g. is there a `feat/music-...` or similar branch I should know about)?

Confirm and I start PHASE 0a.
