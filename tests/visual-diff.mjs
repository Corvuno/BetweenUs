#!/usr/bin/env node
// Visual diff for Between Us: whole-screen pictures of the app "before" and "after" a change, compared
// pixel by pixel. Anything that changed outside the area the change was allowed to touch fails the check,
// so a change meant for one spot cannot quietly move something elsewhere.
//
// Usage: node tests/visual-diff.mjs [--allow=<css selector>[,<css selector>…]] [--base=<git ref>]
//          [--after-dir=<dir>] [--only=<word>] [--phone | --wide] [--out=<dir>]
//   --allow      the area the change may alter: a difference inside the box of an element matching one of
//                these selectors (in the before or the after page) is allowed. Without it, every difference fails.
//   --base       the "before" copy: a git ref exported with `git archive` (default origin/main). The working
//                tree, the index and the branch are never touched.
//   --after-dir  the "after" copy: a directory (default: the working tree).
//   --only       only the moments whose name holds the word.
//   --phone / --wide  only that device (412x915 phone, 1440x900 wide).
//   --out        where before/after/diff pictures of failing moments are saved (default: a new temp directory).
// Exit code 0: nothing changed outside the allowed area. 1: something did.

import http from 'node:http';
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Same Playwright lookup as run.mjs: the local package, else the shared copy in the cloud sessions.
const FALLBACK_PW = '/opt/node-tools/node_modules/playwright';
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (e) {
  if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
  ({ chromium } = createRequire(import.meta.url)(FALLBACK_PW));
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = process.argv.slice(2);
const flag = name => ARGS.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const BASE = flag('base') ?? 'origin/main';
const AFTER_DIR = path.resolve(flag('after-dir') ?? ROOT);
const ALLOW = (flag('allow') ?? '').split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);   // commas inside :is(…) stay
const ONLY = flag('only')?.toLowerCase();
const DEVICES = [
  { name: 'phone', viewport: { width: 412, height: 915 }, hasTouch: true },
  { name: 'wide', viewport: { width: 1440, height: 900 }, hasTouch: false },
].filter(d => ARGS.includes(`--${d.name}`) || !(ARGS.includes('--phone') || ARGS.includes('--wide')));

const TOLERANCE = 12;      // per-channel difference that still counts as the same pixel (anti-aliasing noise)
const MERGE_GAP = 6;       // boxes that touch or lie this close together become one
const ALLOW_PAD = 4;       // allowed areas are widened by this much

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

function serve(dir) {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = path.join(dir, urlPath === '/' ? '/between-us.html' : urlPath);
        if (!filePath.startsWith(dir)) { res.writeHead(403); res.end(); return; }
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch { res.writeHead(404); res.end('not found'); }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ── deterministic page: fixed random numbers, fixed clock, clean storage, no motion ────────────────────────
function deterministicInit() {
  let seed = 123456789;
  Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const FIXED = Date.UTC(2026, 0, 15, 12, 0, 0);
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(FIXED); }
    static now() { return FIXED; }
  }
  globalThis.Date = FixedDate;
  // a hand's size and the Wildcards switch decide what a hand holds: fixed here, like run.mjs fixes Wildcards off
  try { localStorage.setItem('bu.wildcards', '0'); } catch { /* storage blocked */ }
}

