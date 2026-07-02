import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const projectDir = path.join(root, "ai-real-estate-tag-hero");
const duration = 15;
const voiceId = "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4";

const narration = [
  "AI for Real Estate by TAG.",
  "Where AI agents meet real estate agents.",
  "Listings become campaigns. Websites become lead hubs.",
  "Open houses become future seller opportunities.",
];

const scenes = [
  {
    eyebrow: "AI for Real Estate by TAG",
    headline: "Where AI agents meet real estate agents.",
    body: "Premium systems for the modern agent.",
    visual: "estate",
    caption: "AI for Real Estate by TAG. Where AI agents meet real estate agents.",
  },
  {
    eyebrow: "Listing Engine",
    headline: "Listings become campaigns.",
    body: "Launch-ready videos, mailers, pages, posts, and follow-up.",
    visual: "campaigns",
    caption: "Listings become campaigns. Websites become lead hubs.",
  },
  {
    eyebrow: "Lead Hub",
    headline: "Websites become intelligent lead hubs.",
    body: "Maya concierge, forms, reporting, and instant client workflows.",
    visual: "hub",
    caption: "Maya turns every touchpoint into a smarter next step.",
  },
  {
    eyebrow: "Maya Workflow Suite",
    headline: "Open houses become future seller opportunities.",
    body: "Showing Planner. CMA Generator. Follow-up systems. Built to be reviewed, refined, and sent.",
    visual: "proof",
    caption: "Send Maya an address. Get a premium real estate deliverable back.",
  },
];

const formats = [
  { slug: "landscape-16x9", width: 1920, height: 1080, type: "landscape" },
  { slug: "portrait-9x16", width: 1080, height: 1920, type: "portrait" },
  { slug: "square-1x1", width: 1080, height: 1080, type: "square" },
];

function readEnv() {
  const envPath = path.join(root, ".env");
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function durationOf(file) {
  const out = execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nw=1:nk=1",
    file,
  ]);
  return Number.parseFloat(String(out).trim());
}

async function createVoiceover(apiKey) {
  const out = path.join(projectDir, "assets", "narration.mp3");
  if (fs.existsSync(out)) return out;
  if (!apiKey) throw new Error("CARTESIA_API_KEY missing from .env");

  const transcript = narration.join(" ");
  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-3.5",
      transcript,
      voice: { mode: "id", id: voiceId },
      output_format: { container: "mp3", sample_rate: 44100, bit_rate: 128000 },
      language: "en",
      speed: 1.42,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cartesia failed: ${response.status} ${await response.text()}`);
  }

  fs.writeFileSync(out, Buffer.from(await response.arrayBuffer()));
  return out;
}

function writeDesignFiles() {
  fs.mkdirSync(path.join(projectDir, "assets"), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "DESIGN.md"),
    `# AI for Real Estate by TAG Hero Design

## Visual System

Premium real estate AI operating system. This should feel like a luxury home at twilight merging with an intelligent SaaS command center: atmospheric, editorial, calm, precise, and expensive.

## Palette

- Midnight Black: \`#030611\`
- Deep Navy: \`#061322\`
- Glass Panel: \`rgba(8, 18, 31, 0.72)\`
- Warm Interior Light: \`#F2C879\`
- Luxury Gold: \`#D6B56D\`
- Electric AI Blue: \`#32D8FF\`
- Platinum Text: \`#F6F0E3\`
- Mist Text: \`#BAC6D8\`

## Typography

- Display: Georgia, Times New Roman fallback.
- Interface: Arial, system sans fallback.
- Data: JetBrains Mono, Consolas fallback.

## Motion

Use cinematic focus pulls, slow parallax, glass panels assembling, light leaks, subtle data-line motion, and one final brand reveal. The loop must work muted. Audio is support, not dependency.

## Constraints

- No brokerage logos.
- No Coldwell Banker marks.
- No Michelle contact details.
- No fake performance claims.
- No cartoon AI.
- No loud glitch effects.
- No generic stock-looking tech blobs.
- Keep desktop and mobile text readable.
`,
  );

  fs.writeFileSync(
    path.join(projectDir, "SCRIPT.md"),
    `# AI for Real Estate by TAG Hero Script

${narration.map((line, index) => `${index + 1}. ${line}`).join("\n")}
`,
  );

  fs.writeFileSync(
    path.join(projectDir, "STORYBOARD.md"),
    `# Storyboard

${scenes
  .map(
    (scene, index) => `## Scene ${index + 1}: ${scene.headline}

- Eyebrow: ${scene.eyebrow}
- Body: ${scene.body}
- Visual: ${scene.visual}
- Caption: ${scene.caption}
`,
  )
  .join("\n")}
`,
  );
}

