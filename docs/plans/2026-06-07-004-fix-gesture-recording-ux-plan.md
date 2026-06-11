---
title: "fix: gesture recording UX + keyframes documentation"
type: fix
status: active
date: 2026-06-07
---

# fix: Gesture recording UX + keyframes documentation

## Summary

Fix three bugs in gesture-to-keyframes recording that make it unusable, then write Mintlify docs explaining keyframes and arc motion. The recording must work as: click Record → timeline plays → drag element → pointer path becomes GSAP keyframes.

---

## Problem Frame

The gesture recording feature shipped with three bugs that make it confusing: (1) the element position is captured relative to the scrubbed time, not its initial CSS position, so the resulting keyframes have wrong offsets; (2) the preview panel overlaps other UI and blocks interaction; (3) state transitions are unclear — playback doesn't pause on stop, and it's not obvious what the recording captured. Users also lack documentation for the keyframe and arc motion features.

---

## Requirements

- R1. Recording starts timeline playback and captures pointer deltas from the element's position at recording start time
- R2. Recorded keyframes represent motion relative to the element's starting position, not the scrubbed position
- R3. The preview panel does not block element interaction — it shows inline in the design panel, not as a floating overlay
- R4. Stop recording pauses timeline, seeks back to start of the recorded segment, and shows preview
- R5. Mintlify docs explain keyframes (timeline diamonds, design panel editing, arc motion toggle/curviness/auto-rotate)

---

## Key Technical Decisions

KTD1. **Capture element's computed transform at recording start, not pointer position.** The current bug: `startPointerRef` captures cursor position before recording. Fix: read the element's current GSAP-interpolated x/y via `gsap.getProperty()` at recording start, and compute deltas from that baseline — not from where the cursor happens to be.

KTD2. **Preview panel inline in design panel, not floating overlay.** The floating `z-[90]` div blocks interaction. Move the GesturePreviewPanel into the PropertyPanel's Animation section (where the Record button already lives), replacing the Record button while in preview state.

KTD3. **Seek to recording start on stop.** When recording stops, seek the timeline back to `recordingStartTimeRef.current` so the user sees the element in its pre-recording position. This makes the preview meaningful — they see where the motion starts.

KTD4. **Remove toast notifications during recording.** The "Recording — drag in preview" toast is redundant when the Record button already shows the recording state. Remove the toasts for start/stop — the button state is sufficient feedback.

---

## Implementation Units

### U1. Fix position capture baseline

**Goal:** Record pointer deltas relative to the element's GSAP position at recording start, not cursor position.

**Requirements:** R1, R2

**Files:**
- `packages/studio/src/hooks/useGestureRecording.ts`
- `packages/studio/src/App.tsx`

**Approach:**
In `startRecording`, read the element's current x/y via `gsap.getProperty(element, "x")` and `gsap.getProperty(element, "y")` from the iframe's GSAP instance. Store as `elementBaselineRef`. In each RAF tick, compute `dx = currentPointerX - dragStartPointerX` (pointer delta from drag start), not absolute position. The resulting samples are relative motion deltas — exactly what GSAP keyframes need.

In App.tsx, store `recordingStartTimeRef.current = store.currentTime` before starting playback.

**Test scenarios:**
- Element at x=100, y=200 at scrub time. Record produces keyframes starting at {x:0, y:0}, not {x:100, y:200}
- Dragging right 300px produces x delta of 300, regardless of initial element position
- Recording at t=2s produces keyframes timed from t=2s, not t=0

**Verification:** Record a gesture on fly-item at different scrub positions. Keyframes should represent the same motion regardless of start time.

---

### U2. Move preview panel inline in design panel

**Goal:** Show the gesture preview inside the Animation section instead of a floating overlay.

**Requirements:** R3

**Files:**
- `packages/studio/src/App.tsx`
- `packages/studio/src/components/editor/PropertyPanel.tsx`

**Approach:**
Remove the floating `<div className="absolute bottom-20 right-6 z-[90]">` wrapper from App.tsx. Instead, render `GesturePreviewPanel` inside PropertyPanel's animation section — when `recordingState === "preview"`, show the panel in place of the Record button. Pass the same props (samples, totalDuration, onCommit, onDiscard, onReRecord) through the PropertyPanel props.

**Test scenarios:**
- After recording stops, preview panel appears inside the design panel below the animation section
- Preview panel does not block clicking on elements in the preview
- Commit/Discard/Re-record buttons work from the inline position

**Verification:** Record a gesture, verify the preview shows inline in the design panel without overlapping the preview area.

---

### U3. Fix state transitions — seek on stop, remove toasts

**Goal:** Clean up the recording lifecycle — pause and seek on stop, no redundant toasts.

**Requirements:** R4

**Files:**
- `packages/studio/src/App.tsx`

**Approach:**
In `stopRecording`:
1. Stop timeline playback (`setIsPlaying(false)`)
2. Seek to `recordingStartTimeRef.current` so the user sees the element at its pre-recording position
3. Remove `showToast()` calls from start/stop — the button state (red pulsing → amber preview) is sufficient
4. Clear the auto-stop interval

In the Record button (PropertyPanel), show clear state labels: "Record gesture (R)" → "Stop (R)" → "Commit / Discard" with no toast interruption.

**Test scenarios:**
- Stop recording seeks timeline to the recording start time
- No toast appears on start or stop
- Button text changes through states correctly
- Auto-stop at composition end seeks to start and enters preview

**Verification:** Record, stop, verify timeline is at the right position and no toasts appeared.

---

### U4. Keyframes and arc motion documentation

**Goal:** Write a Mintlify guide page explaining keyframes, timeline diamonds, arc motion, and gesture recording.

**Requirements:** R5

**Files:**
- `docs/guides/keyframes.mdx` (new)
- `docs/docs.json` (modify — add to navigation after gsap-animation)

**Approach:**
Single MDX page covering:
1. **Timeline keyframe diamonds** — what they represent, how they map to GSAP tweens
2. **Design panel editing** — changing tween properties (Move X/Y, Scale, Opacity, Ease)
3. **Arc motion** — step-by-step: select element with x/y tween → toggle Arc Motion → adjust curviness (0=straight, 3=extreme arc) → toggle auto-rotate → verify in Code tab
4. **Gesture recording** — select element → click Record → drag in preview → stop → adjust smoothing → commit
5. **Clipboard context** — the clipboard icon copies element info for AI agents

Use the same MDX conventions as `gsap-animation.mdx`: `<Note>`, `<Steps>`, `<Step>`, code blocks with labels.

Add `"guides/keyframes"` to `docs/docs.json` navigation after `"guides/gsap-animation"`.

**Test scenarios:**
Test expectation: none -- documentation only

**Verification:** Run `npx mintlify dev` and verify the page renders correctly with navigation.

---

## Scope Boundaries

### In scope
- Fix position capture baseline bug
- Move preview panel inline
- Fix state transitions (seek on stop, remove toasts)
- Keyframes + arc motion Mintlify docs

### Deferred to Follow-Up Work
- Drawable easing canvas (jhey-style signature-to-easing)
- Multi-element gesture recording
- Gesture recording for rotation/scale/opacity via modifier keys (hooks exist but not wired to commit)
- Layered multi-pass recording
