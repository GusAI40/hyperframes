# HyperFrames — Project Repository Specification

> Reconstruction-grade specification for this repository. This document is generated from the
> codebase itself and is intended to let an engineer (or agent) with zero prior context rebuild,
> operate, and extend the project without inventing architecture. Where a conventional web-app
> section (database, auth, payments) does not apply to a rendering framework, the section says so
> explicitly and documents the real equivalent instead of inventing one.

---

## Project ID

| Field            | Value                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Project name     | HyperFrames (`hyperframes-monorepo`)                                                          |
| Version          | 0.7.26 (fixed versioning — all publishable packages and plugins share one version)            |
| Repository type  | Open-source Bun/TypeScript monorepo (Apache-2.0), upstream `heygen-com/hyperframes`           |
| Purpose          | Video rendering framework: author compositions as HTML, render deterministic video            |
| Target users     | AI agents (primary — the repo ships 20 agent skills) and developers building video pipelines  |
| Business goal    | Make HTML the authoring format for programmatic video; feed the HeyGen ecosystem              |
| Success criteria | Deterministic frame-exact renders; green golden-baseline regression CI; npm + skills adoption |

## Project Vision

- **What it does.** A composition is a plain HTML file with `data-*` timing attributes and one
  paused GSAP timeline. The engine loads it in headless Chrome, seeks frame-by-frame, captures
  pixels, and encodes video with FFmpeg. Everything else in the repo — CLI, Studio editor, SDK,
  player, cloud adapters, registry, skills — exists to author, edit, preview, validate, or scale
  that core loop.
- **Why it exists.** HTML/CSS/GSAP is the most widely known layout and motion stack in the world,
  and the one LLMs write best. Rendering it deterministically turns every agent into a motion
  designer without teaching it a proprietary scene format.
- **Business outcomes.** Adoption of the `hyperframes` CLI and `@hyperframes/*` packages; agent
  workflows routed through the skill catalog; distributed rendering on customers' own AWS/GCP.
- **User experience.** An agent reads `/hyperframes` (the router skill), picks a creation workflow,
  writes HTML, and iterates with `lint → validate → preview → render`. A human uses Studio (a
  browser editor) or the CLI directly. Feedback loops are diagnostic-first: layout audits,
  keyframe inspection, frame snapshots.
- **Long-term vision.** Any input (URL, PR, music track, script, existing footage) → a designed
  video, with the framework owning determinism, media playback, and scale.

## Core Features

Each feature lists its real interface surface. There are no REST "products" here besides the local
Studio API; failure/loading/validation behavior is encoded in lint rules, preflight checks, and
the regression harness.

| Feature              | Purpose                                   | Inputs                                  | Outputs                        | Lives in                                               |
| -------------------- | ----------------------------------------- | --------------------------------------- | ------------------------------ | ------------------------------------------------------ |
| Composition contract | Deterministic, seekable HTML video format | HTML + `data-*` attrs                   | Parsed timeline model          | `packages/core`, skill `hyperframes-core`              |
| Render engine        | Frame-exact page→video capture            | Composition dir                         | MP4/WebM/MOV/GIF/PNG-seq       | `packages/engine`, `packages/producer`                 |
| CLI                  | Full dev loop                             | commands + flags                        | scaffolds, reports, renders    | `packages/cli` (binary `hyperframes`)                  |
| Studio               | Browser NLE-style editor                  | project dir                             | edited composition files       | `packages/studio` + `packages/studio-server`           |
| SDK                  | Headless programmatic editing             | `openComposition()`                     | typed `EditOp`s → JSON patches | `packages/sdk`                                         |
| Player               | Embeddable playback                       | `<hyperframes-player src>`              | scaled iframe playback         | `packages/player`                                      |
| Registry             | Installable scenes/effects                | `hyperframes add <name or tag>`         | files copied into project      | `registry/` (~120 blocks, ~25 components, 13 examples) |
| Cloud rendering      | Distributed chunked renders               | deployed stack + site                   | assembled video in S3/GCS      | `packages/aws-lambda`, `packages/gcp-cloud-run`        |
| Skills               | Agent capability catalog                  | `npx skills add heygen-com/hyperframes` | 20 skills installed            | `skills/`, `skills-manifest.json`                      |
| Media tooling        | TTS, transcription, BG removal, beats     | audio/video files                       | wav/srt/vtt/json/matted video  | `packages/cli` (ONNX, Whisper, Kokoro)                 |

