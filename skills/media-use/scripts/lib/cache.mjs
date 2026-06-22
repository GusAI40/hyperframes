import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { readManifest } from "./manifest.mjs";

const SCHEMA_PREFIX = "mu-v1-";
const KEY_HEX_CHARS = 16;
const COMPLETE_SENTINEL = ".hf-complete";

export function globalMediaDir() {
  return join(homedir(), ".media");
}

export function contentHash(filePath) {
  const bytes = readFileSync(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

function cacheEntryDir(rootDir, sha) {
  return join(rootDir, SCHEMA_PREFIX + sha.slice(0, KEY_HEX_CHARS));
}

function isComplete(entryDir) {
  return existsSync(join(entryDir, COMPLETE_SENTINEL));
}

function markComplete(entryDir) {
  writeFileSync(join(entryDir, COMPLETE_SENTINEL), "", "utf8");
}

function readGlobalManifest() {
  const dir = globalMediaDir();
  const p = join(dir, "manifest.jsonl");
  if (!existsSync(p)) return [];
  const raw = readFileSync(p, "utf8");
  const records = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch {
      // skip malformed
    }
  }
  return records;
}

function appendGlobalRecord(record) {
  const dir = globalMediaDir();
  mkdirSync(dir, { recursive: true });
  const p = join(dir, "manifest.jsonl");
  const line = JSON.stringify(record) + "\n";
  if (existsSync(p)) {
    const existing = readFileSync(p, "utf8");
    const sep = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(p, existing + sep + line);
  } else {
    writeFileSync(p, line);
  }
}

export function cacheGet(prompt, type) {
  const records = readGlobalManifest();
  const match = records.find(
    (r) =>
      r.reusable &&
      r.provenance?.prompt === prompt &&
      (type == null || r.type === type),
  );
  if (!match) return null;

  const sha = match.sha;
  if (!sha) return null;
  const entryDir = cacheEntryDir(globalMediaDir(), sha);
  if (!isComplete(entryDir)) return null;

  return match;
}

export function cacheGetByEntity(entity) {
  const lower = entity.toLowerCase();
  const records = readGlobalManifest();
  const match = records.find(
    (r) => r.reusable && r.entity && r.entity.toLowerCase() === lower,
  );
  if (!match) return null;

  const sha = match.sha;
  if (!sha) return null;
  const entryDir = cacheEntryDir(globalMediaDir(), sha);
  if (!isComplete(entryDir)) return null;

  return match;
}

export function cachePut(filePath, record) {
  const sha = contentHash(filePath);
  const dir = globalMediaDir();
  const entryDir = cacheEntryDir(dir, sha);
  mkdirSync(entryDir, { recursive: true });

  const dest = join(entryDir, basename(filePath));
  copyFileSync(filePath, dest);
  markComplete(entryDir);

  const globalRecord = {
    ...record,
    sha,
    reusable: true,
    cached_path: dest,
  };
  appendGlobalRecord(globalRecord);
  return { sha, cached_path: dest };
}

export function importFromCache(cacheRecord, projectDir, localId, localPath) {
  const sha = cacheRecord.sha;
  const entryDir = cacheEntryDir(globalMediaDir(), sha);
  if (!isComplete(entryDir)) return null;

  const cachedFile = cacheRecord.cached_path;
  if (!cachedFile || !existsSync(cachedFile)) return null;

  mkdirSync(join(projectDir, ".media"), { recursive: true });
  const fullDest = join(projectDir, localPath);
  mkdirSync(join(fullDest, ".."), { recursive: true });
  copyFileSync(cachedFile, fullDest);

  const projectRecord = {
    ...cacheRecord,
    id: localId,
    path: localPath,
    provenance: {
      ...cacheRecord.provenance,
      imported_from: sha,
    },
  };
  delete projectRecord.sha;
  delete projectRecord.reusable;
  delete projectRecord.cached_path;

  return projectRecord;
}

export function promote(projectDir, id) {
  const records = readManifest(projectDir);
  const record = records.find((r) => r.id === id);
  if (!record) throw new Error(`asset not found in project manifest: ${id}`);

  const filePath = join(projectDir, record.path);
  if (!existsSync(filePath))
    throw new Error(`asset file not found: ${filePath}`);

  return cachePut(filePath, record);
}