function visualMarkup(scene) {
  if (scene.visual === "estate") {
    return `
      <div class="estate-frame">
        <div class="estate-skyline" data-layout-ignore></div>
        <div class="estate-house">
          <span class="roof roof-a"></span>
          <span class="roof roof-b"></span>
          <span class="wall wall-a"></span>
          <span class="wall wall-b"></span>
          <span class="window w1"></span>
          <span class="window w2"></span>
          <span class="window w3"></span>
          <span class="window w4"></span>
          <span class="terrace"></span>
        </div>
        <div class="ai-thread thread-a" data-layout-ignore></div>
        <div class="ai-thread thread-b" data-layout-ignore></div>
      </div>`;
  }

  if (scene.visual === "campaigns") {
    return `
      <div class="artifact-stage">
        <div class="artifact listing-card"><em>LISTING</em><strong>Active Campaign</strong><span>photos - copy - video</span></div>
        <div class="artifact video-card"><em>VIDEO</em><strong>Story Cut</strong><span>hero + reels + posts</span></div>
        <div class="artifact mailer-card"><em>MAILER</em><strong>Seller Reach</strong><span>print + QR + follow-up</span></div>
        <div class="artifact web-card"><em>WEB</em><strong>Lead Hub</strong><span>landing page live</span></div>
      </div>`;
  }

  if (scene.visual === "hub") {
    return `
      <div class="dashboard-shell">
        <div class="dash-top"><span>MAYA CONCIERGE</span><em>LIVE</em></div>
        <div class="dash-grid">
          <div><strong>Lead Capture</strong><span>Open house inquiry</span></div>
          <div><strong>Follow-Up</strong><span>Seller sequence ready</span></div>
          <div><strong>Report</strong><span>Campaign signal found</span></div>
          <div><strong>Next Step</strong><span>Agent review queue</span></div>
        </div>
        <div class="pulse-node node-a"></div>
        <div class="pulse-node node-b"></div>
      </div>`;
  }

  return `
      <div class="proof-stack">
        <div class="proof-card proof-main">
          <span>AI AGENTS</span>
          <strong>Meet</strong>
          <span>REAL ESTATE AGENTS</span>
        </div>
        <div class="proof-card proof-left"><em>Maya Showing Planner</em><span>buyer tour package</span></div>
        <div class="proof-card proof-right"><em>Maya CMA Generator</em><span>seller market report</span></div>
        <div class="tag-seal">TAG</div>
      </div>`;
}

function sceneMarkup(format) {
  const sceneDuration = duration / scenes.length;
  return scenes
    .map((scene, index) => {
      const start = (index * sceneDuration).toFixed(2);
      return `
      <section id="scene-${index + 1}" class="clip scene scene-${scene.visual}" data-start="${start}" data-duration="${sceneDuration.toFixed(2)}" data-track-index="${index + 1}" data-layout-allow-overlap>
        <div class="scene-light" data-layout-ignore></div>
        <div class="scene-content ${format.type}">
          <div class="copy-block">
            <p class="eyebrow">${esc(scene.eyebrow)}</p>
            <h1>${esc(scene.headline)}</h1>
            <p class="body-copy">${esc(scene.body)}</p>
          </div>
          <div class="visual-block">${visualMarkup(scene)}</div>
        </div>
        <div class="designed-caption">${esc(scene.caption)}</div>
      </section>`;
    })
    .join("\n");
}

