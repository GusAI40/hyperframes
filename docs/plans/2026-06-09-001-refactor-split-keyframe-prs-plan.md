---
title: "refactor: Split keyframe PRs into ≤700 LOC stacked PRs"
status: active
date: 2026-06-09
type: refactor
depth: standard
---

## Summary

Reorganize three keyframe-system PRs (#1217, #1232, #1256) into a clean stack of 8 PRs, each ≤700 LOC. #1217 ships as-is. #1232 (3608 LOC) splits into 5 PRs following the dependency chain: parser → runtime → timeline UI → design panel → render queue. #1256 (2353 LOC) splits into 3 PRs: gesture recording core → bug fixes → integration wiring. The keyframe feature remains gated behind `VITE_STUDIO_ENABLE_KEYFRAMES=false`.

---

## Problem Frame

Three PRs implementing Studio's keyframe system are too large for effective review:
- #1232 at +3164/-444 (61 files) — reviewer fatigue, hard to reason about correctness
- #1256 at +1924/-429 (43 files) — mixes new features with 21 bug fixes

Splitting them preserves the same total code but makes each PR reviewable in one sitting, with clear scope per PR and a dependency-ordered stack.

---

## Requirements

- **R1.** Each resulting PR ≤700 lines changed (additions + deletions)
- **R2.** Stack order respects import dependencies — no PR imports from a file introduced in a later PR
- **R3.** Each PR builds and type-checks independently (no broken intermediate states)
- **R4.** Squash to 1 commit per PR, rebase onto main
- **R5.** Feature gate `VITE_STUDIO_ENABLE_KEYFRAMES` defaults to `false` in the final PR
- **R6.** No plan files or design specs committed

---

## Key Technical Decisions

**KTD1. Split by dependency layer, not by feature slice.**
Splitting by feature (e.g., "arc motion PR" vs "dopesheet PR") would create circular dependencies since the parser, hooks, and UI all cross-reference. Layer-based splitting (parser → hooks → UI → integration) follows the import graph and produces PRs that each add one layer the next PR can build on.

**KTD2. Shared-file changes go in the earliest PR that needs them.**
Files modified by both #1232 and #1256 (gsapParser.ts, useGsapTweenCache.ts, init.ts, PropertyPanel.tsx, etc.) — the #1232-era changes land in the #1232 split, and #1256-era changes land in the #1256 split. The stack order guarantees later PRs can build on earlier ones.

**KTD3. RenderQueue and producer build are a standalone PR.**
These changes (+311 LOC combined) are independent of the keyframe feature. Shipping them separately unblocks the render pipeline improvements without waiting for keyframe review.

**KTD4. Feature gate moved to the earliest PR that introduces the UI surface.**
The `STUDIO_KEYFRAMES_ENABLED` flag (default false) ships in PR 5 (Timeline UI), which is the first PR that exposes user-facing keyframe UI. All subsequent PRs respect the gate.

---

## Scope Boundaries

### In Scope
- Reorganizing existing committed code into smaller PRs
- Adjusting imports/exports if splitting a file's changes across PRs requires it
- Running type-check and lint on each intermediate PR

### Out of Scope
- New features or bug fixes beyond what's already in #1217/#1232/#1256
- Refactoring the code itself (only reorganizing commits)

### Deferred to Follow-Up Work
- Fallow duplication/complexity findings (inherited, pre-existing)
- Gesture trail overlay positioning fix (known issue, not blocking)

---

## Implementation Units

### U1. PR 1 — fix(studio): keyframe stability + modular border-radius editor

**Goal:** Ship #1217 as-is — already under 700 LOC.

**Requirements:** R1

**Dependencies:** None (bases on main)

**Files (333 LOC, 11 files):**
- `packages/studio/src/components/editor/BorderRadiusEditor.tsx` (+209)
- `packages/studio/src/components/editor/propertyPanelStyleSections.tsx` (+38)
- `packages/studio/src/components/editor/PropertyPanel.tsx` (+29)
- `packages/studio/src/hooks/useGsapScriptCommits.ts` (+23)
- `packages/studio/src/hooks/useDomEditSession.ts` (+15)
- `packages/studio/src/components/StudioHeader.tsx` (+14)
- Plus 5 smaller files (<10 LOC each)

**Approach:** Already merged/reviewed. Rebase onto main if needed. No changes required.

**Verification:** `bun run build && bunx tsc --noEmit` passes. PR is ≤333 LOC.

---

### U2. PR 2 — feat(studio): GSAP parser — arc path mutations + keyframe CRUD

**Goal:** Add all parser-level mutations for arc paths, keyframe add/remove/update, convert-to-keyframes, and the _auto flag for 100% keyframes. Includes tests and API route wiring.

**Requirements:** R1, R2, R3

**Dependencies:** U1

**Files (~665 LOC, 5 files):**
- `packages/core/src/parsers/gsapParser.ts` (+392 from #1232, +41 from #1256 = ~433 combined)
- `packages/core/src/parsers/gsapParser.test.ts` (+200)
- `packages/core/src/studio-api/routes/files.ts` (+73 from #1232, +1 from #1256 = ~74)
- `packages/core/src/parsers/gsapSerialize.ts` (+16) — ArcPathConfig types
- `packages/core/src/parsers/gsapConstants.ts` (+1)

**Approach:** Cherry-pick all gsapParser.ts changes from both branches into one PR. The parser has no studio-side dependencies — it's pure Node.js AST manipulation. Include the `_auto: 1` flag logic from the bug bash since it's parser-level. Route handler changes in files.ts wire the new mutation types.

**Test scenarios:**
- `addKeyframeToScript` adds a keyframe at the correct percentage, sorted
- `addKeyframeToScript` with `_auto` flag on 100% — auto-updates when adding lower percentage
- `addKeyframeToScript` at 100% explicitly — strips `_auto` from existing 100%
- `removeKeyframeFromScript` collapses to flat tween when <2 keyframes remain
- `convertToKeyframesInScript` preserves from/to values for each method type
- `addAnimationWithKeyframesToScript` serializes `_auto: 1` on flagged keyframes
- Arc path mutations: `setArcPath`, `removeArcPath` modify the correct tween

**Verification:** `bun run --cwd packages/core test` passes. `bunx tsc --noEmit --project packages/core/tsconfig.json` clean.

---

### U3. PR 3 — feat(studio): runtime hooks — global time compiler + keyframe runtime

**Goal:** Add the runtime layer that bridges GSAP timeline state to Studio's keyframe model: global time compilation, soft reload, runtime keyframe preview, and the keyframe commit helper.

**Requirements:** R1, R2, R3

**Dependencies:** U2

**Files (~575 LOC, 8 files):**
- `packages/studio/src/utils/globalTimeCompiler.ts` (+77) NEW
- `packages/studio/src/utils/globalTimeCompiler.test.ts` (+169) NEW
- `packages/studio/src/hooks/gsapRuntimeKeyframes.ts` (+99)
- `packages/studio/src/hooks/gsapKeyframeCommit.ts` (+92) NEW
- `packages/studio/src/hooks/gsapRuntimePreview.ts` (+19) NEW
- `packages/studio/src/utils/gsapSoftReload.ts` (+38)
- `packages/core/src/runtime/init.ts` (+60 from #1232)
- `packages/studio/src/player/store/playerStore.ts` (+41)

**Approach:** These files form the "data layer" between the parser (U2) and the UI (U5/U6). `globalTimeCompiler` converts tween-relative percentages to clip-relative for timeline rendering. `gsapKeyframeCommit` wraps mutation dispatch. `gsapRuntimeKeyframes` reads live GSAP state for drag intercept. `gsapSoftReload` handles iframe reload after mutations.

**Test scenarios:**
- `globalTimeCompiler` converts tween percentage to clip percentage correctly
- `globalTimeCompiler` handles tweens that start mid-clip (position > 0)
- `globalTimeCompiler` handles zero-duration edge case
- `gsapSoftReload` triggers iframe content reload and calls post-reload callback

**Verification:** Tests pass. Type-check clean. `globalTimeCompiler.test.ts` covers the conversion math.

---

### U4. PR 4 — feat(studio): keyframe cache + commit hooks

**Goal:** Add the Studio hooks that populate the keyframe cache (for timeline diamond rendering) and commit keyframe mutations to the parser via the API.

**Requirements:** R1, R2, R3

**Dependencies:** U3

**Files (~575 LOC, 8 files):**
- `packages/studio/src/hooks/useGsapScriptCommits.ts` (+161 from #1232, +55 from #1256 = pick #1232 portion)
- `packages/studio/src/hooks/useGsapTweenCache.ts` (+120 from #1232, +59 from #1256 = pick #1232 portion)
- `packages/studio/src/utils/keyframeSnapping.ts` (+63) NEW
- `packages/studio/src/utils/keyframeSnapping.test.ts` (+74) NEW
- `packages/studio/src/utils/audioBeatDetection.ts` (+58) NEW
- `packages/studio/src/hooks/useDomEditSession.ts` (+21)
- `packages/studio/src/hooks/useGsapSelectionHandlers.ts` (+10)
- `packages/studio/src/contexts/DomEditContext.tsx` (+6)

**Approach:** `useGsapTweenCache` populates the per-element keyframe cache from parsed animations using the global time compiler (U3). `useGsapScriptCommits` dispatches mutation requests to the API. `keyframeSnapping` provides snap-to-grid for diamond drag. `audioBeatDetection` provides beat markers for timeline snapping.

**Test scenarios:**
- Keyframe cache populates correct clip-relative percentages for a tween starting at position > 0
- Keyframe cache clears when animations are deleted
- `keyframeSnapping` snaps to nearest grid line within threshold
- `keyframeSnapping` returns original value when no grid line is within threshold
- Commit hook dispatches `add-keyframe` mutation with correct percentage and properties

**Verification:** Tests pass. Type-check clean. Keyframe snapping tests cover snap/no-snap boundary.

---

### U5. PR 5 — feat(studio): timeline UI — dopesheet diamonds + keyboard nav

**Goal:** Add the visual keyframe editing surface: dopesheet strip with diamond indicators, keyboard navigation (J/Shift+J/Delete/K), timeline property rows, and the keyframe toggle in the toolbar. This is the first PR that introduces user-facing keyframe UI, so the feature gate ships here.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** U4

**Files (~600 LOC, 10 files):**
- `packages/studio/src/components/editor/DopesheetStrip.tsx` (+141) NEW
- `packages/studio/src/player/components/TimelinePropertyRows.tsx` (+120) NEW
- `packages/studio/src/hooks/useKeyframeKeyboard.ts` (+103) NEW
- `packages/studio/src/components/editor/DomEditOverlay.tsx` (+72)
- `packages/studio/src/components/TimelineToolbar.tsx` (+47 from #1232)
- `packages/studio/src/components/editor/KeyframeDiamond.tsx` (+39)
- `packages/studio/src/components/editor/useDomEditOverlayRects.ts` (+37)
- `packages/studio/src/components/editor/LayersPanel.tsx` (+24)
- `packages/studio/src/components/editor/manualEditingAvailability.ts` (+2) — gate default=false
- `packages/studio/src/components/editor/panelTokens.ts` (+10) NEW

**Approach:** `DopesheetStrip` renders diamond keyframe indicators at clip-relative percentages. `TimelinePropertyRows` adds per-property keyframe rows below clips. `useKeyframeKeyboard` handles J/Shift+J/Delete/K shortcuts. The feature gate `STUDIO_KEYFRAMES_ENABLED` (default false) guards all new UI.

**Test scenarios:**
- Diamond renders at correct horizontal position for a keyframe at 50%
- Clicking a diamond selects it (visual highlight)
- Pressing Delete on selected diamond removes the keyframe
- Pressing K toggles keyframe at current playhead position
- J/Shift+J navigate between keyframes
- Feature gate: diamonds don't render when `STUDIO_KEYFRAMES_ENABLED=false`

**Verification:** Type-check clean. Manual verification: open Studio with `VITE_STUDIO_ENABLE_KEYFRAMES=true`, confirm diamonds appear on timeline clips.

---

### U6. PR 6 — feat(studio): design panel — arc controls + ease curve + stagger

**Goal:** Add the design panel components for arc path editing (curviness slider, auto-rotate toggle), ease curve visualization, stagger controls, and the expanded animation card with per-property keyframe fields.

**Requirements:** R1, R2, R3

**Dependencies:** U5

**Files (~685 LOC, 12 files):**
- `packages/studio/src/components/editor/ArcPathControls.tsx` (+131) NEW
- `packages/studio/src/components/editor/MotionPathOverlay.tsx` (+146) NEW
- `packages/studio/src/components/editor/EaseCurveSection.tsx` (+89)
- `packages/studio/src/components/editor/StaggerControls.tsx` (+61) NEW
- `packages/studio/src/components/editor/AnimationCard.tsx` (+74)
- `packages/studio/src/components/editor/propertyPanelPrimitives.tsx` (+63)
- `packages/studio/src/components/editor/PropertyPanel.tsx` (+122 from #1232)
- Plus 5 smaller files: propertyPanelHelpers (+17), domEditingElement (+17), GsapAnimationSection (+15), propertyPanelSections (+10), propertyPanelColor (+4)

**Approach:** `ArcPathControls` renders the curviness slider and auto-rotate toggle when an arc path animation is selected. `MotionPathOverlay` renders the SVG path visualization over the preview. `EaseCurveSection` shows the bezier curve editor. `StaggerControls` adds stagger timing fields. All integrate into the existing PropertyPanel via conditional rendering gated on `STUDIO_KEYFRAMES_ENABLED`.

**Test scenarios:**
- Arc path controls appear when a MotionPath animation is selected
- Curviness slider dispatches `set-arc-path` mutation with correct value
- Ease curve section renders the correct bezier shape for power2.inOut
- Stagger controls appear for animations targeting multiple elements
- MotionPath overlay SVG path matches the animation's waypoints

**Verification:** Type-check clean. Manual: select an element with a MotionPath animation, verify arc controls appear and curviness slider updates the path preview.

---

### U7. PR 7 — chore(studio): render queue improvements + producer build

**Goal:** Ship the render queue UI improvements and producer build changes independently of the keyframe feature.

**Requirements:** R1, R3

**Dependencies:** None (independent, can base on main or any point in the stack)

**Files (~370 LOC, 5 files):**
- `packages/studio/src/components/renders/RenderQueue.tsx` (+221)
- `packages/producer/build.mjs` (+90)
- `packages/studio/src/components/renders/RenderQueueItem.tsx` (+26 from #1232)
- `packages/studio/tailwind.config.js` (+15)
- `packages/studio/vite.config.ts` (+3)

**Approach:** These changes are unrelated to keyframes — render queue progress indicators, download improvements, and producer build optimizations. Ship separately to unblock review.

**Test scenarios:**
- Render queue displays progress percentage during active render
- Completed renders show download button
- Producer build script generates correct output artifact

**Verification:** `bun run build` passes. Manual: trigger a render, verify progress updates in the queue.

---

### U8. PR 8 — feat(studio): gesture recording core

**Goal:** Add the gesture recording engine: RAF sampling loop, modifier key handling (Shift/Alt/Cmd for different properties), Ramer-Douglas-Peucker simplification, and the ghost trail SVG overlay.

**Requirements:** R1, R2, R3

**Dependencies:** U6

**Files (~655 LOC, 3 files):**
- `packages/studio/src/hooks/useGestureRecording.ts` (+340) NEW
- `packages/studio/src/utils/rdpSimplify.ts` (+183) NEW
- `packages/studio/src/components/editor/GestureTrailOverlay.tsx` (+132) NEW

**Approach:** `useGestureRecording` captures pointer events at 60fps, resolves property deltas based on modifier keys, and accumulates samples. `rdpSimplify` reduces raw samples to clean keyframes using the Ramer-Douglas-Peucker algorithm. `GestureTrailOverlay` renders an SVG polyline following the pointer during recording and shows simplified keyframe diamonds after.

**Test scenarios:**
- Recording starts on `startRecording()` and stops on `stopRecording()`
- Samples accumulate at ~60fps with correct time stamps
- Shift+drag produces rotationX/rotationY properties (not x/y)
- Alt+drag produces rotation property
- Cmd+drag produces opacity property
- RDP simplification reduces 180 samples to 5-15 keyframes for a smooth arc
- RDP simplification preserves start and end points exactly
- Trail overlay renders polyline in viewport coordinates during recording
- Trail overlay renders simplified path with diamonds in preview mode

**Verification:** Type-check clean. Manual: select element, press R, drag, press R — verify trail appears and keyframes are created.

---

### U9. PR 9 — fix(studio): keyframe drag + recording bug bash

**Goal:** Apply all 21 bug fixes from the bug bash session: GSAP coordinate system fixes, gesture recording position fixes, keyframe cache race conditions, overlay flash, re-render optimization, and the `_auto` flag integration in `useEnableKeyframes`.

**Requirements:** R1, R2, R3

**Dependencies:** U8

**Files (~600 LOC, 15 files):**
- `packages/studio/src/hooks/gsapRuntimeBridge.ts` (+212) — drag intercept fixes
- `packages/studio/src/hooks/useEnableKeyframes.ts` (+171) NEW — centralized enable/toggle
- `packages/studio/src/components/editor/manualOffsetDrag.ts` (+59) — drag member fixes
- `packages/studio/src/hooks/useGsapTweenCache.ts` (+59 from #1256) — cache invalidation fix
- `packages/studio/src/hooks/useGsapScriptCommits.ts` (+55 from #1256) — mutation ordering
- `packages/core/src/runtime/init.ts` (+49 from #1256) — remove destructive stripping
- `packages/core/src/studio-api/helpers/sourceMutation.ts` (+45)
- `packages/studio/src/components/editor/manualEditsDom.ts` (+28) — draft gsap.set fix
- `packages/studio/src/hooks/useTimelineEditing.ts` (+36) — block edits during recording
- Plus 6 smaller files: useStudioContextValue (+9), DomEditOverlay (+9), useDomEditOverlayRects (+11), manualEdits (+3), contexts (+4+4)

**Approach:** These are all fixes discovered during the bug bash. Key fixes: capture GSAP base at drag start to prevent cache corruption, set `translate:none` before `gsap.set` to prevent double-counting, skip `reapplyPathOffsets` for GSAP-animated elements, clamp recording seek to element end time, and the `_auto` flag for 100% keyframes (useEnableKeyframes).

**Test scenarios:**
- Dragging a GSAP-animated element updates position correctly (no double-counting)
- Element stays visible during gesture recording past element midpoint
- Keyframe cache updates after soft reload (no stale diamonds)
- 100% keyframe auto-updates when user adds intermediate keyframes (while _auto present)
- 100% keyframe stops auto-updating after user explicitly edits it
- Overlay doesn't flash at (0,0) on first render
- Timeline edits are blocked during active recording

**Verification:** Type-check clean. Manual: enable keyframes on element, drag at different times, verify position persists. Record gesture, verify element follows pointer.

---

### U10. PR 10 — feat(studio): keyframe integration wiring + docs

**Goal:** Wire everything together: App.tsx orchestration (recording toggle, commit flow), TimelineToolbar (R key, recording indicator), PropertyPanel keyframe diamonds, shortcuts panel, toast notifications, and the keyframes guide doc.

**Requirements:** R1, R2, R3, R6

**Dependencies:** U9

**Files (~580 LOC, 14 files):**
- `packages/studio/src/App.tsx` (+163) — recording orchestration
- `packages/studio/src/components/TimelineToolbar.tsx` (+177 from #1256) — R key, enable keyframes button
- `packages/studio/src/components/editor/PropertyPanel.tsx` (+119 from #1256) — per-property diamonds
- `packages/studio/src/components/renders/RenderQueueItem.tsx` (+93 from #1256)
- `packages/studio/src/components/StudioToast.tsx` (+54) — recording toast
- `packages/studio/src/player/components/ShortcutsPanel.tsx` (+30) — K/R shortcuts
- `packages/studio/src/hooks/useAppHotkeys.ts` (+18) — R key binding
- Plus 7 smaller files: StudioPreviewArea (+7), StudioRightPanel (+9), StudioHeader (+13), useAskAgentModal (+6), useStudioUrlState (+3), LayersPanel (+2), SourceEditor (+1)

**Approach:** This is the final "glue" PR. App.tsx orchestrates the recording flow (gestureStateRef, handleToggleRecording, commit path). TimelineToolbar adds the K/R buttons. PropertyPanel renders per-property keyframe diamond toggles. All gated on `STUDIO_KEYFRAMES_ENABLED`.

**Note:** `docs/guides/keyframes.mdx` (+141) is included here. It documents the keyframe system for Studio users.

**Test scenarios:**
- Pressing R in toolbar starts recording (toast appears, indicator visible)
- Pressing R again stops recording and commits keyframes
- K button toggles keyframe at current playhead
- PropertyPanel shows diamond indicators next to keyframeable properties
- Shortcut panel shows K and R shortcuts
- Recording blocked when no element is selected (toast warning)

**Verification:** Full integration test: open Studio with `VITE_STUDIO_ENABLE_KEYFRAMES=true`, select element, press K (diamond appears), drag at different time (new diamond), press R (record gesture), verify smooth workflow end-to-end.

---

## Stack Order Summary

```
main
 └─ U1:  fix(studio): keyframe stability + border-radius       (333 LOC)  #1217
     └─ U2:  feat(studio): parser — arc path + keyframe CRUD   (~665 LOC)
         └─ U3:  feat(studio): runtime — global time + reload   (~575 LOC)
             └─ U4:  feat(studio): keyframe cache + commits     (~575 LOC)
                 └─ U5:  feat(studio): timeline UI + diamonds   (~600 LOC)
                     └─ U6:  feat(studio): design panel + arc   (~685 LOC)
                         └─ U8:  feat(studio): gesture core     (~655 LOC)
                             └─ U9:  fix(studio): bug bash      (~600 LOC)
                                 └─ U10: feat(studio): wiring   (~580 LOC)

 └─ U7:  chore(studio): render queue (independent)              (~370 LOC)
```

---

## Open Questions

### Deferred to Implementation

- **Exact cherry-pick vs rewrite strategy** — Some files have interleaved changes from #1232 and #1256. The implementer will need to decide per-file whether to cherry-pick hunks or manually reconstruct. `git diff` between the two branches on shared files will guide this.
- **Intermediate test coverage** — Some test files (e.g., `gsapParser.test.ts`) test features across multiple PRs. Tests may need to be split or temporarily stubbed at intermediate stack points.
- **Fallow gate** — The inherited duplication/complexity findings will trigger fallow on every PR in the stack. May need `LEFTHOOK=0` for intermediate commits, with a clean fallow run on the final PR.
