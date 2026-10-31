#!/usr/bin/env node
// Plain-script regression harness for Between Us. No test framework — a
// runnable checklist that drives the real app in a real browser and asserts
// on real DOM state. Deliberately dependency-light: this app has no build
// step, so its tests shouldn't need one either.
//
// Usage: node tests/run.mjs [file.html]   (default: between-us.html)

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Use the local `playwright` (npm install in tests/) when present; otherwise
// fall back to the shared install in the cloud sessions (/opt/node-tools).
const FALLBACK_PW = '/opt/node-tools/node_modules/playwright';
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (e) {
  if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
  ({ chromium } = createRequire(import.meta.url)(FALLBACK_PW));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = process.argv[2] || 'between-us.html';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = path.join(ROOT, urlPath === '/' ? '/between-us.html' : urlPath);
        if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
        const data = await readFile(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch (e) {
        res.writeHead(404); res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ── assertion bookkeeping ──────────────────────────────────────────────────
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e.message || String(e) });
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${e.message || e}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

// ── in-page helpers ─────────────────────────────────────────────────────────
// Read the real state instead of parsing the rendered "n / total"
// (#progCountNum): more robust, and works before any card is drawn
// (index -1).
async function cardParts(page) {
  return page.evaluate(() => ({ index: state.currentIndex + 1, total: state.visibleDeck.length }));
}
async function questionText(page) { return (await page.locator('#card-question').textContent()).trim(); }
// Polls real DOM state instead of sleeping a fixed duration — the draw
// animation's length is a styling detail, not a contract, so a test that
// waits for it to *finish* (rather than guessing how long it takes) doesn't
// need re-tuning every time that duration changes.
async function waitForCardIndex(page, n, timeout = 3000) {
  await page.waitForFunction((expected) => state.currentIndex + 1 === expected, n, { timeout });
}

// Dispatch a synthetic touch swipe on an element, optionally followed by the
// synthetic 'click' mobile browsers fire after a touch gesture — this is
// exactly the double-fire scenario the app's swipe handling exists to
// prevent. A real browser skips that synthetic click when touchend's
// preventDefault() was called, so `thenClick` mimics that faithfully
// instead of firing the click unconditionally.
async function swipe(page, selector, dx, dy, { thenClick = false } = {}) {
  await page.evaluate(({ selector, dx, dy, thenClick }) => {
    const el = document.querySelector(selector);
    const rect = el.getBoundingClientRect();
    const x0 = rect.left + rect.width / 2, y0 = rect.top + rect.height / 2;
    const x1 = x0 + dx, y1 = y0 + dy;
    function touchEvt(type, x, y) {
      const touch = new Touch({ identifier: Date.now() + Math.random(), target: el, clientX: x, clientY: y });
      return new TouchEvent(type, {
        touches: type === 'touchend' ? [] : [touch],
        changedTouches: [touch],
        bubbles: true, cancelable: true,
      });
    }
    el.dispatchEvent(touchEvt('touchstart', x0, y0));
    const endEvt = touchEvt('touchend', x1, y1);
    el.dispatchEvent(endEvt);
    if (thenClick && !endEvt.defaultPrevented) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, { selector, dx, dy, thenClick });
}

async function pointerHold(page, selector, ms) {
  await page.evaluate(({ selector }) => {
    const el = document.querySelector(selector);
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  }, { selector });
  await page.waitForTimeout(ms);
  await page.evaluate(({ selector }) => {
    const el = document.querySelector(selector);
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, { selector });
}

// Three, Spotlight and Twist wait for the first card of a hand — draw it.
async function drawFirstIfNeeded(page) {
  if ((await cardParts(page)).index === 0) { await page.locator('#btn-next').click(); await page.waitForFunction(() => !document.getElementById('pickToggle').classList.contains('disabled'), null, { timeout: 4000 }); }
}

async function run() {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch();
  // Between Us is designed mobile-first ("hand it to someone" — see README);
  // a desktop-width viewport leaves category-sheet elements sitting under
  // pointer-events:none, which isn't a real bug, just an untested layout.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  console.log(`\nBetween Us regression harness — ${TARGET}\n`);

  await page.goto(`http://127.0.0.1:${port}/${TARGET}`);
  await page.waitForSelector('#card', { state: 'visible' });
  await page.waitForTimeout(500); // entrance animations / initDeck settle

  // ── A. Initial load ──────────────────────────────────────────────────────
  // Between Us has no intro screen (deliberately) — it loads categories active
  // but no card drawn yet, waiting for the first tap. See "NO INTRO" comment
  // near the top of the file.
  await check('initial load shows the "draw a card" placeholder, not a card', async () => {
    const q = await questionText(page);
    assert(/draw a card|trek een kaart|place to begin|plek om te beginnen/i.test(q), `expected the draw-to-begin placeholder, got "${q}"`);
    const { index } = await cardParts(page);
    assert(index === 0, `expected no card drawn yet (index 0, i.e. currentIndex -1), got index ${index}`);
  });

  await check('first tap on the card draws card 1 of the hand', async () => {
    await page.locator('#card').click();
    // the first draw of a hand plays the (longer) shuffle animation rather
    // than the plain 175ms flip — see .card.drawing-in in styles.css; wait for
    // the actual reveal instead of guessing its duration
    await waitForCardIndex(page, 1);
    const { index, total } = await cardParts(page);
    assert(index === 1, `expected card 1, got ${index}`);
    assert(total > 0, 'deck total is 0');
  });

  // ── B. Card tap advances ─────────────────────────────────────────────────
  await check('tapping the card advances to the next one', async () => {
    const before = await cardParts(page);
    const beforeQ = await questionText(page);
    await page.locator('#card').click();
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    const afterQ = await questionText(page);
    assert(after.index === before.index + 1, `index ${before.index} -> ${after.index}`);
    assert(afterQ !== beforeQ, 'question text did not change');
  });

  // ── C. Keyboard arrows ────────────────────────────────────────────────────
  await check('ArrowLeft/ArrowRight move the deck cursor', async () => {
    const before = await cardParts(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const afterRight = await cardParts(page);
    assert(afterRight.index === before.index + 1, `ArrowRight: ${before.index} -> ${afterRight.index}`);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    const afterLeft = await cardParts(page);
    assert(afterLeft.index === before.index, `ArrowLeft did not return to ${before.index}, got ${afterLeft.index}`);
  });

  // ── D. Swipe left/right, with the mobile synthetic-click-after-touch guard ─
  await check('swipe left advances exactly one card (no double-fire from synthetic click)', async () => {
    const before = await cardParts(page);
    await swipe(page, '#card', -120, 0, { thenClick: true });
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.index === before.index + 1, `expected +1, got ${before.index} -> ${after.index}`);
  });

  await check('swipe right (on the card body) goes back one card', async () => {
    const before = await cardParts(page);
    await swipe(page, '#card', 120, 0, { thenClick: true });
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.index === before.index - 1, `expected -1, got ${before.index} -> ${after.index}`);
  });

  // ── E. Swipe down skips the current card ────────────────────────────────
  await check('swipe down skips exactly one card (no double-fire from synthetic click)', async () => {
    const before = await cardParts(page);
    await swipe(page, '#card', 0, 100, { thenClick: true });
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.total === before.total - 1, `expected total ${before.total - 1}, got ${after.total}`);
  });

  // ── E2. Skip-undo: the skipped card comes back at the same position ──────
  await check('skip-undo restores the skipped card', async () => {
    const before = await cardParts(page);
    const beforeQ = await questionText(page);
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(300);
    const undoBtn = page.locator('#skipUndo');
    assert(await undoBtn.evaluate(el => el.classList.contains('visible')), 'undo button did not appear after a skip');
    await undoBtn.click();
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    const afterQ = await questionText(page);
    assert(after.total === before.total, `deck total did not restore: ${before.total} -> ${after.total}`);
    assert(afterQ === beforeQ, `card did not come back (${beforeQ} vs ${afterQ})`);
    assert(!(await undoBtn.evaluate(el => el.classList.contains('visible'))), 'undo button stayed visible after use');
  });

  // ── F. Category toggle reshuffles the deck and updates the token line ──────
  // Categories live in a sheet overlay (#cat-area), opened via the #tokCats
  // token — not the legacy #catLabel, which the adaptation layer left behind
  // display:none. This split (dead old control, live new one) is exactly the
  // kind of thing the refactor is meant to clean up.
  async function openCategorySheet() {
    const catArea = page.locator('#cat-area');
    if (!(await catArea.evaluate(el => el.classList.contains('sheet-open')))) {
      await page.locator('#tokCats').click();
      await page.waitForTimeout(300);
    }
    // the sheet has an opacity/transform transition; wait it out so later
    // clicks don't race a still-animating overlay
    await catArea.evaluate(el => new Promise(res => {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) >= 0.99) return res();
      const done = () => { el.removeEventListener('transitionend', done); res(); };
      el.addEventListener('transitionend', done);
      setTimeout(done, 500);
    }));
  }
  async function closeCategorySheet() {
    const catArea = page.locator('#cat-area');
    if (await catArea.evaluate(el => el.classList.contains('sheet-open'))) {
      await page.locator('#catClose').click();
      await page.waitForTimeout(300);
    }
    // Belt-and-braces: every later test needs this sheet out of the way, and
    // an overlay left open (e.g. by a click that landed a beat early) blocks
    // every click after it, so verify and force-close if it's still up.
    if (await catArea.evaluate(el => el.classList.contains('sheet-open'))) {
      await page.locator('#catClose').click({ force: true });
      await page.waitForTimeout(300);
    }
  }

  // The token now shows a computed "mood" word rather than a raw count, so
  // it doesn't necessarily change on every toggle (two selections can land
  // in the same mood band) — check the underlying state directly instead.
  // `state` is a top-level `const` in a classic script, so it's not on
  // `window` — but page.evaluate() shares that same global lexical scope,
  // so the bare identifier resolves fine.
  async function activeToggleCount() { return page.evaluate(() => state.activeToggles.size); }

  await check('tapping a chapter row switches its categories on or off and reshuffles the deck; the fold target only opens it', async () => {
    try {
      await openCategorySheet();
      // Each chapter row switches the whole chapter; its right-hand count + chevron
      // unfolds the chapter's categories in place without touching the selection.
      const row = page.locator('.chapter[data-chapter="surface"]');
      assert(await row.count() > 0, 'expected a "surface" chapter row');
      const before = await activeToggleCount();
      await row.locator('.ch-fold').click();
      await page.waitForTimeout(450);
      assert((await activeToggleCount()) === before, 'unfolding a chapter changed the selection');
      assert(await page.locator('.chapter-panel[data-chapter="surface"] .toggle-btn').count() > 0, 'unfolded chapter shows no categories');
      await row.locator('.ch-hit').click({ force: true });
      await page.waitForTimeout(300);
      const after = await activeToggleCount();
      assert(after !== before, `active category count did not change (${before})`);
      // A toggle change calls initDeck(), which resets to the "draw a card"
      // placeholder (no auto-drawn first card — see the NO INTRO note up top).
      const { index: resetIndex } = await cardParts(page);
      assert(resetIndex === 0, `deck did not reset to the draw-to-begin placeholder, currentIndex+1 was ${resetIndex}`);
      // restore for later tests
      await row.locator('.ch-hit').click({ force: true });
      await page.waitForTimeout(300);
      assert((await activeToggleCount()) === before, 'active category count did not restore');
    } finally {
      await closeCategorySheet();
    }
  });

  await check('a single category in an unfolded chapter toggles on its own, the chapter count follows, and None clears everything', async () => {
    try {
      await openCategorySheet();
      const row = page.locator('.chapter[data-chapter="surface"]');
      // folds keep their state between visits to the sheet — open it only if it is shut
      if (!(await row.locator('.ch-fold').evaluate(el => el.classList.contains('open')))) {
        await row.locator('.ch-fold').click();
        await page.waitForTimeout(450);
      }
      const cat = page.locator('.chapter-panel[data-chapter="surface"] .toggle-btn:visible').first();
      const was = await cat.evaluate(el => el.classList.contains('on'));
      const ctBefore = await row.locator('.ch-ct').textContent();
      await cat.click();
      await page.waitForTimeout(300);
      assert((await cat.evaluate(el => el.classList.contains('on'))) !== was, 'category did not toggle');
      assert((await row.locator('.ch-ct').textContent()) !== ctBefore, 'chapter count did not follow the category');
      await cat.click(); await page.waitForTimeout(300);
      assert((await row.locator('.ch-ct').textContent()) === ctBefore, 'chapter count did not restore');
      const keep = await page.evaluate(() => ({ t: [...state.activeToggles], p: state.activePreset }));
      await page.locator('#deselectAll').click();
      await page.waitForTimeout(300);
      assert((await activeToggleCount()) === 0, 'None did not clear every category');
      await page.evaluate(k => { applyPreset(k.p); state.activeToggles = new Set(k.t); document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === k.p)); applyToggleUI(); initDeck(); }, keep);
    } finally {
      await closeCategorySheet();
    }
  });

  await check('the deck reads "Custom" when the selection leaves the preset, undoing the edit brings the preset back, None is Custom, and picking a preset names it', async () => {
    try {
      await openCategorySheet();
      const token = () => page.locator('#valCats').textContent().then(s => s.trim());
      await page.locator('.mode-btn[data-mode="balanced"]').click();
      await page.waitForTimeout(300);
      assert((await token()) === 'Balanced', 'Balanced did not name the deck');
      await page.evaluate(() => document.querySelector('.chapter[data-chapter="surface"] .ch-fold')?.classList.contains('open') ||
        document.querySelector('.chapter[data-chapter="surface"] .ch-fold').click());
      await page.waitForTimeout(450);
      const cat = page.locator('.chapter-panel[data-chapter="surface"] .toggle-btn:visible').first();
      await cat.click(); await page.waitForTimeout(300);
      assert((await token()) === 'Custom', 'one category tap did not make the deck Custom');
      assert((await page.locator('.mode-btn.active').count()) === 0, 'a preset stayed highlighted while Custom');
      await cat.click(); await page.waitForTimeout(300);
      assert((await token()) === 'Balanced', 'undoing the tap did not bring Balanced back');
      assert(await page.locator('.mode-btn[data-mode="balanced"]').evaluate(el => el.classList.contains('active')), 'Balanced not highlighted again');
      await page.locator('#deselectAll').click(); await page.waitForTimeout(300);
      assert((await token()) === 'Custom', 'None did not make the deck Custom');
      await page.locator('.mode-btn[data-mode="friends"]').click(); await page.waitForTimeout(300);
      assert((await token()) === 'Friends', 'picking Friends did not name the deck');
      await page.locator('.mode-btn[data-mode="balanced"]').click(); await page.waitForTimeout(300);
    } finally {
      await closeCategorySheet();
    }
  });

  await check('After Dark keeps the preset (Partner + Flesh stays Partner, Balanced + Flesh stays Balanced); Us: Intimate in Balanced and any other category still make it Custom', async () => {
    try {
      await openCategorySheet();
      const token = () => page.locator('#valCats').textContent().then(s => s.trim());
      // the same path a category button takes: toggle, then re-read the preset
      const toggle = lvl => page.evaluate(l => {
        state.activeToggles[state.activeToggles.has(l) ? 'delete' : 'add'](l);
        syncActivePreset(); applyToggleUI(); initDeck();
      }, lvl);
      const pick = async mode => { await page.locator(`.mode-btn[data-mode="${mode}"]`).click(); await page.waitForTimeout(300); };
      await pick('partner');
      await page.evaluate(() => openAfterDark());
      await toggle('flesh');
      assert((await token()) === 'Partner', `Partner + Flesh read "${await token()}"`);
      assert(await page.locator('.mode-btn[data-mode="partner"]').evaluate(el => el.classList.contains('active')), 'Partner lost its active button');
      await toggle('flesh');
      assert((await token()) === 'Partner', 'removing Flesh again lost Partner');
      await toggle('usintimate');
      assert((await token()) === 'Partner', `Partner + Us: Intimate read "${await token()}"`);
      await toggle('usintimate');
      await pick('balanced');
      await page.evaluate(() => openAfterDark());
      await toggle('flesh');
      assert((await token()) === 'Balanced', `Balanced + Flesh read "${await token()}"`);
      await toggle('usintimate');
      assert((await token()) === 'Custom', `Balanced + Us: Intimate read "${await token()}"`);
      await toggle('usintimate');
      assert((await token()) === 'Balanced', 'removing Us: Intimate did not bring Balanced back');
      await toggle('culture');
      assert((await token()) === 'Custom', 'Balanced without Culture did not read Custom');
      await pick('balanced');
    } finally {
      await closeCategorySheet();
    }
  });

  await check('the None control turns into All once nothing is on, and All switches on every category the limits allow (After Dark included, Coworkers stays within its limits)', async () => {
    try {
      await openCategorySheet();
      const label = () => page.locator('#deselectAll').textContent().then(s => s.trim());
      const click = async () => { await page.locator('#deselectAll').click(); await page.waitForTimeout(300); };
      const shownCats = () => page.evaluate(() => [...document.querySelectorAll('.toggle-btn')]
        .filter(b => b.dataset.level && b.style.display !== 'none' && !OPT_IN_ONLY.includes(b.dataset.level)).map(b => b.dataset.level));
      const onCats = () => page.evaluate(() => [...state.activeToggles]);
      await page.locator('.mode-btn[data-mode="balanced"]').click(); await page.waitForTimeout(300);
      assert((await label()) === 'None', 'label was not None while categories are on');
      await click();
      assert((await label()) === 'All' && (await onCats()).length === 0, 'None did not clear everything and read All');
      await click();
      assert((await label()) === 'None', 'All did not flip the label back to None');
      const shown = await shownCats(), on = await onCats();
      assert(shown.every(l => on.includes(l)), 'All left a shown category off');
      assert(await page.evaluate(() => SAFE_BLOCKED_LEVELS.some(l => state.activeToggles.has(l))), 'All did not switch After Dark categories on');
      assert((await page.locator('#subtitle').textContent()).trim() === 'Off script.', 'All did not leave the deck Custom');
      // switching the last category off by hand also reads All
      await page.evaluate(() => { state.activeToggles.clear(); applyToggleUI(); });
      assert((await label()) === 'All', 'an empty selection did not read All');
      await page.locator('.mode-btn[data-mode="work"]').click(); await page.waitForTimeout(300);
      await click(); await click();
      const workOn = await onCats();
      assert(workOn.length > 0 && !workOn.includes('deep') && !(await page.evaluate(() => SAFE_BLOCKED_LEVELS.some(l => state.activeToggles.has(l)))), 'All in Coworkers went past its limits');
      assert(await page.evaluate(() => state.safeMode), 'All in Coworkers opened After Dark');
      await page.locator('.mode-btn[data-mode="balanced"]').click(); await page.waitForTimeout(300);
    } finally {
      await closeCategorySheet();
    }
  });

  await check('presets limit the sheet: Coworkers hides Into the Deep and After Dark, Family hides After Dark, Custom keeps the limits and reads "Off script.", Open all opens the shown chapters', async () => {
    try {
      await openCategorySheet();
      const shown = ch => page.locator(`.chapter-group[data-group="${ch}"]`).evaluate(el => getComputedStyle(el).display !== 'none' && !el.classList.contains('ch-hidden'));
      const subtitle = () => page.locator('#subtitle').textContent().then(s => s.trim());
      const visibleCats = () => page.evaluate(() => [...document.querySelectorAll('.toggle-btn')].filter(b => b.style.display !== 'none').map(b => b.dataset.level));
      await page.locator('.mode-btn[data-mode="work"]').click(); await page.waitForTimeout(300);
      assert(!(await shown('deeper')) && !(await shown('afterdark')), 'Coworkers still shows Into the Deep or After Dark');
      assert((await shown('surface')) && (await shown('warmup')), 'Coworkers lost a chapter it can reach');
      assert((await subtitle()) === 'Professional, mostly.', 'Coworkers subtitle missing');
      const allowedOff = await page.evaluate(() => PRESETS.work.available.filter(l => DECK_LEVELS.has(l) && !SAFE_BLOCKED_LEVELS.includes(l) && document.querySelector(`.toggle-btn[data-level="${l}"]`)));
      const vis = await visibleCats();
      assert(allowedOff.length > 0 && allowedOff.every(l => vis.includes(l)), 'allowed-but-off categories are not shown');
      assert(!vis.includes('deep') && !vis.includes('carnal'), 'a category outside Coworkers is shown');
      // one change: the deck is Custom, the limits stay, the preset's tagline gives way
      const row = page.locator('.chapter[data-chapter="surface"]');
      await row.locator('.ch-hit').click({ force: true }); await page.waitForTimeout(300);
      assert((await page.locator('#valCats').textContent()).trim() === 'Custom', 'a change from Coworkers did not make the deck Custom');
      assert((await subtitle()) === 'Off script.', `Custom subtitle was "${await subtitle()}"`);
      assert(!(await shown('deeper')) && !(await shown('afterdark')), 'going Custom lifted the Coworkers limits');
      assert(!(await visibleCats()).includes('deep'), 'a chapter tap unhid a locked category');
      await row.locator('.ch-hit').click({ force: true }); await page.waitForTimeout(300);
      assert((await subtitle()) === 'Professional, mostly.', 'undoing the change did not bring the Coworkers subtitle back');
      // Open all / Close all
      const folds = () => page.evaluate(() => [...document.querySelectorAll('.chapter-group:not(.ch-hidden):not(.chapter-group--fixed) .ch-fold')].map(f => f.classList.contains('open')));
      const foldAll = page.locator('#foldAll');
      if ((await foldAll.textContent()) === 'Close all') { await foldAll.click(); await page.waitForTimeout(450); }
      assert((await foldAll.textContent()) === 'Open all', 'fold control should offer Open all');
      await foldAll.click(); await page.waitForTimeout(450);
      const opened = await folds();
      assert(opened.length === 3 && opened.every(Boolean), `Open all left shown chapters shut: ${opened}`);
      assert((await page.locator('.chapter-group[data-group="deeper"] .chapter-panel.open').count()) === 0, 'Open all opened a hidden chapter');
      assert((await foldAll.textContent()) === 'Close all', 'control should read Close all once everything is open');
      await foldAll.click(); await page.waitForTimeout(450);
      assert((await folds()).every(o => !o), 'Close all left a chapter open');
      await page.locator('.mode-btn[data-mode="family_p"]').click(); await page.waitForTimeout(300);
      assert(!(await shown('afterdark')) && (await shown('deeper')), 'Family should hide only After Dark');
      await page.locator('.mode-btn[data-mode="open"]').click(); await page.waitForTimeout(300);
      assert(await shown('deeper'), 'Everything lost Into the Deep');
    } finally {
      await page.locator('.mode-btn[data-mode="balanced"]').click(); await page.waitForTimeout(300);
      await closeCategorySheet();
    }
  });

  // ── G. Draw-three picker ─────────────────────────────────────────────────
  await check('draw-three picker opens instantly on toggle and choosing an option advances to it', async () => {
    await closeCategorySheet(); // idempotent — guards against a sheet left open by a prior step
    // Three waits for the first card of a hand: draw one, then turn it on
    // (turning pick mode on then draws the three options itself)
    await drawFirstIfNeeded(page);
    await page.locator('#pickToggle').click();
    await page.waitForTimeout(400);
    const picker = page.locator('#cardPicker');
    assert(await picker.evaluate(el => el.classList.contains('open')), 'picker did not open');
    const opts = page.locator('#pickerOptions .pick-opt');
    const n = await opts.count();
    assert(n >= 2, `expected >=2 pick options, got ${n}`);
    const chosenText = await opts.nth(0).locator('.pick-opt-q').textContent();
    await opts.nth(0).click();
    await page.waitForTimeout(300);
    assert(!(await picker.evaluate(el => el.classList.contains('open'))), 'picker did not close');
    const q = await questionText(page);
    assert(q === chosenText.trim(), `card did not flip to chosen option (${q} vs ${chosenText})`);
    await page.locator('#pickToggle').click(); // turn pick mode back off
    await page.waitForTimeout(300);
  });

  // ── H. Drawer overlay click closes the drawer ───────────────────────────
  await check('menu drawer opens on btn-menu and closes on overlay click', async () => {
    await closeCategorySheet();
    await page.locator('#btn-menu').click();
    await page.waitForTimeout(300);
    const drawer = page.locator('#menuDrawer');
    assert(await drawer.evaluate(el => el.classList.contains('open')), 'menu drawer did not open');
    // #overlay spans the full viewport, so a default center-point click can
    // land on drawer content instead of exposed backdrop once the drawer
    // has enough rows to reach the middle of the screen — pinned to the
    // top-left corner instead, which stays clear of the drawer regardless
    // of how tall its content grows.
    await page.locator('#overlay').click({ force: true, position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    assert(!(await drawer.evaluate(el => el.classList.contains('open'))), 'menu drawer did not close on overlay click');
  });

  // ── I. After Dark toggle ─────────────────────────────────────────────────
  // #afterDarkToggle itself is legacy now (kept only so the old preset /
  // hard-safe-mode logic still has something to read — its row is
  // permanently display:none, see .cat-topbar--legacy). The real, current
  // entry point is the "After Dark" chapter row in the sheet.
  await check('the After Dark chapter row adds adult categories to the active set', async () => {
    const legacyBtn = page.locator('#afterDarkToggle');
    if (await legacyBtn.evaluate(el => el.style.display === 'none')) {
      console.log('  \x1b[33m·\x1b[0m (hard-locked in this profile — skipped, counted as pass)');
      return;
    }
    try {
      await openCategorySheet();
      const bucket = page.locator('.chapter[data-chapter="afterdark"]');
      assert(await bucket.count() > 0, 'expected an "afterdark" chapter row');
      const before = await activeToggleCount();
      await bucket.locator('.ch-hit').click({ force: true });
      await page.waitForTimeout(300);
      const after = await activeToggleCount();
      assert(after !== before, `active category count did not change after toggling After Dark (${before})`);
      await bucket.locator('.ch-hit').click({ force: true }); // restore
      await page.waitForTimeout(300);
      assert((await activeToggleCount()) === before, 'active category count did not restore');
    } finally {
      await closeCategorySheet();
    }
  });

  // ── J. Fullscreen party tap zones ────────────────────────────────────────
  await check('fullscreen party mode: enter, tap zones move the deck, exit', async () => {
    await closeCategorySheet();
    await drawFirstIfNeeded(page);   // Spotlight waits for the first card of a hand
    await page.locator('#btnParty').click();
    await page.waitForTimeout(300);
    const overlay = page.locator('#partyOverlay');
    assert(await overlay.evaluate(el => el.classList.contains('open')), 'party overlay did not open');
    const before = await cardParts(page);
    const countBefore = await page.locator('#party-count').textContent();
    await page.locator('#partyOverlay .party-card').click();
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.index === before.index + 1, `party tap did not advance: ${before.index} -> ${after.index}`);
    const countAfter = await page.locator('#party-count').textContent();
    assert(countAfter !== countBefore, `#party-count did not update on advance: "${countBefore}" -> "${countAfter}"`);
    await page.locator('#partyExit').click();
    await page.waitForTimeout(300);
    assert(!(await overlay.evaluate(el => el.classList.contains('open'))), 'party overlay did not close');
  });

  // ── J2. Spotlight mirrors the main screen: star lights, Twist keeps its icon and key hint ──
  await check('Spotlight: tapping the star lights #partyStar; Twist keeps icon and T hint', async () => {
    await closeCategorySheet();
    await drawFirstIfNeeded(page);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(300);
    const starOn = () => page.evaluate(() => document.getElementById('partyStar').classList.contains('on'));
    const was = await starOn();
    await page.locator('#partyStar').click();
    await page.waitForTimeout(200);
    assert((await starOn()) === !was, 'tapping the star in Spotlight did not toggle #partyStar');
    assert((await page.evaluate(() => document.getElementById('cardStar').classList.contains('active'))) === !was, '#cardStar out of step with #partyStar');
    await page.locator('#partyStar').click();   // put it back
    await page.waitForTimeout(150);
    assert((await starOn()) === was, 'star did not toggle back');
    await page.evaluate(() => toggleTwist());
    await page.waitForTimeout(200);
    const tw = await page.evaluate(() => { const b = document.getElementById('partyBtnTwist'); return { svg: !!b.querySelector('svg'), key: !!b.querySelector('.party-key'), lbl: b.querySelector('.row-lbl').textContent, active: b.classList.contains('active') }; });
    assert(tw.svg && tw.key && tw.lbl === 'Twist' && tw.active, 'Twist button in Spotlight lost its icon, key hint or label: ' + JSON.stringify(tw));
    await page.evaluate(() => clearTwist());
    await page.locator('#partyExit').click();
    await page.waitForTimeout(300);
  });

  // ── K. End of hand: Intermezzo, tap to flip to the list, hold (either side) to continue ──
  const imAtEnd = async () => await page.evaluate(() => document.body.classList.contains('showing-hand-summary'));
  const imSide = async () => await page.evaluate(() => state.handSide);
  const imWaitSide = async (side) => { await page.waitForFunction(s => state.handSide === s, side, { timeout: 3000 }); await page.waitForTimeout(1000); };   // the turn takes 0.9s, face swaps at 450ms
  const imHold = async (selector) => { await pointerHold(page, selector, 650); await page.waitForTimeout(400); };
  // A tap: press and release well under the hold threshold, then the click a tap leaves behind.
  const imTap = async (selector) => {
    await page.evaluate(sel => document.querySelector(sel).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })), selector);
    await page.waitForTimeout(80);
    await page.evaluate(sel => {
      const el = document.querySelector(sel);
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }, selector);
    await page.waitForTimeout(1000);   // the turn takes 0.9s
  };
  const imBtn = async () => (await page.locator('#btn-next').textContent()).trim();

  await check('end of hand: the card shows its back with the pause mark and INTERMEZZO; the old summary is gone; Tap to flip card', async () => {
    // Run the current hand out to its end (tap through, waiting out the
    // 175ms flip animation each time so we don't race the DOM update),
    // then the end message and its fade before showHandSummary().
    for (let i = 0; i < 20 && !(await page.evaluate(() => state.currentIndex >= state.visibleDeck.length)); i++) {
      await page.locator('#card').click();
      await page.waitForTimeout(300);
    }
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 }).catch(() => {});   // the message, then the turn
    await page.waitForTimeout(600);
    assert(await imAtEnd(), `did not reach the end of the hand after 20 taps (${await questionText(page)})`);
    assert((await imSide()) === 'intermezzo', `end of hand did not open on Intermezzo: ${await imSide()}`);
    assert(await page.locator('#card-wrap').isVisible(), 'card-wrap disappeared at the end of the hand');
    assert(await page.locator('#handActionsRow').isVisible(), 'the Change/Save row did not appear');
    assert(!(await page.locator('#screenRow').isVisible()), 'three/Full Screen/Twist stayed visible at the end of the hand');
    const cls = await page.locator('#card').evaluate(el => [...el.classList]);
    assert(cls.includes('is-start') && cls.includes('is-intermezzo') && !cls.includes('is-hand-list'), `card classes at Intermezzo: ${cls}`);
    assert(await page.locator('#card .cb-fermata').isVisible(), 'the pause mark is not visible on the back');
    assert(await page.locator('#card .cb-caption').isVisible(), 'the INTERMEZZO word is not visible');
    assert((await page.locator('#card .cb-caption').evaluate(el => getComputedStyle(el).textTransform)) === 'uppercase', 'the caption is not in capitals');
    assert(!(await page.locator('#card .cb-mark:not(.cb-fermata)').first().isVisible()), 'the start logo shows on the Intermezzo back');
    const bodyText = await page.locator('body').innerText();
    assert(!/set is finished|You began at|cards? you starred/i.test(bodyText), 'old end-of-hand summary text is still on screen');
    assert(await page.locator('#card .es-chip, #card .hs-wrap').count() === 0, 'old summary markup is still in the card');
    // the diamond takes the last drawn card's category colour (lifted for legibility)
    const want = await page.evaluate(() => {
      const last = state.visibleDeck[state.visibleDeck.length - 1];
      return labelColor(levelColor(last.level)).toLowerCase();
    });
    const got = await page.evaluate(() => document.body.style.getPropertyValue('--im-color').trim().toLowerCase());
    assert(got === want, `--im-color ${got} is not the last card's category colour ${want}`);
    assert((await imBtn()) === 'Tap to flip card', `button reads "${await imBtn()}"`);
    assert((await page.locator('#endHint').textContent()).trim() === 'Tap to flip card', 'the end hint does not follow the button');
  });

  await check('end of hand: a tap on the button flips to the list (stars, no title, no corner star); a tap on the list does not flip back or move the hand', async () => {
    await imTap('#btn-next');
    assert((await imSide()) === 'list', `a tap on the button did not flip to the list: ${await imSide()}`);
    assert((await imBtn()) === 'Hold to continue', `button reads "${await imBtn()}" on the list side`);
    const info = await page.evaluate(() => ({
      rows: document.querySelectorAll('#card-question .hd-row').length, n: state.visibleDeck.length,
      texts: [...document.querySelectorAll('#card-question .hd-q')].map(e => e.textContent),
      qs: state.visibleDeck.map(c => c.question),
      level: document.getElementById('card-level').textContent,
      cls: [...document.getElementById('card').classList],
    }));
    assert(info.rows === info.n && info.n > 0, `list has ${info.rows} rows for a hand of ${info.n}`);
    assert(JSON.stringify(info.texts) === JSON.stringify(info.qs), 'list rows are not this hand\'s questions in order');
    assert(info.level === '' && info.cls.includes('is-hand-list') && !info.cls.includes('is-start'), `list side state wrong: ${JSON.stringify(info)}`);
    assert(!(await page.locator('#cardStar').isVisible()), 'the card\'s corner star shows on the list side');
    assert(await page.locator('#card .hd-star').first().isVisible(), 'row stars are not visible');
    // taps on the list text leave the card where it is
    await page.locator('#card .hd-q').first().click();
    await page.waitForTimeout(300);
    assert((await imSide()) === 'list', 'a tap on the list changed the side');
  });

  await check('hand list: a row star toggles the same favourite the card star uses; the list scrolls; scrolling does not move the hand', async () => {
    const q0 = await page.evaluate(() => state.visibleDeck[0].question);
    const was = await page.evaluate(q => state.favourites.some(f => f.question === q), q0);
    await page.locator('#card .hd-star').first().click();
    await page.waitForTimeout(150);
    const now = await page.evaluate(q => ({ fav: state.favourites.some(f => f.question === q), starred: state.handStarred.has(q), on: document.querySelector('#card .hd-star').classList.contains('on'), side: state.handSide, idx: state.currentIndex }), q0);
    assert(now.fav === !was && now.on === !was, `star did not toggle the favourite: ${JSON.stringify(now)}`);
    assert(now.side === 'list' && now.idx === await page.evaluate(() => state.visibleDeck.length), 'tapping a star moved the hand or flipped the card');
    await page.locator('#card .hd-star').first().click();
    await page.waitForTimeout(150);
    assert(await page.evaluate(q => state.favourites.some(f => f.question === q), q0) === was, 'second tap did not undo the star');
    // the star on the list and the card's own star share one store
    await page.evaluate(() => { state.currentIndex = 0; });   // (state only) the card star acts on the card at the index
    await page.evaluate(() => toggleFavourite());
    assert(await page.locator('#card .hd-star').first().evaluate(el => el.classList.contains('on')) === !was, 'the card star did not show on the list star');
    await page.evaluate(() => { toggleFavourite(); state.currentIndex = state.visibleDeck.length; });
    // scrolling: give the list more rows than fit, scroll it, nothing else moves
    const sc = await page.evaluate(() => { const l = document.querySelector('#card .hd-list'); return { over: l.scrollHeight - l.clientHeight, h: l.clientHeight }; });
    if (sc.over > 4) {
      await page.evaluate(() => { document.querySelector('#card .hd-list').scrollTop = 40; });
      assert((await imSide()) === 'list', 'scrolling moved the card');
    }
  });

  await check('end of hand: Back on the list side (button, arrow key, swipe right) turns to Intermezzo; on Intermezzo it goes back a card as before', async () => {
    await page.locator('#btn-prev').click(); await imWaitSide('intermezzo');
    assert(await page.locator('#card').evaluate(el => el.classList.contains('is-start') && !el.classList.contains('is-hand-list')), 'not back on the Intermezzo card');
    assert((await imBtn()) === 'Tap to flip card', 'button did not go back to "Tap to flip card"');
    await page.locator('#card').click(); await page.waitForTimeout(1000);   // a tap on the card flips as well (0.9s turn)
    assert((await imSide()) === 'list', 'a tap on the card did not flip to the list');
    await page.keyboard.press('ArrowLeft'); await imWaitSide('intermezzo');
    await imTap('#btn-next'); assert((await imSide()) === 'list', 'could not flip again');
    // swipe right on the card
    await page.evaluate(() => {
      const c = document.getElementById('card');
      const mk = (type, x) => c.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [new Touch({ identifier: 1, target: c, clientX: x, clientY: 300 })], changedTouches: [new Touch({ identifier: 1, target: c, clientX: x, clientY: 300 })] }));
      mk('touchstart', 80); mk('touchend', 220);
    });
    await imWaitSide('intermezzo');
    // Intermezzo: Back is the old Back — the last card of the hand
    const n = await page.evaluate(() => state.visibleDeck.length);
    await page.locator('#btn-prev').click();
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => ({ side: state.handSide, idx: state.currentIndex, back: document.getElementById('card').classList.contains('is-start'), body: document.body.classList.contains('showing-hand-summary') }));
    assert(st.side === null && st.idx === n - 1 && !st.back && !st.body, `Back from Intermezzo: ${JSON.stringify(st)}`);
    // and forward again to the end of the hand
    await page.locator('#card').click();
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 }).catch(() => {});   // message, then the turn
    await page.waitForTimeout(400);
    assert((await imSide()) === 'intermezzo', 'did not come back to Intermezzo after stepping forward');
  });

  await check('end of hand: Save gives two files (the list and a state file); Import restores a state file; the .txt import still works', async () => {
    const files = [];
    const onDl = d => files.push(d);
    page.on('download', onDl);
    await page.locator('#btnSave').click();
    await page.waitForTimeout(1500);
    page.off('download', onDl);
    const names = files.map(f => f.suggestedFilename());
    assert(files.length === 2, `Save gave ${files.length} files: ${names}`);
    assert(names.some(n => /^between-us-\d{4}-\d{2}-\d{2}\.txt$/.test(n)) && names.some(n => /^between-us-state-\d{4}-\d{2}-\d{2}\.json$/.test(n)), `unexpected file names: ${names}`);
    const stateFile = files.find(f => f.suggestedFilename().endsWith('.json'));
    const json = JSON.parse(await (await import('node:fs/promises')).readFile(await stateFile.path(), 'utf8'));
    const live = await page.evaluate(() => ({ q: state.visibleDeck.map(c => c.question), mode: state.randomMode, lim: state.cardLimit }));
    assert(json.format === 'between-us-state' && JSON.stringify(json.data.deckQuestions) === JSON.stringify(live.q), 'state file does not hold this hand');
    assert(json.data.position === live.q.length - 1, `state file position ${json.data.position} (at the end of a hand it is the last card)`);
    // wreck the live state, then import the file
    await page.evaluate(() => { document.getElementById('d-reshuffle').click(); });
    await page.waitForTimeout(500);
    await page.locator('#btn-menu').click();
    await page.locator('#d-log').click();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#btnImport').click()]);
    await chooser.setFiles(await stateFile.path());
    await page.waitForTimeout(800);
    const back = await page.evaluate(() => ({ q: state.visibleDeck.map(c => c.question), idx: state.currentIndex }));
    assert(JSON.stringify(back.q) === JSON.stringify(live.q) && back.idx === live.q.length - 1, `state import did not restore the hand: idx ${back.idx}`);
    // the .txt still imports as before
    const txt = files.find(f => f.suggestedFilename().endsWith('.txt'));
    await page.evaluate(() => { window.__logKeep = { log: state.sessionLog, from: state.seenFrom, logged: state.loggedQuestions }; });
    await page.locator('#btn-menu').click();
    await page.locator('#d-log').click();
    const [chooser2] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#btnImport').click()]);
    await chooser2.setFiles(await txt.path());
    await page.waitForTimeout(500);
    assert(await page.evaluate(() => state.sessionLog.length > 0), 'the .txt import loaded nothing');
    // put the history back as it was: the import replaces it, and later checks count on the real one
    await page.evaluate(() => { const k = window.__logKeep; state.sessionLog = k.log; state.seenFrom = k.from; state.loggedQuestions = k.logged; renderLog(); closeAllDrawers(); });
    // back to the end of the hand for the next check
    await page.evaluate(() => { state.currentIndex = state.visibleDeck.length; showHandSummary(); });
    await page.waitForTimeout(300);
  });

  await check('end of hand: a hold on the list side starts a fresh hand (card face back, flip state cleared)', async () => {
    await imTap('#btn-next'); assert((await imSide()) === 'list', 'not on the list side');
    await pointerHold(page, '#card', 650);
    await waitForCardIndex(page, 1);
    const { index, total } = await cardParts(page);
    assert(index === 1 && total > 0, `hold did not start a fresh hand, got ${index}/${total}`);
    await page.waitForTimeout(600);
    const st = await page.evaluate(() => ({ side: state.handSide, body: document.body.className, cls: [...document.getElementById('card').classList], par: [...document.getElementById('partyOverlay').classList] }));
    assert(st.side === null && !/showing-hand-summary|hand-side-list/.test(st.body) && !st.cls.some(c => /^is-(start|intermezzo|hand-list)$/.test(c)) && !st.par.some(c => /^is-(hand|intermezzo)/.test(c)), `end-of-hand state left behind: ${JSON.stringify(st)}`);
    assert((await imBtn()) !== 'Hold to continue' && (await imBtn()) !== 'Tap to flip card', 'button still in end-of-hand mode');
  });

  await check('end of hand: a hold on Intermezzo (button or card) skips the list and starts a fresh hand, with no flip first; a tap while the end message is up does not flip', async () => {
    for (const sel of ['#btn-next', '#card']) {
      await page.evaluate(() => { state.currentIndex = state.visibleDeck.length; showHandSummary(); });
      await page.waitForTimeout(400);
      assert((await imSide()) === 'intermezzo', 'not on Intermezzo');
      const seen = await page.evaluate(() => { window.__sides = []; const o = flipHandList; window.flipHandList = function () { window.__sides.push('flip'); return o.apply(this, arguments); }; return true; });
      await pointerHold(page, sel, 700);
      await waitForCardIndex(page, 1);
      const st = await page.evaluate(() => { const r = { side: state.handSide, flips: window.__sides.length, idx: state.currentIndex }; return r; });
      await page.evaluate(() => { delete window.flipHandList; });
      assert(st.side === null && st.flips === 0 && st.idx === 0, `a hold on ${sel} at Intermezzo: ${JSON.stringify(st)}`);
      await page.waitForTimeout(400);
    }
    // the gap after the last card: Intermezzo is not up yet, a tap must not flip
    await page.evaluate(() => { state.currentIndex = state.visibleDeck.length - 2; });
    await page.evaluate(() => { nextCard(); });
    await page.waitForTimeout(150);
    await page.locator('#card').click(); await page.waitForTimeout(100);
    assert(await page.evaluate(() => state.handSide) === null, 'a tap before Intermezzo flipped the card');
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 }).catch(() => {});
    assert((await imSide()) === 'intermezzo', 'Intermezzo did not come up after the gap');
  });

  await check('end of hand: the message after the last card is the exact words, centred, then the card turns over into Intermezzo; same in fullscreen', async () => {
    for (const fs of [false, true]) {
      await freshHand({ three: false });
      await page.locator('#btn-next').click(); await waitForCardIndex(page, 1);
      await page.waitForTimeout(1200);
      if (fs) { await page.locator('#btnParty').click(); await page.waitForTimeout(500); }
      const n = await page.evaluate(() => state.visibleDeck.length);
      await page.evaluate(() => { state.currentIndex = state.visibleDeck.length - 2; _nextCardBase(); });   // draw the last card, then step past it
      await page.waitForTimeout(300);
      await page.evaluate(() => { nextCard(); });
      await page.waitForTimeout(900);
      const sel = fs ? '#party-question .end-msg' : '#card-question .end-msg';
      const t = await page.locator(sel).first().textContent();
      const want = n === 1 ? 'That was your 1 card.' : `Those were your ${n} cards.`;
      const fresh = await page.evaluate(() => _unseenCount(state.fullDeck));
      if (fresh > 0) assert(t.trim() === want, `end message: "${t}" (wanted "${want}")`);
      const al = await page.locator(sel).first().evaluate(el => getComputedStyle(el).textAlign);
      assert(al === 'center', `end message not centred: ${al}`);
      const ms = await page.evaluate(() => window.__x = state.handSide);
      assert(ms === null, 'Intermezzo came up while the message should still be on screen');
      // the card closes (no turn): the back builds over the faded message, the face is painted at 700ms
      await page.waitForFunction(() => document.getElementById('card').classList.contains('mv-build'), null, { timeout: 6000 });
      assert((await page.evaluate(() => state.handSide)) === null, 'the face was painted before the closing reached the handover');
      assert(!(await page.evaluate(() => document.getElementById('card').classList.contains('turning'))), 'the closing turned the card');
      await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 3000 });
      await page.waitForFunction(() => !document.getElementById('card').classList.contains('mv-keep'), null, { timeout: 3000 });
      // the closing really ends: nothing is left running or held, and the word is up
      await page.waitForFunction(() => !document.getElementById('card').classList.contains('mv-live'), null, { timeout: 5000 });
      const end = await page.evaluate(() => ({ cls: [...document.getElementById('card').classList], q: document.getElementById('card-question').className, word: +getComputedStyle(document.querySelector('#card .cb-caption')).opacity }));
      assert(!end.cls.includes('mv-keep') && !end.q.includes('mv-fade') && end.word === 1, `closing did not end cleanly: ${JSON.stringify(end)}`);
      if (fs) { await page.evaluate(() => document.getElementById('partyOverlay').classList.contains('open')); }
      const left = await page.locator('.end-msg').count();
      assert(left === 0, 'the end message is still in the DOM after Intermezzo came up');
      if (fs) { await page.locator('#partyOverlay').evaluate(() => {}); await page.evaluate(() => exitParty()); await page.waitForTimeout(300); }
    }
  });

  // ends a fresh hand on its message, then waits until the closing has started (before the face is painted)
  const startClosing = async () => {
    await freshHand({ three: false });
    await page.locator('#btn-next').click(); await waitForCardIndex(page, 1);
    await page.waitForTimeout(1200);
    await page.evaluate(() => { state.currentIndex = state.visibleDeck.length - 2; _nextCardBase(); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { nextCard(); });
    await page.waitForFunction(() => document.getElementById('card').classList.contains('mv-build'), null, { timeout: 6000 });
  };
  const closingClasses = () => page.evaluate(() => [...document.getElementById('card').classList, ...document.getElementById('card-question').classList].filter(c => /^mv-/.test(c)));
  await check('end of hand: a tap during the closing lands on the list, with the Intermezzo finished (im-still) and no closing classes', async () => {
    await startClosing();
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 3000 });
    await page.evaluate(() => flipHandList());
    await page.waitForTimeout(1200);
    const st = await page.evaluate(() => ({ side: state.handSide, cls: [...document.getElementById('card').classList] }));
    assert(st.side === 'list' && st.cls.includes('im-still') && st.cls.includes('is-hand-list'), `tap during the closing: ${JSON.stringify(st)}`);
    assert((await closingClasses()).length === 0, `closing classes left after the tap: ${await closingClasses()}`);
  });
  await check('end of hand: Back or a new hand during the closing leaves no closing classes behind', async () => {
    for (const leave of ['prevCard()', 'startNewHand()']) {
      await startClosing();
      await page.waitForTimeout(300);
      await page.evaluate(leave);
      await page.waitForTimeout(1500);
      assert((await closingClasses()).length === 0, `${leave} during the closing left: ${await closingClasses()}`);
    }
  });
  await check('end of hand: changing a preset or the card limit from Intermezzo or the list clears the end state', async () => {
    for (const side of ['intermezzo', 'list']) {
      await page.evaluate(() => { const l = state.visibleDeck.length; state.currentIndex = l; showHandSummary(); });
      if (side === 'list') { await page.evaluate(() => flipHandList()); }
      await page.waitForTimeout(1000);
      assert((await imSide()) === side, `not on ${side}`);
      await page.evaluate(() => document.getElementById('d-reshuffle').click());   // a settings-style rebuild of the hand
      await page.waitForTimeout(500);
      const st = await page.evaluate(() => ({ side: state.handSide, body: document.body.className, start: document.getElementById('card').classList.contains('is-start'), im: document.getElementById('card').classList.contains('is-hand-list') }));
      assert(st.side === null && !/showing-hand-summary|hand-side-list/.test(st.body) && !st.im, `after a rebuild from ${side}: ${JSON.stringify(st)}`);
    }
  });

  await check('fullscreen end of hand: Intermezzo, tap flips to the list, stars work, Back returns, hold continues', async () => {
    await freshHand({ three: false });
    await page.locator('#btn-next').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1200);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(500);
    for (let i = 0; i < 8 && !(await imSide()); i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450); }
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 }).catch(() => {});   // message, then the turn
    await page.waitForTimeout(500);
    assert((await imSide()) === 'intermezzo', `fullscreen did not end on Intermezzo: ${await imSide()}`);
    const ov = page.locator('#partyOverlay');
    assert(await ov.locator('.cb-fermata').isVisible() && (await ov.locator('.im-word').textContent()).trim().toLowerCase() === 'intermezzo', 'fullscreen Intermezzo has no mark and word');
    assert(!/Arc complete|Draw complete/.test(await ov.innerText()), 'old fullscreen summary text is still there');
    assert(/Tap to flip card/.test(await page.locator('#endHint').textContent()), 'fullscreen hint does not say Tap to flip card');
    const cardPt = await ov.locator('.party-card').evaluate(el => { const r = el.getBoundingClientRect(); return [r.x + r.width * 0.7, r.y + r.height / 2]; });
    /* the card turns for 0.9s (TURN_END_MS); the stars only hold still once it has */
    const turnDone = () => page.waitForFunction(() => !document.querySelector('#partyOverlay .party-card').classList.contains('turning'), null, { timeout: 3000 });
    await page.touchscreen.tap(cardPt[0], cardPt[1]); await page.waitForTimeout(500);
    assert((await imSide()) === 'list', 'a tap in fullscreen did not flip to the list');
    await turnDone();
    assert(await ov.locator('.hd-row').count() === await page.evaluate(() => state.visibleDeck.length), 'fullscreen list rows differ from the hand');
    const q0 = await page.evaluate(() => state.visibleDeck[0].question);
    const was = await page.evaluate(q => state.favourites.some(f => f.question === q), q0);
    const pt = await ov.locator('.hd-star').first().evaluate(el => { const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await page.touchscreen.tap(pt[0], pt[1]); await page.waitForTimeout(300);
    assert(await page.evaluate(q => state.favourites.some(f => f.question === q), q0) === !was, 'tapping a fullscreen star did not toggle the favourite');
    assert((await imSide()) === 'list', 'a star tap in fullscreen moved the card');
    await page.touchscreen.tap(pt[0], pt[1]); await page.waitForTimeout(300);
    await page.keyboard.press('ArrowLeft'); await imWaitSide('intermezzo'); await turnDone();
    await page.mouse.click(cardPt[0], cardPt[1]); await page.waitForTimeout(500);   // mouse tap flips too
    assert((await imSide()) === 'list', 'a mouse click in fullscreen did not flip to the list');
    await pointerHold(page, '#partyOverlay', 700); await waitForCardIndex(page, 1);
    const st = await page.evaluate(() => ({ side: state.handSide, ov: document.getElementById('partyOverlay').className }));
    assert(st.side === null && !/is-hand|is-intermezzo/.test(st.ov), `fullscreen end state left behind: ${JSON.stringify(st)}`);
    await page.locator('#partyExit').click(); await page.waitForTimeout(300);
  });

  await check('hand size: with most cards seen and the dials moved, a hand of 5 is 5 and All is every unseen card; running out starts a fresh pass', async () => {
    const r = await page.evaluate(() => {
      const keep = { lim: state.cardLimit, log: state.sessionLog, from: state.seenFrom, on: intentOn, ii: intentIntensity, fo: intentFocus };
      intentOn = true; intentIntensity = 0.9; intentFocus = 0.1;
      const sel = getFilteredCards(), unseenN = 12;
      const seed = () => { state.sessionLog = shuffle(sel).slice(0, sel.length - unseenN).map(c => ({ question: c.question, level: c.level })); state.seenFrom = 0; };
      const out = { sizes: [] };
      state.cardLimit = 5; seed();
      for (let i = 0; i < 3; i++) { initDeck(true); out.sizes.push(state.visibleDeck.length); state.visibleDeck.forEach(c => state.sessionLog.push({ question: c.question, level: c.level })); }
      const logLen = state.sessionLog.length;
      initDeck(true);
      out.fresh = { size: state.visibleDeck.length, seenFrom: state.seenFrom, logLen, logKept: state.sessionLog.length === logLen };
      state.cardLimit = null; seed(); initDeck(true); out.all = state.visibleDeck.length;
      state.cardLimit = keep.lim; state.sessionLog = keep.log; state.seenFrom = keep.from;
      intentOn = keep.on; intentIntensity = keep.ii; intentFocus = keep.fo;
      return out;
    });
    assert(r.sizes.join() === '5,5,2', `hands of 5 from 12 unseen: got ${r.sizes.join()}`);
    assert(r.fresh.size === 5 && r.fresh.seenFrom === r.fresh.logLen && r.fresh.logKept, `fresh pass after the last unseen card: ${JSON.stringify(r.fresh)}`);
    assert(r.all === 12, `All should be every unseen card (12), got ${r.all}`);
  });

  await check('start screen: Three, Spotlight and Twist are dimmed (hints bright), shake and do nothing until the first card; usable after it', async () => {
    await page.evaluate(() => { document.querySelector('.limit-btn').click(); });   // fresh hand, nothing drawn
    await page.waitForTimeout(300);
    assert((await cardParts(page)).index === 0, 'expected no card drawn yet');
    const taughtBefore = await page.evaluate(() => document.body.className);
    for (const id of ['pickToggle', 'btnParty', 'btnTwist']) {
      const info = await page.evaluate((id) => {
        const b = document.getElementById(id);
        return { dis: b.classList.contains('disabled'), top: +getComputedStyle(b.querySelector('.row-top')).opacity, hint: +getComputedStyle(b.querySelector('.row-hint')).opacity };
      }, id);
      assert(info.dis && info.top < 0.5 && info.hint === 1, `${id} not dimmed with a bright hint: ${JSON.stringify(info)}`);
      await page.locator('#' + id).click();
      assert(await page.locator('#' + id).evaluate(el => el.classList.contains('row-shake')), `${id} did not shake`);
      await page.waitForTimeout(450);
    }
    // Back is dimmed the same way (whole button), shakes, and does nothing; Menu is not dimmed
    const bk = await page.evaluate(() => ({ dis: document.getElementById('btn-prev').classList.contains('disabled'), op: +getComputedStyle(document.getElementById('btn-prev')).opacity, menu: +getComputedStyle(document.getElementById('btn-menu')).opacity }));
    assert(bk.dis && bk.op < 0.5 && bk.menu === 1, `back not dimmed (or menu dimmed): ${JSON.stringify(bk)}`);
    await page.locator('#btn-prev').click();
    assert(await page.locator('#btn-prev').evaluate(el => el.classList.contains('row-shake')), 'back did not shake');
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(450);
    assert(!(await page.locator('#partyOverlay').evaluate(el => el.classList.contains('open'))), 'Spotlight opened before the first draw');
    assert(!(await page.evaluate(() => pickMode)), 'Three switched on before the first draw');
    assert((await cardParts(page)).index === 0, 'a dimmed button drew a card');
    assert(await page.evaluate(() => document.body.className) === taughtBefore, 'a shake retired a hint');
    await drawFirstIfNeeded(page);
    await page.waitForTimeout(1200);
    for (const id of ['pickToggle', 'btnParty']) {
      assert(!(await page.locator('#' + id).evaluate(el => el.classList.contains('disabled'))), `${id} still dimmed after the first card`);
    }
    assert(!(await page.locator('#btn-prev').evaluate(el => el.classList.contains('disabled'))), 'back still dimmed after the first card');
    // Spotlight opened after the first draw leaves the card's category title showing
    await page.click('#btnParty');
    await page.waitForTimeout(200);
    await page.click('#partyExit');
    await page.waitForTimeout(600);
    const t = await page.evaluate(() => { const e = document.getElementById('card-level'); return { text: e.textContent.trim(), op: +getComputedStyle(e).opacity }; });
    assert(t.text.length > 0 && t.op > 0.9, `category title missing or transparent: ${JSON.stringify(t)}`);
  });

  // ── Three, inside the hand ────────────────────────────────────────────────
  // A fresh hand of 5 (Arc), nothing seen, Three off, no Spotlight; optionally Three on before the first draw.
  async function freshHand({ three = false, mode = 'arc' } = {}) {
    await page.evaluate(({ three, mode }) => {
      if (state.partyMode) exitParty();
      closePicker(); state.pickOptions = null;
      pickMode = three;
      document.getElementById('pickToggle').classList.toggle('on', three);
      state.randomMode = mode; state.cardLimit = 5; syncLimitButtons();
      state.sessionLog = []; state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {};
      renderLog(); initDeck(); renderShell();
    }, { three, mode });
    await page.waitForTimeout(250);
  }
  const waitPicker = (open = true) => page.waitForFunction((o) => state.pickerOpen === o, open, { timeout: 3000 });
  const pickInfo = () => page.evaluate(() => ({ step: state.pickOptions.step, qs: state.pickOptions.options.map(c => c.question), planned: state.pickOptions.planned.question, depths: state.pickOptions.options.map(c => levelDepth(c.level)), pDepth: levelDepth(state.pickOptions.planned.level) }));

  await check('Three inside a 5-card Arc hand: 5 picks of 3 options at the planned step\'s depth, then the end screen', async () => {
    await freshHand({ three: true });
    const picked = [];
    for (let i = 0; i < 5; i++) {
      if (i === 0) await page.locator('#card').click(); else await page.locator('#btn-next').click();
      await waitPicker(true);
      const before = await page.evaluate(() => { const pl = state.pickOptions.planned; const hand = new Set(state.visibleDeck.map(c => c.question)); const seen = _seenSet(); return { n: getFilteredCards().filter(c => levelDepth(c.level) === levelDepth(pl.level) && !hand.has(c.question) && !seen.has(c.question) && !_sittingOut(c) && !state.handOffered.has(c.question)).length, handLen: state.visibleDeck.length }; });
      const info = await pickInfo();
      assert(info.step === i, `options were for step ${info.step}, expected ${i}`);
      assert(info.qs.length === 3 && new Set(info.qs).size === 3, `step ${i}: expected 3 distinct options, got ${info.qs.length}`);
      assert(info.qs.includes(info.planned), `step ${i}: the planned card is not among the options`);
      if (before.n >= 2) assert(info.depths.every(d => d === info.pDepth), `step ${i}: options at depths ${info.depths} but the planned card's is ${info.pDepth} (${before.n} others at that depth exist)`);
      assert(before.handLen === 5, `hand length ${before.handLen}`);
      const opts = page.locator('#cardPicker .pick-opt');
      assert(await opts.count() === 3, 'the picker did not show 3 options');
      const text = (await opts.nth(i % 3).locator('.pick-opt-q').textContent()).trim();
      await opts.nth(i % 3).click();
      await waitForCardIndex(page, i + 1);
      await page.waitForTimeout(300);
      assert(await questionText(page) === text, `step ${i}: the card is not the picked option`);
      picked.push(text);
    }
    const st = await page.evaluate(() => ({ len: state.visibleDeck.length, logged: state.sessionLog.length, idx: state.currentIndex, open: state.pickerOpen }));
    assert(st.len === 5 && st.logged === 5 && st.idx === 4 && !st.open, `after 5 picks: ${JSON.stringify(st)}`);
    await page.locator('#card').click();   // after the last step: the normal end screen, no sixth pick
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 }).catch(() => {});   // message, fade, turn
    assert(await page.evaluate(() => document.body.classList.contains('showing-hand-summary') && !state.pickerOpen), 'no end screen after the 5th pick');
  });

  await check('Three late in a pass (7 unseen left, 5-card hand): three options on every step, no repeats, no card from the hand, seen cards logged once', async () => {
    for (const mode of ['arc', 'wild']) {
      await page.evaluate((mode) => {
        if (state.partyMode) exitParty();
        closePicker(); state.pickOptions = null;
        pickMode = true; document.getElementById('pickToggle').classList.add('on');
        state.randomMode = mode; state.cardLimit = 5; syncLimitButtons();
        state.sitOut = {}; state.skippedSeen.clear(); state.seenFrom = 0;
        state.loggedQuestions.clear();
        const all = getFilteredCards();
        state.sessionLog = all.slice(0, all.length - 7).map(c => ({ question: c.question, level: c.level }));
        state.sessionLog.forEach(c => state.loggedQuestions.add(c.question));
        renderLog(); initDeck(); renderShell();
      }, mode);
      await page.waitForTimeout(250);
      assert(await page.evaluate(() => state.visibleDeck.length) === 5, `${mode}: the hand is not 5 cards`);
      const logged0 = await page.evaluate(() => state.sessionLog.length);
      const offered = new Set();
      for (let i = 0; i < 5; i++) {
        if (i === 0) await page.locator('#card').click(); else await page.locator('#btn-next').click();
        await waitPicker(true);
        const o = await page.evaluate(() => ({ step: state.pickOptions.step, qs: state.pickOptions.options.map(c => c.question), hand: state.visibleDeck.map(c => c.question), planned: state.pickOptions.planned.question }));
        assert(o.step === i && o.qs.length === 3 && new Set(o.qs).size === 3, `${mode} step ${i}: expected 3 distinct options, got ${o.qs.length}`);
        o.qs.filter(q => q !== o.planned).forEach(q => {
          assert(!o.hand.includes(q), `${mode} step ${i}: an extra option is a card of the hand`);
          assert(!offered.has(q), `${mode} step ${i}: an extra option was already offered this hand`);
          offered.add(q);
        });
        await page.locator('#cardPicker .pick-opt').nth(0).click();
        await waitForCardIndex(page, i + 1);
        await page.waitForTimeout(250);
      }
      const uniq = await page.evaluate(() => new Set(state.sessionLog.map(c => c.question)).size === state.sessionLog.length);
      assert(uniq, `${mode}: a card was logged twice: ${await page.evaluate(() => JSON.stringify(state.sessionLog.map(c => c.question).filter((q, i, a) => a.indexOf(q) !== i)))}`);
      assert(await page.evaluate(() => state.sessionLog.length) <= logged0 + 5, `${mode}: more than 5 cards logged for the hand`);
    }
  });

  await check('Three offers three different categories (broad selection, fresh pass, Arc and Wild, many draws); late in a pass an unseen same-category card beats a seen different-category one', async () => {
    const r = await page.evaluate(() => {
      const out = { bad: [], cats: 0, late: [] };
      if (state.partyMode) exitParty();
      closePicker(); state.pickOptions = null;
      state.cardLimit = 5; state.sitOut = {}; state.skippedSeen.clear(); state.seenFrom = 0;
      const resetSeen = () => { state.sessionLog = []; state.loggedQuestions.clear(); };
      for (const mode of ['arc', 'wild']) {
        state.randomMode = mode;
        out.cats = new Set(getFilteredCards().map(c => c.level)).size;
        for (let n = 0; n < 40; n++) {
          resetSeen(); state.handOffered = new Set(); initDeck();
          for (let step = 0; step < state.visibleDeck.length; step++) {
            const o = buildPickOptions(step);
            const lv = new Set(o.map(c => c.level));
            if (o.length !== 3 || lv.size !== 3) out.bad.push(`${mode} hand ${n} step ${step}: ${o.map(c => c.level).join(' / ')}`);
          }
        }
        // late in a pass: everything seen except cards of the planned card's own category
        for (const step of [2, 3]) {
          resetSeen(); state.handOffered = new Set(); initDeck();
          const planned = state.visibleDeck[step], hand = new Set(state.visibleDeck.map(c => c.question));
          const same = getFilteredCards().filter(c => c.level === planned.level && !hand.has(c.question));
          getFilteredCards().filter(c => c.level !== planned.level).forEach(c => { state.sessionLog.push({ question: c.question, level: c.level }); state.loggedQuestions.add(c.question); });
          const o = buildPickOptions(step);
          const extras = o.filter(c => c.question !== planned.question);
          out.late.push({ mode, step, n: same.length, ok: extras.length === 2 && extras.every(c => c.level === planned.level) });
        }
      }
      resetSeen(); initDeck();
      return out;
    });
    assert(r.cats >= 3, `the default selection has only ${r.cats} categories`);
    assert(r.bad.length === 0, `options from repeated categories: ${r.bad.slice(0, 5).join('; ')} (${r.bad.length} in all)`);
    r.late.forEach(l => { if (l.n >= 2) assert(l.ok, `${l.mode} step ${l.step}: an unseen same-category card was passed over for a seen one of another category`); });
    await freshHand({ three: false });
  });

  await check('category spread: a hand never stacks 3+ cards of one category while other unseen categories exist (Wild 5/10/20/All, Arc 5; Three options too)', async () => {
    const r = await page.evaluate(() => {
      if (state.partyMode) exitParty();
      closePicker(); state.pickOptions = null;
      const out = { bad: 0, hands: 0, short: 0, worst: 0, threeBad: 0, threeTried: 0, cappedOnly: null };
      const all = getFilteredCards();
      const lv = [...new Set(all.map(c => c.level))];
      const big = lv.includes('family') ? 'family' : lv[0];
      const others = lv.filter(l => l !== big).slice(0, 10);
      const setPool = (levels, perOther, perBig) => {
        const keep = new Set();
        levels.forEach(l => all.filter(c => c.level === l).slice(0, l === big ? perBig : perOther).forEach(c => keep.add(c.question)));
        state.sessionLog = all.filter(c => !keep.has(c.question)).map(c => ({ question: c.question, level: c.level }));
        state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {};
        return keep.size;
      };
      const maxRun = (hand) => { let w = 0; for (let i = 0; i < hand.length; i += 5) { const m = {}; hand.slice(i, i + 5).forEach(c => { m[c.level] = (m[c.level] || 0) + 1; }); w = Math.max(w, ...Object.values(m)); } return w; };
      for (const [mode, lim] of [['arc', 5], ['wild', 5], ['wild', 10]]) {
        state.randomMode = mode; state.cardLimit = lim; pickMode = false;
        for (let i = 0; i < 150; i++) {
          const n = setPool([big, ...others], 2, 10);
          state.handNo++;
          const b = buildFullDeck(); const hand = sliceVisibleDeck(b.deck, b.unseen);
          out.hands++;
          if (hand.length !== Math.min(lim, n)) out.short++;
          const w = maxRun(hand); out.worst = Math.max(out.worst, w);
          if (w > 2) out.bad++;
        }
      }
      /* Three: the options for a step must not push its run of five past two */
      state.randomMode = 'arc'; state.cardLimit = 5;
      for (let i = 0; i < 60; i++) {
        setPool([big, ...others], 2, 10); state.handNo++;
        const b = buildFullDeck(); state.fullDeck = b.deck; state.drawUnseen = b.unseen;
        state.visibleDeck = sliceVisibleDeck(b.deck, b.unseen); state.handOffered.clear();
        for (let step = 0; step < 5; step++) {
          const opts = buildPickOptions(step);
          const rest = state.visibleDeck.filter((c, k) => k !== step);
          out.threeTried++;
          opts.forEach(o => { const cnt = rest.filter(c => c.level === o.level).length; if (cnt >= 2) out.threeBad++; });
        }
      }
      /* crowded long hands: whenever the unseen cards CAN fill the hand at two per category
         per run (exact max-flow/min-cut check), no run may hold a third */
      const fillable = (counts, size) => {
        const runs = Array.from({ length: Math.ceil(size / 5) }, (_, i) => Math.min(5, size - i * 5)).sort((x, y) => y - x);
        const sum = (xs) => xs.reduce((a, b) => a + b, 0);
        return Math.min(...Array.from({ length: runs.length + 1 }, (_, k) =>
          sum(runs.slice(k)) + sum(counts.map(n => Math.min(n, sum(runs.slice(0, k).map(r => Math.min(2, r))))))));
      };
      out.crowded = { hands: 0, avoidable: 0, short: 0 };
      intentOn = false; state.spiceMode = false; state.handOffered.clear();
      const shapes = [[3, 6, 6, 11, 4, 4], [8, 3, 3, 3, 3], [10, 3, 3, 3, 3, 3], [12, 12, 12, 12, 12, 12], [9, 9, 2, 2, 2]];
      for (const mode of ['wild']) for (const lim of [null, 20]) for (const shape of shapes) for (let i = 0; i < 24; i++) {
        state.randomMode = mode; state.cardLimit = lim;
        const keep = new Set();
        lv.slice().sort(() => Math.random() - 0.5).slice(0, shape.length).forEach((l, j) => all.filter(c => c.level === l).slice(0, shape[j]).forEach(c => keep.add(c.question)));
        state.sessionLog = all.filter(c => !keep.has(c.question)).map(c => ({ question: c.question, level: c.level }));
        state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {}; state.handNo++;
        const b = buildFullDeck(); const hand = sliceVisibleDeck(b.deck, b.unseen);
        const counts = Object.values(Object.groupBy(b.deck.slice(0, b.unseen), c => c.level)).map(g => g.length);
        out.crowded.hands++;
        if (hand.length !== Math.min(lim ?? Infinity, keep.size)) out.crowded.short++;
        if (maxRun(hand) > 2 && fillable(counts, hand.length) >= hand.length) out.crowded.avoidable++;
      }
      /* After Dark joining an Arc hand must not break the up-then-down shape (the opener swap) */
      const savedToggles = new Set(state.activeToggles), savedSpice = state.spiceMode, savedSafe = state.safeMode;
      SPICY_LEVELS.forEach(l => state.activeToggles.add(l));
      state.spiceMode = true; state.safeMode = false; intentOn = false; state.randomMode = 'arc'; state.cardLimit = 5;
      out.shape = { hands: 400, broken: 0 };
      for (let i = 0; i < out.shape.hands; i++) {
        state.sessionLog = []; state.seenFrom = 0; state.skippedSeen.clear(); state.sitOut = {}; state.handNo++;
        const b = buildFullDeck();
        if (!_isArcShaped(sliceVisibleDeck(b.deck, b.unseen))) out.shape.broken++;
      }
      state.activeToggles = savedToggles; state.spiceMode = savedSpice; state.safeMode = savedSafe;
      /* only two categories selected: hands still fill to the size picked (long Arc too) */
      state.randomMode = 'arc'; state.cardLimit = 10;
      const n2 = setPool([big, others[0]], 8, 8);
      state.handNo++;
      const b2 = buildFullDeck(); out.cappedOnly = { n: n2, got: sliceVisibleDeck(b2.deck, b2.unseen).length };
      return out;
    });
    assert(r.short === 0, `hands came out short: ${r.short}/${r.hands}`);
    assert(r.bad === 0, `${r.bad} of ${r.hands} hands had 3+ cards of one category in a run of five (worst ${r.worst})`);
    assert(r.crowded.short === 0, `crowded hands came out short: ${r.crowded.short}/${r.crowded.hands}`);
    assert(r.crowded.avoidable === 0, `${r.crowded.avoidable} of ${r.crowded.hands} crowded long hands stacked 3+ of a category although the unseen cards could avoid it`);
    assert(r.shape.broken === 0, `${r.shape.broken} of ${r.shape.hands} Arc hands with After Dark lost their up-then-down shape`);
    assert(r.threeBad === 0, `${r.threeBad} Three options would stack a third card of a category`);
    assert(r.cappedOnly.got === Math.min(10, r.cappedOnly.n), `two-category selection did not fill: ${JSON.stringify(r.cappedOnly)}`);
    await page.evaluate(() => { state.sessionLog = []; state.seenFrom = 0; state.sitOut = {}; state.skippedSeen.clear(); state.cardLimit = 5; state.randomMode = 'arc'; initDeck(); renderShell(); });
  });

  await check('long Arc: 10 and 20 are one arc (warm-up, deep middle, wind-down of 2/3), deepest categories selected in the middle, no category twice in a row; All is Wild-only and Arc lands on 20', async () => {
    const r = await page.evaluate(() => {
      if (state.partyMode) exitParty();
      closePicker(); state.pickOptions = null; pickMode = false;
      const saved = new Set(state.activeToggles), keepIntent = intentOn;
      const out = { hands: 0, len: 0, shape: 0, repeats: 0, deepMiddle: 0, plans: {} };
      const broad = Object.keys(CATEGORIES).filter(k => !CATEGORIES[k].optIn && !CATEGORIES[k].gate && k !== 'backup');
      for (const sel of [saved, new Set(broad)]) for (const lim of [10, 20]) for (let i = 0; i < 120; i++) {
        state.activeToggles = new Set(sel); state.randomMode = 'arc'; state.cardLimit = lim;
        state.sessionLog = []; state.seenFrom = 0; state.sitOut = {}; state.skippedSeen.clear(); state.handNo++;
        const b = buildFullDeck(); const h = sliceVisibleDeck(b.deck, b.unseen);
        out.hands++;
        if (h.length !== lim) out.len++;
        const d = h.map(c => levelDepth(c.level)), p = _longArcPlan(h.length);
        out.plans[lim] = `${p.warm}/${p.deep}/${p.cool}`;
        const mid = d.slice(p.warm, p.warm + p.deep), warm = d.slice(0, p.warm), cool = d.slice(-p.cool);
        const rises = warm.every((x, k) => k === 0 || x >= warm[k - 1]), falls = cool.every((x, k) => k === 0 || x <= cool[k - 1]);
        if (!(rises && falls && Math.min(...mid) >= Math.max(...warm, ...cool))) out.shape++;
        const top = Math.max(...getFilteredCards().map(c => levelDepth(c.level)));
        if (!mid.includes(top)) out.deepMiddle++;
        out.repeats += _repeats(h);
      }
      state.activeToggles = saved; intentOn = keepIntent;
      /* All: hidden in Arc, back in Wild; Arc with All picked lands on 20 */
      const allBtn = document.querySelector('#limitBtnsDrawer .limit-btn[data-limit="all"]');
      state.randomMode = 'wild'; state.cardLimit = null; initDeck();
      const wild = { hidden: allBtn.hidden, lim: state.cardLimit, len: state.visibleDeck.length };
      state.randomMode = 'arc'; initDeck();
      const arc = { hidden: allBtn.hidden, lim: state.cardLimit, len: state.visibleDeck.length, active: document.querySelector('#limitBtnsDrawer .limit-btn.active')?.dataset.limit };
      return { out, wild, arc };
    });
    assert(r.out.plans[10] === '3/5/2' && r.out.plans[20] === '4/13/3', `plans are not 3/5/2 and 4/13/3: ${JSON.stringify(r.out.plans)}`);
    assert(r.out.len === 0, `${r.out.len} long Arc hands came out short`);
    /* Arc is the base: nothing may bend the shape, the After Dark opener swap included */
    assert(r.out.shape === 0, `${r.out.shape} of ${r.out.hands} long Arc hands were not warm-up, deep middle, wind-down`);
    assert(r.out.deepMiddle === 0, `${r.out.deepMiddle} long Arc hands had none of the deepest selected categories in the middle`);
    assert(r.out.repeats === 0, `${r.out.repeats} back-to-back repeats of a category in broad long Arc hands`);
    assert(!r.wild.hidden && r.wild.lim === null, `All is not available in Wild: ${JSON.stringify(r.wild)}`);
    assert(r.arc.hidden && r.arc.lim === 20 && r.arc.len === 20 && r.arc.active === '20', `Arc did not hide All and land on 20: ${JSON.stringify(r.arc)}`);
    await page.evaluate(() => { state.sessionLog = []; state.seenFrom = 0; state.sitOut = {}; state.skippedSeen.clear(); state.cardLimit = 5; state.randomMode = 'arc'; initDeck(); renderShell(); });
  });

  await check('spread look-ahead: _canFillRuns (three cut points) agrees with trying every k, on random states incl. short final runs, mid-run states and an inRun of 3', async () => {
    const r = await page.evaluate(() => {
      const every = (left, places, runRoom, inRun, plan) => {
        const roomIn = level => Math.max(0, Math.min(RUN_CAP - (inRun.get(level) ?? 0), runRoom));
        const holds = (k, withCurrent) => {
          let supply = plan.outside[k] + (withCurrent ? 0 : runRoom);
          for (const [level, n] of left) supply += Math.min(n, plan.cap[k] + (withCurrent ? roomIn(level) : 0));
          return supply >= places;
        };
        return plan.cap.every((_, k) => holds(k, false) && holds(k, true));
      };
      const rnd = (n) => Math.floor(Math.random() * (n + 1));
      let states = 0, disagree = 0, firstBad = null, fillable = 0;
      for (let i = 0; i < 4000; i++) {
        const after = rnd(40), runRoom = rnd(5);
        const left = new Map(), inRun = new Map();
        const cats = 1 + rnd(8);
        for (let c = 0; c < cats; c++) { left.set('c' + c, rnd(14)); inRun.set('c' + c, rnd(3)); }
        if (i % 7 === 0) inRun.set('c0', 3);
        const plan = _laterRunsPlan(after);
        const places = Math.max(0, runRoom + after - rnd(3));
        const a = _canFillRuns(left, places, runRoom, inRun, plan), b = every(left, places, runRoom, inRun, plan);
        states++; if (b) fillable++;
        if (a !== b) { disagree++; firstBad ??= JSON.stringify({ after, runRoom, places, left: [...left], inRun: [...inRun] }); }
      }
      return { states, disagree, firstBad, fillable };
    });
    assert(r.disagree === 0, `${r.disagree} of ${r.states} states differ; first: ${r.firstBad}`);
    assert(r.fillable > 200 && r.fillable < r.states - 200, `the random states are one-sided (${r.fillable} of ${r.states} fillable)`);
  });

  await check('Three is live right after the first draw (button and Spotlight not dimmed) and the 3 key toggles it on the main screen', async () => {
    await freshHand({ three: false });
    await page.locator('#btn-next').click();
    await page.waitForTimeout(150);   // well inside the ~1s draw animation
    const dim = await page.evaluate(() => ({ t: document.getElementById('pickToggle').classList.contains('disabled'), s: document.getElementById('btnParty').classList.contains('disabled') }));
    assert(!dim.t && !dim.s, `Three/Spotlight still dimmed during the first draw: ${JSON.stringify(dim)}`);
    await page.keyboard.press('3');
    await waitPicker(true);
    assert(await page.evaluate(() => pickMode), 'the 3 key did not switch Three on');
    await page.keyboard.press('3');
    await page.waitForTimeout(400);
    assert(!(await page.evaluate(() => pickMode || state.pickerOpen)), 'the 3 key did not switch Three off');
    assert((await questionText(page)).length > 0 && !/place to begin/i.test(await questionText(page)), 'the card face is wrong after toggling during the first draw');
  });

  await check('Three on and off mid-hand acts from the next card: no restart, card count unchanged, off with options up shows the planned card', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    const before = await page.evaluate(() => ({ hand: state.handNo, deck: state.visibleDeck.map(c => c.question), lim: state.cardLimit }));
    await page.locator('#pickToggle').click();   // on: the very next card is three options
    await waitPicker(true);
    let mid = await page.evaluate(() => ({ hand: state.handNo, deck: state.visibleDeck.map(c => c.question), lim: state.cardLimit, step: state.pickOptions.step, planned: state.pickOptions.planned.question, idx: state.currentIndex, q: document.getElementById('card-question').textContent.trim() }));
    assert(mid.hand === before.hand && mid.lim === before.lim && mid.lim === 5, `switching on changed the hand or the limit: ${JSON.stringify({ b: before.hand, m: mid.hand, lim: mid.lim })}`);
    assert(mid.deck.join('|') === before.deck.join('|') && mid.step === 1 && mid.idx === 0, 'switching on restarted or changed the hand');
    assert(!/place to begin|draw a card/i.test(mid.q), 'switching on went back to the start card');
    await page.locator('#pickToggle').click();   // off with the options up: the planned card takes the step
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({ open: state.pickerOpen, idx: state.currentIndex, q: document.getElementById('card-question').textContent.trim(), cur: state.visibleDeck[state.currentIndex].question, sit: Object.keys(state.sitOut).length, hand: state.handNo, len: state.visibleDeck.length, lim: state.cardLimit, qq: [...state.sessionLog].map(c => c.question) }));
    assert(!after.open && after.idx === 1 && after.cur === mid.planned, 'off with options up did not show the planned card for that step');
    assert(after.sit === 0, 'the two put back were made to sit out');
    assert(after.hand === before.hand && after.len === 5 && after.lim === 5, 'switching off changed the hand or the limit');
    assert(after.qq.includes(mid.planned) && after.qq.length === 2, 'planned card not logged as the step\'s card');
    await page.locator('#btn-next').click();   // next: one card at that step
    await page.waitForTimeout(400);
    assert(!(await page.evaluate(() => state.pickerOpen)) && (await cardParts(page)).index === 3, 'with Three off the next card was not a single card');
    await page.locator('#pickToggle').click();   // on again: next card is three again
    await waitPicker(true);
    assert((await pickInfo()).step === 3, 'switching on again did not offer the next step');
    await page.locator('#pickToggle').click();
    await page.waitForTimeout(500);
  });

  await check('cards passed over in a Three pick sit out the next hand and are drawable again from the one after; not logged as seen', async () => {
    await freshHand({ three: true });
    await page.locator('#card').click();
    await waitPicker(true);
    const info = await pickInfo();
    const passed = info.qs.filter(q => q !== info.qs[0]);
    await page.locator('#cardPicker .pick-opt').nth(0).click();
    await page.waitForTimeout(400);
    const r = await page.evaluate((passed) => {
      const unseenPart = () => new Set(state.fullDeck.slice(0, state.drawUnseen).map(c => c.question));
      const logged = state.sessionLog.map(c => c.question);
      const out = { loggedPassed: passed.some(q => logged.includes(q)), sit: passed.map(q => state.sitOut[q]), hand: state.handNo };
      initDeck(true);   // hand 2
      out.h2 = passed.some(q => unseenPart().has(q) || state.visibleDeck.some(c => c.question === q));
      initDeck(true);   // hand 3
      out.h3 = passed.every(q => unseenPart().has(q));
      out.h3sit = passed.some(q => q in state.sitOut);
      return out;
    }, passed);
    assert(!r.loggedPassed, 'a passed-over card was logged as seen');
    assert(r.sit.every(v => v === r.hand + 2), `sit-out marks wrong: ${r.sit} (hand ${r.hand})`);
    assert(!r.h2, 'a passed-over card is in the next hand');
    assert(r.h3 && !r.h3sit, 'passed-over cards are not drawable again from the hand after');
  });

  // A 5-card Arc hand with Three on, played to its last card through the real controls.
  async function playHandWithThree() {
    await freshHand({ three: true });
    for (let i = 0; i < 5; i++) {
      if (i === 0) await page.locator('#card').click(); else await page.locator('#btn-next').click();
      await waitPicker(true);
      await page.locator('#cardPicker .pick-opt').nth(0).click();
      await waitForCardIndex(page, i + 1);
    }
  }
  const newHandPick = () => page.evaluate(() => ({ open: state.pickerOpen, step: state.pickOptions?.step, n: state.pickOptions?.options.length, idx: state.currentIndex, hand: state.handNo, sit: Object.keys(state.sitOut).length }));

  await check('Three on: the first card of the next hand is three options too, after hold-to-continue and after Draw more', async () => {
    await playHandWithThree();
    const handBefore = await page.evaluate(() => state.handNo);
    await page.locator('#card').click();   // past the last card: end message, then Intermezzo
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
    await page.evaluate(() => { window._endHoldOK = true; nextCard(); });   // what a completed hold does
    await waitPicker(true);
    let r = await newHandPick();
    assert(r.step === 0 && r.n === 3 && r.idx === -1 && r.hand === handBefore + 1, `after hold-to-continue: ${JSON.stringify(r)}`);
    const chrome = await page.evaluate(() => ({ label: document.getElementById('btn-next').textContent.trim(), start: document.getElementById('btn-next').classList.contains('btn-draw--start'), count: document.getElementById('progCountNum').textContent.replace(/\s+/g, ''), spot: document.getElementById('btnParty').classList.contains('disabled') }));
    assert(chrome.label === 'Next Card' && !chrome.start && !chrome.spot, `first-card options show the start state: ${JSON.stringify(chrome)}`);
    await page.keyboard.press('ArrowLeft');
    assert(await page.evaluate(() => state.pickerOpen), 'Back with the first card\'s options up closed them and left the start card showing');
    assert(r.sit === 10, `the first hand's ten unpicked cards should sit out the new hand: ${r.sit}`);
    await page.locator('#cardPicker .pick-opt').nth(1).click();
    await waitForCardIndex(page, 1);
    assert(!(await page.evaluate(() => state.pickerOpen)), 'picker still open after choosing at step 1');
    // Draw more, mid-hand
    await page.evaluate(() => drawMore());
    await waitPicker(true);
    r = await newHandPick();
    assert(r.step === 0 && r.n === 3 && r.idx === -1 && r.hand === handBefore + 2, `after Draw more: ${JSON.stringify(r)}`);
    // With Three off the first card of the next hand stays a single card
    await page.locator('#pickToggle').click();
    assert(!(await page.evaluate(() => state.pickerOpen)) && (await page.evaluate(() => state.currentIndex)) === 0, 'Three off with the first card of the hand\'s options up: the planned card should take the step');
    await page.evaluate(() => drawMore());
    await page.waitForTimeout(300);
    r = await newHandPick();
    assert(!r.open && r.idx === 0, `Three off, Draw more: ${JSON.stringify(r)}`);
  });

  await check('Spotlight open/close with Three options up: the options move along, Next stays put, Close/Back/Twist/Three/Next are tappable over them', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    await page.locator('#card').click();   // step 1 shown
    await waitForCardIndex(page, 2);
    await page.waitForTimeout(400);
    await page.locator('#pickToggle').click();   // Three on: options for step 2
    await waitPicker(true);
    const qs0 = (await pickInfo()).qs;
    await page.locator('#btnParty').click();
    await page.waitForTimeout(500);
    let s = await page.evaluate(() => ({ party: document.getElementById('partyPicker').classList.contains('open'), main: document.getElementById('cardPicker').classList.contains('open'), qs: [...document.querySelectorAll('#partyPickerOptions .pick-opt-q')].map(e => e.textContent.trim()), open: state.pickerOpen }));
    assert(s.party && !s.main && s.open, 'options did not move into Spotlight');
    const texts = await page.evaluate((qs) => qs.map(q => translateQ({ question: q })), qs0);
    assert(s.qs.length === 3 && s.qs.every(t => texts.includes(t)), 'Spotlight shows different options');
    // each control is the topmost thing at its own centre (not covered by the options)
    for (const id of ['partyExit', 'partyPrevBtn', 'partyBtnTwist', 'partyPick', 'partyNext', 'partyStar']) {
      const ok = await page.evaluate((id) => { const el = document.getElementById(id); const r = el.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (t === el || el.contains(t)); }, id);
      assert(ok, `#${id} is covered while the options show`);
    }
    // Next does nothing (no stuck, no card drawn without options); Twist still works
    const idx = await page.evaluate(() => state.currentIndex);
    await page.locator('#partyNext').click();
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => state.pickerOpen && state.currentIndex) === idx, 'Next drew a card under the options');
    await page.locator('#partyBtnTwist').click();
    await page.waitForTimeout(200);
    assert(await page.evaluate(() => !!currentTwist || document.getElementById('partyBtnTwist').classList.contains('active')), 'Twist did not respond over the options');
    await page.locator('#partyExit').click();   // Close: the options go back to the main screen
    await page.waitForTimeout(500);
    s = await page.evaluate(() => ({ party: document.getElementById('partyPicker').classList.contains('open'), main: document.getElementById('cardPicker').classList.contains('open'), qs: [...document.querySelectorAll('#pickerOptions .pick-opt-q')].map(e => e.textContent.trim()), pm: state.partyMode }));
    assert(s.main && !s.party && !s.pm && s.qs.length === 3 && s.qs.every(t => texts.includes(t)), 'options did not come back to the main screen');
    await page.locator('#btnParty').click();   // and in again, then switch Three off from inside Spotlight with the options up
    await page.waitForTimeout(400);
    await page.locator('#partyPick').click();
    await page.waitForTimeout(500);
    s = await page.evaluate(() => ({ open: state.pickerOpen, three: pickMode, idx: state.currentIndex, sit: Object.keys(state.sitOut).length }));
    assert(!s.open && !s.three && s.idx === 2 && s.sit === 0, `Three off in Spotlight with options up: ${JSON.stringify(s)}`);
    await page.locator('#partyExit').click();
    await page.waitForTimeout(400);
    // "‹ One card" is gone; the Three toggle (top-right) does that job and shows gold while the options are up
    assert(await page.locator('#partyPickerBack').count() === 0, '#partyPickerBack ("‹ One card") is still in the page');
    await page.locator('#pickToggle').click();
    await waitPicker(true);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(400);
    s = await page.evaluate(() => { const b = document.getElementById('partyPick'); const r = b.getBoundingClientRect(); const c = document.querySelector('#partyOverlay .party-count-wrap').getBoundingClientRect(); return { on: b.classList.contains('on'), colour: getComputedStyle(b).color, top: r.top < 120 && r.left > innerWidth / 2, countShown: getComputedStyle(document.getElementById('party-count')).visibility !== 'hidden' && c.height > 0 }; });
    assert(s.on && s.top, `Three toggle while picking: ${JSON.stringify(s)}`);
    assert(s.countShown, 'the count is hidden while picking');
    await page.locator('#partyPick').click();
    await page.waitForTimeout(500);
    s = await page.evaluate(() => ({ open: state.pickerOpen, three: pickMode }));
    assert(!s.open && !s.three, 'the Three toggle did not switch Three off from the options');
    await page.locator('#partyExit').click();
    await page.waitForTimeout(300);
  });

  await check('Spotlight layout: arrows in the bottom corners, celadon Close between, Twist/Three top corners, star under the count, no line under the question; Sideways switch turns the layout; PC stacks the options', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(500);
    const box = id => page.evaluate(id => { const r = document.querySelector(id).getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, cx: (r.left + r.right) / 2 }; }, id);
    const [pv, ex, nx, tw, pk, st, ct] = await Promise.all(['#partyPrevBtn', '#partyExit', '#partyNext', '#partyBtnTwist', '#partyPick', '#partyStar', '#party-count'].map(box));
    assert(pv.l < ex.l && ex.r < nx.r && Math.abs(pv.t - ex.t) < 30 && ex.t > 844 - 140, 'back / Close / next are not in one bottom row');
    assert(Math.abs(ex.cx - 195) < 4, 'Close is not centred at the bottom');
    assert(tw.l < 100 && pk.r > 290 && tw.t < 140 && pk.t < 140, 'Twist and Three are not in the top corners');
    assert(st.t >= ct.b - 2 && Math.abs(st.cx - ct.cx) < 6, 'the star is not under the count');
    assert(await page.evaluate(() => getComputedStyle(document.querySelector('.twist-div')).display === 'none'), 'the divider under the question is showing without a Twist');
    assert(await page.evaluate(() => !!document.querySelector('#partyExit svg') && getComputedStyle(document.getElementById('partyExit')).color === 'rgb(169, 199, 182)'), 'Close is not celadon (like the main Spotlight button) with the Spotlight symbol');
    // the Sideways switch
    const vis = () => page.evaluate(() => { const o = document.getElementById('partyOrient'); return { shown: getComputedStyle(o).display !== 'none', word: [...o.querySelectorAll('[data-s]')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent).join(''), land: document.getElementById('partyOverlay').classList.contains('orient-landscape') }; });
    let o = await vis();
    assert(o.shown && o.word === 'Sideways' && !o.land, `switch in portrait: ${JSON.stringify(o)}`);
    await page.locator('#partyOrientBtn').click();
    o = await vis();
    assert(o.land && o.word === 'Upright', `after Sideways: ${JSON.stringify(o)}`);
    await page.locator('#partyOrientBtn').click();
    o = await vis();
    assert(!o.land && o.word === 'Sideways', `after Upright: ${JSON.stringify(o)}`);
    // the word really turns the content: the overlay takes the swapped screen size and is rotated a quarter
    await page.locator('#partyOrientBtn').click();
    const turned = await page.evaluate(() => { const ov = document.getElementById('partyOverlay'); return { turn: ov.dataset.turn, w: ov.offsetWidth, h: ov.offsetHeight, tf: getComputedStyle(ov).transform }; });
    assert(turned.turn === 'cw' && turned.w === 844 && turned.h === 390 && turned.tf !== 'none', `Sideways did not turn the content a quarter: ${JSON.stringify(turned)}`);
    // Three up in the turned frame: three columns, vertical dividers, like a real sideways phone
    await page.locator('#partyPick').click();
    await waitPicker(true);
    await page.waitForTimeout(300);
    const cols = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('#partyPickerOptions .pick-opt')].map(e => ({ w: e.offsetWidth, x: e.offsetLeft, y: e.offsetTop }));
      return { opts, q: getComputedStyle(document.querySelector('#partyPickerOptions .pick-opt-q')).fontSize, div: getComputedStyle(document.querySelector('#partyPickerOptions .pick-div')).opacity };
    });
    assert(cols.opts.length === 3 && cols.opts[0].x < cols.opts[1].x && cols.opts[1].x < cols.opts[2].x && cols.opts.every(c => c.y === cols.opts[0].y), `turned Three is not three columns: ${JSON.stringify(cols.opts)}`);
    assert(cols.q === '21px' && cols.div === '0.65', `turned Three sizes: ${cols.q} / ${cols.div}`);
    await page.locator('#partyOrientBtn').click();
    assert(await page.evaluate(() => !document.getElementById('partyOverlay').dataset.turn), 'Upright did not drop the turn');
    await page.locator('#partyPick').click();
    await page.waitForTimeout(400);
    // PC: no switch, options stacked one above the other
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    assert(!(await vis()).shown, 'the Sideways switch shows on a PC');
    await page.locator('#partyPick').click();
    await waitPicker(true);
    await page.waitForTimeout(300);
    const rows = await page.evaluate(() => [...document.querySelectorAll('#partyPickerOptions .pick-opt')].map(e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, b: r.bottom }; }));
    assert(rows.length === 3 && rows[0].b <= rows[1].t + 1 && rows[1].b <= rows[2].t + 1 && Math.abs(rows[0].l - rows[2].l) < 2, `PC options not stacked: ${JSON.stringify(rows)}`);
    assert(await page.evaluate(() => document.querySelectorAll('#partyPickerOptions .pick-div').length === 2), 'expected 2 dividers between 3 options');
    await page.locator('#partyPick').click();
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#partyExit').click();
    await page.waitForTimeout(300);
  });

  await check('key 3 in Spotlight switches Three on and off; arrows are not blocked while Three is on', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(400);
    await page.keyboard.press('3');
    await waitPicker(true);
    await page.keyboard.press('3');
    await page.waitForTimeout(400);
    assert(await page.evaluate(() => !pickMode && !state.pickerOpen && state.currentIndex === 1), 'key 3 did not switch Three off with options up');
    await page.keyboard.press('3');
    await waitPicker(true);
    await page.keyboard.press('ArrowLeft');   // Back leaves the options
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => pickMode && !state.pickerOpen), 'ArrowLeft was blocked or misbehaved with Three on');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.evaluate(() => { if (pickMode) document.getElementById('pickToggle').click(); });
  });

  await check('skipped cards count as seen but are not in the history; undo takes them back; a fresh pass clears them', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    const q = await page.evaluate(() => state.visibleDeck[state.currentIndex].question);
    assert(await page.evaluate((q) => state.sessionLog.some(c => c.question === q), q), 'card was not in the log before the skip');
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(400);
    const r = await page.evaluate((q) => {
      const out = { seen: state.skippedSeen.has(q), inLog: state.sessionLog.some(c => c.question === q), inDrawer: document.getElementById('logList').textContent.includes(q) };
      out.back = [];
      for (let i = 0; i < 6; i++) { initDeck(true); out.back.push(state.fullDeck.slice(0, state.drawUnseen).some(c => c.question === q) || state.visibleDeck.some(c => c.question === q)); }
      return out;
    }, q);
    assert(r.seen && !r.inLog && !r.inDrawer, `skipped card state: ${JSON.stringify(r)}`);
    assert(!r.back.some(Boolean), 'a skipped card came back in a later hand');
    // undo puts it back
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    const q2 = await page.evaluate(() => state.visibleDeck[state.currentIndex].question);
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(300);
    await page.locator('#skipUndo').click();
    await page.waitForTimeout(400);
    const u = await page.evaluate((q) => ({ seen: state.skippedSeen.has(q), inLog: state.sessionLog.filter(c => c.question === q).length }), q2);
    assert(!u.seen && u.inLog === 1, `undo-skip: ${JSON.stringify(u)}`);
    // when the whole selection is used up (skipped ones included) a fresh pass starts and empties the set
    const f = await page.evaluate(() => {
      const sel = getFilteredCards();
      state.sessionLog = sel.slice(1).map(c => ({ question: c.question, level: c.level })); state.seenFrom = 0;
      state.skippedSeen = new Set(); state.skippedSeen.add(sel[0].question);
      initDeck(true);
      return { seenFrom: state.seenFrom, len: state.sessionLog.length, sk: state.skippedSeen.size, hand: state.visibleDeck.length };
    });
    assert(f.seenFrom === f.len && f.sk === 0 && f.hand === 5, `fresh pass: ${JSON.stringify(f)}`);
  });

  await check('skip gap: the card that slides in after a skip is logged and counts as seen; undo keeps it logged, no double entry (Spotlight has no skip)', async () => {
    for (const spot of [false]) {
      await freshHand({ three: false });
      await page.locator('#card').click();
      await waitForCardIndex(page, 1);
      await page.waitForTimeout(1100);
      if (spot) { await page.click('#btnParty'); await page.waitForTimeout(300); }
      const a = await page.evaluate(() => state.visibleDeck[state.currentIndex].question);
      if (spot) await page.keyboard.press('ArrowDown'); else await swipe(page, '#card', 0, 100);
      await page.waitForTimeout(500);
      const r = await page.evaluate((a) => {
        const b = state.visibleDeck[state.currentIndex].question;
        return { b, differs: b !== a, aLogged: state.sessionLog.some(c => c.question === a), bLogged: state.sessionLog.filter(c => c.question === b).length,
                 bInDrawer: document.getElementById('logList').textContent.includes(b), bSeen: _seenSet().has(b), aSeen: _seenSet().has(a), n: state.sessionLog.length };
      }, a);
      assert(r.differs && !r.aLogged && r.aSeen && r.bLogged === 1 && r.bInDrawer && r.bSeen && r.n === 1, `skip gap (spotlight=${spot}): ${JSON.stringify(r)}`);
      await page.locator('#skipUndo').evaluate(el => el.click());
      await page.waitForTimeout(400);
      const u = await page.evaluate(([a, b]) => ({ order: state.sessionLog.map(c => c.question), cur: state.visibleDeck[state.currentIndex].question, nextIs: state.visibleDeck[state.currentIndex + 1].question }), [a, r.b]);
      assert(u.cur === a && u.nextIs === r.b && u.order.length === 2 && u.order[0] === a && u.order[1] === r.b, `undo after skip (spotlight=${spot}): ${JSON.stringify(u)}`);
      if (spot) { await page.click('#partyExit'); await page.waitForTimeout(500); }
    }
  });

  await check('Back then skip: reachedIdx moves with the cards, so the first unreached step still offers three; undo restores it', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click(); await waitForCardIndex(page, 1);
    await page.locator('#btn-next').click(); await waitForCardIndex(page, 2);
    await page.locator('#btn-next').click(); await waitForCardIndex(page, 3);
    await page.waitForTimeout(1100);
    await page.locator('#btn-prev').click(); await waitForCardIndex(page, 2);
    await page.waitForTimeout(400);
    await page.evaluate(() => { document.getElementById('pickToggle').click(); });   // Three on, mid-hand, behind the front
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ reached: state.reachedIdx, cur: state.currentIndex, len: state.visibleDeck.length, open: state.pickerOpen }));
    assert(r.reached === 1 && r.cur === 1 && r.len === 4 && !r.open, `after Back + skip: ${JSON.stringify(r)}`);
    await page.locator('#skipUndo').evaluate(el => el.click());
    await page.waitForTimeout(400);
    assert(await page.evaluate(() => state.reachedIdx) === 2, 'undo did not restore reachedIdx');
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(500);
    await page.locator('#btn-next').click();
    await waitPicker(true);
    assert(await page.evaluate(() => state.pickOptions.step) === 2 && await page.locator('#cardPicker .pick-opt').count() === 3, 'first unreached step did not offer three after Back + skip');
    await page.evaluate(() => { document.getElementById('pickToggle').click(); });
    await page.waitForTimeout(400);
  });

  await check('start screen: with Three ON its button is not dimmed and switches Three off (then dims again); with Three off it stays dimmed; Spotlight and Twist stay dimmed', async () => {
    await freshHand({ three: true });
    assert((await cardParts(page)).index === 0, 'expected no card drawn yet');
    const st = () => page.evaluate(() => { const b = document.getElementById('pickToggle'); return { dis: b.classList.contains('disabled'), on: b.classList.contains('on'), top: +getComputedStyle(b.querySelector('.row-top')).opacity, mode: pickMode, spotDis: document.getElementById('btnParty').classList.contains('disabled'), twistDis: document.getElementById('btnTwist').classList.contains('disabled') }; });
    let s = await st();
    assert(!s.dis && s.on && s.mode && s.top === 1 && s.spotDis && s.twistDis, `Three on at start: ${JSON.stringify(s)}`);
    await page.locator('#pickToggle').click();
    await page.waitForTimeout(450);
    s = await st();
    assert(!s.on && !s.mode && s.dis && s.top < 0.5, `after switching off at start: ${JSON.stringify(s)}`);
    assert(!(await page.locator('#pickToggle').evaluate(el => el.classList.contains('row-shake'))) && (await cardParts(page)).index === 0, 'switching off at start shook or drew a card');
    await page.locator('#pickToggle').click();   // off + dimmed: shakes, does nothing
    assert(await page.locator('#pickToggle').evaluate(el => el.classList.contains('row-shake')), 'dimmed Three did not shake');
    await page.waitForTimeout(450);
    assert(!(await page.evaluate(() => pickMode)), 'Three switched on before the first draw');
    await freshHand({ three: false });
  });

  await check('Spotlight Twist divider: two bars (card colour, soft celadon), no diamond, old ornament gone', async () => {
    await freshHand({ three: false });
    await page.locator('#card').click();
    await waitForCardIndex(page, 1);
    await page.waitForTimeout(1100);
    await page.locator('#btnParty').click();
    await page.waitForTimeout(500);
    const none = await page.evaluate(() => getComputedStyle(document.querySelector('.twist-div')).display);
    assert(none === 'none', `divider shows without a Twist (${none})`);
    await page.evaluate(() => { currentTwist = MODIFIERS[0]; renderTwist(); });
    await page.waitForTimeout(100);
    const r = await page.evaluate(() => {
      const d = document.querySelector('.twist-div'), cs = getComputedStyle(d);
      const a = getComputedStyle(d, '::before'), b = getComputedStyle(d, '::after');
      return { display: cs.display, kids: d.children.length, old: !!document.querySelector('.party-ornament, .po-svg'),
        a: a.backgroundColor, b: b.backgroundColor, aw: a.width, bw: b.width, level: getComputedStyle(document.getElementById('party-level')).color };
    });
    assert(r.display === 'block' && r.aw !== '0px' && r.bw !== '0px', `divider not drawn with two bars: ${JSON.stringify(r)}`);
    assert(r.kids === 0 && !r.old, `a diamond / old ornament is still there: ${JSON.stringify(r)}`);
    assert(r.a !== r.b && r.b !== 'rgba(0, 0, 0, 0)', `bars not distinct: ${JSON.stringify(r)}`);
    await page.evaluate(() => { clearTwist(); });
    await page.locator('#partyExit').click();
    await page.waitForTimeout(400);
  });

  await check('English only: no language switch, page language is en, no Dutch UI or Twist text', async () => {
    assert(await page.locator('#d-lang').count() === 0, 'a language switch (#d-lang) still exists in the menu');
    assert(await page.evaluate(() => document.documentElement.lang) === 'en', 'document language is not en');
    assert(await page.evaluate(() => typeof state.lang === 'undefined' && typeof setLang === 'undefined'), 'state.lang / setLang still exist');
    const dutch = await page.evaluate(() => /Nederlands|Trek kaart|Volgende kaart|Wending|Houd vast/.test(document.body.innerText + document.body.innerHTML));
    assert(!dutch, 'Dutch UI text found in the page');
    assert(await page.evaluate(() => MODIFIERS.every(m => Object.keys(m).join() === 'en')), 'a Twist still carries a non-English text');
    const draw = (await page.locator('#btn-next').textContent()).trim();
    assert(/^(Draw Card|Next Card|Summary|Hold to continue)$/.test(draw), `unexpected draw button text: ${draw}`);
  });

  await check('new version: picked up at a between-hands moment only (not mid-hand, offline, with a drawer open, or twice for the same version), and the player lands on the same screen', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });
    let served = null;   // the stamp a page fetch finds; page navigations always get the real file
    await ctx.route(`http://127.0.0.1:${port}/${TARGET}`, async route => {
      const res = await route.fetch();
      const body = await res.text();
      const fetched = route.request().resourceType() === 'fetch';
      await route.fulfill({ response: res, body: fetched && served ? body.replace(/\?v=[\w.-]+/g, `?v=${served}`) : body });
    });
    const upd = await ctx.newPage();
    await upd.goto(`http://127.0.0.1:${port}/${TARGET}`);
    await upd.waitForSelector('#card', { state: 'visible' });
    const mark = () => upd.evaluate(() => { window.__same = true; });
    const alive = () => upd.evaluate(() => window.__same === true).catch(() => false);
    const backToFront = () => upd.evaluate(() => {   // a minute later, the app comes to the front
      const t = Date.now(); Date.now = () => t + 6e7;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    /* the new page counts as loaded only when its scripts have all run (the restore is the last of them) */
    const reloaded = () => upd.waitForFunction(() => window.__same !== true && document.readyState === 'complete', null, { timeout: 5000 });
    await mark();
    await backToFront();   // same version served: nothing happens
    await upd.waitForTimeout(500);
    assert(await alive(), 'reloaded although the version is unchanged');

    served = 'NEWVERSION';
    await upd.evaluate(() => _nextCardBase());   // mid-hand: a card on screen
    await backToFront();
    await upd.waitForTimeout(800);
    assert(await alive(), 'reloaded in the middle of a hand');

    await upd.evaluate(() => { while (state.currentIndex < state.visibleDeck.length - 1) _nextCardBase(); });
    await upd.locator('#pickToggle').click();   // Three on: it has to survive the reload
    await ctx.setOffline(true);
    await upd.evaluate(() => showHandSummary());   // Intermezzo, but offline
    await upd.waitForTimeout(500);
    assert(await alive(), 'reloaded while offline');

    await ctx.setOffline(false);
    await upd.evaluate(() => document.getElementById('logDrawer').classList.add('open'));
    await upd.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); updateDrawMore(); });
    await upd.waitForTimeout(500);
    assert(await alive(), 'reloaded with a drawer open');

    await upd.evaluate(() => { document.getElementById('logDrawer').classList.remove('open'); updateDrawMore(); });   // the next screen change at Intermezzo applies it
    await reloaded();
    let at = await upd.evaluate(() => ({ side: state.handSide, idx: state.currentIndex, len: state.visibleDeck.length, body: document.body.classList.contains('showing-hand-summary'), recorded: sessionStorage.getItem('bu-reloaded-for') }));
    assert(at.side === 'intermezzo' && at.idx === at.len && at.body && at.recorded === 'NEWVERSION', `after the reload: ${JSON.stringify(at)}`);
    assert(await upd.evaluate(() => pickMode && document.getElementById('pickToggle').classList.contains('on')), 'Three was not on after the reload');
    await upd.evaluate(() => { window._endHoldOK = true; nextCard(); });   // a completed hold
    await upd.waitForFunction(() => state.pickerOpen && state.pickOptions.step === 0 && state.pickOptions.options.length === 3, null, { timeout: 3000 });
    await upd.evaluate(() => { closePicker(); state.pickOptions = null; state.handSide = null; while (state.currentIndex < state.visibleDeck.length - 1) _nextCardBase(); showHandSummary(); });   // back to an Intermezzo for the list case below

    await mark();   // the same version is still being served: no second reload
    await backToFront();
    await upd.waitForTimeout(800);
    assert(await alive(), 'reloaded twice for the same version');

    served = 'NEWVERSION2';   // another version, picked up from the list side
    await upd.evaluate(() => flipHandList());
    await upd.waitForTimeout(300);
    await backToFront();
    await reloaded();
    at = await upd.evaluate(() => ({ side: state.handSide, idx: state.currentIndex, len: state.visibleDeck.length }));
    assert(at.side === 'list' && at.idx === at.len, `after the reload from the list: ${JSON.stringify(at)}`);

    // no sessionStorage, no loop guard: no update check at all
    const bare = await ctx.newPage();
    await bare.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } }));
    await bare.goto(`http://127.0.0.1:${port}/${TARGET}`);
    await bare.waitForSelector('#card', { state: 'visible' });
    await bare.evaluate(() => { window.__same = true; });
    await bare.waitForTimeout(1200);
    assert(await bare.evaluate(() => window.__same === true), 'reloaded without sessionStorage');
    await ctx.close();
  });

  await check('new version: a reload at the start screen keeps Three on', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });
    let served = null;
    await ctx.route(`http://127.0.0.1:${port}/${TARGET}`, async route => {
      const res = await route.fetch();
      const body = await res.text();
      await route.fulfill({ response: res, body: route.request().resourceType() === 'fetch' && served ? body.replace(/\?v=[\w.-]+/g, `?v=${served}`) : body });
    });
    const upd = await ctx.newPage();
    await upd.goto(`http://127.0.0.1:${port}/${TARGET}`);
    await upd.waitForFunction(() => document.readyState === 'complete');
    await upd.evaluate(() => setPickMode(true));   // Three on, nothing drawn yet
    assert(await upd.evaluate(() => state.currentIndex === -1 && pickMode), 'not at the start screen with Three on');
    served = 'NEWVERSION';
    await upd.evaluate(() => { window.__same = true; const t = Date.now(); Date.now = () => t + 6e7; document.dispatchEvent(new Event('visibilitychange')); });
    await upd.waitForFunction(() => window.__same !== true && document.readyState === 'complete', null, { timeout: 5000 });
    const r = await upd.evaluate(() => ({ on: pickMode, lit: document.getElementById('pickToggle').classList.contains('on'), idx: state.currentIndex, side: state.handSide }));
    assert(r.on && r.lit && r.idx === -1 && r.side === null, `after the reload at the start screen: ${JSON.stringify(r)}`);
    await ctx.close();
  });

  await check('Spotlight opened with the first card\'s Three options up (after the intermezzo): nothing is drawn, the options move along and back', async () => {
    await playHandWithThree();
    await page.locator('#card').click();
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
    await page.evaluate(() => { window._endHoldOK = true; nextCard(); });
    await waitPicker(true);
    const read = () => page.evaluate(() => ({ idx: state.currentIndex, count: document.getElementById('progCountNum').textContent.replace(/\s+/g, ''), open: state.pickerOpen, step: state.pickOptions?.step, inParty: document.getElementById('partyPicker').classList.contains('open'), main: document.getElementById('cardPicker').classList.contains('open') }));
    const before = await read();
    await page.locator('#btnParty').click();
    await page.waitForTimeout(400);
    let r = await read();
    assert(r.idx === -1 && r.count === before.count && r.open && r.step === 0 && r.inParty && !r.main, `in Spotlight: ${JSON.stringify(r)} (before ${JSON.stringify(before)})`);
    await page.locator('#partyExit').click();
    await page.waitForTimeout(400);
    r = await read();
    assert(r.idx === -1 && r.count === before.count && r.open && r.step === 0 && !r.inParty && r.main, `back on the main screen: ${JSON.stringify(r)}`);
  });

  await check('damaged saved favourites: the app still loads and the drawer shows empty', async () => {
    const damaged = [
      ['null', 'null'],
      ['an object', '{"a":1}'],
      ['not JSON', '{oops'],
      ['entries without text', '[null, 5, {"level":"light"}]'],
    ];
    for (const [label, value] of damaged) {
      const damagedPage = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
      const errors = [];
      damagedPage.on('pageerror', (e) => errors.push(e.message));
      await damagedPage.addInitScript((v) => {
        localStorage.setItem('bu-favourites', v);
      }, value);
      await damagedPage.goto(`http://127.0.0.1:${port}/${TARGET}`);
      await damagedPage.waitForSelector('#card', { state: 'visible' });
      assert(errors.length === 0, `${label}: page errors on load: ${errors.join(' | ')}`);
      const shown = await damagedPage.evaluate(() => {
        renderFavourites();
        return {
          favs: document.querySelector('#favsList').textContent.trim(),
        };
      });
      assert(/No favourites yet/.test(shown.favs), `${label}: favourites drawer not empty: ${shown.favs}`);
      await damagedPage.context().close();
    }
  });

  // ── Spotlight turning: tilt readings, no permission phones, swipes in the turned frame ──
  const tiltPage = async (initScript) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    if (initScript) await pg.addInitScript(initScript);
    await pg.goto(`http://127.0.0.1:${port}/${TARGET}`);
    await pg.waitForSelector('#card', { state: 'visible' });
    await pg.locator('#card').click();
    await pg.waitForFunction(() => state.currentIndex >= 0);
    await pg.waitForTimeout(1200);
    await pg.locator('#btnParty').click();
    await pg.waitForTimeout(400);
    return pg;
  };
  const tilt = (pg, beta, gamma) => pg.evaluate(([beta, gamma]) => window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta, gamma, alpha: 0 })), [beta, gamma]);
  const spot = pg => pg.evaluate(() => { const o = document.getElementById('partyOverlay'), w = document.getElementById('partyOrient'); return { turn: o.dataset.turn ?? null, land: o.classList.contains('orient-landscape'), wordShown: getComputedStyle(w).display !== 'none' }; });

  await check('Spotlight tilt: on its side turns the content (towards the tilt) after a moment, upright turns it back, flat and in-between change nothing; the word hides', async () => {
    const pg = await tiltPage();
    assert((await spot(pg)).wordShown, 'the word is hidden before any reading arrived');
    await tilt(pg, null, null);   // a desktop browser's empty reading proves nothing
    assert((await spot(pg)).wordShown, 'an empty reading hid the word');
    await tilt(pg, 85, 2);        // upright
    assert(!(await spot(pg)).wordShown, 'the word is still shown after a real reading');
    await tilt(pg, 2, -82);       // on its side, left edge down: top to the left
    assert((await spot(pg)).turn === null, 'turned at once, without waiting for the tilt to hold');
    await pg.waitForTimeout(1000);
    let s = await spot(pg);
    assert(s.turn === 'cw' && s.land, `tilt left: ${JSON.stringify(s)}`);
    await tilt(pg, 3, 0);         // flat on the table
    await tilt(pg, 40, -45);      // somewhere in between
    await pg.waitForTimeout(1000);
    assert((await spot(pg)).turn === 'cw', 'flat / in-between readings changed the turn');
    await tilt(pg, 80, 3);        // upright again
    await pg.waitForTimeout(1000);
    s = await spot(pg);
    assert(s.turn === null && !s.land, `back upright: ${JSON.stringify(s)}`);
    await tilt(pg, 2, 82);        // the other side
    await pg.waitForTimeout(1000);
    assert((await spot(pg)).turn === 'ccw', 'tilt right did not turn the other way');
    await tilt(pg, 85, 0); await tilt(pg, 2, 85);   // a dip upright that does not hold
    await pg.waitForTimeout(1000);
    assert((await spot(pg)).turn === 'ccw', 'a flicker that never held changed the turn');
    await pg.locator('#partyExit').click();
    await pg.waitForTimeout(400);
    assert((await spot(pg)).turn === null, 'closing Spotlight did not return to upright');
    await pg.context().close();
  });

  await check('Spotlight tilt: readings while Spotlight is closed turn nothing; a phone that needs a permission popup is never turned by itself and keeps the word', async () => {
    const ios = await tiltPage(() => { window.DeviceOrientationEvent = Object.assign(function () {}, { requestPermission: () => Promise.resolve('granted') }); });
    await tilt(ios, 2, -85);
    await ios.waitForTimeout(1000);
    const s = await spot(ios);
    assert(s.turn === null && s.wordShown, `permission-style phone: ${JSON.stringify(s)}`);
    await ios.locator('#partyOrientBtn').click();
    assert((await spot(ios)).turn === 'cw', 'the word does not turn on a permission-style phone');
    await ios.context().close();
    const pg = await tiltPage();
    await pg.locator('#partyExit').click();
    await pg.waitForTimeout(400);
    await tilt(pg, 2, -85);
    await pg.waitForTimeout(1000);
    assert((await spot(pg)).turn === null, 'tilt turned a closed Spotlight');
    await pg.context().close();
  });

  await check('Spotlight tilt: closing within the hold time leaves no stray turn behind, and a phone still on its side turns again on reopening', async () => {
    const pg = await tiltPage();
    await tilt(pg, 2, -85);
    await pg.locator('#partyExit').click();
    await pg.waitForTimeout(1000);   // longer than the hold time
    await pg.locator('#btnParty').click();
    await pg.waitForTimeout(100);
    assert((await spot(pg)).turn === null, 'the closed Spotlight was turned by a tilt that was still settling');
    await tilt(pg, 2, -85);
    await pg.waitForTimeout(1000);
    assert((await spot(pg)).turn === 'cw', 'on reopening with the phone on its side, the first reading did not turn it');
    assert(await pg.evaluate(() => document.getElementById('partyOrientBtn').getAttribute('aria-pressed')) === 'true', 'the switch does not say it is pressed while turned');
    await pg.context().close();
  });

  await check('Spotlight on a phone that turns its own screen: never an own turn on top of the browser\'s, and none from tilt afterwards', async () => {
    const pg = await tiltPage();
    await tilt(pg, 2, -82);                                    // phone goes on its side: the tilt arrives first
    await pg.waitForTimeout(300);
    await pg.setViewportSize({ width: 844, height: 390 });     // ...then the browser turns the screen
    await pg.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
    await pg.waitForTimeout(1200);                             // past the hold time: a late own turn would show now
    let s = await spot(pg);
    assert(s.turn === null && s.land, `after the browser turned the screen: ${JSON.stringify(s)}`);
    assert(await pg.evaluate(() => getComputedStyle(document.getElementById('partyOverlay')).transform) === 'none', 'the overlay is still turned on a screen the browser turned');
    assert(await pg.evaluate(() => localStorage.getItem('bu-screen-rotates')) === '1', 'the phone was not remembered as turning its own screen');
    await pg.setViewportSize({ width: 390, height: 844 });     // phone back upright
    await pg.waitForTimeout(300);
    await tilt(pg, 85, 0);
    await tilt(pg, 2, -82);                                    // on its side again, this time the screen stays upright for a while
    await pg.waitForTimeout(1300);
    assert((await spot(pg)).turn === null, 'a tilt turned the content on a phone that turns its own screen');
    await pg.waitForTimeout(1200);                             // held long enough: the rotation lock must be on now
    assert((await spot(pg)).turn === 'cw', 'a long tilt with the screen staying upright did not allow own turning again');
    await pg.context().close();
  });

  await check('Spotlight word then the browser turns the screen: one sideways view, no turn left over', async () => {
    const pg = await tiltPage();
    await pg.locator('#partyOrientBtn').click();
    assert((await spot(pg)).turn === 'cw', 'the word did not turn');
    await pg.setViewportSize({ width: 844, height: 390 });
    // the browser sends its resize event with the next frame, not as setViewportSize returns: wait for that frame, not a guessed time
    await pg.waitForFunction(() => document.getElementById('partyOverlay').classList.contains('orient-landscape') && document.getElementById('partyOverlay').dataset.turn === undefined, null, { timeout: 2000 }).catch(() => {});
    const s = await spot(pg);
    assert(s.turn === null && s.land, `right after the browser turned the screen: ${JSON.stringify(s)}`);
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.waitForTimeout(300);
    assert((await spot(pg)).turn === null, 'a turn came back when the screen turned upright again');
    await pg.context().close();
  });

  await check('Spotlight turned: a swipe is read in the turned frame, a real sideways screen is left alone', async () => {
    const pg = await tiltPage();
    await pg.locator('#partyOrientBtn').click();   // cw: content right = screen down, content left = screen up
    await pg.evaluate(() => { state.currentIndex = 2; updatePartyDisplay(state.visibleDeck[2]); });
    const swipe = (from, to) => pg.evaluate(([from, to]) => {
      const t = (x, y) => new Touch({ identifier: 1, target: document.querySelector('#partyOverlay .party-card'), clientX: x, clientY: y });
      const fire = (type, x, y) => document.querySelector('#partyOverlay .party-card').dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t(x, y)], changedTouches: [t(x, y)] }));
      fire('touchstart', ...from); fire('touchend', ...to);
    }, [from, to]);
    await swipe([195, 600], [195, 400]);   // finger up the screen = to the content's left = forward
    await pg.waitForTimeout(500);
    assert(await pg.evaluate(() => state.currentIndex) === 3, 'a swipe up the screen did not go forward in the turned Spotlight');
    await swipe([195, 400], [195, 600]);   // down = to the content's right = back
    await pg.waitForTimeout(500);
    assert(await pg.evaluate(() => state.currentIndex) === 2, 'a swipe down the screen did not go back in the turned Spotlight');
    await swipe([100, 400], [300, 400]);   // across the screen is up/down for the content: not a swipe, counts as a tap (forward)
    await pg.waitForTimeout(500);
    assert(await pg.evaluate(() => state.currentIndex) === 3, 'a drag across the screen was read as a swipe in the turned Spotlight');
    await pg.setViewportSize({ width: 844, height: 390 });   // the browser turns the screen itself
    await pg.waitForTimeout(400);
    const real = await pg.evaluate(() => { const o = document.getElementById('partyOverlay'); return { turn: o.dataset.turn ?? null, land: o.classList.contains('orient-landscape'), tf: getComputedStyle(o).transform, w: o.offsetWidth }; });
    assert(real.turn === null && real.land && real.tf === 'none' && real.w === 844, `real sideways screen: ${JSON.stringify(real)}`);
    await pg.context().close();
  });

  await check('end of hand: from the first frame of the end message, the button, --im-color and --im-target carry THIS hand\'s last card colour (not the previous hand\'s); the last-card button reads End of hand', async () => {
    let lastLabel = '';
    const playHand = async (levels) => {
      await page.evaluate((lv) => {
        const by = {}; ALL_CARDS.forEach(c => { (by[c.level] = by[c.level] || []).push(c); });
        hideHandSummary(); try { pickMode = false; } catch (e) {} state.pickerOpen = false; state.visibleDeck = lv.map((l, i) => by[l][i + 3]); state.currentIndex = -1; state.handSide = null; updateDrawMore();
      }, levels);
      for (let i = 0; i < levels.length; i++) {
        await page.locator('#btn-next').click({ force: true });
        await page.waitForTimeout(450);
        if (i === levels.length - 1) { await page.waitForFunction(() => state.currentIndex === state.visibleDeck.length - 1, null, { timeout: 3000 }); await page.waitForTimeout(1200); lastLabel = await imBtn(); }
      }
      await page.locator('#btn-next').click({ force: true });
      // the first frame of the end message
      await page.waitForFunction(() => document.querySelector('#card-question .end-msg'), null, { timeout: 3000 });
      const first = await page.evaluate(() => {
        const last = state.visibleDeck[state.visibleDeck.length - 1];
        return {
          want: labelColor(levelColor(last.level)).toLowerCase(),
          tgt: getComputedStyle(document.getElementById('btn-next')).getPropertyValue('--im-target').trim().toLowerCase(),
          im: document.body.style.getPropertyValue('--im-color').trim().toLowerCase(),
        };
      });
      await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
      await page.waitForTimeout(900);
      return first;
    };
    const a = await playHand(['life', 'life', 'life']);
    assert(a.tgt === a.want && a.im === a.want, `hand 1 end message: --im-target ${a.tgt}, --im-color ${a.im}, want ${a.want}`);
    await imHold('#btn-next');
    const b = await playHand(['work', 'work', 'work']);
    assert(b.want !== a.want, 'the test hands must end in different colours');
    assert(b.tgt === b.want && b.im === b.want, `hand 2 end message still holds the previous hand's colour: --im-target ${b.tgt}, --im-color ${b.im}, want ${b.want} (hand 1 was ${a.want})`);
    await imHold('#btn-next');
    assert(lastLabel === 'End of hand', `the button on the last card reads "${lastLabel}"`);
  });

  await check('a restored session shows its own subtitle: Custom "Off script.", a preset its own line', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    const reload = async () => { await p.reload(); await p.waitForSelector('#card', { state: 'visible' }); await p.waitForTimeout(500); };
    const read = () => p.evaluate(() => ({ token: document.getElementById('valCats').textContent, sub: document.getElementById('subtitle').textContent }));
    try {
      await p.goto(`http://127.0.0.1:${port}/${TARGET}`);
      await p.waitForSelector('#card', { state: 'visible' });
      await p.waitForTimeout(500);
      const balanced = (await read()).sub;
      await p.evaluate(() => document.getElementById('deselectAll').click());   // None
      await p.evaluate(() => document.getElementById('deselectAll').click());   // All = Custom
      assert((await read()).sub === 'Off script.', 'All did not read Custom');
      await p.locator('#card').click();
      await p.waitForFunction(() => localStorage.getItem('bu-session'));
      await reload();
      const after = await read();
      assert(after.token === 'Custom' && after.sub === 'Off script.', `restored Custom deck reads ${JSON.stringify(after)}`);
      await p.evaluate(() => applyPreset('balanced'));
      await p.locator('#card').click();
      await p.waitForTimeout(600);
      await reload();
      const preset = await read();
      assert(preset.token === 'Balanced' && preset.sub === balanced, `restored Balanced deck reads ${JSON.stringify(preset)}, want subtitle "${balanced}"`);
    } finally { await ctx.close(); }
  });

  // Frame-by-frame look at the card (one sample per animation frame). A frame is "wrong" when a
  // player could see the start card (its logo, "A place to begin…", Spotlight's "Draw a card to begin.")
  // or the question / list of a hand that is over.
  const FRAME_WATCH = (old) => {
    window.__frames = [];
    const seen = (el) => { if (!el) return false; const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.03; };
    (function tick() {
      const c = document.getElementById('card'), q = document.getElementById('card-question'), pq = document.getElementById('party-question');
      const back = c.querySelector('.card-back');
      const backOn = seen(back);
      const wrong = [];
      if (backOn && (seen(c.querySelector('.cb-text')) || seen(c.querySelector('.cb-mark:not(.cb-fermata)')))) wrong.push('start logo/text');
      if (seen(q) && seen(q.parentElement) && /A place to begin/.test(q.textContent)) wrong.push('start text');
      if (seen(q) && !c.classList.contains('is-start') && (q.querySelector('.hd-list') || old.some(t => q.textContent.includes(t)))) wrong.push('old hand: ' + q.textContent.slice(0, 30));
      if (document.getElementById('partyOverlay').classList.contains('open') && /Draw a card to begin/.test(pq.textContent)) wrong.push('start text in Spotlight');
      window.__frames.push({ t: Math.round(performance.now()), wrong: wrong.join(' | '), cls: [...c.classList].join(' ') });
      window.__watch = requestAnimationFrame(tick);
    })();
  };
  const frameReport = async () => {
    const f = await page.evaluate(() => { cancelAnimationFrame(window.__watch); return window.__frames; });
    const bad = f.filter(x => x.wrong);
    return { n: f.length, bad: bad.length, first: bad[0] ? `${bad[0].wrong} @${bad[0].t - f[0].t}ms (${bad[0].cls})` : '' };
  };

  await check('end of hand: the card turning to Intermezzo never shows the start card, at any frame (phone and Spotlight)', async () => {
    for (const fs of [false, true]) {
      await freshHand({ three: false });
      await page.locator('#btn-next').click(); await waitForCardIndex(page, 1);
      await page.waitForTimeout(800);
      if (fs) { await page.locator('#btnParty').click(); await page.waitForTimeout(500); }
      await page.evaluate(() => { while (state.currentIndex < state.visibleDeck.length - 1) _nextCardBase(); });
      await page.waitForTimeout(700);
      await page.evaluate(FRAME_WATCH, []);
      await page.evaluate(() => { window.__frames.length = 0; nextCard(); });
      await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
      await page.waitForTimeout(500);
      const r = await frameReport();
      assert(r.bad === 0 && r.n > 60, `${fs ? 'Spotlight' : 'phone'}: ${r.bad} wrong frames of ${r.n}, first: ${r.first}`);
      if (fs) await page.evaluate(() => exitParty());
    }
  });

  await check('hold to continue (from Intermezzo or the list, Three off or on, phone and Spotlight): no frame shows the start card or the previous hand\'s questions on the way to the next hand\'s first card', async () => {
    for (const [from, three, fs] of [['intermezzo', false, false], ['list', false, false], ['intermezzo', true, false], ['list', true, false], ['intermezzo', false, true], ['list', false, true]]) {
      await freshHand({ three });
      if (three) { await page.locator('#card').click(); await waitPicker(true); await page.waitForTimeout(400); await page.locator('#pickerOptions .pick-opt').first().click(); }
      else await page.locator('#btn-next').click();
      await waitForCardIndex(page, 1); await page.waitForTimeout(800);
      if (fs) { await page.locator('#btnParty').click(); await page.waitForTimeout(500); }
      await page.evaluate(() => { const on = pickMode; pickMode = false; while (state.currentIndex < state.visibleDeck.length - 1) _nextCardBase(); pickMode = on; });
      await page.evaluate(() => nextCard());
      await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
      await page.waitForTimeout(1200);
      if (from === 'list') { await page.evaluate(() => flipHandList()); await page.waitForTimeout(1200); }
      const old = await page.evaluate(() => state.visibleDeck.map(c => translateQ(c).slice(0, 25)));
      await page.evaluate(FRAME_WATCH, old);
      await page.evaluate(() => { window.__frames.length = 0; window._endHoldOK = true; nextCard(); });   // a completed hold; frames count from here
      if (three) { await waitPicker(true); await page.waitForTimeout(600); await page.locator(fs ? '#partyPickerOptions .pick-opt' : '#pickerOptions .pick-opt').first().click(); }
      await page.waitForTimeout(1500);
      const r = await frameReport();
      assert(r.bad === 0 && r.n > 40, `from ${from}, Three ${three ? 'on' : 'off'}, ${fs ? 'Spotlight' : 'phone'}: ${r.bad} wrong frames of ${r.n}, first: ${r.first}`);
      if (fs) await page.evaluate(() => exitParty());
    }
  });

  await check('hold to continue in Spotlight with Three on: while the first picker is open, the old hand\'s deck mark, star and Prev state are gone', async () => {
    await freshHand({ three: true });
    await page.locator('#card').click(); await waitPicker(true); await page.waitForTimeout(400); await page.locator('#pickerOptions .pick-opt').first().click();
    await waitForCardIndex(page, 1); await page.waitForTimeout(800);
    await page.locator('#btnParty').click(); await page.waitForTimeout(500);
    await page.evaluate(() => { const on = pickMode; pickMode = false; while (state.currentIndex < state.visibleDeck.length - 1) _nextCardBase(); pickMode = on; });
    await page.evaluate(() => nextCard());
    await page.waitForFunction(() => state.handSide === 'intermezzo', null, { timeout: 6000 });
    await page.waitForTimeout(1200);
    // the last card's marks, as an After Dark card would leave them
    await page.evaluate(() => { applyCardMark(document.querySelector('.party-frame'), { level: 'colbert' }); document.getElementById('partyStar').classList.add('on'); });
    await page.evaluate(() => { window._endHoldOK = true; nextCard(); });
    await waitPicker(true); await page.waitForTimeout(600);
    const st = await page.evaluate(() => ({
      mark: document.querySelector('.party-frame').className, star: document.getElementById('partyStar').classList.contains('on'), prev: document.getElementById('partyPrevBtn').disabled,
      start: /Draw a card to begin/.test(document.getElementById('party-question').textContent),
    }));
    assert(!/mark-/.test(st.mark) && !st.star && st.prev && !st.start, `Spotlight picker after hold to continue: ${JSON.stringify(st)}`);
    await page.evaluate(() => exitParty());
  });

  await check('phone layout stays put: retiring a hint or swapping in Change/Save at the end of a hand never moves the card', async () => {
    const tops = await page.evaluate(() => {
      const ALL = ['hint-three-taught', 'hint-spot-taught', 'hint-twist-taught', 'hint-change-taught', 'hint-save-taught'];
      const b = document.body, before = [...b.classList], seen = new Set();
      for (let mask = 0; mask < 32; mask++) for (const end of [false, true]) {
        ALL.forEach((c, i) => b.classList.toggle(c, !!(mask & (1 << i))));
        b.classList.toggle('showing-hand-summary', end);
        seen.add(Math.round(document.getElementById('card-wrap').getBoundingClientRect().top + scrollY));
      }
      b.className = before.join(' ');
      return [...seen];
    });
    assert(tops.length === 1, `card top moved between hint states: ${tops.join(', ')}`);
  });

  await check('no uncaught page errors were raised during the run', async () => {
    assert(consoleErrors.length === 0, `page errors: ${consoleErrors.join(' | ')}`);
  });

  await browser.close();
  server.close();

  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.\n`);
  if (failed.length) process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(1); });