Key per-feature details:

- **Composition contract** (validation & edge cases): root element carries
  `data-composition-id`, `data-width`/`data-height` (px), `data-duration` (seconds; compile-time,
  variables cannot change render length), optional `data-fps` and
  `data-composition-variables`. Timed elements need `class="clip"` and must be direct children of
  the composition root, with `id`, `data-start`, `data-duration`, optional `data-track-index`
  (same-track clips must not overlap), `data-media-start`, `data-volume`, `data-has-audio`.
  Sub-compositions are loaded via `data-composition-src` and must wrap their root in
  `<template>`. Exactly one `gsap.timeline({ paused: true })` per composition must be registered
  synchronously at `window.__timelines["<composition-id>"]`; compositions that fetch data
  asynchronously register the timeline after setup completes (the engine waits). Determinism
  rules: no render-time clocks, no unseeded `Math.random()`, no unpinned network, no
  `repeat: -1`, never animate `display`/`visibility`, framework owns `<video>`/`<audio>` playback.
  Failure surfacing: `hyperframes lint` (static) and `hyperframes validate` (headless Chrome)
  must both pass before a composition is considered done.
- **Render pipeline** (loading/failure): producer performs output-resolution/alpha/HDR preflight
  (telemetry event `render_preflight_rejected`) before spending browser/FFmpeg work; render
  failures persist artifacts under `failures/` and fail the run (the regression harness sets a
  sticky nonzero exit code the moment any suite fails, plus a `beforeExit` guard so an
  incomplete run can never report success).
- **Studio API** (permissions): no auth layer by design — it is a local dev server; the host
  adapter (Vite dev server or CLI embedded server) governs access.

## Tech Stack

| Layer                | Choice                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language             | TypeScript ^5.0/^5.7, `strict: true`, `noUncheckedIndexedAccess: true`, ES2022, ESM only                                                                          |
| Runtime              | Node >= 22 (declared root + 5 packages); Bun is the workspace runner and hook shell                                                                               |
| Frontend             | Studio: React 19 + Vite 6 + zustand + CodeMirror + Phosphor icons; Player: framework-free web component (tsup)                                                    |
| Backend              | Hono ^4 + `@hono/node-server` for every HTTP surface (preview, studio API, producer server, cloud handlers)                                                       |
| Rendering            | Puppeteer ^24 / puppeteer-core ^24.39, pinned `chrome-headless-shell@148.0.7778.167` for reproducible pixels, FFmpeg                                              |
| Animation            | GSAP ^3.13–3.15 (primary frame adapter); Lottie/Anime.js/CSS/WAAPI/Three/TypeGPU via adapters                                                                     |
| Database             | None — see Database section                                                                                                                                       |
| Authentication       | None in the framework; `hyperframes auth` does OAuth/PKCE loopback against HeyGen for `publish`/`cloud` only                                                      |
| Storage              | Local filesystem; S3 (Lambda adapter) and GCS (Cloud Run adapter) for distributed renders; Git LFS for golden baselines and ONNX models                           |
| Hosting              | npm (13 packages), Mintlify docs (hyperframes.heygen.com), ClawHub skill registry, user-owned AWS/GCP for cloud rendering                                         |
| Package manager      | bun (workspaces + `bun run --filter`); publishing uses pnpm/npm inside CI only                                                                                    |
| Testing              | vitest ^3.2.4 (10 packages), `bun test` (2 cloud adapters), custom golden-baseline regression harness (producer). No Playwright — browser automation is Puppeteer |
| CI/CD                | GitHub Actions (11 workflows, all third-party actions SHA-pinned), CodeQL, Docker regression shards                                                               |
| Monitoring/Analytics | PostHog telemetry (opt-out, anonymous, PII-redacted) from CLI and Studio                                                                                          |
| AI models            | ONNX background removal, Whisper transcription, Kokoro-82M local TTS; optional Gemini (`@google/genai`) for website-capture image captioning                      |
| Payments             | None                                                                                                                                                              |

## Dependencies