async function openApp(browser, port, device) {
  const context = await browser.newContext({ viewport: device.viewport, hasTouch: device.hasTouch, deviceScaleFactor: 1,
    reducedMotion: 'reduce', serviceWorkers: 'block', locale: 'en-US', timezoneId: 'UTC' });
  await context.addInitScript(deterministicInit);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/between-us.html`);
  await page.waitForSelector('#card', { state: 'visible' });
  await settle(page);
  page.pageErrors = errors;
  return page;
}

// Fonts loaded, every animation and transition finished, then two frames for the paint.
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let i = 0; i < 20; i++) {
      const running = document.getAnimations().filter(a => a.playState === 'running' && Number.isFinite(a.effect?.getComputedTiming().endTime));
      if (!running.length) break;
      await Promise.race([Promise.allSettled(running.map(a => a.finished)), new Promise(r => setTimeout(r, 1500))]);
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.waitForTimeout(150);
}

const waitCard = (page, n) => page.waitForFunction(i => state.currentIndex + 1 === i, n, { timeout: 5000 });
async function drawFirst(page) { await page.locator('#btn-next').click(); await waitCard(page, 1); }
// A hand of 5 with nothing seen and Three off, the way run.mjs sets up a fresh hand.
async function smallHand(page) {
  await page.evaluate(() => {
    closePicker(); state.pickOptions = null; setTwist(false);
    state.randomMode = 'arc'; state.cardLimit = 5; syncLimitButtons();
    state.sessionLog = []; state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {};
    renderLog(); initDeck(); renderShell();
  });
  await page.waitForTimeout(250);
}

// Each moment leaves the page in the state to photograph. Selectors and steps are the ones run.mjs uses.
const MOMENTS = [
  { name: 'the start card before the first draw', run: async () => {} },
  { name: 'a card in a hand', run: async page => { await smallHand(page); await drawFirst(page); await page.locator('#btn-next').click(); await waitCard(page, 2); } },
  { name: 'The Deck sheet open', run: async page => {
    await page.locator('#tokCats').click({ force: true });
    await page.waitForFunction(() => document.getElementById('cat-area').classList.contains('sheet-open'), null, { timeout: 3000 });
  } },
  { name: 'the menu open', run: async page => {
    await page.locator('#btn-menu').click();
    await page.waitForFunction(() => document.querySelector('#menuDrawer.open, #menuSideDrawer.open') !== null, null, { timeout: 3000 });
  } },
  { name: 'Spotlight open', run: async page => {
    await drawFirst(page);
    await page.locator('#btnParty').click();
    await page.waitForFunction(() => document.getElementById('partyOverlay').classList.contains('open'), null, { timeout: 3000 });
  } },
  { name: 'the end of a hand', run: async page => {
    await smallHand(page);
    for (let i = 0; i < 20 && !(await page.evaluate(() => state.currentIndex >= state.visibleDeck.length)); i++) {
      await page.locator('#card').click();
      await page.waitForTimeout(300);
    }
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 8000 });
    await page.waitForTimeout(1000);
  } },
].filter(m => !ONLY || m.name.toLowerCase().includes(ONLY));

// ── comparison, inside a browser page ──────────────────────────────────────────────────────────────────────
const COMPARE = async ({ a, b, tolerance, gap }) => {
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + src; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  if (ia.width !== ib.width || ia.height !== ib.height) {
    return { sizeDiffers: true, sizes: [[ia.width, ia.height], [ib.width, ib.height]], boxes: [{ x: 0, y: 0, w: Math.max(ia.width, ib.width), h: Math.max(ia.height, ib.height) }] };
  }
  const { width: w, height: h } = ia;
  const px = img => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
  const da = px(ia), db = px(ib);
  // rows of differing pixels, as runs, then grouped into boxes
  const diff = new Uint8Array(w * h);
  let count = 0;
  for (let i = 0; i < w * h; i++) {
    const k = i * 4;
    if (Math.abs(da[k] - db[k]) > tolerance || Math.abs(da[k + 1] - db[k + 1]) > tolerance || Math.abs(da[k + 2] - db[k + 2]) > tolerance) { diff[i] = 1; count++; }
  }
  if (!count) return { boxes: [], count: 0, w, h };
  // coarse cells (gap-sized) -> flood fill into groups -> bounding boxes of the real pixels
  const cell = Math.max(1, gap), cw = Math.ceil(w / cell), ch = Math.ceil(h / cell);
  const cells = new Uint8Array(cw * ch);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (diff[y * w + x]) cells[Math.floor(y / cell) * cw + Math.floor(x / cell)] = 1;
  const group = new Int32Array(cw * ch).fill(-1);
  const boxes = [];
  for (let s = 0; s < cells.length; s++) {
    if (!cells[s] || group[s] >= 0) continue;
    const id = boxes.length; const stack = [s]; group[s] = id;
    let cx0 = cw, cy0 = ch, cx1 = 0, cy1 = 0;
    while (stack.length) {
      const c = stack.pop(), cx = c % cw, cy = (c - cx) / cw;
      cx0 = Math.min(cx0, cx); cx1 = Math.max(cx1, cx); cy0 = Math.min(cy0, cy); cy1 = Math.max(cy1, cy);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const n = ny * cw + nx;
        if (cells[n] && group[n] < 0) { group[n] = id; stack.push(n); }
      }
    }
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = cy0 * cell; y < Math.min(h, (cy1 + 1) * cell); y++) for (let x = cx0 * cell; x < Math.min(w, (cx1 + 1) * cell); x++) {
      if (diff[y * w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    boxes.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  // boxes whose cell groups were separate but whose pixels now overlap or touch are merged
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < boxes.length && !merged; i++) for (let j = i + 1; j < boxes.length && !merged; j++) {
      const p = boxes[i], q = boxes[j];
      if (p.x <= q.x + q.w + gap && q.x <= p.x + p.w + gap && p.y <= q.y + q.h + gap && q.y <= p.y + p.h + gap) {
        const x0 = Math.min(p.x, q.x), y0 = Math.min(p.y, q.y);
        boxes[i] = { x: x0, y: y0, w: Math.max(p.x + p.w, q.x + q.w) - x0, h: Math.max(p.y + p.h, q.y + q.h) - y0 };
        boxes.splice(j, 1); merged = true;
      }
    }
  }
  // highlight picture: the after image faded, differing boxes outlined in red
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.drawImage(ib, 0, 0); x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,0,0,0.9)';
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (diff[y * w + xx]) x.fillRect(xx, y, 1, 1);
  x.strokeStyle = 'rgb(255,0,0)'; x.lineWidth = 2;
  for (const bx of boxes) x.strokeRect(bx.x - 3, bx.y - 3, bx.w + 6, bx.h + 6);
  return { boxes, count, w, h, highlight: c.toDataURL('image/png').split(',')[1] };
};

// ── naming a box in plain words, on the "after" page ───────────────────────────────────────────────────────
const DESCRIBE = ({ boxes, vw, vh }) => {
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const shortPath = el => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) {
      if (e.id) { parts.unshift('#' + e.id); break; }
      const cls = [...e.classList].slice(0, 2).join('.');
      parts.unshift(e.tagName.toLowerCase() + (cls ? '.' + cls : ''));
    }
    return parts.join(' > ');
  };
  const label = el => {
    const withId = el.closest('[id]');
    return withId && withId !== document.body && withId !== document.documentElement ? '#' + withId.id : shortPath(el);
  };
  const at = (x, y) => {
    const px = Math.min(vw - 1, Math.max(0, x)), py = Math.min(vh - 1, Math.max(0, y));
    let el = document.elementsFromPoint(px, py).find(e => e !== document.documentElement && e !== document.body);
    if (!el) {   // untouchable (pointer-events: none) layers are not hit-tested: take the smallest box that holds the point
      let best = null, area = Infinity;
      for (const e of document.body.querySelectorAll('*')) {
        if (!visible(e)) continue;
        const r = e.getBoundingClientRect();
        if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom && r.width * r.height < area) { best = e; area = r.width * r.height; }
      }
      el = best;
    }
    return el ? label(el) : null;
  };
  const place = b => {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const v = cy < vh / 3 ? 'top' : cy > (vh * 2) / 3 ? 'bottom' : 'middle';
    const hz = cx < vw / 3 ? 'left' : cx > (vw * 2) / 3 ? 'right' : 'centre';
    return v === 'middle' && hz === 'centre' ? 'middle of the screen' : `${v} ${hz}`.replace('middle left', 'left side').replace('middle right', 'right side');
  };
  return boxes.map(b => {
    const pts = [[b.x + b.w / 2, b.y + b.h / 2], [b.x + 1, b.y + 1], [b.x + b.w - 2, b.y + 1], [b.x + 1, b.y + b.h - 2], [b.x + b.w - 2, b.y + b.h - 2]];
    const names = [...new Set(pts.map(([x, y]) => at(Math.round(x), Math.round(y))).filter(Boolean))];
    const ided = names.find(n => n.startsWith('#') && !n.includes(' ')) ?? names[0] ?? 'an empty part of the screen';
    return { around: ided, others: names.filter(n => n !== ided), where: place(b) };
  });
};

const ALLOW_RECTS = sels => sels.flatMap(sel => {
  let els = [];
  try { els = [...document.querySelectorAll(sel)]; } catch { return []; }
  return els.map(el => el.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0).map(r => ({ x: r.left, y: r.top, w: r.width, h: r.height, sel }));
});

// ── run ────────────────────────────────────────────────────────────────────────────────────────────────────
const t0 = Date.now();
const tmp = await mkdtemp(path.join(os.tmpdir(), 'bu-visual-'));
const beforeDir = path.join(tmp, 'before');
await mkdir(beforeDir);
execSync(`git archive ${JSON.stringify(BASE)} | tar -x -C ${JSON.stringify(beforeDir)}`, { cwd: ROOT, shell: '/bin/bash', stdio: ['ignore', 'ignore', 'inherit'] });
const OUT = path.resolve(flag('out') ?? await mkdtemp(path.join(os.tmpdir(), 'bu-visual-out-')));
await mkdir(OUT, { recursive: true });

const [srvBefore, srvAfter] = await Promise.all([serve(beforeDir), serve(AFTER_DIR)]);
const portBefore = srvBefore.address().port, portAfter = srvAfter.address().port;
const browser = await chromium.launch();
const cmpPage = await (await browser.newContext()).newPage();

console.log(`\nBetween Us visual diff: before = ${BASE}, after = ${AFTER_DIR === ROOT ? 'the working tree' : AFTER_DIR}`);
console.log(ALLOW.length ? `Allowed to change: ${ALLOW.join(', ')}\n` : 'Allowed to change: nothing\n');

let compared = 0, allowedN = 0, outsideN = 0, broken = 0;
const slug = s => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const runDevice = async device => {
  const lines = [];
  const log = t => lines.push(t);
  for (const moment of MOMENTS) {
    const label = `${device.name} · ${moment.name}`;
    let pb, pa;
    try {
      [pb, pa] = await Promise.all([openApp(browser, portBefore, device), openApp(browser, portAfter, device)]);
      const [errB, errA] = await Promise.allSettled([moment.run(pb), moment.run(pa)]);
      for (const [r, side] of [[errB, 'before'], [errA, 'after']]) if (r.status === 'rejected') throw new Error(`the ${side} copy could not reach this moment: ${r.reason.message.split('\n')[0]}`);
      await Promise.all([settle(pb), settle(pa)]);
      const [imgB, imgA] = (await Promise.all([pb.screenshot({ animations: 'disabled', caret: 'hide' }), pa.screenshot({ animations: 'disabled', caret: 'hide' })])).map(b => b.toString('base64'));
      const cmp = await cmpPage.evaluate(COMPARE, { a: imgB, b: imgA, tolerance: TOLERANCE, gap: MERGE_GAP });
      compared++;
      if (!cmp.boxes.length) { log(`  ok       ${label}: identical`); await Promise.all([pb.context().close(), pa.context().close()]); continue; }

      const rects = ALLOW.length ? (await Promise.all([pb, pa].map(p => p.evaluate(ALLOW_RECTS, ALLOW)))).flat() : [];
      const names = cmp.sizeDiffers ? [{ around: 'the whole screen', others: [], where: 'everywhere' }] : await pa.evaluate(DESCRIBE, { boxes: cmp.boxes, vw: device.viewport.width, vh: device.viewport.height });
      let outsideHere = 0;
      cmp.boxes.forEach((b, i) => {
        const inside = rects.find(r => b.x >= r.x - ALLOW_PAD && b.y >= r.y - ALLOW_PAD && b.x + b.w <= r.x + r.w + ALLOW_PAD && b.y + b.h <= r.y + r.h + ALLOW_PAD);
        const n = names[i];
        const text = `${n.around} (${n.where}, ${b.w}×${b.h} px at ${b.x},${b.y})${n.others.length ? `, also under it: ${n.others.slice(0, 3).join(', ')}` : ''}`;
        if (inside) { allowedN++; log(`  allowed  ${label}: changed around ${text}, inside ${inside.sel}`); }
        else { outsideN++; outsideHere++; log(`  OUTSIDE  ${label}: changed around ${text}`); }
      });
      if (cmp.sizeDiffers) log(`           the two pictures differ in size: before ${cmp.sizes[0].join('×')}, after ${cmp.sizes[1].join('×')}`);
      if (outsideHere) {
        const stem = path.join(OUT, `${device.name}-${slug(moment.name)}`);
        await writeFile(`${stem}-before.png`, Buffer.from(imgB, 'base64'));
        await writeFile(`${stem}-after.png`, Buffer.from(imgA, 'base64'));
        if (cmp.highlight) await writeFile(`${stem}-diff.png`, Buffer.from(cmp.highlight, 'base64'));
      }
    } catch (e) {
      broken++;
      log(`  BROKEN   ${label}: ${e.message}`);
    } finally {
      await Promise.all([pb?.context().close(), pa?.context().close()].filter(Boolean)).catch(() => {});
    }
  }
  return lines;
};
// one device at a time: pictures taken while the machine is busy with another page drift
for (const device of DEVICES) (await runDevice(device)).forEach(l => console.log(l));

await browser.close();
srvBefore.close(); srvAfter.close();
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n${compared} pictures compared (${DEVICES.map(d => d.name).join(' + ')}), ${allowedN} differences in the allowed area, ${outsideN} outside it${broken ? `, ${broken} moments could not be reached` : ''}. (${secs} s)`);
if (outsideN || broken) {
  if (outsideN) console.log(`Before, after and highlighted pictures of the failing moments: ${OUT}`);
  console.log('FAILED');
  process.exit(1);
}
console.log('PASSED');
process.exit(0);
