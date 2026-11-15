// Shared: serve the repo, open the app with the firmer words (#176's mid.css) laid over, reach each screen.
import http from 'node:http'; import path from 'node:path'; import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
export const { chromium } = pw;
export const REPO = '/home/user/BetweenUs';
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
export function serve(dir = REPO) {
  return new Promise(resolve => { const s = http.createServer(async (req, res) => { try {
    const u = decodeURIComponent(req.url.split('?')[0]); const f = path.join(dir, u === '/' ? '/between-us.html' : u);
    const d = await readFile(f); res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d);
  } catch { res.writeHead(404); res.end('x'); } }); s.listen(0, '127.0.0.1', () => resolve(s)); });
}
function init() { let seed = 123456789; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const FIXED = Date.UTC(2026, 0, 15, 12, 0, 0); const R = Date; class F extends R { constructor(...a) { if (a.length) super(...a); else super(FIXED); } static now() { return FIXED; } } globalThis.Date = F;
  try { localStorage.setItem('bu.wildcards', '0'); } catch {} }
export const DEVICES = { phone: { viewport: { width: 412, height: 915 }, hasTouch: true }, wide: { viewport: { width: 1440, height: 900 }, hasTouch: false } };
export async function settle(page) { await page.evaluate(async () => { await document.fonts.ready;
  for (let i = 0; i < 20; i++) { const r = document.getAnimations().filter(a => a.playState === 'running' && Number.isFinite(a.effect?.getComputedTiming().endTime)); if (!r.length) break;
    await Promise.race([Promise.allSettled(r.map(a => a.finished)), new Promise(r2 => setTimeout(r2, 1500))]); }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }); await page.waitForTimeout(200); }
export async function openApp(browser, port, dev, scale = 1) {
  const ctx = await browser.newContext({ ...DEVICES[dev], deviceScaleFactor: scale, reducedMotion: 'reduce', serviceWorkers: 'block', locale: 'en-US', timezoneId: 'UTC' });
  await ctx.addInitScript(init); const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/between-us.html`); await page.waitForSelector('#card', { state: 'visible' });
  const mid = await readFile(REPO + '/.claude/keeper/agreements/2026-11-14-weight-r2/mid.css', 'utf8');
  await page.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Jost:wght@500;600&family=Cormorant+Garamond:wght@500&display=swap' });
  await page.addStyleTag({ content: mid }); await page.evaluate(() => document.body.classList.add('hv'));
  await settle(page); return page;
}
const waitCard = (page, n) => page.waitForFunction(i => state.currentIndex + 1 === i, n, { timeout: 5000 });
const drawFirst = async page => { await page.locator('#btn-next').click(); await waitCard(page, 1); };
const smallHand = async page => { await page.evaluate(() => { closePicker(); state.pickOptions = null; setTwist(false); state.randomMode = 'arc'; state.cardLimit = 5; syncLimitButtons();
  state.sessionLog = []; state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {}; renderLog(); initDeck(); renderShell(); }); await page.waitForTimeout(250); };
export const MOMENTS = [
  { key: 'start', name: 'The start', run: async () => {} },
  { key: 'card', name: 'A card', run: async p => { await smallHand(p); await drawFirst(p); await p.locator('#btn-next').click(); await waitCard(p, 2); } },
  { key: 'deck', name: 'The Deck', run: async p => { await p.locator('#tokCats').click({ force: true }); await p.waitForFunction(() => document.getElementById('cat-area').classList.contains('sheet-open'), null, { timeout: 3000 }); } },
  { key: 'menu', name: 'The menu', run: async p => { await p.locator('#btn-menu').click(); await p.waitForFunction(() => document.querySelector('#menuDrawer.open, #menuSideDrawer.open') !== null, null, { timeout: 3000 }); } },
  { key: 'spot', name: 'Spotlight', run: async p => { await drawFirst(p); await p.locator('#btnParty').click(); await p.waitForFunction(() => document.getElementById('partyOverlay').classList.contains('open'), null, { timeout: 3000 }); } },
  { key: 'end', name: 'The end of a hand', run: async p => { await smallHand(p); for (let i = 0; i < 20 && !(await p.evaluate(() => state.currentIndex >= state.visibleDeck.length)); i++) { await p.locator('#card').click(); await p.waitForTimeout(300); }
    await p.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 8000 }); await p.waitForTimeout(1000); } },
  { key: 'help', name: 'Help', run: async p => { await p.evaluate(() => openDrawer('helpDrawer')); await p.waitForTimeout(600); } },
  { key: 'played', name: 'Played', run: async p => { await smallHand(p); await drawFirst(p); await p.locator('#btn-next').click(); await waitCard(p, 2); await p.locator('#btn-next').click(); await waitCard(p, 3); await p.evaluate(() => openDrawer('playedDrawer')); await p.waitForTimeout(600); } },
];