Root devDependencies (exact ranges): `@commitlint/cli` + `@commitlint/config-conventional` ^20.5.0
(commit convention), `@types/node` ^25.0.10, `fallow` ^2.75.0 (diff-scoped architecture audit in
pre-commit/CI), `happy-dom` ^20.9.0 (DOM test env), `knip` ^6.0.3 (dead-code analysis),
`lefthook` ^2.1.4 (git hooks), `oxfmt` ^0.41.0 + `oxlint` ^1.56.0 (format/lint — not eslint, not
prettier, not biome), `tsx` ^4.21.0 (script runner), `typescript` ^5.0.0,
`@hyperframes/player` workspace:\*. React 19 is forced repo-wide via `resolutions`/`overrides`.

Notable per-package runtime dependencies and why they exist:

- `gsap` — the primary animation runtime (studio ^3.13.0, sdk-playground ^3.15.0, player dev ^3.12.5).
- `puppeteer`/`puppeteer-core`/`@puppeteer/browsers` — headless-Chrome capture everywhere.
- `hono` + `@hono/node-server` — the single HTTP framework across engine, producer, cli, studio-server, gcp-cloud-run.
- `linkedom` — server-side DOM for parsing/mutating compositions without a browser (core, engine, producer, sdk, lint, parsers, studio-server).
- `@babel/parser`, `acorn`, `recast`, `magic-string` — GSAP/JS AST parsing and codemod in `parsers`.
- `sharp`, `fontkit`, `onnxruntime-node`, `adm-zip`, `citty`, `esbuild`, `postcss`, `open`, `debug`, `compare-versions` — CLI image work, font embedding, ML inference, archives, command framework, bundling, CSS, browser launch, runtime logging (bundled puppeteer deps require `debug`), version checks.
- `@google/genai` ^1.50.1 — optional CLI dependency for Gemini image captioning during `capture`.
- `@aws-sdk/client-s3` + `@aws-sdk/client-sfn`, `@sparticuz/chromium` 148.0.0, `ffmpeg-static`/`ffprobe-static`, `tar` — Lambda adapter; `aws-cdk-lib`/`constructs` are peerDeps.
- `@google-cloud/storage` + `@google-cloud/workflows` — Cloud Run adapter.
- `@fontsource/*`, `wawoff2` — producer embedded font data (resolved via `createRequire` at build time; knip must ignore them).
- `bpm-detective` — beat detection (core, studio). `mediabunny`, `dompurify`, `marked`, `@codemirror/*` — studio media probing, sanitization, markdown, code editing. `html2canvas` — shader-transitions capture.

Rule: never add a package without a consumer; `knip` + `fallow` police this, and
`.fallowrc.jsonc` documents intentional dynamic/runtime dependencies that static analysis misses.

## Repository Structure

```
packages/
  aws-lambda/           → AWS Lambda adapter for distributed cloud rendering
  cli/                  → hyperframes CLI (create, preview, lint, render)
  core/                 → Types, parsers, generators, linter, runtime, frame adapters
  engine/               → Seekable page-to-video capture engine (Puppeteer + FFmpeg)
  gcp-cloud-run/        → Google Cloud Run + Workflows adapter for distributed rendering
  lint/                 → Composition linter powering `hyperframes lint`
  parsers/              → Composition, asset, and GSAP parsers shared across packages
  player/               → Embeddable <hyperframes-player> web component
  producer/             → Full rendering pipeline (capture + encode + audio mix)
  sdk/                  → Headless, framework-neutral composition editing engine
  sdk-playground/       → Browser playground for the SDK (private, unpublished)
  shader-transitions/   → WebGL shader transitions for compositions
  studio/               → Browser-based composition editor UI
  studio-server/        → HTTP API server backing the Studio editor
registry/               → Installable blocks (~120), components (~25), examples (13); registry.json index
skills/                 → 20 AI agent skills; skills-manifest.json pins content hashes
docs/                   → Mintlify documentation site (hyperframes.heygen.com)
scripts/                → Release, changelog, schema-sync, catalog-preview, verification scripts (tsx/node, self-tested)
examples/               → Deployment examples (e.g. aws-lambda SAM template — twin of the CDK construct)
releases/               → Reviewed GitHub Release bodies, one file per version
updates/                → Weekly digest source + social drafts
assets/                 → Repo assets (logos etc.)
```

