// ── UI ───────────────────────────────────────────────────────────────────────
// DOM event wiring and app bootstrap. This is the file that actually runs at
// load time: the boot sequence that draws the opening hand, the two
// structural IIFEs that build the tray/drawer chrome and the Play/Explore
// controller, and the event listeners that don't belong to one specific
// domain file. Loads last, after every function it wires up. Executes top-
// to-bottom, so the boot logic is load-order-sensitive (the double init
// sequence, the final default-selection draw).

// Each chapter's category buttons are built from CATEGORIES in config.js (the
// category's own .chapter field says where it goes), into that chapter's panel
// in the sheet. Runs first, before anything else in this file (or any file that
// loads after it) can touch a .toggle-btn expecting it to already exist. Order
// within a chapter follows CATEGORIES' key order. Categories with no chapter
// (Colbert, The 36, Magical, Abyss, Backup, Meta) have no button in the sheet.
(function renderChapterPanels(){
  document.querySelectorAll('.chapter-panel[data-chapter]').forEach(panel => {
    const ch = panel.dataset.chapter;
    let html = '';
    Object.keys(CATEGORIES).forEach(id => {
      const cat = CATEGORIES[id];
      if (cat.chapter !== ch) return;
      const desc = (typeof CATEGORY_DESCRIPTIONS !== 'undefined' && CATEGORY_DESCRIPTIONS[id]) || '';
      html += `<button type="button" class="toggle-btn" data-level="${id}" data-chapter="${ch}" style="--c:${levelColor(id)}" title="${esc(desc)}"><i class="cat-dot" aria-hidden="true"></i><span class="cat-name">${esc(cat.label)}</span></button>`;
    });
    panel.innerHTML = html;
  });
})();

[document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); toggleTwist(); });
});


// ── INIT ──────────────────────────────────────────────────────────────────────
if (MASTER_SAFE || WORKPLACE_MODE) {
  state.safeMode = true;
  document.getElementById('afterDarkToggle').style.display  = 'none';
  SAFE_BLOCKED_LEVELS.forEach(l => {
    const btn = document.querySelector(`.toggle-btn[data-level="${l}"]`);
    if (btn) btn.style.display = 'none';
  });
}

// Backup is a dev-only overflow category — hidden unless SHOW_BACKUP is set
if (!window.SHOW_BACKUP) {
  const bb = document.querySelector('.toggle-btn[data-level="backup"]');
  if (bb) { bb.style.display = 'none'; bb.classList.add('hard-locked'); }
}

if (WORKPLACE_MODE) {
  state.safeMode = true;
  applyPreset('work');
} else {
  state.safeMode = false;
  applyPreset('open');
}
// SPICE_MODE: add adult categories to the active set by default
if (SPICE_MODE && !MASTER_SAFE && !WORKPLACE_MODE) {
  state.safeMode = false;
  applyToggleUI();
  /* the ✦ glyph button reflects spiceMode when its own setup runs, just below */
  state.spiceMode = true;
}
document.querySelectorAll('.mode-btn').forEach(b =>
  b.classList.toggle('active', b.dataset.mode === state.activePreset)
);
initDeck();

if (DEFAULT_COLLAPSED) {
  state.categoriesCollapsed = true;
  document.getElementById('toggles')?.classList.add('collapsed');
  const ca = document.getElementById('catArrow');
  if (ca) ca.textContent = '▶';
}

loadFavourites();

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────


// Card limit — #limitBtnsDrawer is the only card-count picker in the app.
function selectCardLimit(limitAttr) {
  state.cardLimit = limitAttr === 'all' ? null : parseInt(limitAttr);
  syncLimitButtons();
  applyLimit();
}
const limitBtnsDrawer = document.getElementById('limitBtnsDrawer');
if (limitBtnsDrawer) limitBtnsDrawer.addEventListener('click', e => {
  const btn = e.target.closest('.limit-btn');
  if (!btn) return;
  selectCardLimit(btn.dataset.limit);
});

// Draw controls
document.getElementById('drawMoreBtn').addEventListener('click', drawMore);
// At Intermezzo (end of a hand, side 'intermezzo') a tap flips the card to the hand's
// list; a hold skips the list and continues (END_HOLD_TARGETS gate below, whose
// capture-phase click guard swallows the release of a hold before it gets here).
// Before Intermezzo is up (the 500 ms after the last card) a tap does what it always did.
document.getElementById('btn-next').addEventListener('click', () => {
  if (state.handSide === 'intermezzo') { flipHandList(); return; }
  nextCard();
});
document.getElementById('btn-prev').addEventListener('click', function() {
  if (this.classList.contains('disabled')) { shakeRowBtn(this); return; }   // before the first card: shake, nothing else
  prevCard();
});

// Card star
document.getElementById('cardStar').addEventListener('click', e => {
  e.stopPropagation();
  toggleFavourite();
});

// Normal mode: tap the card to advance. The touch handler below owns every
// swipe gesture and calls preventDefault() when it acts, so the browser
// never synthesizes a click after a swipe — this handler only ever sees
// genuine taps and needs no "was that just a swipe?" flag to guard against.
//
// Mouse only: dragging to select the question text (card-question is the
// one part of the card with user-select re-enabled — see styles.css) also
// ends in a click on mouseup, same as a tap does. Distinguish them by
// actual pointer movement rather than by reading the selection in the
// click handler — selection state isn't reliably settled by the time
// click fires (e.g. the first click of a double-click-to-select-a-word
// hasn't selected anything yet), but "did the mouse move" always has.
let cardMouseDownAt = null;
document.getElementById('card').addEventListener('mousedown', e => {
  cardMouseDownAt = { x: e.clientX, y: e.clientY };
});
document.getElementById('card').addEventListener('click', e => {
  if (state.partyMode) return;
  if (e.target.closest('#cardStar, .hd-star')) return;
  if (cardMouseDownAt) {
    const dragged = Math.abs(e.clientX - cardMouseDownAt.x) > 6 || Math.abs(e.clientY - cardMouseDownAt.y) > 6;
    cardMouseDownAt = null;
    if (dragged) return; // was a drag-select, not a tap
  }
  if (window.getSelection && String(window.getSelection()).length > 0) return;
  if (state.handSide === 'intermezzo') { flipHandList(); return; }   // a tap on the Intermezzo card turns it over
  nextCard();
  updateDeckInfo();
});

// Card touch gestures — one handler owns all of them (swipe left/right to
// advance/reverse, swipe down to skip), so there's exactly one place that
// decides what a touch on the card means. Registered non-passive so it can
// call preventDefault() and suppress the synthetic click a touch leaves
// behind, in place of the flag-based "swallow the next call" guards that
// pattern otherwise forces on every listener downstream.
(function() {
  const card = document.getElementById('card');
  let startX = 0, startY = 0, startTime = 0;
  card.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });
  card.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 65 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      // never on the end/summary card
      if (state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length) {
        e.preventDefault();
        skipCard();
      }
    } else if (Date.now() - startTime < 400 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      e.preventDefault();
      dx < 0 ? nextCard() : prevCard();
    }
  }, { passive: false });
})();

