---
title: "fix: Remove synchronous flush from Proxy get/set traps in hf-early-stub"
type: fix
status: active
date: 2026-06-08
---

# fix: Remove synchronous flush from Proxy get/set traps in hf-early-stub

## Summary

Remove `flushPendingOperations()` from the Proxy `get` trap's non-function property-read path and from the `set` trap in the hf-early-stub. This eliminates a synchronous-flush regression introduced in commit `1bcd6ec3` (v0.6.82) that defeats the rAF-based batching mechanism and can starve `DOMContentLoaded`, causing `page.goto` navigation timeouts during render.

## Problem Frame

Commit `1bcd6ec3` rewrote the hf-early-stub's `wrapTimeline` from a plain-object proxy to a `new Proxy` to fix silently-dropped GSAP API surface (eventCallback, labels, repeat, etc.). The Proxy's `get` trap calls `flushPendingOperations()` on every non-function property read where `value !== undefined` (line 310), and the `set` trap does the same on every property write (line 315). This synchronously drains the entire pending operations queue — the same main-thread-blocking behavior the batching mechanism was designed to prevent. The regression manifests as `page.goto` navigation timeouts (60s) during render, observed in both CI (beginframe mode, flaky) and local renders (screenshot mode, large compositions).

## Requirements

- R1. Non-function property reads on the timeline proxy must NOT trigger `flushPendingOperations()`. Passive reads (`tl.vars`, `tl.data`, GSAP internals like `._dp`) return the real timeline's current value without side effects.
- R2. Property writes on the timeline proxy must NOT trigger `flushPendingOperations()`. Writes forward to the real timeline directly.
- R3. Non-batched method calls (`pause()`, `duration()`, `time()`, `seek()`, etc.) continue to trigger `flushPendingOperations()` before delegating — this is correct behavior ensuring consistent state for reading methods.
- R4. Batched methods (`to`, `from`, `fromTo`, `set`, `add`) continue to enqueue operations for rAF-based flush — no change.
- R5. The generated IIFE in `hf-early-stub-inline.ts` reflects the source changes.
- R6. Build and all existing tests pass.

---

## Key Technical Decisions

- **Remove property-read flush, keep method-call flush.** The original plain-object proxy never flushed on property reads — only on explicit method calls. The Proxy rewrite added property-read flushes "so post-batch reads see consistent state," but this is not worth the DOMContentLoaded starvation risk. Compositions that need consistent values use method calls (`tl.duration()`), not raw property reads.
- **Remove set-trap flush.** Property writes during construction (e.g., `tl.data = {...}`) should forward directly to the real timeline without flushing. The original plain-object proxy didn't expose a set trap at all.
- **Preserve the Proxy architecture.** The Proxy approach is correct — it fixes the silently-dropped API surface problem. Only the flush triggers are wrong.

---

## Implementation Units

### U1. Fix Proxy get/set traps in hf-early-stub

**Goal:** Remove synchronous flush from property reads and writes while keeping it for method calls.

**Requirements:** R1, R2, R3, R4

**Files:**
- `packages/producer/stubs/hf-early-stub.ts` (modify)

**Approach:** In the `get` trap, remove the `if (value !== undefined) flushPendingOperations();` line — just return `value` directly. In the `set` trap, remove `flushPendingOperations();` — forward the write to the real timeline directly. Method calls still go through `createFlushingMethodWrapper` which flushes before delegating.

**Patterns to follow:** The BATCHED_METHODS / PROXY_STATE_KEYS pattern is already correct. Only the fallthrough paths need change.

**Test scenarios:**
- Batched methods (`to`, `from`, `fromTo`, `set`, `add`) still queue operations without immediate application
- Non-batched methods (`pause`, `duration`, `time`, `seek`) still flush before delegating
- Property reads (`tl.vars`, `tl.data`) return the real timeline's value without flushing pending operations
- Property writes (`tl.data = x`) forward to real timeline without flushing
- `__hfIsProxy`, `__hfReal`, `__hfQueue` reads bypass the real timeline entirely (existing behavior)

**Verification:** Run `bun run build` and `bun run test` from repo root.

### U2. Regenerate hf-early-stub-inline IIFE

**Goal:** Rebuild the generated IIFE constant to reflect the source changes.

**Requirements:** R5

**Dependencies:** U1

**Files:**
- `packages/producer/src/generated/hf-early-stub-inline.ts` (regenerate)

**Approach:** Run the build script that compiles `stubs/hf-early-stub.ts` into the inline IIFE string constant.

**Test expectation:** none -- generated artifact, verified by build.

**Verification:** `bun run build` succeeds; the generated file content differs from the pre-change version.

### U3. Verify build and tests

**Goal:** Confirm no regressions from the Proxy trap changes.

**Requirements:** R6

**Dependencies:** U1, U2

**Files:**
- (no new files)

**Approach:** Run full build, typecheck, and test suite. Fix any failures.

**Test expectation:** none -- verification step.

**Verification:** `bun run build && bun run test` pass clean.