Ownership and rules: build order is `parsers/lint/studio-server → core → everything → cli`
(encoded in the root `build` script; no turbo/nx). `packages/studio` has a hard 600-line-per-file
cap enforced by lefthook and CI. Registry items each live in their own directory with a
`registry-item.json` manifest; components require a standalone `demo.html` registering a timeline
on `window.__timelines`. Skill edits must keep CLAUDE.md, README.md, `docs/guides/skills.mdx`,
and `skills/hyperframes/SKILL.md` in lockstep (see CLAUDE.md "Skill catalog maintenance").

## Coding Standards

- Strict TypeScript everywhere: `strict`, `noUncheckedIndexedAccess`; avoid `any` (use
  `unknown` + narrowing), avoid `as T` (prefer type guards), avoid `!`; `as const` and
  `as unknown as T` need a justifying comment (CONTRIBUTING.md).
- ESM only (`"type": "module"`), ES2022 target, bundler module resolution.
- oxlint + oxfmt are the only lint/format tools; both run in pre-commit and CI.
- Conventional Commits enforced by commitlint (hook) and semantic-pr-title (CI):
  `feat fix docs style refactor perf test build ci chore revert`.
- Determinism is a coding standard, not just a runtime rule: no `Date.now()`, no unseeded
  `Math.random()`, no render-time network in compositions or generators.
- Duplication/complexity policed by `fallow audit --base origin/main` on every commit.

## Design System

Source of truth: `DESIGN.md` (brand) + `docs/custom.css` (Mintlify overrides, theme "maple").

- Aesthetic: flat, minimal, warm-neutral (beige/cream, not pure gray). Borders over shadows.
- Light: `--bg #f6f5f1`, `--surface #ffffff`, `--surface2 #eeedea`, `--border #e0dfdb`,
  `--text #1a1a1a`, `--heading #0a0a0a`. Dark: `--bg #0a0a0a`, `--surface #141414`,
  `--text #e5e5e5`, `--heading #f5f5f5`. Green/blue/purple accents; full syntax-token palettes
  for both modes.
- Typography: display ABC Solar Display/Inter, body Inter, mono IBM Plex Mono.
  H1 `clamp(2.6rem, 6vw, 4.5rem)` weight 400 tracking −0.02em.
- Spacing scale: 4 / 8 / 16 / 24 / 32 / 64 / 128 px. Radius: 4 / 6 / 8 / 10–12 px.
- Motion: 0.15–0.2s micro-interactions, 0.5s reveals, `ease`/`ease-out`; hover = opacity 0.85 or
  border-color shift; scroll reveals translateY(20px) + fade. Nav uses `backdrop-filter: blur(12px)`.
- Dark mode is first-class across docs and Studio.

## Database

**None — deliberately.** There is no relational database, no ORM, no migrations, no RLS. The
persistent state model is:

- Composition projects: plain files on disk (HTML, assets, `STORYBOARD.md`, `SCRIPT.md`,
  `hyperframes.json` for path mapping).
- Golden regression baselines: `output.mp4` files under `packages/producer/tests/**`, stored in
  Git LFS (as are `*.onnx` models) via `.gitattributes`.
- CLI user state: `~/.hyperframes/config.json` (telemetry consent, anonymous UUID) and
  `XDG_STATE_HOME`-based state.
- Cloud render state: S3/GCS objects (plan tarballs, chunk outputs, final renders) with a 7-day
  lifecycle sweep on GCS scratch artifacts; orchestration state lives in Step Functions / Cloud
  Workflows executions.

Any future feature requiring a database must justify it against this file-first architecture.

## API Specification

The only HTTP API is the **Studio API** (Hono sub-app from `createStudioApi(adapter)`, mounted
under `/api` by both the Vite dev server and the CLI embedded server). It is a localhost dev
server: no authentication, no rate limits, no caching semantics beyond the host adapter.

- Projects: `GET /projects`, `GET /projects/:id`, `GET /resolve-session/:sessionId`,
  `GET /projects/:id/storyboard`, `GET|PUT /projects/:id/selection`, `GET /projects/:id/lint`.
- Files: `GET|PUT|POST|DELETE|PATCH /projects/:id/files/*`, `POST /projects/:id/duplicate-file`.
- Structured mutations: `POST /projects/:id/file-mutations/{remove-element,split-element,patch-element,wrap-elements,unwrap-elements,probe-element}/*`.
- GSAP: `GET /projects/:id/gsap-animations/*`, `POST /projects/:id/gsap-mutations/*`.
- Preview: `GET /projects/:id/preview`, `/preview/comp/*`, `/preview/*`,
  `GET /projects/:id/thumbnail/*`, `GET /projects/:id/waveform/*`.