// ── Show hints again (menu) ──
(function(){
  const b = document.getElementById('d-hints');
  if (b) b.addEventListener('click', () => { hintsReset(); closeAllDrawers(); });
})();

// ── Spotlight brightens once ── PROVISIONAL, for testing. When the third card
// of a session is drawn, the Spotlight button (symbol + word) brightens to near
// white for about a second, once per device ever. Tune or remove here only.
function spotlightBrightenOnce() {
  const KEY = 'bu.spotBrightened';
  try { if (localStorage.getItem(KEY)) return; localStorage.setItem(KEY, '1'); } catch (e) { return; }
  replayClass(document.getElementById('btnParty'), 'spot-bright', 1050);
}

// ── Fullscreen party ──
(function(){
  const btn = document.getElementById('btnParty');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (btn.classList.contains('disabled')) { shakeRowBtn(btn); return; }   // before the first card
      hintRetire('spotlight');
      state.partyMode = true;
      document.getElementById('partyOverlay').classList.add('open');
      movePickerToScreen();   // Three options up: they move along into Spotlight
      if (state.currentIndex < 0 && state.visibleDeck.length > 0 && !state.pickerOpen) {   // first-card options up: nothing is drawn yet
        state.currentIndex = 0;
        setCardDisplay(state.visibleDeck[0]);
        renderProgress();
        updateStarUI();
        updateDrawMore();
      } else if (state.currentIndex >= 0 && state.visibleDeck[state.currentIndex]) {
        updatePartyDisplay(state.visibleDeck[state.currentIndex]);
      } else if (state.handSide) {
        renderHandSide(false);   // the hand has ended: fullscreen shows the same side the card is on
      }
    });
  }

  const newOv = document.getElementById('partyOverlay');

  // Exit button — stop propagation so overlay listener doesn't also fire
  const exitBtn = newOv.querySelector('#partyExit');
  if (exitBtn) exitBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    state.partyMode = false;
    newOv.classList.remove('open');
    movePickerToScreen();   // Three options up: they move along back to the main screen
  });

  // Next/prev — chrome buttons forward to the same nav the tap zones use
  const partyNextBtn = newOv.querySelector('#partyNext');
  if (partyNextBtn) partyNextBtn.addEventListener('click', e => {
    e.stopPropagation();
    nextCard(); updateDeckInfo(); updateDrawMore();
  });
  const partyPrevBtn = newOv.querySelector('#partyPrevBtn');
  if (partyPrevBtn) partyPrevBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (partyPrevBtn.disabled) return;
    prevCard(); updateDeckInfo();
  });

  // Star — same handler as the main star
  const partyStarBtn = newOv.querySelector('#partyStar');
  if (partyStarBtn) partyStarBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleFavourite();
  });

  // Touch: single handler, always prevents click so mobile never double-fires
  let ptsx = 0, ptsy = 0, partyBusy = false;
  const partyThrottle = (fn) => {
    if (partyBusy) return;
    partyBusy = true;
    fn();
    setTimeout(() => { partyBusy = false; }, 350);
  };

  newOv.addEventListener('touchstart', e => {
    ptsx = e.touches[0].clientX;
    ptsy = e.touches[0].clientY;
  }, { passive: true });

  /* movement of the finger since touchstart, as the (possibly turned) content sees it */
  const touchDelta = e => contentDelta(e.changedTouches[0].clientX - ptsx, e.changedTouches[0].clientY - ptsy, newOv.dataset.turn);

  newOv.addEventListener('touchend', e => {
    if (e.target.closest('.party-chrome, .party-picker, .party-orient, .hd-star')) return;
    /* scrolling the hand's list is not a tap or a swipe of the card */
    if (e.target.closest('.hd-list')) {
      const [sdx, sdy] = touchDelta(e);
      if (Math.abs(sdy) > 10 && Math.abs(sdy) >= Math.abs(sdx)) return;
    }
    /* a hold just continued the draw — its release must not advance again.
       Reads the flag, doesn't clear it: the click handler below checks it
       too, in case this touchend's preventDefault doesn't fully suppress a
       trailing click (inconsistent across browsers after a long hold) —
       clearing it here would leave that click unprotected. start() clears
       it at the top of the next press. */
    if (window._endHoldFired) { e.preventDefault(); return; }
    e.preventDefault(); // suppresses subsequent click event on mobile
    const [dx, dy] = touchDelta(e);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      // swipe left = next, swipe right = prev
      if (dx < 0) partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
      else         partyThrottle(() => { prevCard();  updateDeckInfo(); });
    } else {
      // tap — only act on card area
      if (!e.target.closest('.party-card')) return;
      if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
      else if (state.handSide === 'intermezzo') partyThrottle(() => { flipHandList(); });
      else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
    }
  }, { passive: false });

  // Click — desktop only (mobile click is suppressed by touchend's preventDefault above)
  newOv.addEventListener('click', function(e) {
    e.stopPropagation(); // prevent document-level handler from also firing
    if (e.target.closest('.party-chrome, .party-picker, .party-orient, .hd-star')) return;
    if (window._endHoldFired) { return; }
    if (!e.target.closest('.party-card')) return; // outside card = no action
    if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
    else if (state.handSide === 'intermezzo') partyThrottle(() => { flipHandList(); });
    else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
  });
})();

// ── Spotlight turned sideways ── For a phone whose screen is locked upright, Spotlight
// can turn its whole content a quarter (data-turn on the overlay: "cw" = turned
// clockwise, for a phone held with its top to the left; "ccw" = the other way). The turned frame is sized like a real
// sideways screen, and the sideways layout is the `.orient-landscape` class, which is
// also what a real sideways screen gets (the browser turns that one itself, no extra turn).
// Who turns it: tilt readings where the browser gives them freely (no word shown then),
// otherwise the word on the right edge ("Sideways" / "Upright").
const SETTLE_MS = 800;   // a tilt must hold this long, so a browser that turns the screen itself gets there first
const LOCK_MS = 2000;   // on a phone known to turn its own screen: how long "on its side while the screen stays upright" must hold
                        // before we believe the rotation lock is on now
const ROTATES_KEY = 'bu-screen-rotates';

/** Which way is up, in the screen's plane, from the beta/gamma tilt (degrees):
 *  how the content must turn so its top points up: 'cw' when the phone's top is to the left,
 *  'ccw' when it is to the right; null while clearly upright; otherwise `current`
 *  (flat on a table, upside down, or between: the hysteresis). */
function turnFromTilt(beta, gamma, current) {
  const rad = Math.PI / 180;
  const x = -Math.cos(beta * rad) * Math.sin(gamma * rad);
  const y = Math.sin(beta * rad);
  if (Math.hypot(x, y) < 0.5) return current;
  const off = Math.abs(Math.atan2(x, y)) / rad;   // 0 = upright, 90 = on its side
  if (off < 30) return null;
  if (off > 60 && off < 120) return x > 0 ? 'cw' : 'ccw';
  return current;
}

