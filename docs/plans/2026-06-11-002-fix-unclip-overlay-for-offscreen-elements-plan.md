---
title: "fix: Unclip DomEditOverlay for off-screen element interaction"
status: active
created: 2026-06-11
type: fix
depth: lightweight
origin: null
---

## Summary

Split the NLE preview wrapper so the iframe is clipped but the DomEditOverlay renders unclipped, enabling selection handles, resize, rotation, and drag for GSAP-animated elements positioned outside the composition bounds.

## Problem Frame

The NLE layout wraps both `NLEPreview` (iframe) and the `previewOverlay` slot (DomEditOverlay, CaptionOverlay, SnapToolbar, gesture overlays) in a single `overflow-hidden` div at `packages/studio/src/components/nle/NLELayout.tsx` line 369. This clips the overlay, making selection handles unreachable for off-screen elements. The iframe needs clipping (to prevent it from bleeding into the timeline area), but the overlay must NOT be clipped (so handles extend beyond the composition).

## Requirements

- **R1**: The iframe/player content is visually clipped to the preview area
- **R2**: The DomEditOverlay renders without overflow clipping — selection handles, resize handles, and drag gestures work for elements outside the composition bounds
- **R3**: Zoom/pan, drop targets, gesture recording overlay, snap guides, grid overlay, and caption overlay continue to function correctly

## Key Technical Decisions

### KTD1: Restructure at NLELayout wrapper level

The `overflow-hidden` lives on the wrapper div at `NLELayout.tsx:369`, not inside `NLEPreview.tsx`. The fix: split this wrapper into two layers — an inner clipped div for `NLEPreview` and the drag-over indicator, and the outer unclipped div for `previewOverlay`. The overlay already uses absolute positioning with `inset-0`, so moving it one level up is safe as long as the parent has `position: relative`.

## Implementation Units

### U1. Split the NLE preview wrapper

**Goal**: Move `previewOverlay` outside the `overflow-hidden` container so it renders unclipped.

**Requirements**: R1, R2, R3

**Dependencies**: None

**Files**:
- `packages/studio/src/components/nle/NLELayout.tsx` — restructure the preview wrapper

**Approach**: The current structure at line 367-389 is:
```
<div class="overflow-hidden relative">   ← clips everything
  <NLEPreview />                         ← needs clipping
  {previewDragOver && <indicator />}     ← needs clipping
  {previewOverlay}                       ← must NOT be clipped
</div>
```

Change to:
```
<div class="relative">                   ← no overflow, position context
  <div class="overflow-hidden absolute inset-0">  ← clips iframe only
    <NLEPreview />
    {previewDragOver && <indicator />}
  </div>
  {previewOverlay}                       ← unclipped, absolute, same position context
</div>
```

The outer div keeps `relative` for positioning context and `flex-1 min-h-0 flex flex-col` for layout. The inner div gets `overflow-hidden absolute inset-0` to clip the iframe. The overlay sits as a sibling outside the clipped container.

**Patterns to follow**: The existing overlay already uses `absolute inset-0 z-10` positioning in `DomEditOverlay.tsx:341`.

**Test scenarios**:
- Iframe content does not bleed outside the preview area at any zoom level
- Selection handles for an element positioned outside the composition (via GSAP x/y) are visible and interactive
- Drag gesture on an off-screen element moves it (pointer events reach the handle)
- Resize handles on an off-screen element work
- Zoom/pan gestures (wheel, pinch) still function — the wheel handler is on `viewportRef` inside NLEPreview, not on the wrapper
- Block/asset drop onto the preview works — the drag-over indicator and drop handler are on the wrapper; verify `onDragOver`/`onDrop` still fire
- Gesture recording overlay renders correctly over the preview
- Snap guides and grid overlay render correctly
- Caption overlay renders correctly when in caption edit mode
- The zoom HUD and reset button remain visible and functional

**Verification**: Off-screen elements can be selected, dragged, resized, and rotated from their actual position outside the composition bounds. All existing preview interactions (zoom, pan, drop, recording) work unchanged.