function cssFor(format) {
  const portrait = format.type === "portrait";
  const square = format.type === "square";
  const titleSize = portrait ? 84 : square ? 65 : 92;
  const bodySize = portrait ? 28 : square ? 23 : 28;
  const contentDirection = portrait ? "column" : "row";
  const contentPadding = portrait ? "128px 66px 168px" : square ? "78px 58px 122px" : "88px 108px 120px";
  const visualMinHeight = portrait ? "840px" : square ? "440px" : "620px";
  const contentGap = portrait ? "52px" : square ? "34px" : "96px";

  return `
      * { box-sizing: border-box; }
      body { margin: 0; background: #030611; }
      #main-composition {
        position: relative;
        width: ${format.width}px;
        height: ${format.height}px;
        overflow: hidden;
        color: #F6F0E3;
        font-family: Arial, sans-serif;
        background:
          radial-gradient(circle at 74% 28%, rgba(50,216,255,0.22), rgba(3,6,17,0) 31%),
          radial-gradient(circle at 18% 74%, rgba(214,181,109,0.24), rgba(3,6,17,0) 38%),
          #030611;
      }
      #main-composition::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(90deg, rgba(246,240,227,0.035) 1px, rgba(3,6,17,0) 1px),
          linear-gradient(180deg, rgba(246,240,227,0.028) 1px, rgba(3,6,17,0) 1px);
        background-size: 82px 82px;
        opacity: 0.38;
      }
      #main-composition::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(3,6,17,0.78), rgba(3,6,17,0.12) 43%, rgba(3,6,17,0.70)),
          radial-gradient(circle at 50% 120%, rgba(242,200,121,0.15), rgba(3,6,17,0) 48%);
        pointer-events: none;
      }
      .brand-rail {
        position: absolute;
        z-index: 20;
        left: ${portrait ? 46 : 64}px;
        right: ${portrait ? 46 : 64}px;
        top: ${portrait ? 46 : 42}px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: ${portrait ? 18 : 16}px;
        letter-spacing: 0.11em;
        color: #BAC6D8;
        text-transform: uppercase;
      }
      .brand-rail strong {
        color: #F6F0E3;
        font-weight: 800;
      }
      .brand-rail span:last-child {
        color: #D6B56D;
        border: 1px solid rgba(214,181,109,0.45);
        padding: 10px 14px;
        background: rgba(8,18,31,0.58);
      }
      .scene {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background-color: #030611;
      }
      .scene-light {
        position: absolute;
        inset: -15%;
        opacity: 0.85;
        background:
          radial-gradient(circle at 70% 38%, rgba(50,216,255,0.20), rgba(3,6,17,0) 34%),
          radial-gradient(circle at 34% 64%, rgba(242,200,121,0.17), rgba(3,6,17,0) 36%);
        filter: blur(1px);
      }
      .scene-content {
        position: relative;
        z-index: 4;
        width: 100%;
        height: 100%;
        padding: ${contentPadding};
        display: flex;
        flex-direction: ${contentDirection};
        align-items: center;
        justify-content: center;
        gap: ${contentGap};
      }
      .copy-block {
        width: 100%;
        flex: ${portrait ? "0 0 auto" : "1 1 0"};
        max-width: ${portrait ? "900px" : square ? "500px" : "760px"};
      }
      .eyebrow {
        margin: 0 0 20px;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: ${portrait ? 19 : 17}px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #D6B56D;
        font-weight: 800;
      }
      h1 {
        margin: 0;
        max-width: ${portrait ? "940px" : "780px"};
        font-family: Georgia, "Times New Roman", serif;
        font-size: ${titleSize}px;
        line-height: 0.92;
        font-weight: 520;
        letter-spacing: 0.01em;
        color: #F6F0E3;
        text-wrap: balance;
      }
      .body-copy {
        margin: 26px 0 0;
        max-width: ${portrait ? "830px" : "650px"};
        color: #D7DFEC;
        font-size: ${bodySize}px;
        line-height: 1.28;
        font-weight: 450;
      }
      .visual-block {
        position: relative;
        width: 100%;
        flex: ${portrait ? "1 1 auto" : "1 1 0"};
        min-height: ${visualMinHeight};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .designed-caption {
        position: absolute;
        z-index: 12;
        left: ${portrait ? 54 : 72}px;
        right: ${portrait ? 54 : 72}px;
        bottom: ${portrait ? 52 : 40}px;
        padding: ${portrait ? "18px 22px" : "14px 22px"};
        border-top: 1px solid rgba(214,181,109,0.34);
        color: #F6F0E3;
        background: linear-gradient(90deg, rgba(8,18,31,0.18), rgba(8,18,31,0.72), rgba(8,18,31,0.18));
        font-size: ${portrait ? 23 : square ? 18 : 20}px;
        line-height: 1.22;
        text-align: center;
      }
      .luxe-transition {
        position: absolute;
        z-index: 50;
        inset: -120px;
        opacity: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 48% 50%, rgba(246,240,227,0.34), rgba(50,216,255,0.22) 22%, rgba(3,6,17,0) 58%),
          linear-gradient(108deg, rgba(3,6,17,0), rgba(242,200,121,0.34), rgba(3,6,17,0));
        filter: blur(24px);
      }
      .estate-frame {
        position: relative;
        width: ${portrait ? 840 : square ? 560 : 760}px;
        height: ${portrait ? 720 : square ? 460 : 560}px;
        perspective: 1000px;
      }
      .estate-skyline {
        position: absolute;
        inset: 0;
        border: 1px solid rgba(246,240,227,0.10);
        background:
          linear-gradient(180deg, rgba(50,216,255,0.06), rgba(3,6,17,0.12)),
          radial-gradient(circle at 62% 64%, rgba(242,200,121,0.24), rgba(3,6,17,0) 42%);
        box-shadow: inset 0 0 120px rgba(50,216,255,0.07), 0 40px 130px rgba(0,0,0,0.45);
      }
      .estate-house {
        position: absolute;
        left: 8%;
        right: 8%;
        bottom: 14%;
        height: 58%;
        transform: rotateX(2deg) rotateY(-8deg);
      }
      .roof,
      .wall,
      .window,
      .terrace {
        position: absolute;
        display: block;
      }
      .roof {
        height: 2px;
        background: rgba(246,240,227,0.62);
        box-shadow: 0 0 18px rgba(246,240,227,0.30);
        transform-origin: left center;
      }
      .roof-a { left: 3%; top: 12%; width: 72%; transform: rotate(-10deg); }
      .roof-b { right: 4%; top: 18%; width: 42%; transform: rotate(12deg); }
      .wall {
        border: 1px solid rgba(246,240,227,0.17);
        background: rgba(8,18,31,0.42);
        backdrop-filter: blur(10px);
      }
      .wall-a { left: 7%; top: 28%; width: 52%; height: 54%; }
      .wall-b { right: 8%; top: 34%; width: 36%; height: 45%; }
      .window {
        background: rgba(242,200,121,0.38);
        box-shadow: 0 0 28px rgba(242,200,121,0.28);
        border: 1px solid rgba(242,200,121,0.28);
      }
      .w1 { left: 13%; top: 39%; width: 13%; height: 20%; }
      .w2 { left: 31%; top: 39%; width: 13%; height: 20%; }
      .w3 { right: 27%; top: 45%; width: 12%; height: 18%; }
      .w4 { right: 12%; top: 45%; width: 10%; height: 18%; }
      .terrace {
        left: 3%;
        right: 3%;
        bottom: 6%;
        height: 2px;
        background: #32D8FF;
        box-shadow: 0 0 30px rgba(50,216,255,0.55);
      }
      .ai-thread {
        position: absolute;
        height: 1px;
        background: linear-gradient(90deg, rgba(50,216,255,0), rgba(50,216,255,0.85), rgba(214,181,109,0));
        filter: drop-shadow(0 0 10px rgba(50,216,255,0.75));
      }
      .thread-a { left: 0; right: 10%; top: 22%; transform: rotate(-6deg); }
      .thread-b { left: 18%; right: 0; bottom: 23%; transform: rotate(5deg); }
      .artifact-stage,
      .dashboard-shell,
      .proof-stack {
        position: relative;
        width: ${portrait ? 820 : square ? 560 : 760}px;
        height: ${portrait ? 720 : square ? 460 : 560}px;
      }
      .artifact {
        position: absolute;
        width: ${portrait ? 360 : square ? 260 : 320}px;
        padding: ${portrait ? "24px" : "22px"};
        border: 1px solid rgba(246,240,227,0.14);
        background: rgba(8,18,31,0.72);
        backdrop-filter: blur(16px);
        box-shadow: 0 30px 90px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .artifact em,
      .proof-card span,
      .dash-top,
      .artifact span {
        font-family: "JetBrains Mono", Consolas, monospace;
        font-style: normal;
        color: #9FB0C7;
        font-size: ${portrait ? 18 : 15}px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .artifact strong {
        display: block;
        margin: 12px 0 10px;
        font-family: Georgia, "Times New Roman", serif;
        color: #F6F0E3;
        font-size: ${portrait ? 33 : 28}px;
        font-weight: 520;
      }
      .listing-card { left: ${square ? "0" : "4%"}; top: ${square ? "4%" : "8%"}; }
      .video-card { right: ${square ? "0" : "8%"}; top: ${square ? "4%" : "18%"}; }
      .mailer-card { left: ${square ? "0" : "12%"}; bottom: ${square ? "4%" : "12%"}; }
      .web-card { right: ${square ? "0" : "2%"}; bottom: 4%; }
      .dashboard-shell {
        border: 1px solid rgba(246,240,227,0.14);
        background: rgba(8,18,31,0.66);
        backdrop-filter: blur(18px);
        padding: ${portrait ? "34px" : "30px"};
        box-shadow: 0 40px 110px rgba(0,0,0,0.44), inset 0 0 90px rgba(50,216,255,0.05);
      }
      .dash-top {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(246,240,227,0.12);
        padding-bottom: 20px;
        color: #D6B56D;
      }
      .dash-top em { color: #6EE7B7; font-style: normal; }
      .dash-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: ${portrait ? "20px" : "18px"};
        margin-top: 28px;
      }
      .dash-grid div {
        min-height: ${portrait ? 150 : 118}px;
        border: 1px solid rgba(50,216,255,0.18);
        padding: 20px;
        background: rgba(3,6,17,0.42);
      }
      .dash-grid strong {
        display: block;
        color: #F6F0E3;
        font-size: ${portrait ? 25 : 21}px;
        margin-bottom: 12px;
      }
      .dash-grid span {
        color: #BAC6D8;
        font-size: ${portrait ? 21 : 18}px;
      }
      .pulse-node {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #32D8FF;
        box-shadow: 0 0 26px rgba(50,216,255,0.85);
      }
      .node-a { right: 16%; top: 22%; }
      .node-b { left: 18%; bottom: 18%; background: #D6B56D; box-shadow: 0 0 26px rgba(214,181,109,0.85); }
      .proof-card {
        position: absolute;
        border: 1px solid rgba(246,240,227,0.14);
        background: rgba(8,18,31,0.72);
        backdrop-filter: blur(18px);
        box-shadow: 0 35px 100px rgba(0,0,0,0.42);
      }
      .proof-main {
        left: 50%;
        top: 50%;
        width: ${portrait ? 520 : square ? 320 : 460}px;
        height: ${portrait ? 260 : square ? 190 : 220}px;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 14px;
        text-align: center;
      }
      .proof-main strong {
        font-family: Georgia, "Times New Roman", serif;
        font-size: ${portrait ? 84 : square ? 48 : 70}px;
        color: #D6B56D;
        font-weight: 560;
      }
      .proof-left,
      .proof-right {
        padding: 20px 22px;
        width: ${portrait ? 390 : square ? 235 : 330}px;
      }
      .proof-left { left: 0; top: ${portrait ? "8%" : square ? "2%" : "12%"}; }
      .proof-right { right: 0; bottom: ${portrait ? "8%" : square ? "2%" : "12%"}; }
      .proof-left em,
      .proof-right em {
        color: #F6F0E3;
        font-style: normal;
        font-size: ${portrait ? 25 : 21}px;
      }
      .proof-left span,
      .proof-right span {
        display: block;
        margin-top: 8px;
      }
      .tag-seal {
        position: absolute;
        right: ${portrait ? "4%" : "8%"};
        top: ${portrait ? "38%" : "8%"};
        width: ${portrait ? 150 : 118}px;
        height: ${portrait ? 150 : 118}px;
        border-radius: 50%;
        border: 1px solid rgba(214,181,109,0.54);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #D6B56D;
        font-family: Georgia, "Times New Roman", serif;
        font-size: ${portrait ? 50 : 40}px;
        box-shadow: 0 0 80px rgba(214,181,109,0.16);
      }`;
}