/** True once this phone has been seen turning its own screen (rotation lock off). */
function readScreenRotates() {
  try { return localStorage.getItem(ROTATES_KEY) === '1'; } catch { return false; }
}
function writeScreenRotates(rotates) {
  try { localStorage.setItem(ROTATES_KEY, rotates ? '1' : '0'); } catch { /* private mode: only this visit remembers */ }
}

/** A movement on the screen (dx, dy) seen from inside the turned Spotlight content. */
function contentDelta(dx, dy, turn) {
  if (turn === 'ccw') return [-dy, dx];
  if (turn === 'cw') return [dy, -dx];
  return [dx, dy];
}

(function(){
  const orient = document.getElementById('partyOrient');
  if (!orient) return;
  const overlay = document.getElementById('partyOverlay');
  const btn = document.getElementById('partyOrientBtn');
  const realLandscape = matchMedia('(orientation: landscape)');
  const phoneWidth = matchMedia('(max-width: 899px)');   // the app's phone layouts (styles.css uses the same limit)
  const phoneLandscape = matchMedia('(orientation: landscape) and (max-height: 500px)');   // the app's phone-landscape rule, as in styles.css
  let turn = null, wanted = null, settleTimer = 0, screenRotates = readScreenRotates();

  function setTurn(next) {
    turn = realLandscape.matches ? null : next;   // a screen the browser turned needs no extra turn
    if (realLandscape.matches) {
      clearTimeout(settleTimer);
      wanted = null;
      if (phoneLandscape.matches && !screenRotates) { screenRotates = true; writeScreenRotates(true); }
    }
    overlay.classList.toggle('orient-landscape', realLandscape.matches || turn !== null);
    if (turn) overlay.dataset.turn = turn; else delete overlay.dataset.turn;
    orient.dataset.land = turn ? '1' : '0';
    btn?.setAttribute('aria-pressed', String(turn !== null));
    // the layout changed under the options: keep them clear of the bottom row
    if (state.pickerOpen && state.partyMode) fitPartyPicker();
  }
  if (btn) btn.addEventListener('click', e => {
    e.stopPropagation();
    setTurn(turn ? null : 'cw');   // the common way: phone turned counter-clockwise, so the content turns clockwise
  });
  const syncToDevice = () => setTurn(turn);
  syncToDevice();
  window.addEventListener('resize', syncToDevice);
  window.addEventListener('orientationchange', syncToDevice);
  realLandscape.addEventListener('change', syncToDevice);

  // iPhone only gives tilt after a permission popup: none is asked, the word stays.
  const needsPermission = typeof DeviceOrientationEvent !== 'undefined'
    && 'requestPermission' in DeviceOrientationEvent;
  let readingsProven = false;
  function onTilt(e) {
    if (e.beta == null || e.gamma == null) return;
    if (!readingsProven) {
      readingsProven = true;
      overlay.classList.add('auto-turn');   // this device sends readings: the word is not needed
    }
    if (realLandscape.matches || !phoneWidth.matches) return;
    const next = turnFromTilt(e.beta, e.gamma, turn);
    if (next === turn) { clearTimeout(settleTimer); wanted = turn; return; }
    if (next === wanted) return;
    wanted = next;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => settle(next), screenRotates ? LOCK_MS : SETTLE_MS);
  }
  // A tilt that held while the screen stayed upright. On a phone that turns its own screen
  // that can only mean the rotation lock is on now, so own turning is allowed again.
  function settle(next) {
    if (realLandscape.matches) return;
    if (next && screenRotates) { screenRotates = false; writeScreenRotates(false); }
    setTurn(next);
  }

  // Tilt is only listened to while Spotlight is open; leaving it always returns to upright.
  new MutationObserver(() => {
    if (overlay.classList.contains('open')) {
      if (!needsPermission) window.addEventListener('deviceorientation', onTilt);
      return;
    }
    window.removeEventListener('deviceorientation', onTilt);
    clearTimeout(settleTimer);
    wanted = null;
    if (turn) setTurn(null);
  }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
})();


// ── Keyboard ──
document.addEventListener('keydown',e=>{
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;   // don't hijack typing
  if(document.querySelector('[id$="Drawer"].open')){
    if(e.key==='Escape') closeAllDrawers();
    return;                                                               // drawers own the keys
  }
  if(document.getElementById('cat-area')?.classList.contains('sheet-open')){
    if(e.key==='Escape' && typeof closeCats==='function') closeCats();
    return;
  }
  if(state.partyMode){
    if(e.key==='Escape')     exitParty();
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); updateDrawMore(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
    if(e.key==='t'||e.key==='T') toggleTwist();
    if(e.key==='3') document.getElementById('pickToggle').click();
  } else {
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
    if(e.key==='ArrowDown')  { e.preventDefault(); skipCard(); }
    if(e.key==='3') document.getElementById('pickToggle').click();
  }
});


// ── INIT ──
// Apply initial shuffle display
updateShuffleDisplay();

// Apply After Dark state
document.getElementById('afterDarkToggle').classList.toggle('on',!state.safeMode);

updateTimeOfDayHeading();

// Animate UI in
setTimeout(()=>document.getElementById('card-wrap').classList.add('in'),60);
setTimeout(()=>document.getElementById('hdr').classList.add('in'),200);
setTimeout(()=>document.getElementById('preset-outer').classList.add('in'),260);
setTimeout(()=>document.getElementById('cat-area').classList.add('in'),320);
setTimeout(()=>document.getElementById('controls-wrap').classList.add('in'),380);

// Set initial category label state

(function(){
  const wrap=document.getElementById('toggles-wrap');
  const lbl=document.getElementById('catLabel');
  const arrow=document.getElementById('catArrow');
  if(DEFAULT_COLLAPSED){
    if(wrap) wrap.classList.remove('open');
    if(arrow) arrow.textContent='▶';
    if(lbl) lbl.classList.remove('open');
  } else {
    if(wrap) wrap.classList.add('open');
    if(arrow) arrow.textContent='▼';
    if(lbl) lbl.classList.add('open');
  }
})();

// Initialise card-level visibility
(function(){
  const lv=document.getElementById('card-level');
  if(lv) setTimeout(()=>lv.classList.add('in'),400);
  const qEl=document.getElementById('card-question');
  if(qEl) setTimeout(()=>qEl.classList.add('in'),400);
})();

