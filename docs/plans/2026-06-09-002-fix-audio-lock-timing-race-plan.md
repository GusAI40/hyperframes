---
title: "fix: Audio-lock muting fails on fast-loading iframes (timing race)"
status: active
type: fix
created: 2026-06-09
origin: Slack thread — audio-lock muting on Claude desktop
depth: Lightweight
---

# fix: Audio-lock muting fails on fast-loading iframes (timing race)

## Summary

The `audio-locked` attribute on `<hyperframes-player>` correctly hides volume controls and mutes audio on Claude web, but on Claude desktop audio still plays. The root cause is a timing race: `_handleMutedChange` sends `set-muted` via postMessage immediately when the attribute fires, but the iframe's runtime control bridge (`installRuntimeControlBridge`) isn't installed yet. On Claude web the CDN-loaded iframe is slow enough that the bridge is ready; on Claude desktop, the local `claude-media://` protocol loads the iframe faster than the bridge installs, so the message is silently dropped.

Secondary issue: `_onIframeLoad` calls `_media.resetForIframeLoad()` but `_onProbeReady` never re-syncs player-side state (muted, volume, playback-rate) to the iframe, so even a reload loses the muted state.

## Problem Frame

The `_sendControl` path has no delivery guarantee — it fires postMessage into an iframe that may not have a listener yet. The `_onProbeReady` callback is the earliest point where the runtime bridge is guaranteed installed (the probe resolves by finding `window.__player` or `window.__timelines`, which only exist after `initSandboxRuntimeModular()` runs, which also calls `installRuntimeControlBridge`). But `_onProbeReady` currently syncs none of the player-side state.

This isn't specific to `audio-locked` — any attribute that fires `_sendControl` before the probe resolves has the same race. `audio-locked` manifests it because it's set as a static HTML attribute, which fires `attributeChangedCallback` during element upgrade, well before any iframe content loads.

## Requirements

- **R1.** Audio must be muted when `audio-locked` is set, regardless of iframe load speed or protocol scheme
- **R2.** Muted, volume, and playback-rate state must survive iframe reloads
- **R3.** No regression on Claude web, direct embedding, or headless rendering

---

## Key Technical Decisions

**KTD-1. Sync all control state in `_onProbeReady`, not just muted.**

Volume and playback-rate have the same race window — they just don't manifest because they're rarely set as static HTML attributes before load. Syncing all three in `_onProbeReady` is the correct fix because it's the one point where the bridge is guaranteed ready, and it covers both the initial-load race and the reload-drops-state secondary issue.

**KTD-2. Unconditional sync, not conditional re-send.**

Always send the current state in `_onProbeReady` rather than tracking whether an earlier `_sendControl` was "acked." The messages are idempotent — re-sending the same muted/volume/playback-rate values is a no-op on the runtime side. This avoids adding ack/retry complexity for a problem that unconditional sync solves cleanly.

---

## Implementation Units

### U1. Sync player-side state to iframe on probe ready

**Goal:** Ensure muted, volume, and playback-rate are delivered to the runtime after the bridge is installed.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- `packages/player/src/hyperframes-player.ts` (modify `_onProbeReady`)
- `packages/player/tests/hyperframes-player.test.ts` (if exists, add test scenarios)

**Approach:**

At the end of `_onProbeReady`, after the existing `setupFromIframe` / `autoplay` logic, send the current player-side state to the iframe:

1. Send `set-muted` with the current `this.muted` value
2. Send `set-volume` with the current `this._volume` value
3. Send `set-playback-rate` with the current `this.playbackRate` value

All three use the existing `_sendControl` method. This is safe because:
- `_sendControl` is already a no-op when `contentWindow` is null
- The runtime handlers are idempotent (they just set state)
- The probe resolving guarantees the bridge listener is installed

**Patterns to follow:** The existing `_sendControl` calls in `attributeChangedCallback` for volume (line 211) and playback-rate (line 195) — same message shapes.

**Test scenarios:**
- Muted attribute set before iframe loads → audio is muted after probe resolves
- Volume attribute set before iframe loads → volume is applied after probe resolves
- Playback-rate attribute set before iframe loads → rate is applied after probe resolves
- Iframe reload with muted=true → muted state is re-synced after probe re-resolves
- Default state (no muted/volume/rate attributes) → sync sends defaults, no regression

**Verification:** Build passes (`bun run build`). Manual verification: set `audio-locked` on a `<hyperframes-player>` element with a fast-loading src — audio should be muted on first load and after reload.

---

## Scope Boundaries

### Not in scope

- Changes to the runtime bridge (`installRuntimeControlBridge`) — it's correct; the issue is the sender's timing
- Adding ack/retry to `_sendControl` — unconditional sync in `_onProbeReady` is simpler and sufficient
- Re-disabling TTS in Pacific — separate decision, separate PR

### Deferred to Follow-Up Work

- Auditing other `_sendControl` callers (e.g., `play`, `pause`, `seek`) for the same pre-bridge-ready race — these are user-initiated actions that only fire after the player is interactive, so they're unlikely to hit the race, but worth confirming
