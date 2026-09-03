#!/usr/bin/env node
/**
 * Fails the build when a tracked file looks like code has been smuggled into it.
 *
 * Added after the A8-2008 incident (Aug 2026): ~31KB of obfuscated JavaScript was
 * appended to postcss.config.mjs, on the same line as `export default config;` and
 * pushed off-screen behind ~500 spaces. It sat in the repo for months because every
 * editor and diff view rendered a normal-looking file, and PostCSS configs are
 * evaluated on every `next build` and `next dev` — so it ran on every build.
 *
 * The injection happened between a developer's machine and the remote (commits were
 * re-authored by someone with org write access), so a pre-commit hook would never
 * have fired. This runs in CI on every push and as a `prebuild` step, which covers
 * both the deploy path and branches that never deploy.
 *
 * Usage: node scripts/check-config-integrity.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

/** A line this long in hand-written source is always either minified or hostile. */
const MAX_LINE = 500;
/** Padding used to push a payload out of view. Legitimate code never does this. */
const WHITESPACE_RUN = /[ \t]{80,}\S/;
/** Hex-identifier density, the signature of javascript-obfuscator output. */
const OBFUSCATED_IDENT = /_0x[0-9a-f]{4,}/g;
const OBFUSCATED_THRESHOLD = 20;

/** Long lines are never legitimate in these; checked strictly. */
const CONFIG_FILE = /(^|\/)[\w.-]*\.config\.(js|mjs|cjs|ts)$/;
/** Structural checks run across all of these; near-zero false-positive risk. */
const SOURCE_FILE = /\.(js|mjs|cjs|jsx|ts|tsx)$/;

const SKIP = [
  /(^|\/)node_modules\//,
  /(^|\/)\.next\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /\.min\.(js|mjs|cjs)$/,
  /(^|\/)generated\//,
];

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out.split("\0").filter(Boolean);
}

const findings = [];

function report(file, detail) {
  findings.push({ file, detail });
}

for (const file of trackedFiles()) {
  if (SKIP.some((re) => re.test(file))) continue;

  const isConfig = CONFIG_FILE.test(file);
  const isSource = SOURCE_FILE.test(file);
  if (!isConfig && !isSource) continue;

  let text;
  try {
    if (statSync(file).size > 8 * 1024 * 1024) continue;
    text = readFileSync(file, "utf8");
  } catch {
    continue; // deleted, or not readable as text
  }

  const lines = text.split(/\r?\n/);

  // 1. Padding run — the specific technique used to hide the A8-2008 payload.
  lines.forEach((line, i) => {
    if (WHITESPACE_RUN.test(line)) {
      report(file, `line ${i + 1}: code hidden behind a run of whitespace`);
    }
  });

  // 2. Obfuscated identifier density.
  const hits = text.match(OBFUSCATED_IDENT);
  if (hits && hits.length >= OBFUSCATED_THRESHOLD) {
    report(file, `${hits.length} obfuscated \`_0x…\` identifiers`);
  }

  // 3. Absurd line length — config files only, where it is never legitimate.
  if (isConfig) {
    lines.forEach((line, i) => {
      if (line.length > MAX_LINE) {
        report(file, `line ${i + 1}: ${line.length} characters (limit ${MAX_LINE})`);
      }
    });
  }
}

if (findings.length === 0) {
  console.log("config integrity: clean");
  process.exit(0);
}

const seen = new Set();
console.error("\n  Config integrity check FAILED\n");
for (const { file, detail } of findings) {
  const key = `${file}::${detail}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.error(`    ${file}`);
  console.error(`      ${detail}`);
}
console.error(
  "\n  This is the signature of injected code, not a formatting problem.",
);
console.error("  Inspect the file before doing anything else:\n");
console.error(`    git log --format='%h %an|A:%ad|C:%cd|%s' \\`);
console.error(`      --date=format:'%z' -- <file> | grep -v 'C:+0000'\n`);
console.error("  A committer timezone that is not +0000 means the commit was");
console.error("  re-authored by someone else. See the A8-2008 incident report.\n");
process.exit(1);