// End of a hand: pressing and holding the card, Next Card or the fullscreen overlay
// continues into a fresh hand (on Intermezzo and on the list alike).
const END_HOLD_TARGETS = ['card','btn-next','partyOverlay'];
(function(){
  const HOLD = 550;
  let timer = null;
  window._nudgeEndHold = function(){
    const el = document.getElementById('endHint');
    if (!el) return;
    el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge');
  };
  function holdBtn(){ return document.getElementById('btn-next'); }
  function start(e){
    /* a new press starts a new gesture — never inherit a stale swallow flag */
    window._endHoldFired = false;
    if (!atEnd()) return;
    /* a star in the hand's list is a tap, never a hold */
    if (e && e.target && e.target.closest && e.target.closest('.hd-star')) return;
    clearTimeout(timer);
    const b = holdBtn();
    if (b && e && e.currentTarget === b) b.classList.add('holding');
    timer = setTimeout(() => {
      if (b) b.classList.remove('holding');
      /* Swallow the release, however long the press lasted. A time window here
         expired mid-hold, letting the release advance a second card. */
      window._endHoldFired = true;
      hint(false);
      /* A hold continues into the next hand from either side of Intermezzo (on the
         Intermezzo side a tap flips instead — see the click handlers). */
      window._endHoldOK    = true;
      if (typeof nextCard === 'function') nextCard();
    }, HOLD);
  }
  function cancel(){
    clearTimeout(timer); timer = null;
    const b = holdBtn(); if (b) b.classList.remove('holding');
  }
  END_HOLD_TARGETS.forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('pointerdown', start);
    ['pointerup','pointerleave','pointercancel'].forEach(ev => el.addEventListener(ev, cancel));
    /* swallow the click that a completed hold leaves behind. Reads the flag
       but never clears it here — on the party overlay, touchend checks the
       same flag before this does, and if it were the one to clear it, a
       trailing click that slips through anyway (preventDefault doesn't
       always suppress it, especially after a long hold rather than a quick
       tap) would find the flag already gone and double-advance. start()
       is the only place that resets it, at the top of the next press. */
    el.addEventListener('click', e => {
      if (window._endHoldFired) {
        e.stopImmediatePropagation(); e.preventDefault();
      }
    }, true);
  });
})();

// ── Hand summary actions ── Change/Save, the screen-row's end-of-hand
// content (see styles.css body.showing-hand-summary, presentation.js
// showHandSummary()). Plain taps — the hold-to-draw-a-fresh-hand gesture
// is Next Card itself (in hold-mode), handled by the END_HOLD_TARGETS gate.
document.getElementById('btnChange') && document.getElementById('btnChange').addEventListener('click', () => {
  hintRetire('change');
  if (typeof openCats === 'function') openCats();
});
document.getElementById('btnSave') && document.getElementById('btnSave').addEventListener('click', () => {
  hintRetire('save');
  if (typeof saveSessionFiles === 'function') saveSessionFiles();
});

// ── Spice glyph buttons (one inline on the After Dark chapter in Play,
//    one inline on the After Dark drawer in Explore) — same state, kept in sync ──
(function(){
  const btns = [...document.querySelectorAll('.spice-glyph')];
  if (!btns.length) return;
  const update = () => btns.forEach(b => b.classList.toggle('on', state.spiceMode));
  window.syncSpiceGlyph = update;
  update();
  btns.forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();   // sits inside the After Dark chapter/bucket row — must not also toggle it
    state.spiceMode = !state.spiceMode;
    update();
    initDeck();
  }));
})();

// Fullscreen end-of-draw continue is handled by the shared end-gate above
// (bound to #partyOverlay too).



// ═══════════════════════════════════════════════════════════
// SKIP UNDO — 3-second undo window after skip
// ═══════════════════════════════════════════════════════════
(function() {
  // _undoCard / _undoIndex / _undoTimer are set by skipCard().
  const undoBtn = document.getElementById('skipUndo');
  if (!undoBtn) return;

  undoBtn.addEventListener('click', () => {
    if (!_undoCard) return;
    clearTimeout(_undoTimer);
    undoBtn.classList.remove('visible');
    // Re-insert card at original position and remove from skipped set
    state.skippedCards.delete(_undoCard.question);
    state.skippedSeen.delete(_undoCard.question);
    restoreToLog(_undoLog);
    const insertAt = Math.min(_undoIndex, state.visibleDeck.length);
    state.visibleDeck.splice(insertAt, 0, _undoCard);
    if (_undoReachedShift) state.reachedIdx++;
    state.currentIndex = insertAt;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    updateDeckInfo(); renderProgress(); updateDrawMore();
    _undoCard = null; _undoIndex = null; _undoLog = null; _undoReachedShift = false;
  });
})();


// ═══════════════════════════════════════════════════════════
// SPICE_AVAILABLE — hide spice glyph if configured off
// ═══════════════════════════════════════════════════════════

(function() {
  if (!window.SPICE_AVAILABLE) {
    const sg = document.getElementById('spiceGlyphBtn');
    if (sg) sg.classList.add('spice-hidden');
  }
})();


// ═══════════════════════════════════════════════════════════
// PICK-3 MODE — draw 3 cards, choose one, discard the others
// ═══════════════════════════════════════════════════════════

let pickMode = false;

/* Three on or off: the flag, the button's lit state, and everything that mirrors it */
function setPickMode(on) {
  pickMode = on;
  document.getElementById('pickToggle')?.classList.toggle('on', on);
  updateDrawMore();   // start screen: Three off dims again, until the first card
  renderShell();      // mirror the toggle onto the fullscreen Three button
}


(function(){
  const btn = document.getElementById('pickToggle');
  if (!btn) return;

  /* Three is a layer on the hand, not a different hand: it never touches the
     card count or restarts anything. On: the very next card is three options
     (when there is a next step). Off: the next card is the step's single
     planned card; with the options on screen, the planned card takes the step
     now and the other two go back (no pick, so nothing sits out). */
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) { shakeRowBtn(btn); return; }   // before the first card
    setPickMode(!pickMode);

    if (pickMode) {
      hintRetire('three');
      // Turning this on IS the draw — show the next step's three straight
      // away (only from the front of the hand, and only if there is a next step).
      if (state.currentIndex === state.reachedIdx && state.currentIndex + 1 < state.visibleDeck.length) nextCard();
      updateDeckInfo();
    } else if (state.pickerOpen && state.pickOptions) {
      const o = state.pickOptions;
      choosePick(o.planned, o.options, o.step, true);
      updateDeckInfo();
    } else {
      closePicker();
    }
  });
})();

// ── Category card counts in the grid ──

updateCatCounts();

// Initial "What kind of …?" heading
updateTimeOfDayHeading();


// ── Category grid: make it obvious that it scrolls ──
(function(){
  const wrap = document.getElementById('toggles-wrap');
  if (!wrap) return;
  /* class-only and inserted once: an id here could never be unique if this ever
     ran twice, and nothing looks the element up by id anyway */
  if (!wrap.querySelector(':scope > .grid-fade'))
    wrap.insertAdjacentHTML('beforeend', '<div class="grid-fade"></div>');
  function upd(){
    const scrollable = wrap.scrollHeight > wrap.clientHeight + 4;
    const atBottom   = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 6;
    wrap.classList.toggle('can-scroll', scrollable && !atBottom);
  }
  window.updateGridScrollHint = upd;
  wrap.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  new MutationObserver(upd).observe(wrap, { childList: true, subtree: true, attributes: true });
  const mb = document.getElementById('modeBar');
  if (mb) mb.addEventListener('click', () => setTimeout(() => { wrap.scrollTop = 0; upd(); }, 60));
  upd();
})();