function writeHtml(format, audioDuration) {
  const dir = path.join(projectDir, format.slug);
  fs.mkdirSync(path.join(dir, "renders"), { recursive: true });
  fs.mkdirSync(path.join(dir, "snapshots"), { recursive: true });
  fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
  fs.copyFileSync(path.join(projectDir, "assets", "narration.mp3"), path.join(dir, "assets", "narration.mp3"));

  const sceneDuration = duration / scenes.length;
  const boundaries = scenes.slice(1).map((_, index) => ((index + 1) * sceneDuration).toFixed(2));
  const audioDurationSafe = Math.min(audioDuration, duration).toFixed(2);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI for Real Estate by TAG Hero - ${format.slug}</title>
    <style>
${cssFor(format)}
    </style>
  </head>
  <body>
    <div id="main-composition" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${format.width}" data-height="${format.height}">
      <div class="brand-rail">
        <strong>AI for Real Estate by TAG</strong>
        <span>Hero Loop</span>
      </div>
      ${sceneMarkup(format)}
      <div class="luxe-transition" data-layout-ignore></div>
      <audio id="narration" class="clip" src="assets/narration.mp3" data-start="0" data-duration="${audioDurationSafe}" data-track-index="10" data-volume="0.92"></audio>
      <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
      <script>
        window.__timelines = window.__timelines || {};
        var tl = gsap.timeline({ paused: true });
        var sceneDuration = ${sceneDuration};
        function fromTo(selector, fromVars, toVars, at) {
          var targets = document.querySelectorAll(selector);
          if (targets.length) tl.fromTo(targets, fromVars, toVars, at);
        }
        function to(selector, vars, at) {
          var targets = document.querySelectorAll(selector);
          if (targets.length) tl.to(targets, vars, at);
        }
        fromTo(".brand-rail", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.68, ease: "power3.out" }, 0.18);
        for (var i = 1; i <= ${scenes.length}; i++) {
          var start = (i - 1) * sceneDuration;
          var scene = "#scene-" + i;
          fromTo(scene + " .scene-light", { opacity: 0, scale: 1.08, x: -60 }, { opacity: 0.9, scale: 1, x: 0, duration: 1.25, ease: "sine.out" }, start + 0.05);
          fromTo(scene + " .eyebrow", { opacity: 0, x: -36, letterSpacing: "0.22em" }, { opacity: 1, x: 0, letterSpacing: "0.12em", duration: 0.58, ease: "power3.out" }, start + 0.14);
          fromTo(scene + " h1", { opacity: 0, y: 58, filter: "blur(16px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.92, ease: "expo.out" }, start + 0.24);
          fromTo(scene + " .body-copy", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.54, ease: "power2.out" }, start + 0.74);
          fromTo(scene + " .visual-block > *", { opacity: 0, scale: 0.95, y: 38, rotation: -0.5 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.94, ease: "power4.out", stagger: 0.07 }, start + 0.34);
          fromTo(scene + " .designed-caption", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.50, ease: "power2.out" }, start + 1.08);
          fromTo(scene + " .artifact, " + scene + " .dash-grid div, " + scene + " .proof-card, " + scene + " .window", { opacity: 0, y: 22, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: "back.out(1.08)", stagger: 0.08 }, start + 0.72);
          fromTo(scene + " .ai-thread, " + scene + " .terrace", { opacity: 0, scaleX: 0, transformOrigin: "left center" }, { opacity: 1, scaleX: 1, duration: 0.72, ease: "power2.inOut", stagger: 0.11 }, start + 0.84);
          fromTo(scene + " .estate-house, " + scene + " .dashboard-shell, " + scene + " .proof-stack", { x: 24, y: 8 }, { x: 0, y: 0, duration: 2.5, ease: "sine.inOut" }, start + 0.52);
        }
        [${boundaries.join(",")}].forEach(function(time) {
          fromTo(".luxe-transition", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1.04, duration: 0.30, ease: "power1.inOut", overwrite: "auto" }, time - 0.34);
          to(".luxe-transition", { opacity: 0, scale: 1.16, duration: 0.44, ease: "sine.inOut", overwrite: "auto" }, time - 0.04);
        });
        to("#main-composition", { opacity: 0.98, duration: 0.2, ease: "sine.inOut" }, ${duration - 0.22});
        window.__timelines["main"] = tl;
      </script>
    </div>
  </body>
</html>`;

  fs.writeFileSync(path.join(dir, "index.html"), html);
}

async function main() {
  fs.mkdirSync(projectDir, { recursive: true });
  writeDesignFiles();
  const env = readEnv();
  const narrationFile = await createVoiceover(env.CARTESIA_API_KEY);
  const audioDuration = durationOf(narrationFile);
  for (const format of formats) {
    writeHtml(format, audioDuration);
  }
  fs.writeFileSync(
    path.join(projectDir, "manifest.json"),
    JSON.stringify(
      {
        title: "AI for Real Estate by TAG Hero",
        duration,
        narrationDuration: audioDuration,
        formats,
        files: formats.map((format) => `${format.slug}/renders/${format.slug}.mp4`),
      },
      null,
      2,
    ),
  );
  console.log(`Generated AI for Real Estate by TAG hero. Narration: ${audioDuration.toFixed(2)}s`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
