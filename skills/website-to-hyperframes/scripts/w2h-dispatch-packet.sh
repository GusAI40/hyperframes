#!/usr/bin/env bash
# w2h-dispatch-packet.sh — build the two-part dispatch packet for Step 5 beat workers.
#
# Adapted from plv2's `mkdir -p /tmp/scene-dispatch; cat shared → header; per-worker = shared + scene YAML`
# pattern (SKILL.md:260-268). Tuned for w2h's continuity-heavy genre: workers CAN read sibling
# storyboards on demand; the packet is the default, not a wall-off.
#
# Usage (from $PROJECT_DIR before dispatching Step 5 beat workers):
#   bash <SKILL_DIR>/scripts/w2h-dispatch-packet.sh shared
#   bash <SKILL_DIR>/scripts/w2h-dispatch-packet.sh beat <N> <BEAT_FILE> <BEAT_YAML_INLINE>
#
# Or all-at-once when iterating in a single agent message:
#   bash w2h-dispatch-packet.sh shared
#   for N in 1 2 3 ...; do bash w2h-dispatch-packet.sh beat $N "compositions/beat-${N}-foo.html" "<<inline YAML>>"; done
#
# Outputs:
#   /tmp/w2h-shared.txt              — DESIGN.md + STORYBOARD.md + SCRIPT.md + transcript.json (project-level globals; cat ONCE)
#   /tmp/w2h-dispatch/b<N>.txt       — shared header + per-beat YAML (one Read per worker)
#
# Each worker's prompt then contains:
#   ## Dispatch context
#   PROJECT_DIR: <abs path>
#   BEAT_NUMBER: <N>
#   BEAT_FILE: <relative path inside PROJECT_DIR, e.g. compositions/beat-3-feature-tour.html>
#   Dispatch packet: /tmp/w2h-dispatch/b<N>.txt
#
# Worker Step 0 reads /tmp/w2h-dispatch/b<N>.txt ONCE → gets all globals + its beat spec, saving
# 3 separate Reads per worker for DESIGN.md / STORYBOARD.md / brand_values. w2h workers can still
# Read sibling beat files when continuity demands (motif callback, color carry-through), but the
# default path is the packet.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
MODE="${1:-}"

build_shared() {
  mkdir -p /tmp/w2h-dispatch
  # cat project-level globals into a single shared header. Skip files that don't exist (project may
  # be running Step 5 without a finalized DESIGN.md if user is in autonomous mode).
  {
    echo "## DESIGN.md"
    if [ -f "$PROJECT_DIR/DESIGN.md" ]; then
      cat "$PROJECT_DIR/DESIGN.md"
    else
      echo "(DESIGN.md not present — fall back to capture/extracted/tokens.json + design-styles.json)"
    fi
    echo
    echo "## STORYBOARD.md"
    if [ -f "$PROJECT_DIR/STORYBOARD.md" ]; then
      cat "$PROJECT_DIR/STORYBOARD.md"
    else
      echo "(STORYBOARD.md not present — orchestrator must rebuild before dispatch)"
      exit 1
    fi
    echo
    echo "## SCRIPT.md"
    if [ -f "$PROJECT_DIR/SCRIPT.md" ]; then
      cat "$PROJECT_DIR/SCRIPT.md"
    fi
    echo
    echo "## transcript.json (word-level timestamps for VO sync)"
    if [ -f "$PROJECT_DIR/transcript.json" ]; then
      cat "$PROJECT_DIR/transcript.json"
    else
      echo "(transcript.json not present — beats use planned timings only)"
    fi
  } > /tmp/w2h-shared.txt
  echo "wrote /tmp/w2h-shared.txt ($(wc -l < /tmp/w2h-shared.txt) lines)"
}

build_beat() {
  local N="${2:-}"
  local BEAT_FILE="${3:-}"
  local BEAT_YAML="${4:-}"
  if [ -z "$N" ] || [ -z "$BEAT_FILE" ] || [ -z "$BEAT_YAML" ]; then
    echo "usage: $0 beat <N> <BEAT_FILE> <BEAT_YAML_INLINE>" >&2
    exit 1
  fi
  [ -f /tmp/w2h-shared.txt ] || { echo "/tmp/w2h-shared.txt missing — run '$0 shared' first" >&2; exit 1; }
  mkdir -p /tmp/w2h-dispatch
  local OUT="/tmp/w2h-dispatch/b${N}.txt"
  {
    cat /tmp/w2h-shared.txt
    echo
    echo "## Beat ${N} — your assignment"
    echo "BEAT_FILE: ${BEAT_FILE}"
    echo
    echo "## Beat spec (verbatim from STORYBOARD.md + main agent's customizations)"
    echo "${BEAT_YAML}"
  } > "$OUT"
  echo "wrote ${OUT} ($(wc -l < "$OUT") lines)"
}

case "$MODE" in
  shared) build_shared ;;
  beat)   build_beat "$@" ;;
  *)
    echo "usage: $0 shared              (build /tmp/w2h-shared.txt once before fan-out)" >&2
    echo "       $0 beat <N> <BEAT_FILE> <BEAT_YAML_INLINE>  (per-worker packet)" >&2
    exit 1
    ;;
esac