// ── Keep the screen awake during fullscreen play ──
(function(){
  let lock = null;
  async function acquire(){ try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch(e) {} }
  function release(){ try { lock && lock.release(); } catch(e) {} lock = null; }
  const ov = document.getElementById('partyOverlay');
  if (!ov) return;
  new MutationObserver(() => { ov.classList.contains('open') ? acquire() : release(); })
    .observe(ov, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ov.classList.contains('open')) acquire();
  });
})();

// Apply category colors to initial state

applyToggleUI();

/* ═════════ APP SHELL WIRING — trays, drawers, presets, dials ═════════ */
(function(){
  const $=id=>document.getElementById(id);

  /* ── slide a fold open/closed by animating max-height against its real,
     measured content height — never a guessed constant. A guessed max
     that's much bigger than the real content makes opening look near-
     instant (the content reaches full height long before the transition's
     nominal duration is up) while closing, which always travels the real
     distance, reads as the properly-paced one — that mismatch makes
     open/close feel asymmetric.
     Once fully open the cap is released to "none" so anything that grows
     inside the fold afterward (a bucket expanding inside Explore, say)
     isn't clipped by a stale measurement; closing re-measures the real
     height first so it always starts the animation from where the box
     actually is, not from "none". ── */
  function slideFold(el, opening, ms){
    if (!el) return;
    el.style.transition = 'none';
    if (opening) {
      el.style.maxHeight = el.getBoundingClientRect().height + 'px';
    } else {
      el.style.maxHeight = 'none';
      el.style.maxHeight = el.scrollHeight + 'px';   // re-measure, then snap the start point to it
    }
    el.offsetHeight; // force layout so the jump above doesn't itself animate
    el.style.transition = `max-height ${ms ?? 260}ms var(--ease-out)`;
    requestAnimationFrame(() => {
      el.style.maxHeight = opening ? el.scrollHeight + 'px' : '0px';
    });
    if (opening) {
      const onEnd = e => {
        if (e.target !== el || e.propertyName !== 'max-height') return;
        el.removeEventListener('transitionend', onEnd);
        el.style.maxHeight = 'none';
      };
      el.addEventListener('transitionend', onEnd);
    }
  }
  window.slideFold = slideFold;   // used from the separate Play/Explore wiring IIFE below

  /* ── lock the page's own scroll behind any open sheet/drawer ──
     Every sheet/drawer is position:fixed, but the page underneath it was
     never actually stopped from scrolling — a touch that landed on the
     sliver of body still reachable around/behind the overlay (or a mouse
     wheel over it on desktop) scrolled the page invisibly, so closing
     often landed somewhere the player never scrolled to on purpose. Pins
     the body in place at its exact current scroll position while anything
     is open, and restores that exact position on close, instead of
     leaving the page free to drift underneath. A count guards nested opens
     (e.g. opening Categories from inside the menu drawer, which closes
     the menu drawer first — two calls in a row, only the outer one should
     actually restore scroll). */
  let _scrollLockY = 0, _scrollLockDepth = 0;
  function lockBodyScroll(){
    if (_scrollLockDepth++ > 0) return;
    _scrollLockY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }
  function unlockBodyScroll(){
    if (_scrollLockDepth === 0) return;
    if (--_scrollLockDepth > 0) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, _scrollLockY);
  }
  window.lockBodyScroll = lockBodyScroll;
  window.unlockBodyScroll = unlockBodyScroll;

  /* ── re-home existing controls into trays ── */
  /* modes live in the categories drawer as presets — always visible under a
     plain "Start from" label, the same section-heading language
     Chapters/Tune/Round use. No collapse/toggle: a collapsed row read as
     inert text, not something to tap. */
  const presetHost=document.createElement('div');
  presetHost.className='preset-host open';
  presetHost.innerHTML='<div class="sect-lbl"><span>Start from</span></div>';
  presetHost.appendChild($('preset-outer'));
  const topbar=document.querySelector('.cat-area .cat-topbar');
  topbar.before(presetHost);            /* presets first … */
  presetHost.after(topbar);             /* … then After Dark · All · None */
  const openRow=$('tokCats');
  const dc=$('deckCount'); dc.style.display='none'; openRow.appendChild(dc);

  /* ── category sheet ── */
  const catArea=document.getElementById('cat-area'), scrim=$('catScrim'),
        togglesWrap=$('toggles-wrap'), catLabel=$('catLabel');
  /* .app is a stacking context (z-index:1); the body-level scrim was painting OVER
     the drawer and eating its taps. Re-home both to <body>: scrim below, drawer above. */
  document.body.appendChild(scrim);
  document.body.appendChild(catArea);
  /* Things that must wait for the sheet to be fully gone (the start-card logo
     animation) register with afterCatsClosed(); they run on the sheet's own
     transitionend, with a timeout as a safety net. */
  let catsClosing=false; const closeWaiters=[];
  function catsBusy(){ return catArea.classList.contains('sheet-open') || catsClosing; }
  function flushCloseWaiters(){ catsClosing=false; if(catArea.classList.contains('sheet-open')) return; closeWaiters.splice(0).forEach(fn=>fn()); }
  window.afterCatsClosed=function(fn){ if(catsBusy()) closeWaiters.push(fn); else fn(); };
  window.catsBusy=catsBusy;
  function openCats(){
    if(!togglesWrap.classList.contains('open')) catLabel.click(); /* keep original state machine in sync */
    catArea.classList.add('sheet-open'); scrim.classList.add('on');
    lockBodyScroll();
    document.querySelectorAll('.tray.open,.tok.open').forEach(el=>el.classList.remove('open'));
    catArea.removeAttribute('aria-hidden');
    $('d-cats').setAttribute('aria-expanded', 'true');
    // Reset to the top on every open, so the sheet doesn't reopen scrolled
    // wherever it was left (e.g. deep in Explore's list).
    const pp = $('panePlay'); if (pp) pp.scrollTop = 0;
    // preventScroll: catArea is position:fixed, covering the viewport — it
    // needs no scroll to be "in view," but browsers don't know that and will
    // scroll the page to it anyway without this.
    catArea.focus({preventScroll: true});
  }
  function closeCats(){
    const wasOpen=catArea.classList.contains('sheet-open');
    catArea.classList.remove('sheet-open'); scrim.classList.remove('on');
    if(wasOpen){
      catsClosing=true;
      const done=e=>{ if(e && (e.target!==catArea || e.propertyName!=='transform')) return;
        catArea.removeEventListener('transitionend',done); flushCloseWaiters(); };
      catArea.addEventListener('transitionend',done);
      setTimeout(()=>{ catArea.removeEventListener('transitionend',done); if(catsClosing) flushCloseWaiters(); },600);
    }
    unlockBodyScroll();
    catArea.setAttribute('aria-hidden', 'true');
    $('d-cats').setAttribute('aria-expanded', 'false');
    // d-cats lives inside menuDrawer, already closed by the time this fires — a
    // stable, always-visible anchor (same one closeAllDrawers uses) is safer to
    // refocus than a trigger that may now sit inside a hidden dialog.
    // preventScroll here too: btn-menu sits down in the Controls section,
    // below the Card section — without it, closing the sheet would scroll the
    // whole page down to bring btn-menu into view, pushing the header off the top.
    const btnMenu = $('btn-menu'); if (btnMenu) try { btnMenu.focus({preventScroll: true}); } catch(e) {}
  }
  window.openCats=openCats; window.closeCats=closeCats;
  // "· tap to change" teaches the preset token opens something, then
  // retires for good once it's done its job — fade first (not an instant
  // display:none) because the sheet covers the header on mobile, so the
  // hint disappearing is only ever actually seen on desktop.
  openRow.addEventListener('click', () => {
    if (!hintIsTaught('tok')) {
      const h = document.getElementById('tokHint');
      if (h) h.style.opacity = '0';
      setTimeout(() => hintRetire('tok'), 350);
    }
    openCats();
  });
  $('catClose').addEventListener('click', closeCats);
  scrim.addEventListener('click', closeCats);
  $('d-cats').addEventListener('click', ()=>{ if(typeof closeAllDrawers==='function') closeAllDrawers(); openCats(); });

  /* ── swipe the sheet down to dismiss it, same gesture a bottom sheet is
     expected to have — dragging from the handle follows the finger live
     and either snaps back or finishes the close, instead of only reading
     a start/end delta like the card's swipe does (a sheet this tall needs
     the live feedback to feel grabbed, not just gestured at). ── */
  (function(){
    const handle = document.querySelector('.cat-sheet-handle');
    if (!handle) return;
    let startY = 0, dragging = false;
    const SNAP_THRESHOLD = 90;
    handle.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      dragging = true;
      catArea.style.transition = 'none';
    }, {passive:true});
    handle.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) catArea.style.transform = `translateY(${dy}px)`;
    }, {passive:true});
    handle.addEventListener('touchend', e => {
      if (!dragging) return;
      dragging = false;
      catArea.style.transition = '';
      const dy = e.changedTouches[0].clientY - startY;
      catArea.style.transform = '';
      if (dy > SNAP_THRESHOLD) closeCats();
    });
  })();

  /* ── same swipe-down-to-dismiss on every other bottom-sheet drawer (the
     hamburger menu, and Log/Favourites/Help underneath it) — they're
     the same kind of sheet as Categories and deserve the same handle, not
     just a small "x" in the corner. ── */
  (function(){
    const SNAP_THRESHOLD = 90;
    document.querySelectorAll('.drawer, .sub-drawer').forEach(sheet => {
      const handle = sheet.querySelector('.drawer-handle');
      if (!handle) return;
      let startY = 0, dragging = false;
      handle.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        dragging = true;
        sheet.style.transition = 'none';
      }, {passive:true});
      handle.addEventListener('touchmove', e => {
        if (!dragging) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
      }, {passive:true});
      handle.addEventListener('touchend', e => {
        if (!dragging) return;
        dragging = false;
        sheet.style.transition = '';
        const dy = e.changedTouches[0].clientY - startY;
        sheet.style.transform = '';
        if (dy > SNAP_THRESHOLD && typeof closeAllDrawers === 'function') closeAllDrawers();
      });
    });
  })();

  // "Draw Cards" — closes the sheet and draws straight into the first hand
  // of whatever's now selected, the same reshuffle-then-draw the app already
  // does elsewhere (deck.js's end-of-hand hold) — so finishing the sheet
  // never leaves the placeholder card sitting there waiting for one more tap.
  const goBtn = $('catGoBtn');
  if (goBtn) goBtn.addEventListener('click', () => {
    // Drawing a brand-new hand from the sheet is the "starting over" moment —
    // if a stored session was live, detach from it so these new cards land
    // only in the ephemeral autosave slot, never silently overwriting it.
    // Ordinary continued play (next/prev/skip/draw more/reshuffle/toggling a
    // category) never goes through here, so it never unbinds.
    if (typeof setActiveSessionId === 'function') setActiveSessionId('');
    initDeck();
    _nextCardBase();
    updateDeckInfo(); updateDrawMore();
    closeCats();
    if (typeof renderSessionsList === 'function') renderSessionsList();
  });

  /* ── shuffle toggle: Arc vs Wild, a straight two-way switch ──
     Arc and Wild are the only shuffle modes (SHUFFLE_MODES in config.js),
     so this is a plain toggle, not a list. */
  function selectShuffleMode(mode){
    state.randomMode = mode;
    shuffleModeIdx = SHUFFLE_MODES.indexOf(state.randomMode);
    initDeck(); updateDeckInfo(); updateDrawMore();
    renderShell();
  }
  const shuffleToggle = $('shuffleToggle');
  if (shuffleToggle) shuffleToggle.addEventListener('click', e => {
    const btn = e.target.closest('.shuffle-toggle-opt'); if (!btn) return;
    selectShuffleMode(btn.dataset.mode);
  });

  /* token labels are rendered from state by renderShell() — no self-observation */
  renderShell();
  // .limit-btn's "active" state was only ever applied reactively, after a
  // tap — Section 3's #limitBtnsDrawer copy has no hardcoded default in its
  // markup, so on load neither of its buttons showed the actual default
  // (state.cardLimit, set from DEFAULT_LIMIT in state.js) as selected.
  if (typeof syncLimitButtons === 'function') syncLimitButtons();
  $('tokLine').classList.add('in');

  /* fullscreen mirror of the pick-3 toggle */
  /* fullscreen Draw-three button forwards taps; its label + state come from renderShell() */
  const pp=$('partyPick');
  if(pp) pp.addEventListener('click',e=>{ e.stopPropagation(); $('pickToggle').click(); });

  /* ── fullscreen idle fade (concept B: resting state is only the card) ── */
  const party=$('partyOverlay'); let idleT=null, partyWasOpen=false;
  function wake(){
    if(party.classList.contains('idle')) party.classList.remove('idle');
    clearTimeout(idleT);
    if(party.classList.contains('open'))
      idleT=setTimeout(()=>{ if(party.classList.contains('open')) party.classList.add('idle'); },2800);
  }
  ['pointerdown','pointermove','keydown'].forEach(ev=>party.addEventListener(ev,wake,{passive:true}));
  new MutationObserver(()=>{
    const isOpen=party.classList.contains('open');
    if(isOpen && !partyWasOpen) wake();                       /* just entered fullscreen */
    if(!isOpen && partyWasOpen){                              /* just left it */
      clearTimeout(idleT);
      if(party.classList.contains('idle')) party.classList.remove('idle');
    }
    partyWasOpen=isOpen;
  }).observe(party,{attributes:true,attributeFilter:['class']});
})();
// Chapter rail: same gilt.js metal stops as the card accent, painted on each row
// (--rail-d/-m/-l) off CHAPTERS_META's colour — computed once at
// boot since, unlike a card's category, a chapter's colour never changes
// at runtime. styles.css composes the vertical (190deg) sweep from them into --ch-rail,
// which it paints only on .on (see
// the on/part/off rule there) — .part and the base/off state use a flat
// --ch-derived colour instead. CHAPTERS_META (config.js) is the one
// stored copy of these colours — the end-of-set screen reads the same
// object rather than keeping its own. The label/glow colour reuses --ch
// (already read by .chapter.on/.part in styles.css) via labelColor(),
// which lifts After Dark's near-black lacquer to a readable tone while
// leaving every other chapter's --ch at its base.
document.querySelectorAll('.chapter[data-chapter]').forEach(el => {
  const meta = CHAPTERS_META[el.dataset.chapter];
  if (!meta) return;
  giltRailPaint(el, meta.color);
  el.style.setProperty('--ch', labelColor(meta.color));
  if (el.parentElement) el.parentElement.style.setProperty('--ch', labelColor(meta.color)); // the unfolded panel's paled left line
});

