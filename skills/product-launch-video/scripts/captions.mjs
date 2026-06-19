#!/usr/bin/env node
// captions.mjs — build the captions sub-composition from STORYBOARD + audio_meta.
//
// One mode: `build`. Reads STORYBOARD.md (frame order + durations → cumulative
// frame starts) + audio_meta.json (voices[].words, frame-relative) → absolute-
// timed caption groups → writes:
//   compositions/captions.html  — a self-contained sub-composition the index
//        assembler mounts on its captions track (data-composition-id="captions").
//   caption_groups.json         — the computed groups (debug / inspection / --out).
//   caption-overrides.json      — an empty `[]` shim (silences the captions runtime's
//        validate-time fetch; only written when captions.html is).
// No narration / no words → legal skip: nothing written, assemble-index then omits
// the captions track (it keys off compositions/captions.html existence).
//
//   node captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json
//
// Grouping mirrors the proven heuristics (frame boundary · sentence-end punct ·
// silence gap · density-aware word cap) but is rewritten for the new inputs (no
// group_spec / no whisper pass — word timings come inline from audio_meta).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseStoryboard } from "./lib/storyboard.mjs";
import { captionBand, parseFormat } from "./lib/dimensions.mjs";

const flag = (argv, name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const r3 = (x) => Number(x.toFixed(3));

// ── grouping params ───────────────────────────────────────────────────────────
const SILENCE_GAP = 0.18; // s of silence between words → split
const TAIL_PAD = 0.12; // s the group lingers after its last word
const SENT_END = /[.?!,;:—]$/;
const DENSITY_WINDOW = 1.0; // s window for words/sec density
function wordCap(density) {
  return density > 3.5 ? 2 : density > 2.5 ? 3 : 4;
}

function runBuild(argv) {
  const skip = (reason) => {
    console.log(`captions: skipped (${reason})`);
    process.exit(0);
  };
  const die = (m) => {
    console.error(`✗ captions build: ${m}`);
    process.exit(1);
  };

  const hyperframesDir = resolve(flag(argv, "hyperframes", "."));
  const storyboardPath = resolve(flag(argv, "storyboard", join(hyperframesDir, "STORYBOARD.md")));
  const audioMetaPath = resolve(flag(argv, "audio-meta", join(hyperframesDir, "audio_meta.json")));
  const outPath = resolve(flag(argv, "out", join(hyperframesDir, "caption_groups.json")));
  const htmlPath = join(hyperframesDir, "compositions/captions.html");
  const overridesPath = join(hyperframesDir, "caption-overrides.json");

  if (!existsSync(storyboardPath)) die(`STORYBOARD.md not found at ${storyboardPath}`);
  const manifest = parseStoryboard(readFileSync(storyboardPath, "utf8"));
  const { width: W, height: H } = parseFormat(manifest.globals.format);

  if (!existsSync(audioMetaPath)) skip("no audio_meta.json (silent film)");
  const meta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
  if (!Array.isArray(meta.voices) || meta.voices.length === 0) skip("no narration");

  // cumulative frame starts (by frame number) + total duration, from STORYBOARD.
  const startByFrame = new Map();
  let acc = 0;
  for (const f of manifest.frames) {
    if (f.number != null) startByFrame.set(f.number, acc);
    acc += Number.isFinite(f.durationSeconds) ? f.durationSeconds : 0;
  }
  const total = r3(acc);

  // absolute word stream: frame start + frame-relative word timing.
  const words = [];
  for (const v of meta.voices) {
    const base = startByFrame.get(v.frame);
    if (base == null || !Array.isArray(v.words)) continue;
    for (const w of v.words) {
      const text = String(w.text ?? "").trim();
      if (!text || /^[.?!,;:—–-]+$/.test(text)) continue; // drop empties + bare punctuation
      if (!isFinite(w.start) || !isFinite(w.end)) continue;
      words.push({ text, start: r3(base + w.start), end: r3(base + w.end), frame: v.frame });
    }
  }
  words.sort((a, b) => a.start - b.start);
  if (words.length === 0) skip("no usable words");

  // density at i = words whose start falls within [w.start, w.start + WINDOW).
  const densityAt = (i) => {
    const t0 = words[i].start;
    let n = 0;
    for (let j = i; j < words.length && words[j].start < t0 + DENSITY_WINDOW; j++) n++;
    return n / DENSITY_WINDOW;
  };

  // group: split on frame change / silence gap / word cap; always flush after a
  // sentence-ending word.
  const groups = [];
  let cur = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = cur && cur.words[cur.words.length - 1];
    const crossFrame = cur && w.frame !== cur.frame;
    const gap = prev && w.start - prev.end > SILENCE_GAP;
    const full = cur && cur.words.length >= cur.cap;
    if (!cur || crossFrame || gap || full) {
      if (cur) groups.push(cur);
      cur = { frame: w.frame, cap: wordCap(densityAt(i)), words: [] };
    }
    cur.words.push(w);
    if (SENT_END.test(w.text)) {
      groups.push(cur);
      cur = null;
    }
  }
  if (cur) groups.push(cur);

  // finalize: ids, start/end (tail-padded, clamped < next group's start), text.
  const finalized = groups.map((g, gi) => {
    const first = g.words[0];
    const last = g.words[g.words.length - 1];
    const next = groups[gi + 1];
    let end = r3(last.end + TAIL_PAD);
    if (next && next.words[0].start < end) end = r3(next.words[0].start);
    return {
      id: `caption-group-${gi}`,
      frame: g.frame,
      start: r3(first.start),
      end,
      text: g.words.map((w) => w.text).join(" "),
      words: g.words.map((w, wi) => ({
        id: `caption-word-${gi}-${wi}`,
        text: w.text,
        start: r3(w.start),
        end: r3(w.end),
      })),
    };
  });

  // ── write caption_groups.json ──
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify({ total_duration_s: total, width: W, height: H, groups: finalized }, null, 2),
  );

  // ── write compositions/captions.html ──
  mkdirSync(dirname(htmlPath), { recursive: true });
  writeFileSync(htmlPath, buildCaptionsHtml(finalized, total, W, H));

  // ── write caption-overrides.json shim ──
  if (!existsSync(overridesPath)) writeFileSync(overridesPath, "[]\n");

  console.log(
    `✓ captions build: ${finalized.length} group(s) from ${words.length} words → compositions/captions.html (total ${total}s)`,
  );
}