- Rendering: `POST /projects/:id/render`; `GET /render/:jobId/progress|view|download`;
  `DELETE /render/:jobId`; `GET /projects/:id/renders`, `/renders/file/*`.
- Assets: `GET /fonts`, `/fonts/google`, `/fonts/file`; registry: `GET /registry/blocks`,
  `POST /projects/:id/registry/install`.

Distributed-render adapters expose an internal action dispatch (`plan` / `renderChunk` /
`assemble`) — Lambda invocations behind Step Functions, or OIDC-authenticated `http.post` calls
from Cloud Workflows to the Cloud Run service. These are machine-to-machine, IAM-scoped, and not
public APIs.

## AI Systems

- **Skill catalog (primary AI system).** 20 skills under `skills/`: 1 router (`/hyperframes` —
  capability map + intent router), 11 creation workflows (`product-launch-video`,
  `website-to-video`, `faceless-explainer`, `pr-to-video`, `embedded-captions`,
  `talking-head-recut`, `motion-graphics`, `music-to-video`, `slideshow`, `general-video`,
  `remotion-to-hyperframes`), 8 domain skills (`hyperframes-core/animation/keyframes/creative/
media/cli/registry`, `media-use`). Hallucination prevention is structural: skills force the
  agent through `lint → validate → inspect/snapshot` verification loops, and the composition
  contract makes invalid output fail fast. `skills-manifest.json` pins a content hash per skill;
  `hyperframes skills check|update` compares and refreshes; pushes to `skills/**` on main
  auto-publish to ClawHub. Skill-usage beacons (`skill_invoked`/`skill_completed`) flow through
  the CLI `events` command.
- **Local ML models (CLI).** Background removal (ONNX Runtime, model in LFS), Whisper
  transcription (`tiny.en`…`large-v3`, srt/vtt/json output), Kokoro-82M local TTS, beat
  detection (`bpm-detective` + ONNX beat analyzer). All run locally — no inference API keys.
- **Optional LLM usage.** Gemini (`GEMINI_API_KEY`/`GOOGLE_API_KEY`) captions captured website
  images during `hyperframes capture` (~$0.001/image); `OPENROUTER_API_KEY` +
  `HYPERFRAMES_OPENROUTER_MODEL` override content extraction. Absence degrades gracefully —
  capture works without captions.

## State Management

- Studio UI: zustand stores + React 19; server state flows through the Studio API with
  structured mutation endpoints (not blind file writes) so edits stay semantically valid.
- SDK: `SdkDocument` session model — typed `EditOp` dispatch produces JSON-patch `PatchEvent`s;
  `createHistory()` gives undo/redo; `createPersistQueue()` batches writes; persist/preview
  adapters are pluggable (memory, headless, iframe, Node fs).
- Render jobs: job-id-addressed progress polling (`/render/:jobId/progress`), artifacts on disk
  with TTL (`PRODUCER_OUTPUT_ARTIFACT_TTL_MS`).

## Error Handling

- Expected authoring errors surface through lint rules (e.g.
  `root_composition_missing_duration_source`) and `validate`'s console-error capture — before any
  render is attempted.
- Producer preflight rejects impossible outputs (resolution/alpha/HDR) pre-browser and emits
  `render_preflight_rejected` telemetry.
- The regression harness persists failure artifacts, sets a sticky nonzero exit code at the
  moment a suite fails, and a `beforeExit` guard fails any run whose event loop drains before the
  summary — an incomplete run can never report success.
- CLI errors emit `cli_error` telemetry with redacted messages/stacks; `hyperframes feedback`
  can attach a published repro to a pre-filled GitHub issue.

## Security

- No auth/RLS/CSRF surface in the framework itself (local-first, no database, no sessions). The
  Studio API binds to localhost dev servers only.
- Secrets: none committed — verified. `.env*` gitignored except `.env.example` (a commented
  optional `GEMINI_API_KEY`). All keys read from `process.env`. CI publishing uses the
  `npm-publish` environment with OIDC (`id-token: write`); ClawHub sync uses `CLAWHUB_TOKEN`.
