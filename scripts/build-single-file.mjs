#!/usr/bin/env node
// Merge the split source (styles.css + questions.js + app.js) into a single,
// self-contained HTML file per build profile — for handing someone one file
// to double-click and play offline. The split files in the repo root stay
// the source of truth; this script's output is disposable and untracked
// (see dist/ in .gitignore), rebuilt on demand rather than kept in sync.
//
// Usage:
//   node scripts/build-single-file.mjs public          # -> dist/between-us.html
//   node scripts/build-single-file.mjs work             # -> dist/between-us-work.html
//   node scripts/build-single-file.mjs dev               # -> dist/between-us-dev.html
//   node scripts/build-single-file.mjs all                 # all three

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SHELLS = {
  public: 'between-us.html',
  work: 'between-us-work.html',
  dev: 'between-us-dev.html',
};

function buildOne(profile) {
  const shellFile = SHELLS[profile];
  const shellPath = path.join(ROOT, shellFile);
  let html = readFileSync(shellPath, 'utf8');

  const css = readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  const questions = readFileSync(path.join(ROOT, 'questions.js'), 'utf8');
  const app = readFileSync(path.join(ROOT, 'app.js'), 'utf8');

  const linkTag = '<link rel="stylesheet" href="styles.css">';
  if (!html.includes(linkTag)) throw new Error(`${shellFile}: stylesheet link not found — shell markup changed?`);
  html = html.replace(linkTag, `<style>\n${css}\n</style>`);

  const scriptTags = '<script src="questions.js"></script>\n<script src="app.js"></script>';
  if (!html.includes(scriptTags)) throw new Error(`${shellFile}: script tags not found — shell markup changed?`);
  html = html.replace(scriptTags, `<script>\n${questions}\n</script>\n<script>\n${app}\n</script>`);

  const outDir = path.join(ROOT, 'dist');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, shellFile);
  writeFileSync(outPath, html);
  console.log(`built dist/${shellFile}  (${(html.length / 1024).toFixed(0)} KB, single file)`);
}

const arg = process.argv[2];
if (!arg || !['public', 'work', 'dev', 'all'].includes(arg)) {
  console.error('Usage: node scripts/build-single-file.mjs <public|work|dev|all>');
  process.exit(1);
}

if (arg === 'all') Object.keys(SHELLS).forEach(buildOne);
else buildOne(arg);
