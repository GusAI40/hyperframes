import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreDependencies: [
    // Mirrors .fallowrc.jsonc's documented intentional list.
    // Required by bundled puppeteer deps (@puppeteer/browsers,
    // puppeteer-core) via require() at runtime; listed as direct deps to
    // guarantee installation when transitive resolution fails.
    "debug",
    "puppeteer",
    "puppeteer-core",
    // Binary paths resolved at runtime (require.resolve / tsup external),
    // invisible to the import graph.
    "ffmpeg-static",
    "ffprobe-static",
    // Font files resolved via createRequire at build time by
    // packages/producer/scripts/generate-font-data.ts (run from the
    // gcp-cloud-run Dockerfile) and scripts/build-fonts.mjs.
    "@fontsource/*",
    // Imported by @hyperframes/core/beats; studio declares it directly so
    // vite optimizeDeps.include / tsup external can resolve it.
    "bpm-detective",
  ],
  // Mintlify CLI, provisioned in CI (.github/workflows/docs.yml).
  ignoreBinaries: ["mint"],
  workspaces: {
    ".": {
      // Root-level code is the scripts/ toolbox. The other root trees are
      // not import-graph code and are excluded by this project scope:
      // skills/** ships agent-run .mjs/.cjs scripts and test corpora invoked
      // by path per SKILL.md prose; registry/** vendors libs (gsap.min.js,
      // liquid-glass.iife.js) referenced from composition HTML; docs/** is
      // the Mintlify site.
      project: ["scripts/**"],
      // Run via root package.json scripts and CI workflows
      // (.github/workflows/{catalog-previews,docs}.yml), or manually.
      entry: ["scripts/*.{ts,mjs}", "scripts/*/run.mjs"],
    },
    "packages/aws-lambda": {
      // The four esbuild entryPoints in build.mjs, one per package.json
      // export (".", "./handler", "./sdk", "./cdk"); the exports map points
      // at dist/ so knip cannot map them back to src/.
      entry: ["src/index.ts", "src/handler.ts", "src/{sdk,cdk}/index.ts"],
    },
    "packages/cli": {
      // In-page audit scripts read as raw strings and injected via
      // page.addScriptTag (layout.ts / validate.ts) — referenced by file
      // path, never imported.
      entry: ["src/commands/*.browser.js"],
    },
    "packages/core": {
      // Built as a standalone IIFE for the browser-side sandbox runtime;
      // referenced by file path (not import) in
      // scripts/build-hyperframes-runtime-artifact.ts.
      entry: ["src/runtime/entry.ts"],
    },
    "packages/gcp-cloud-run": {
      // Run by the package Dockerfile (`bunx tsx scripts/generate-font-data.ts`),
      // not imported.
      ignoreDependencies: ["tsx"],
    },
    "packages/parsers": {
      // Golden snapshot data consumed via toMatchFileSnapshot, not modules.
      ignore: ["src/__goldens__/**"],
    },
    "packages/producer": {
      entry: [
        // esbuild entry in build.mjs (dist/public-server.js, the "./server"
        // export); the output name differs so knip cannot map it back.
        "src/server.ts",
        // Run by the gcp-cloud-run Dockerfile
        // (`bunx tsx scripts/generate-font-data.ts`); resolves the
        // @fontsource/* deps via createRequire at build time.
        "scripts/generate-font-data.ts",
        // Off-main-thread /health endpoint, spawned via `new Worker(path)`
        // from healthWorker.ts.
        "src/services/healthWorkerThread.ts",
        // Test fixture worker, spawned by path (workerEntryPath option) from
        // the crash-recovery tests.
        "src/services/__fixtures__/crashOnMessageWorker.mjs",
        // esbuild entry of scripts/build-hf-early-stub.ts (compiled into
        // src/generated/hf-early-stub-inline.ts), referenced by path only.
        "stubs/hf-early-stub.ts",
      ],
      // Composition fixture projects (HTML plus css/js/vendor assets
      // referenced from the HTML, not imported) used by render tests.
      ignore: ["tests/**"],
    },
    "packages/sdk": {
      // Standalone usage examples; typechecked via tsconfig.check.json
      // (`bun run typecheck:examples`) but never imported.
      entry: ["examples/*.ts"],
    },
  },
};

export default config;