- Supply chain: no postinstall scripts in any workspace package; no git/file/http dependency
  specifiers; all GitHub Actions SHA-pinned; CodeQL runs on push/PR/weekly (js/ts, actions,
  python); no `pull_request_target`; no `${{ github.event.* }}` interpolation into `run:` blocks.
- Command execution: every child process uses no-shell argv-array forms (`execFileSync`,
  `spawn`); no `eval`; the one non-test `new Function` constructs-but-never-invokes purely for
  syntax checking.
- Cloud adapters follow least privilege: GCS `run_sa` has bucket objectAdmin only; `workflow_sa`
  can only invoke the render service; Lambda stack exposes CloudWatch alarms for runaway chunk
  invocations.
- Input validation: composition HTML is parsed via linkedom and linted; Studio sanitizes
  rendered markdown with dompurify.
- Vulnerability reporting: SECURITY.md → GitHub Security Advisories, 48h ack / 7-day fix SLA.

## Performance

- Frame capture uses Chrome's BeginFrame API (producer) and static-frame deduplication
  (predicted from `window.__timelines` + empirical anchor verification) to skip re-encoding
  unchanged frames.
- Pinned `chrome-headless-shell@148.0.7778.167` + pinned font set (Noto/Liberation/DejaVu) keep
  golden baselines pixel-reproducible across machines.
- Tuning knobs: `PRODUCER_MAX_CONCURRENT_RENDERS`, `PRODUCER_LOW_MEMORY_MODE`,
  `PRODUCER_BROWSER_GPU_MODE`, seek-mode/step/offset vars, shader worker pool vars,
  `HDR_TRANSFER_CACHE_MAX_BYTES`, font cache dir.
- Scale-out: chunked distributed rendering (plan → parallel chunks → assemble) on Lambda
  (Step Functions fan-out, 2048–10240MB memory, ≤900s timeout) or Cloud Run (Workflows fan-out,
  max-instances as the ceiling); `computeRenderCost` estimates spend.
- CI perf gates: player perf harness (5 shards: load/fps/scrub/drift/parity, SSIM-scored),
  `cli-smoke-required` enforces a `page.goto` < 5s budget, `benchmark` command compares render
  configs.

## Testing

- Unit/integration: vitest in 10 packages, `bun test` in the 2 cloud adapters; scripts and
  skills have their own `node --test` suites (`test:scripts`, `test:skills`).
- Golden regression: producer harness renders ~63 fixture compositions and compares against LFS
  `output.mp4` baselines via PSNR + audio-RMS envelope; runs in Docker (`Dockerfile.test`) as 8
  bin-packed CI shards; `--update` regenerates baselines; CI validates baselines aren't LFS
  pointers.
- Parity: WYSIWYG preview-vs-render SSIM checks (`preview-regression.yml`); runtime contract
  tests in core; Windows render verification on `windows-latest` (including issue #574
  regression); cross-OS npx-shim matrix (ubuntu/macos/windows); global-install and end-to-end
  `init→lint→validate→render` smoke jobs.
- Coverage: only `packages/core` configures vitest coverage; there is no repo-wide coverage
  gate — the golden/parity/smoke lattice is the effective quality bar.

## Deployment

- **npm** (public): tag `v*` push (or merged `release/v*` PR, or manual dispatch) →
  `publish.yml` → 12 `@hyperframes/*` packages + unscoped `hyperframes` CLI. Prerelease suffix
  routes dist-tag (`alpha`/`beta`/`rc`), stable → `latest`. Publishing is idempotent (skips
  already-published versions) and creates a GitHub Release from `releases/v<version>.md`.
- **Release procedure**: `bun run release:prepare <version>` (first run drafts
  `releases/v<version>.md` and exits nonzero for review) → edit summary → rerun (bumps all
  versions via `set-version.ts`, creates `chore: release v<version>` commit + tag; refuses
  non-monotonic tags) → `git push origin main && git push origin v<version>`.
- **Docs**: Mintlify (hyperframes.heygen.com); `docs.yml` validates schema mirrors, `mint
validate`, and broken links on PRs.
- **Skills**: pushes to `skills/**` on main auto-sync to ClawHub (`clawhub sync --all --owner
heygen-com --bump patch`).
- **Cloud stacks**: users deploy via `hyperframes lambda deploy` (CDK construct
  `HyperframesRenderStack`, kept drift-free against the SAM template by a snapshot test) or
  `hyperframes cloudrun deploy` (Terraform module; one Docker image serving plan/render/assemble).
