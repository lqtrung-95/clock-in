#!/usr/bin/env node
// Validates that every ambient scene in src/data/video-backgrounds.ts still
// points at a YouTube video that exists AND allows third-party embedding.
//
// Uses YouTube's public oEmbed endpoint (no API key needed):
//   200 -> video exists and is embeddable
//   401 -> embedding disabled by the owner
//   404 -> video removed / private / invalid id
//
// Exits non-zero if any scene is broken so CI (or a local run) fails loudly.
// Run: node scripts/check-video-backgrounds.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "../src/data/video-backgrounds.ts");
const REQUEST_TIMEOUT_MS = 10_000;

/** Parse { name, embedUrl, videoId } tuples out of the TS data file. */
async function parseVideos() {
  const text = await readFile(DATA_FILE, "utf8");
  const re = /name:\s*"([^"]+)",\s*embedUrl:\s*"([^"]+)"/g;
  const videos = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, name, embedUrl] = m;
    const idMatch = embedUrl.match(/\/embed\/([A-Za-z0-9_-]+)/);
    videos.push({ name, embedUrl, videoId: idMatch ? idMatch[1] : null });
  }
  return videos;
}

/** Check one video via oEmbed. Returns { ok, reason }. */
async function checkVideo(videoId) {
  if (!videoId) return { ok: false, reason: "could not parse video id" };
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) return { ok: true, reason: "ok" };
    if (res.status === 401) return { ok: false, reason: "embedding disabled (401)" };
    if (res.status === 404) return { ok: false, reason: "removed / private / invalid (404)" };
    return { ok: false, reason: `unexpected status ${res.status}` };
  } catch (err) {
    const reason = err.name === "AbortError" ? "request timed out" : `network error: ${err.message}`;
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const videos = await parseVideos();
  if (videos.length === 0) {
    console.error("No videos found — did the data file format change?");
    process.exit(2);
  }

  console.log(`Checking ${videos.length} ambient scenes via YouTube oEmbed...\n`);
  const results = await Promise.all(
    videos.map(async (v) => ({ ...v, ...(await checkVideo(v.videoId)) }))
  );

  const broken = results.filter((r) => !r.ok);
  for (const r of results) {
    const mark = r.ok ? "✅" : "❌";
    console.log(`${mark} ${r.name.padEnd(18)} ${r.videoId ?? "?"}  ${r.ok ? "" : "— " + r.reason}`);
  }

  if (broken.length > 0) {
    console.log(`\n${broken.length} broken scene(s):`);
    for (const b of broken) console.log(`  - ${b.name} (${b.videoId}): ${b.reason}`);
    console.log("\nRemove or replace them in clockin/src/data/video-backgrounds.ts");
    process.exit(1);
  }

  console.log("\nAll ambient scenes are live and embeddable. 🎉");
}

main().catch((err) => {
  console.error("Checker crashed:", err);
  process.exit(2);
});
