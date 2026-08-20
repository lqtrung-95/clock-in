#!/usr/bin/env node
// Prints how many raw Tailwind palette classes (bg-blue-500, text-cyan-400,
// ...) remain per directory under src/. This is the migration burndown for
// the ground-up UI rebuild — the ESLint rule in eslint.config.mjs flags new
// occurrences at "warn" during the migration; this script tracks the total
// so the count is visible without scrolling lint output.
//
// Never fails the build — informational only. Run: node scripts/check-tokens.mjs

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "../src");

const RAW_PALETTE =
  /\b(?:bg|text|border|from|via|to|ring|fill|stroke|shadow|divide|outline|decoration)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g;

const EXEMPT_PREFIXES = [
  "components/ui/",
  "components/focus/",
  "components/dream-goal/",
  "components/landing/",
  "app/opengraph-image.tsx",
  "app/page.tsx",
  "app/pricing/",
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(SRC_DIR);
  const perDir = new Map();
  let total = 0;
  let exemptTotal = 0;

  for (const file of files) {
    const rel = relative(SRC_DIR, file).replace(/\\/g, "/");
    const isExempt = EXEMPT_PREFIXES.some((p) => rel.startsWith(p));
    const text = await readFile(file, "utf8");
    const matches = text.match(RAW_PALETTE);
    if (!matches) continue;

    if (isExempt) {
      exemptTotal += matches.length;
      continue;
    }

    total += matches.length;
    const dir = dirname(rel).split("/").slice(0, 2).join("/") || ".";
    perDir.set(dir, (perDir.get(dir) ?? 0) + matches.length);
  }

  console.log("Raw Tailwind palette usage burndown (excludes exempt expressive surfaces):\n");
  const sorted = [...perDir.entries()].sort((a, b) => b[1] - a[1]);
  for (const [dir, count] of sorted) {
    console.log(`  ${String(count).padStart(4)}  ${dir}`);
  }
  console.log(`\n  ${String(total).padStart(4)}  TOTAL (lint-visible)`);
  console.log(`  ${String(exemptTotal).padStart(4)}  exempt (focus / dream-goal / landing / marketing)`);
}

main().catch((err) => {
  console.error("check-tokens crashed:", err);
  process.exit(1);
});