- Rollback: npm dist-tags + idempotent publish allow re-pointing `latest`; git tags are
  monotonic; cloud stacks roll back via CDK/Terraform.

## Observability

- PostHog telemetry (US instance, write-only public key), anonymous UUID, `$ip: null`,
  PII-redaction on all message/stack fields. CLI events: `cli_command(_result)`, `cli_error`,
  `render_complete` (deep perf payload: stage timings, memory, static-dedup, browser
  diagnostics), `render_error`, `render_observation`, `render_preflight_rejected`,
  `init_template`, `browser_install`, survey/feedback events. Studio mirrors with
  `studio_session_start`, `studio_render_start`, editor-interaction events (sendBeacon flush on
  pagehide).
- Opt-out: `hyperframes telemetry disable`, `HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1`,
  Studio localStorage flag or `VITE_HYPERFRAMES_NO_TELEMETRY=1`; auto-off in dev mode; first-run
  consent notice before any tracking. HeyGen's own CI sets `HYPERFRAMES_NO_TELEMETRY: "1"` in
  every non-publish workflow.
- Health: producer exposes a health port (`PRODUCER_HEALTH_PORT`) with a health worker thread;
  Lambda stack ships CloudWatch alarms; `hyperframes doctor` is the client-side health check.
- Logging is console-based/custom (the `debug` package is a transitive puppeteer need, not a
  repo convention).

## Workflow

- Branch strategy: fork → feature branch → PR to `main`. CI must pass; ≥1 approval required;
  PR titles must be conventional (enforced job). BDFL governance — HeyGen core maintainers have
  final say; Contributor Covenant applies.
- Pre-commit (lefthook, parallel): oxlint, oxfmt (auto-format + re-stage), skills-manifest
  regen, `tsc --noEmit` (core, studio), `fallow audit --base origin/main --fail-on-issues`,
  large-file guard, studio 600-line cap. Commit-msg: commitlint.
- AI-assisted contributions are welcome without disclosure, but the contributor owns
  correctness — AI code you can't explain is rejected.
- Review checklist = the Quality Gates below plus: registry items follow the
  `registry-item.json` + `demo.html` contract; skill/catalog edits update all lockstep surfaces;
  no new dependency without a consumer.

## Documentation

- `README.md` (overview, quickstart, package table), `CLAUDE.md`/`AGENTS.md` (agent-facing
  build/convention contract — kept in sync), `DESIGN.md` (brand system), `DOCS_GUIDELINES.md`,
  `CONTRIBUTING.md`, `SECURITY.md`, `ADOPTERS.md`, `CREDITS.md`, `releases/` (per-version
  notes), `docs/` (Mintlify site: guides, catalog with auto-generated block MDX pages, API
  reference), inline docs via `hyperframes docs`, and this `SPEC.md`.

## Quality Gates

Before any task is complete:

- ✓ `bun run build` succeeds (dependency-ordered workspace build)
- ✓ `bunx oxlint` and `bunx oxfmt --check` clean on changed files
- ✓ `tsc --noEmit` passes (core + studio at minimum — pre-commit enforces)
- ✓ Tests pass via each package's own `test` script (vitest/bun test/harness — not bare `bun test` in vitest packages)
- ✓ Compositions: `npx hyperframes lint` and `npx hyperframes validate` both pass
- ✓ `fallow audit` reports no new issues vs `origin/main`
- ✓ No unused dependencies introduced (knip-aware; document intentional dynamics in `.fallowrc.jsonc`)
- ✓ Studio files ≤ 600 lines; no large non-LFS binaries
- ✓ Conventional commit messages; skill/catalog surfaces updated in lockstep when touched

## Output Requirements (for implementers)

When implementing features: list affected files and why; state dependency, architecture,
baseline (golden-file), and testing impact; if a change affects rendered pixels, regenerate
goldens with the harness `--update` inside the pinned Docker image, never by hand. Do not stop
at code: build, test, and docs must all be green, and the repo must remain releasable at any
commit on `main`. If interrupted, resume from the failing gate, not from scratch.
