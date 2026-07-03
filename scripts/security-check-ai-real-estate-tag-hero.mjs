import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const projectDir = path.join(root, "ai-real-estate-tag-hero");
const indexPath = path.join(projectDir, "index.html");
const vercelConfigPath = path.join(projectDir, "vercel.json");

const requiredHeaders = new Set([
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
  "X-DNS-Prefetch-Control",
]);

function fail(message) {
  console.error(`security check failed: ${message}`);
  process.exitCode = 1;
}

function assertFileExists(file) {
  if (!fs.existsSync(file)) {
    fail(`missing file ${path.relative(root, file)}`);
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`invalid json ${path.relative(root, file)}: ${error.message}`);
    return {};
  }
}

function checkLocalReferences(html) {
  const refs = [...html.matchAll(/(?:href|src|poster)="([^"#][^"]*)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^https?:/.test(value) && !value.startsWith("#"));

  for (const ref of refs) {
    const clean = ref.split("?")[0];
    assertFileExists(path.join(projectDir, clean));
  }

  return refs.length;
}

function checkNoScriptSurface(html) {
  if (/<script[\s>]/i.test(html)) {
    fail("index.html contains a script tag");
  }

  if (/\son[a-z]+\s*=/i.test(html)) {
    fail("index.html contains inline event handlers");
  }
}

function checkHeaders(config) {
  const allHeaderBlocks = Array.isArray(config.headers) ? config.headers : [];
  const rootHeaderBlock = allHeaderBlocks.find((block) => block.source === "/(.*)");

  if (!rootHeaderBlock) {
    fail("vercel.json missing /(.*) header block");
    return;
  }

  const configured = new Set((rootHeaderBlock.headers ?? []).map((header) => header.key));
  for (const header of requiredHeaders) {
    if (!configured.has(header)) {
      fail(`missing required security header ${header}`);
    }
  }

  const csp = (rootHeaderBlock.headers ?? []).find((header) => header.key === "Content-Security-Policy")?.value ?? "";
  for (const directive of ["default-src 'self'", "script-src 'none'", "object-src 'none'", "frame-ancestors 'none'"]) {
    if (!csp.includes(directive)) {
      fail(`CSP missing directive ${directive}`);
    }
  }
}

function checkTrackedSensitiveFiles() {
  const tracked = execFileSync("git", ["ls-files", ".env", ".env.local", ".env.*.local", ".vercel", "ai-real-estate-tag-hero/.vercel"], {
    cwd: root,
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .filter(Boolean);

  if (tracked.length > 0) {
    fail(`sensitive local files are tracked: ${tracked.join(", ")}`);
  }
}

assertFileExists(indexPath);
assertFileExists(vercelConfigPath);

const html = fs.readFileSync(indexPath, "utf8");
const config = readJson(vercelConfigPath);

const refCount = checkLocalReferences(html);
checkNoScriptSurface(html);
checkHeaders(config);
checkTrackedSensitiveFiles();

if (!process.exitCode) {
  console.log(`security check passed: ${refCount} local references, strict headers, no script surface`);
}
