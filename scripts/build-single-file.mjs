#!/usr/bin/env node
// Merge the split source (styles.css + questions.js + the 9 app modules) into
// a single, self-contained HTML file per build profile — for handing someone
// one file to double-click and play offline. The split files in the repo
// root stay the source of truth; this script's output is disposable and
// untracked (see dist/ in .gitignore), rebuilt on demand rather than kept in
// sync.
//
// There's one real shell (between-us.html) for every profile — normally the
// profile comes from ?profile= in the URL, but an offline file has no URL to
// read, so this script bakes it in as a small inline script instead (config.js
// falls back to window.BUILD_PROFILE when there's no query string).
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

// CLI name -> [output filename, internal PROFILES key in config.js]
const PROFILES = {
  public: ['between-us.html', 'public'],
  work: ['between-us-work.html', 'work'],
  dev: ['between-us-dev.html', 'editor'],
};

// Load order matters (each depends on globals the previous ones declare) —
// keep this in sync with the <script> tags in between-us.html.
const APP_MODULES = ['config', 'state', 'deck', 'card', 'library', 'session', 'selection', 'presentation', 'ui'];

function buildOne(profile) {
  const [outFile, profileKey] = PROFILES[profile];
  const shellPath = path.join(ROOT, 'between-us.html'); // the one real shell
  let html = readFileSync(shellPath, 'utf8');

  const css = readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  const questions = readFileSync(path.join(ROOT, 'questions.js'), 'utf8');
  const appModules = APP_MODULES.map(name => readFileSync(path.join(ROOT, `${name}.js`), 'utf8'));

  const headMarker = '<head>';
  if (!html.includes(headMarker)) throw new Error('between-us.html: <head> not found — shell markup changed?');
  html = html.replace(headMarker, `<head>\n<script>window.BUILD_PROFILE = ${JSON.stringify(profileKey)};</script>`);

  const linkTag = '<link rel="stylesheet" href="styles.css">';
  if (!html.includes(linkTag)) throw new Error('between-us.html: stylesheet link not found — shell markup changed?');
  html = html.replace(linkTag, `<style>\n${css}\n</style>`);

  const scriptTags = '<script src="questions.js"></script>\n' + APP_MODULES.map(name => `<script src="${name}.js"></script>`).join('\n');
  if (!html.includes(scriptTags)) throw new Error('between-us.html: script tags not found — shell markup changed?');
  const inlineScripts = [questions, ...appModules].map(src => `<script>\n${src}\n</script>`).join('\n');
  html = html.replace(scriptTags, inlineScripts);

  const outDir = path.join(ROOT, 'dist');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, outFile);
  writeFileSync(outPath, html);
  console.log(`built dist/${outFile}  (${(html.length / 1024).toFixed(0)} KB, single file, profile=${profileKey})`);
}

const arg = process.argv[2];
if (!arg || !['public', 'work', 'dev', 'all'].includes(arg)) {
  console.error('Usage: node scripts/build-single-file.mjs <public|work|dev|all>');
  process.exit(1);
}

if (arg === 'all') Object.keys(PROFILES).forEach(buildOne);
else buildOne(arg);
