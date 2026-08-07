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
import { chromium } from 'playwright';

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
async function cardNumberText(page) { return page.locator('#card-number').textContent(); }
async function cardParts(page) {
  const t = (await cardNumberText(page)).trim();
  const m = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  return m ? { index: +m[1], total: +m[2] } : { raw: t };
}
async function questionText(page) { return (await page.locator('#card-question').textContent()).trim(); }

// Dispatch a synthetic touch swipe on an element, optionally followed by the
// synthetic 'click' mobile browsers fire after a touch gesture — this is
// exactly the double-fire scenario the app's swipe guards exist to prevent.
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
    el.dispatchEvent(touchEvt('touchend', x1, y1));
    if (thenClick) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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
    assert(/draw a card|trek een kaart/i.test(q), `expected the draw-to-begin placeholder, got "${q}"`);
    const numTxt = (await cardNumberText(page)).trim();
    assert(numTxt === '— — —', `expected the empty card-number placeholder, got "${numTxt}"`);
  });

  await check('first tap on the card draws card 1 of the hand', async () => {
    await page.locator('#card').click();
    await page.waitForTimeout(300);
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
  await check('swipe down skips the current card (deck total shrinks by one)', async () => {
    const before = await cardParts(page);
    await swipe(page, '#card', 0, 100);
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.total === before.total - 1, `expected total ${before.total - 1}, got ${after.total}`);
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
  }
  async function closeCategorySheet() {
    await page.locator('#catClose').click();
    await page.waitForTimeout(300);
  }

  await check('toggling a category off updates valCats and reshuffles the deck', async () => {
    try {
      await openCategorySheet();
      const onBtn = page.locator('.toggle-btn.on:not(.hard-locked)').first();
      assert(await onBtn.count() > 0, 'no active category toggle found to click');
      const beforeCats = await page.locator('#valCats').textContent();
      await onBtn.click();
      await page.waitForTimeout(300);
      const afterCats = await page.locator('#valCats').textContent();
      assert(afterCats !== beforeCats, `valCats did not change (${beforeCats})`);
      // A toggle change calls initDeck(), which resets to the "draw a card"
      // placeholder (no auto-drawn first card — see the NO INTRO note up top).
      const numTxt = (await cardNumberText(page)).trim();
      assert(numTxt === '— — —', `deck did not reset to the draw-to-begin placeholder, got "${numTxt}"`);
      // restore for later tests
      await onBtn.click();
      await page.waitForTimeout(300);
    } finally {
      await closeCategorySheet();
    }
  });

  // ── G. Draw-three picker ─────────────────────────────────────────────────
  await check('draw-three picker opens on next-card and choosing an option advances to it', async () => {
    await page.locator('#pickToggle').click();
    await page.waitForTimeout(300);
    await page.locator('#card').click(); // triggers nextCard -> pick intercept
    await page.waitForTimeout(300);
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
    await page.locator('#btn-menu').click();
    await page.waitForTimeout(300);
    const drawer = page.locator('#menuDrawer');
    assert(await drawer.evaluate(el => el.classList.contains('open')), 'menu drawer did not open');
    await page.locator('#overlay').click({ force: true });
    await page.waitForTimeout(300);
    assert(!(await drawer.evaluate(el => el.classList.contains('open'))), 'menu drawer did not close on overlay click');
  });

  // ── I. After Dark toggle ─────────────────────────────────────────────────
  await check('After Dark toggle adds adult categories to the active set', async () => {
    const btn = page.locator('#afterDarkToggle');
    if (await btn.evaluate(el => el.style.display === 'none')) {
      results.push({ name: '(After Dark hard-locked in this profile, skipped)', ok: true });
      console.log('  \x1b[33m·\x1b[0m After Dark hard-locked in this profile — skipped');
      return;
    }
    try {
      await openCategorySheet(); // the button lives inside the category sheet
      const wasOn = await btn.evaluate(el => el.classList.contains('on'));
      const beforeCats = await page.locator('#valCats').textContent();
      await btn.click();
      await page.waitForTimeout(300);
      const afterCats = await page.locator('#valCats').textContent();
      const isOn = await btn.evaluate(el => el.classList.contains('on'));
      assert(isOn !== wasOn, 'After Dark class did not toggle');
      if (isOn) assert(afterCats !== beforeCats, 'valCats did not change after enabling After Dark');
      await btn.click(); // restore
      await page.waitForTimeout(300);
    } finally {
      await closeCategorySheet();
    }
  });

  // ── J. Fullscreen party tap zones ────────────────────────────────────────
  await check('fullscreen party mode: enter, tap zones move the deck, exit', async () => {
    await page.locator('#btnParty').click();
    await page.waitForTimeout(300);
    const overlay = page.locator('#partyOverlay');
    assert(await overlay.evaluate(el => el.classList.contains('open')), 'party overlay did not open');
    const before = await cardParts(page);
    await page.locator('#partyOverlay .party-card').click();
    await page.waitForTimeout(300);
    const after = await cardParts(page);
    assert(after.index === before.index + 1, `party tap did not advance: ${before.index} -> ${after.index}`);
    await page.locator('#partyExit').click();
    await page.waitForTimeout(300);
    assert(!(await overlay.evaluate(el => el.classList.contains('open'))), 'party overlay did not close');
  });

  // ── K. End-of-hand hold-to-continue gate ────────────────────────────────
  await check('end-of-hand: a quick tap does not advance, a full hold does', async () => {
    // Run the current hand out to its end (tap through, waiting out the
    // 175ms flip animation each time so we don't race the DOM update).
    const atEnd = async () => /sic-wrap|Draw complete|Ronde afgerond/.test(await page.locator('#card-question').innerHTML());
    for (let i = 0; i < 20 && !(await atEnd()); i++) {
      await page.locator('#card').click();
      await page.waitForTimeout(300);
    }
    assert(await atEnd(), `did not reach the end-of-hand screen after 20 taps (${await questionText(page)})`);

    // Quick tap: pointerdown+up well under the hold threshold must NOT advance.
    await page.evaluate(() => {
      document.getElementById('btn-next').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    await page.waitForTimeout(80);
    await page.evaluate(() => {
      const el = document.getElementById('btn-next');
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(300);
    const stillEnd = await page.locator('#card-question').innerHTML();
    assert(/sic-wrap|Draw complete|Ronde afgerond/.test(stillEnd), 'a quick tap advanced past the end-of-hand gate');

    // Full hold: must advance into a fresh hand.
    await pointerHold(page, '#btn-next', 650);
    await page.waitForTimeout(200);
    const { index, total } = await cardParts(page);
    assert(index === 1 && total > 0, `hold did not start a fresh hand, got ${index}/${total}`);
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
