# Session Handoff: Keyframes & Studio UX

## What was done

Three stacked PRs shipping keyframe editing, arc motion, design panel redesign, and gesture recording:

### PR #1217 — `fix/keyframe-stability-border-radius` → main
- Per-corner border-radius editor with visual picker
- GSAP cache stability fixes (bump on code-tab edits, sync on mutations)
- Flat undo/redo/capture buttons in header

### PR #1232 — `feat/motionpath-arc-motion` → #1217
- MotionPathPlugin integration (conditional CDN, AST mutations, curviness/auto-rotate)
- Design panel visual redesign (panel-* Tailwind tokens, unified #3CE6AC accent)
- Runtime auto-stamp with timed-ancestor guard (fixes style-13-prod regression)
- Keyframe diamond synthesis from flat tweens (start+end markers)
- Shape-adaptive selection overlays (clip-path mirroring, border-radius matching)
- Export button, render controls redesign, SSR externals fix
- Click-through for styled elements (background, border, shadow detection)

### PR #1256 — `feat/gesture-to-keyframes` → #1232
- Gesture recording engine (RAF sampling, RDP simplification, velocity-to-ease inference)
- Record button in Animation section, R keyboard shortcut
- Auto-commit keyframes on stop (no preview panel, no extra step)
- Ghost trail SVG overlay during recording
- Clipboard icon copies element context (selector, position, size, line number, animation)
- Glass-style dismissible toast (bottom-right, backdrop-blur)
- Render queue always-visible download/remove buttons
- Keyframe diamond dedup + React key fix
- Keyframe cache fixes (3 clearing paths eliminated)
- `addKeyframeToScript` auto-converts flat tweens + handles ID change after from→to conversion
- Mintlify docs: `docs/guides/keyframes.mdx` (timeline diamonds, arc motion, gesture recording)

## Known issues to fix next session

### Critical: Keyframe creation at scrubbed time doesn't work properly
**Root cause**: GSAP keyframes are percentage-based within a tween's duration (e.g., 0-100% of 0.5s). When the user scrubs to t=1.5s on a 0.5s tween, the computed percentage is based on `data-duration` (4s full composition), not the tween's actual duration. This creates keyframes at meaningless percentages.

**The gap vs After Effects**: AE has per-property keyframes on a global timeline. GSAP has percentage keyframes within a tween's local duration. Dragging at t=1.5s on a 0.5s tween needs one of:
- (a) Extend the tween duration to cover the scrubbed time, then add keyframe
- (b) Create a new tween starting at the scrubbed time
- (c) Clamp to the tween's end percentage
- (d) Rearchitect to a global-time keyframe model that maps to GSAP behind the scenes

**Recommended next step**: `/ce-brainstorm` on the global timeline keyframe architecture before implementing.

### Medium: Gesture recording position baseline
The recording captures pointer deltas but doesn't properly account for the element's GSAP-interpolated position at recording start. The `useGestureRecording` hook's `startPointerRef` captures cursor position, not the element's computed transform. Fix: read `gsap.getProperty(element, "x/y")` at recording start.

### Low: Timeline keyframe diamonds disappear temporarily
After certain operations (undo/redo, element drag, selection change), diamonds may briefly disappear because the runtime scan polls at 500ms intervals and the cache needs time to repopulate. The cache is no longer cleared incorrectly, but the scan timing creates a visual flicker.

## Architecture notes

### Keyframe cache system
The keyframe cache (`playerStore.keyframeCache`) maps element IDs to keyframe data. Three systems populate it:
1. **AST fetch** (`usePopulateKeyframeCacheForFile`) — parses GSAP script for explicit `keyframes: {}` objects
2. **Runtime scan** (`scanAllRuntimeKeyframes`) — reads `timeline.getChildren()` from the iframe's live GSAP instance, synthesizes start+end keyframes from flat tweens
3. **Per-element selection** (`useGsapAnimationsForElement`) — sets cache when an element with explicit keyframes is selected

**Key invariant**: No code path should clear cache entries for flat tweens. The cache is additive-only for runtime-scanned entries. The three clearing bugs were:
- `usePopulateKeyframeCacheForFile` cleared all entries matching `sourceFile#*` prefix (removed)
- `useGsapAnimationsForElement` wrote `undefined` for elements without explicit keyframes (changed to set-only)  
- `useGsapScriptCommits.commitMutation` cleared entries when parsed result had no keyframes (removed)

### Animation ID changes after conversion
When `convertToKeyframesInScript` converts a `from()` tween to `to()` with keyframes, the animation ID changes (e.g., `#title-from-0` → `#title-to-0`). The parser's `addKeyframeToScript` handles this with a regex fallback: `animationId.replace(/-from-|-fromTo-/, "-to-")`. This fallback runs at both the top-level `locateAnimation` and inside the auto-conversion branch.

### Auto-stamp and render parity
The runtime's auto-stamp code (`init.ts`) adds `data-start`/`data-duration` to GSAP-targeted elements so they appear in the Studio timeline. The `hasTimedAncestor()` guard prevents stamping elements whose parent already has timing attributes — without this, the style-13-prod regression test fails (elements inside timed clips get their own timing, overriding parent clip visibility).

## Files of interest

| Area | Key files |
|------|-----------|
| Keyframe cache | `packages/studio/src/hooks/useGsapTweenCache.ts` |
| Runtime keyframe synthesis | `packages/studio/src/hooks/gsapRuntimeKeyframes.ts` |
| GSAP drag intercept | `packages/studio/src/hooks/gsapRuntimeBridge.ts` |
| Keyframe mutation parser | `packages/core/src/parsers/gsapParser.ts` (lines 1286-1380) |
| Auto-stamp | `packages/core/src/runtime/init.ts` (lines 1002-1060) |
| Gesture recording | `packages/studio/src/hooks/useGestureRecording.ts` |
| RDP simplification | `packages/studio/src/utils/rdpSimplify.ts` |
| Design panel | `packages/studio/src/components/editor/PropertyPanel.tsx` |
| Timeline diamonds | `packages/studio/src/player/components/TimelineClipDiamonds.tsx` |
| Arc path controls | `packages/studio/src/components/editor/ArcPathControls.tsx` |
| Soft reload | `packages/studio/src/utils/gsapSoftReload.ts` |

## Branches and worktrees

- Main repo: `/Users/miguel07code/dev/hyperframes-oss` — currently on `feat/motionpath-arc-motion`
- Worktree: `.worktrees/feat/motionpath-arc-motion` — currently on `feat/gesture-to-keyframes`
- Test project: `packages/studio/data/projects/keyframes-test/` (clean copy at `/tmp/keyframes-test/index.html`)
- Dev server: `bun run --cwd packages/studio dev --port 5191` from the worktree
- After changing `packages/core/src/parsers/gsapParser.ts`, must rebuild: `bun run --cwd packages/core build` AND restart the dev server (Vite SSR caches module imports)

## User preferences (from CLAUDE.md and memory)

- Stealth mode: never add AI attribution to commits/PRs
- Rebase not merge, squash to 1 commit per PR
- Always write plan.md before code
- Don't commit design specs, only actual code
- Sequential renders only (never parallel — saturates CPU)
- Pacific is private source, never reference in HyperFrames artifacts
