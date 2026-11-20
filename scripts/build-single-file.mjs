#!/usr/bin/env node
// Merge the split source (styles.css + questions.js + the app modules) into
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
// Everything the page needs is inside the file: the Google Fonts stylesheet
// is fetched at build time and its font files are inlined as data: URLs
// (latin and latin-ext only — the deck is in English), and the manifest and
// home-screen icon links, which point at files a single file doesn't have,
// are dropped. The build fails if the fonts can't be fetched or if any
// outside address is left in the result, so a release never ships a file
// that quietly needs the internet.
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
const APP_MODULES = ['categories', 'config', 'gilt', 'state', 'deck', 'card', 'library', 'session', 'selection', 'presentation', 'ui'];

// A current desktop Chrome user agent, so Google Fonts answers with woff2.
const FONT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

async function fetchOk(url, asBuffer) {
  const res = await fetch(url, { headers: { 'User-Agent': FONT_UA } });
  if (!res.ok) throw new Error(`fonts: ${url} answered ${res.status}`);
  return asBuffer ? Buffer.from(await res.arrayBuffer()) : res.text();
}

// The shell's Google Fonts <link>, turned into an inline <style> with every
// font file embedded. Fetched once and shared by all profiles.
let inlineFontsPromise;
function inlineFonts(cssUrl) {
  inlineFontsPromise ??= (async () => {
    const css = await fetchOk(cssUrl, false);
    // Google's CSS is a run of "/* subset */ @font-face { ... }" blocks.
    const kept = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
      .filter(m => KEEP_SUBSETS.has(m[1])).map(m => m[2]);
    if (!kept.length) throw new Error('fonts: no latin @font-face blocks in the Google Fonts answer');
    // Variable fonts come back as one block per weight, all on the same file:
    // merge those into one block with a weight range so each file is embedded once.
    const merged = new Map();
    for (const block of kept) {
      const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
      const key = block.replace(/font-weight:\s*\d+;/, '');
      const seen = merged.get(key);
      if (seen) { seen.min = Math.min(seen.min, weight); seen.max = Math.max(seen.max, weight); }
      else merged.set(key, { block, min: weight, max: weight });
    }
    const blocks = [...merged.values()].map(({ block, min, max }) =>
      block.replace(/font-weight:\s*\d+;/, `font-weight: ${min === max ? min : `${min} ${max}`};`));
    const files = new Map();
    for (const block of blocks) {
      for (const [, url] of block.matchAll(/url\((https:[^)]+)\)/g)) {
        if (!files.has(url)) files.set(url, fetchOk(url, true));
      }
    }
    const dataUrls = new Map();
    for (const [url, buf] of files) dataUrls.set(url, `data:font/woff2;base64,${(await buf).toString('base64')}`);
    return blocks.map(b => b.replace(/url\((https:[^)]+)\)/g, (_, url) => `url(${dataUrls.get(url)})`)).join('\n');
  })();
  return inlineFontsPromise;
}

async function buildOne(profile) {
  const [outFile, profileKey] = PROFILES[profile];
  const shellPath = path.join(ROOT, 'between-us.html'); // the one real shell
  let html = readFileSync(shellPath, 'utf8');

  const css = readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  const questions = readFileSync(path.join(ROOT, 'questions.js'), 'utf8');
  const appModules = APP_MODULES.map(name => readFileSync(path.join(ROOT, `${name}.js`), 'utf8'));

  const fontLinkRe = /<link href="(https:\/\/fonts\.googleapis\.com\/[^"]+)" rel="stylesheet">/;
  const fontLink = html.match(fontLinkRe);
  if (!fontLink) throw new Error('between-us.html: Google Fonts link not found — shell markup changed?');
  const fontCss = await inlineFonts(fontLink[1].replaceAll('&amp;', '&'));
  html = html.replace(fontLinkRe, () => `<style>\n${fontCss}\n</style>`);

  // Point at files that don't travel with a single file.
  html = html.replace(/<link rel="manifest" href="[^"]*">\n?/, '');
  html = html.replace(/<link rel="apple-touch-icon" href="[^"]*">\n?/, '');

  const headMarker = '<head>';
  if (!html.includes(headMarker)) throw new Error('between-us.html: <head> not found — shell markup changed?');
  html = html.replace(headMarker, `<head>\n<script>window.BUILD_PROFILE = ${JSON.stringify(profileKey)};</script>`);

  // Matches the cache-busting ?v=... query string (see the comment above the
  // link/script tags in between-us.html) without needing to know its value.
  const linkRe = /<link rel="stylesheet" href="styles\.css(?:\?[^"]*)?">/;
  if (!linkRe.test(html)) throw new Error('between-us.html: stylesheet link not found — shell markup changed?');
  html = html.replace(linkRe, `<style>\n${css}\n</style>`);

  const scriptNames = ['questions', ...APP_MODULES];
  const scriptRe = new RegExp(scriptNames.map(name => `<script src="${name}\\.js(?:\\?[^"]*)?"></script>`).join('\\n'));
  if (!scriptRe.test(html)) throw new Error('between-us.html: script tags not found — shell markup changed?');
  const inlineScripts = [questions, ...appModules].map(src => `<script>\n${src}\n</script>`).join('\n');
  html = html.replace(scriptRe, inlineScripts);

  // Nothing may be loaded from elsewhere: no src/href/url() to a file or address.
  const outside = [...html.matchAll(/(?:\bsrc|\bhref)\s*=\s*["']([^"'#][^"']*)["']|url\(\s*["']?(https?:[^)"']+)/g)]
    .map(m => m[1] || m[2]).filter(u => u && !u.startsWith('data:') && !u.startsWith('javascript:'));
  if (outside.length) throw new Error(`${outFile}: still loads from outside the file: ${[...new Set(outside)].join(', ')}`);

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

const todo = arg === 'all' ? Object.keys(PROFILES) : [arg];
for (const profile of todo) await buildOne(profile);