// Self-contained captions sub-composition. The <template> holds the band container
// + style AND the <script> (the HyperFrames loader only executes scripts INSIDE the
// cloned template — a sibling <script> after </template> never runs, so the timeline
// never registers and captions render blank). The script builds per-word spans and a
// paused, seek-safe GSAP timeline (opacity for group show/hide, a quick color tween
// per word for the karaoke highlight — no className flips, no JS state) and ends each
// group with a hard tl.set kill so an exit can't get stuck. gsap is loaded via CDN
// inside the template (matching the frame compositions). Band = captionBand(H).
function buildCaptionsHtml(groups, total, W, H) {
  const band = captionBand(H);
  const fs = Math.round(H * 0.038);
  const pad = Math.round(fs * 0.4);
  return `<template id="captions-template">
  <div
    data-composition-id="captions"
    data-width="${W}"
    data-height="${H}"
    data-duration="${total}"
    id="captions-root"
  >
    <div id="cap"></div>
  </div>
  <style>
    #captions-root {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
#cap {
      position: absolute;
      left: 0;
      right: 0;
      top: ${band.bandTopY}px;
      height: ${band.bandHeight}px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
.caption-group {
      position: absolute;
      max-width: 80%;
      padding: ${pad}px ${Math.round(pad * 1.8)}px;
      background: rgba(0, 0, 0, 0.72);
      border-radius: ${Math.round(fs * 0.3)}px;
      font-family: Roboto, sans-serif;
      font-weight: 700;
      font-size: ${fs}px;
      line-height: 1.25;
      text-align: center;
      color: #fff;
      opacity: 0;
    }
.caption-word {
      color: rgba(255, 255, 255, 0.55);
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script>
    (function () {
      var GROUPS = ${JSON.stringify(groups)};
      var cap = document.getElementById("cap");
      var tl = gsap.timeline({ paused: true });
      GROUPS.forEach(function (g) {
        var el = document.createElement("div");
        el.className = "caption-group";
        g.words.forEach(function (w) {
          var s = document.createElement("span");
          s.className = "caption-word";
          s.textContent = w.text + " ";
          el.appendChild(s);
        });
        cap.appendChild(el);
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.18, overwrite: "auto" }, g.start);
        tl.to(el, { opacity: 0, duration: 0.12, overwrite: "auto" }, g.end);
        tl.set(el, { opacity: 0, visibility: "hidden" }, g.end + 0.12); // deterministic hard kill
        g.words.forEach(function (w, i) {
          tl.to(el.children[i], { color: "#ffffff", duration: 0.06 }, w.start);
        });
      });
      tl.to({}, { duration: ${total} }, 0); // full-span anchor
      window.__timelines = window.__timelines || {};
      window.__timelines["captions"] = tl;
    })();
  </script>
</template>
`;
}

const sub = process.argv[2];
if (sub === "build" || sub === undefined) runBuild(process.argv.slice(sub === "build" ? 3 : 2));
else {
  console.error("usage: node captions.mjs build [--storyboard …] [--audio-meta …] [--hyperframes .]");
  process.exit(2);
}