/* ═════════ PLAY · EXPLORE — the two ways in ═══════════════════════════════
   Play asks what kind of evening this is: six chapters you can mix, and two
   dials that weight the draw inside them. Explore is the same deck as a
   handful of drawers, each opening onto the categories it is made of. One
   selection underneath both, and one spice toggle and After Dark link
   shared above both tabs, so neither view goes without them.            */
(function(){
  const $ = id => document.getElementById(id);

  // Derived from CATEGORIES' own .chapter field (config.js) rather than
  // hand-listed here — a category's chapter is set in exactly one place.
  const CHAPTERS = {};
  Object.keys(CATEGORIES).forEach(id => {
    const ch = CATEGORIES[id].chapter;
    if (ch) (CHAPTERS[ch] = CHAPTERS[ch] || []).push(id);
  });
  const inDeck = l => DECK_LEVELS.has(l);
  const chapterLevels = id => (CHAPTERS[id] || []).filter(inDeck);
  // the chapter's categories the sheet shows under the current preset limits
  const visibleLevels = id => chapterLevels(id).filter(l =>
    document.querySelector('.toggle-btn[data-level="' + l + '"]')?.style.display !== 'none');
  /* A bucket can hold opt-in-only members (Ease In has the ordered lists)
     that a bulk click deliberately never turns on. Judging a bucket's
     on/off state against ALL its members meant it could never reach "on" —
     every click re-ran the turn-on branch, so it looked stuck and never
     deselected. On/off is judged only against the members a click can
     actually control; the count badge still shows against every member. */
  const controllable = levels => { const c = levels.filter(l => !OPT_IN_ONLY.includes(l)); return c.length ? c : levels; };

  function stateOf(levels){
    const live = levels.filter(l => !(state.safeMode && SAFE_BLOCKED_LEVELS.includes(l)));
    const pool = live.length ? live : levels;
    if (!pool.length) return 'off';
    const on = pool.filter(l => state.activeToggles.has(l)).length;
    return on === 0 ? 'off' : (on === pool.length ? 'on' : 'part');
  }

  function openAfterDark(){
    if (MASTER_SAFE || WORKPLACE_MODE) return false;
    if (state.safeMode) { state.safeMode = false; state.spiceMode = true; updateAfterDarkBtn(); }
    return true;
  }

  window.openAfterDark = openAfterDark;

  function setLevels(levels, on){
    levels.forEach(l => {
      if (on) { if (!(state.safeMode && SAFE_BLOCKED_LEVELS.includes(l))) state.activeToggles.add(l); }
      else state.activeToggles.delete(l);
    });
  }

  function syncIntentUI(){
    document.querySelectorAll('.chapter').forEach(btn => {
      const visible = visibleLevels(btn.dataset.chapter);
      const st = stateOf(visible);
      btn.classList.toggle('on',   st === 'on');
      btn.classList.toggle('part', st === 'part');
      /* a chapter with nothing reachable under it in the current mode doesn't
         belong on screen at all — the same rule an Explore drawer already
         follows (bkt-hidden), applied one level up. Applies to any chapter
         in any mode, e.g. After Dark in New people/Solo, or Into the Deep in
         Work/Date/New people. */
      btn.closest('.chapter-group')?.classList.toggle('ch-hidden', visible.length === 0);
      /* "n / total": how many of this chapter's categories are on, of those reachable here */
      const ct = btn.querySelector('.ch-ct');
      if (ct) ct.textContent = `${visible.filter(l => state.activeToggles.has(l)).length} / ${visible.length}`;
    });
    updateListModeNote();
    syncFoldAll();
    $('deselectAll').textContent = state.activeToggles.size ? 'None' : 'All';
  }
  window.syncIntentUI = syncIntentUI;

  // Colbert / The 36 aren't evenings built from chapters — they're fixed,
  // ordered lists, so "What kind of evening?" has nothing under it to show
  // once one is picked. Rather than leave that blank, swap the chapter grid
  // for a line saying what's actually playing.
  const LIST_MODE_TEXT = {
    colbertmode: CATEGORY_DESCRIPTIONS.colbert,
    aronmode:    CATEGORY_DESCRIPTIONS.aron,
  };
  function updateListModeNote(){
    const note  = $('listModeNote');
    if (!note) return;
    const chaps = $('chapters');
    const text = LIST_MODE_TEXT[state.activePreset];
    // The Fixed Sets row stays visible even in list mode, so you can switch
    // from one set to the other; only the chapters step aside.
    if (text) {
      note.textContent = text;
      note.style.display = 'block';
      if (chaps) chaps.querySelectorAll('.chapter-group:not(.chapter-group--fixed)').forEach(g => g.style.display = 'none');
    } else {
      note.style.display = 'none';
      if (chaps) chaps.querySelectorAll('.chapter-group').forEach(g => g.style.display = '');
    }
  }

  function commit(){
    syncActivePreset();
    applyToggleUI();   // calls syncIntentUI() itself
    initDeck();
    if (typeof renderShell === 'function') renderShell();
  }

  /* ── chapters: plain add/remove toggles on whatever's already selected —
     same rule as an Explore bucket, no matter what put the current
     selection there (a preset, Explore, another chapter). A chapter never
     wipes the rest of the room; it only ever adds or removes its own
     categories. ── */
  $('chapters').addEventListener('click', e => {
    if (e.target.closest('.spice-glyph, .ch-fold')) return;   // the spice toggle and the fold target handle themselves
    const btn = e.target.closest('.chapter'); if (!btn) return;
    const id = btn.dataset.chapter;
    const levels = visibleLevels(id);
    const turningOn = stateOf(controllable(levels)) !== 'on';
    if (id === 'afterdark' && turningOn && !openAfterDark()) return;
    syncCategoryButtons();   // After Dark may just have opened
    intentOn = true;
    setLevels(levels, turningOn);
    commit();
  });

  /* None / All at the Chapters heading: None while anything is on, All once nothing is.
     All switches on every category the sheet shows under the current limits, After Dark
     included when its gate opens; opt-in-only categories are never swept up. */
  $('deselectAll').addEventListener('click', () => {
    if (state.activeToggles.size) state.activeToggles.clear();
    else {
      const levels = Object.keys(CHAPTERS).flatMap(visibleLevels).filter(l => !OPT_IN_ONLY.includes(l));
      if (state.safeMode && levels.some(l => SAFE_BLOCKED_LEVELS.includes(l)) && openAfterDark()) syncCategoryButtons();
      setLevels(levels, true);
    }
    commit();
  });

  /* ── defaults: what the app opens on, and what Draw plays ── */
  function applyDefaultSelection(){
    const d = window.DEFAULT_SELECTION || { mode:'preset', preset:'balanced', intensity:50, focus:50 };
    if (d.mode === 'preset') {
      // Routes through the exact same applyPreset() every mode button
      // uses, so the matching button legitimately shows active — a
      // selection that doesn't match any preset shouldn't leave every
      // button looking equally (un)selected, see PRESETS.balanced.
      applyPreset(d.preset);
      document.querySelectorAll('.mode-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === d.preset));
    } else {
      // Unlike an in-flight edit, this genuinely isn't any preset — the
      // config named a chapter set or "all" instead, so nothing should
      // claim to be Balanced (or anything else) here.
      state.activePreset = '';
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      _lastPreset = '';   // not any preset: no limits
      syncCategoryButtons();
      state.activeToggles.clear();
      if (d.mode === 'all') {
        document.querySelectorAll('.toggle-btn').forEach(b => {
          const lvl = b.dataset.level;
          if (!lvl || b.style.display === 'none') return;
          if (lvl === 'backup' && !window.SHOW_BACKUP) return;
          if (OPT_IN_ONLY.includes(lvl)) return;
          if (state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl)) return;
          state.activeToggles.add(lvl);
        });
      } else {
        (d.chapters || []).forEach(id => {
          if (id === 'afterdark') { if (!openAfterDark()) return; }
          setLevels(chapterLevels(id), true);
        });
      }
    }
    intentIntensity = (d.intensity != null ? d.intensity : 50) / 100;
    intentFocus     = ((d.focus != null ? d.focus : 50) / 100) * 2 - 1;
    intentOn = true;
  }

  /* A chip, preset or bulk All/None is a selection of its own — the dials
     stop weighting it, so a chapter tapped afterwards doesn't silently
     resume a weighting the player never asked for here. The selection
     itself is untouched; every route in (preset, Explore, a chapter) is a
     plain add/remove toggle on whatever's already there — nothing wipes
     the room out from under whatever came before it. */
  ['modeBar','deselectAll'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => { intentOn = false; syncIntentUI(); }, true);
  });
  $('chapters').addEventListener('click', e => {
    if (e.target.closest('.toggle-btn')) { intentOn = false; syncIntentUI(); }
  }, true);

  /* Each "Start from" room has its own natural depth and focus. The preset
     itself still decides exactly which categories are on — this only moves
     the dials to where that room's mood actually sits, so if the player
     starts mixing chapters in afterwards, the dials aren't left wherever a
     different room last set them. Strangers and Work sit light; Late Night
     sits the most intense; Partner leans furthest toward Us. */
  const PRESET_DIALS = {
    open:       { intensity:50, focus:50 },
    balanced:   { intensity:50, focus:50 },
    newpeople:  { intensity:15, focus:30 },
    friends:    { intensity:20, focus:45 },
    dating:     { intensity:40, focus:55 },
    partner:    { intensity:60, focus:75 },
    latenight:  { intensity:90, focus:55 },
    solo:       { intensity:45, focus:5  },
    work:       { intensity:10, focus:25 },
    family_p:   { intensity:30, focus:40 },
  };
  const modeBarEl = $('modeBar');
  if (modeBarEl) modeBarEl.addEventListener('click', e => {
    const modeBtn = e.target.closest('.mode-btn'); if (!modeBtn) return;
    const d = PRESET_DIALS[modeBtn.dataset.mode]; if (!d) return;
    intentIntensity = d.intensity / 100;
    intentFocus     = (d.focus / 100) * 2 - 1;
    syncIntentUI();
  });

  /* ── folds: a chapter's count + chevron (and the whole Fixed Sets row) opens its
     panel in place. Several can be open at once; looking is not choosing, so
     opening or closing never touches the selection or the hand. ── */
  function setFold(btn, open){
    const grp = btn.closest('.chapter-group');
    const panel = grp && grp.querySelector('.chapter-panel');
    if (!panel || panel.classList.contains('open') === open) return;
    panel.classList.toggle('open', open);
    grp.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    const ms = open ? 260 : 200;
    window.slideFold(panel, open, prefersReducedMotion.matches ? 1 : ms);
    if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
  }

  /* "Open all" at the Chapters heading: every chapter the sheet shows (not Fixed Sets). */
  function shownChapterFolds(){
    return [...document.querySelectorAll('.chapter-group:not(.ch-hidden):not(.chapter-group--fixed) .chapter .ch-fold')];
  }
  function syncFoldAll(){
    const folds = shownChapterFolds();
    const allOpen = folds.length > 0 && folds.every(f => f.classList.contains('open'));
    $('foldAll').textContent = allOpen ? 'Close all' : 'Open all';
  }
  $('foldAll').addEventListener('click', () => {
    const folds = shownChapterFolds();
    const open = !folds.every(f => f.classList.contains('open'));
    folds.forEach(f => setFold(f, open));
    syncFoldAll();
  });

  $('chapters').addEventListener('click', e => {
    const f = e.target.closest('.ch-fold');
    if (!f) return;
    setFold(f, !f.classList.contains('open'));
    syncFoldAll();
  });

  /* ── move the re-homed presets into Play, where they belong ── */
  const presetHost = document.querySelector('.preset-host'), playPane = $('panePlay');
  if (presetHost && playPane) playPane.insertBefore(presetHost, playPane.firstChild);

  /* ── the app should never open empty: play the build's defaults now ── */
  applyDefaultSelection();
  commit();

  syncIntentUI();
})();

applyQueryDeck();   // ?Q=Work1,Life7,... overrides the drawn default hand, if present

// Silently resume whatever was last live (the ephemeral autosave slot, and
// the stored session it may be bound to) — after the default draw and the
// ?Q= override, so it's the last word on what's actually on screen. A ?Q=
// test link must stay exactly what it says, never quietly swapped for a
// saved session.
if (!state.queryDeckActive) autoResumeSession();



// Wide screens (see styles.css "WIDE SCREENS"): one scale for the chrome around the card, 1 at 1920x1080 and
// smaller on smaller windows, so the composition keeps its shape and the card gets the room. Phone: unused.
function setWideScale() {
  const k = Math.max(0.62, Math.min(1, Math.min(innerWidth / 1920, innerHeight / 1080) * 1.08));
  document.documentElement.style.setProperty('--k', k.toFixed(3));
}
setWideScale();
window.addEventListener('resize', setWideScale);
