// ── UI ───────────────────────────────────────────────────────────────────────
// DOM event wiring and app bootstrap. This is the file that actually runs at
// load time: the boot sequence that deals the opening hand, the two
// structural IIFEs that build the tray/drawer chrome and the Play/Explore
// controller, and the event listeners that don't belong to one specific
// domain file. Loads last, after every function it wires up. Executes top-
// to-bottom in the exact order app.js used to, so load-order-sensitive boot
// logic (the double init sequence, the final default-selection deal) behaves
// identically to before the split.

[document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); toggleTwist(); });
});


// Delegated remove handler — inline onclick breaks on quotes in the question text
document.getElementById('customList').addEventListener('click', e => {
  const btn = e.target.closest('.drawer-remove-btn');
  if (!btn) return;
  const card = state.customCards[parseInt(btn.dataset.idx, 10)];
  if (card) removeCustomCard(card.question);
});


// ── INIT ──────────────────────────────────────────────────────────────────────
if (MASTER_SAFE || WORKPLACE_MODE) {
  state.safeMode = true;
  document.getElementById('afterDarkToggle').style.display  = 'none';
  document.querySelector('.spice-toggle') && (document.querySelector('.spice-toggle').style.display = 'none');
  SAFE_BLOCKED_LEVELS.forEach(l => {
    const btn = document.querySelector(`.toggle-btn[data-level="${l}"]`);
    if (btn) btn.style.display = 'none';
  });
  const dBtn = null; // 'desire' mode removed with deck v14
  if (dBtn) dBtn.style.display = 'none';
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
loadCustomCards();
checkSavedSession();

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────


// Card limit — #limitBtnsDrawer (inside the "Fine-tune the hand" fold) is
// now the only card-count picker in the app.
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
document.getElementById('btn-next').addEventListener('click', nextCard);
document.getElementById('btn-prev').addEventListener('click', prevCard);

// Card star
document.getElementById('cardStar').addEventListener('click', e => {
  e.stopPropagation();
  toggleFavourite();
});

// Normal mode: tap the card to advance. The touch handler below owns every
// swipe gesture and calls preventDefault() when it acts, so the browser
// never synthesizes a click after a swipe — this handler only ever sees
// genuine taps and needs no "was that just a swipe?" flag to guard against.
document.getElementById('card').addEventListener('click', e => {
  if (state.partyMode) return;
  if (e.target.closest('#cardStar')) return;
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

document.getElementById('d-save').addEventListener('click',()=>{
  closeAllDrawers();
  if (saveMode==='continue') { continueSession(); }
  else { saveSession(); }
});
/* Snapshot of everything continueSession() needs to rehydrate a session.
   Pure function of state: reads state, writes nothing. Shared by the manual
   Save button and the after-every-card autosave so the two never drift. */

// ── Fullscreen party ──
(function(){
  const btn = document.getElementById('btnParty');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      state.partyMode = true;
      document.getElementById('partyOverlay').classList.add('open');
      if (state.currentIndex < 0 && state.visibleDeck.length > 0) {
        state.currentIndex = 0;
        setCardDisplay(state.visibleDeck[0]);
        renderProgress();
        updateStarUI();
        updateDrawMore();
      } else if (state.currentIndex >= 0 && state.visibleDeck[state.currentIndex]) {
        updatePartyDisplay(state.visibleDeck[state.currentIndex]);
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

  newOv.addEventListener('touchend', e => {
    if (e.target.closest('#partyExit')) return;
    if (e.target.closest('#partyBtnTwist')) return;
    /* a hold just continued the draw — its release must not advance again.
       Reads the flag, doesn't clear it: the click handler below checks it
       too, in case this touchend's preventDefault doesn't fully suppress a
       trailing click (inconsistent across browsers after a long hold) —
       clearing it here would leave that click unprotected. start() clears
       it at the top of the next press. */
    if (window._endHoldFired) { e.preventDefault(); return; }
    e.preventDefault(); // suppresses subsequent click event on mobile
    const dx = e.changedTouches[0].clientX - ptsx;
    const dy = e.changedTouches[0].clientY - ptsy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      // swipe left = next, swipe right = prev
      if (dx < 0) partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
      else         partyThrottle(() => { prevCard();  updateDeckInfo(); });
    } else {
      // tap — only act on card area
      if (!e.target.closest('.party-card')) return;
      if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
      else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
    }
  }, { passive: false });

  // Click — desktop only (mobile click is suppressed by touchend's preventDefault above)
  newOv.addEventListener('click', function(e) {
    e.stopPropagation(); // prevent document-level handler from also firing
    if (e.target.closest('#partyExit')) return;
    if (e.target.closest('#partyBtnTwist')) return;
    if (window._endHoldFired) { return; }
    if (!e.target.closest('.party-card')) return; // outside card = no action
    if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
    else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
  });
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
  if(typeof pickMode!=='undefined' && pickMode) return;
  if(state.partyMode){
    if(e.key==='Escape')     exitParty();
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); updateDrawMore(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
  } else {
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
    if(e.key==='ArrowDown')  { e.preventDefault(); skipCard(); }
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

// updateDrawMore — transforms btn-next into "hold to continue" at the end of a hand

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
    clearTimeout(timer);
    const b = holdBtn();
    if (b && e && e.currentTarget === b) b.classList.add('holding');
    timer = setTimeout(() => {
      if (b) b.classList.remove('holding');
      window._endHoldOK    = true;
      /* Swallow the release, however long the press lasted. A time window here
         expired mid-hold, letting the release advance a second card. */
      window._endHoldFired = true;
      hint(false);
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
  // _undoCard / _undoIndex / _undoTimer are set by skipCard() itself now.
  const undoBtn = document.getElementById('skipUndo');
  if (!undoBtn) return;

  undoBtn.addEventListener('click', () => {
    if (!_undoCard) return;
    clearTimeout(_undoTimer);
    undoBtn.classList.remove('visible');
    // Re-insert card at original position and remove from skipped set
    state.skippedCards.delete(_undoCard.question);
    const insertAt = Math.min(_undoIndex, state.visibleDeck.length);
    state.visibleDeck.splice(insertAt, 0, _undoCard);
    state.currentIndex = insertAt;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    updateDeckInfo(); renderProgress(); updateDrawMore();
    _undoCard = null; _undoIndex = null;
  });
})();


(function() {
  const descEl = document.getElementById('catDesc');
  if (!descEl) return;
  const show = (btn) => {
    const desc = CATEGORY_DESCRIPTIONS[btn.dataset.level];
    if (!desc) return;
    descEl.textContent = desc + (btn.dataset.count ? '  ·  ' + btn.dataset.count + ' cards' : '');
    descEl.classList.add('lit');
  };
  const showBucket = (el) => {
    const desc = BUCKET_DESCRIPTIONS[el.dataset.bucket];
    if (!desc) return;
    descEl.textContent = desc;
    descEl.classList.add('lit');
  };
  document.querySelectorAll('.toggle-btn, .cbk-select').forEach(btn => {
    const isBucket = btn.classList.contains('cbk-select');
    const fire = () => isBucket ? showBucket(btn.closest('.cat-bucket')) : show(btn);
    // Desktop hover reads it too, no need to click
    btn.addEventListener('mouseenter', fire);
    // Every tap updates the description — same moment the category toggles
    btn.addEventListener('click', () => { if (!btn._longPressed) fire(); });
    // Long-press (450ms) reads the description WITHOUT toggling the category
    let touchTimer = null;
    btn.addEventListener('touchstart', () => {
      btn._longPressed = false;
      touchTimer = setTimeout(() => { btn._longPressed = true; fire(); }, 450);
    }, {passive:true});
    btn.addEventListener('touchmove', () => clearTimeout(touchTimer), {passive:true});
    btn.addEventListener('touchend',  () => clearTimeout(touchTimer), {passive:true});
  });
})();


// ═══════════════════════════════════════════════════════════
// CUSTOM CARDS — export / import
// ═══════════════════════════════════════════════════════════
(function() {
  const expBtn = document.getElementById('customExportBtn');
  const impBtn = document.getElementById('customImportBtn');
  if (expBtn) {
    expBtn.addEventListener('click', () => {
      if (!state.customCards.length) return;
      const blob = new Blob([JSON.stringify(state.customCards, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'between-us-custom-cards.json';
      a.click();
    });
  }
  if (impBtn) {
    impBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json';
      inp.onchange = async e => {
        try {
          const text = await e.target.files[0]?.text();
          if (!text) return;
          const imported = JSON.parse(text);
          if (!Array.isArray(imported)) return;
          imported.forEach(c => {
            if (!c.question || !c.level) return;
            if (state.customCards.find(x => x.question === c.question)) return; // skip dupes
            const card = { level: c.level, question: c.question, custom: true };
            if (c.nl) card.nl = c.nl;
            state.customCards.push(card);
            ALL_CARDS.push(card);
          });
          localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards));
          renderCustomList();
          updateCatCounts();
          initDeck();
        } catch(err) { console.warn('Import failed:', err); }
      };
      inp.click();
    });
  }
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


(function(){
  const btn = document.getElementById('pickToggle');
  if (!btn) return;
  let prevLimit = null; // remember the limit before pick mode was turned on

  btn.addEventListener('click', () => {
    pickMode = !pickMode;
    btn.classList.toggle('on', pickMode);
    renderShell();  // mirror the toggle onto the fullscreen Draw-three button

    if (pickMode) {
      // Remember current limit and switch to All so there are always enough cards to pick from
      prevLimit = state.cardLimit;
      if (state.cardLimit !== null) {
        state.cardLimit = null;
        syncLimitButtons();
        initDeck();
      }
      // Turning this on IS the draw — show the first three immediately
      // instead of leaving the "place to begin" placeholder sitting there
      // for an extra, unsignposted tap.
      nextCard();
      updateDeckInfo();
    } else {
      // Restore previous limit
      closePicker();
      if (prevLimit !== null) {
        state.cardLimit = prevLimit;
        syncLimitButtons();
        initDeck();
      }
      prevLimit = null;
    }
  });
})();

// ── Category card counts in the grid ──

updateCatCounts();

// Apply initial language to all language UI (incl. html lang attribute)
setLang(state.lang, true);

checkSavedSession();


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

  /* ── re-home existing controls into trays ── */
  /* modes now live in the categories drawer as presets */
  const presetHost=document.createElement('div');
  presetHost.className='preset-host';
  presetHost.innerHTML='<div class="preset-host-lbl">Who\'s at the table?</div>';
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
  function openCats(){
    if(!togglesWrap.classList.contains('open')) catLabel.click(); /* keep original state machine in sync */
    catArea.classList.add('sheet-open'); scrim.classList.add('on');
    document.querySelectorAll('.tray.open,.tok.open').forEach(el=>el.classList.remove('open'));
    catArea.removeAttribute('aria-hidden');
    $('d-cats').setAttribute('aria-expanded', 'true');
    catArea.focus();
  }
  function closeCats(){
    catArea.classList.remove('sheet-open'); scrim.classList.remove('on');
    catArea.setAttribute('aria-hidden', 'true');
    $('d-cats').setAttribute('aria-expanded', 'false');
    // d-cats lives inside menuDrawer, already closed by the time this fires — a
    // stable, always-visible anchor (same one closeAllDrawers uses) is safer to
    // refocus than a trigger that may now sit inside a hidden dialog.
    const btnMenu = $('btn-menu'); if (btnMenu) try { btnMenu.focus(); } catch(e) {}
  }
  window.openCats=openCats; window.closeCats=closeCats;
  openRow.addEventListener('click', openCats);
  $('catClose').addEventListener('click', closeCats);
  scrim.addEventListener('click', closeCats);
  $('d-cats').addEventListener('click', ()=>{ if(typeof closeAllDrawers==='function') closeAllDrawers(); openCats(); });

  // "Draw Cards" — closes the sheet and deals straight into the first hand
  // of whatever's now selected, the same reshuffle-then-deal the app already
  // does elsewhere (deck.js's end-of-hand hold) — so finishing the sheet
  // never leaves the placeholder card sitting there waiting for one more tap.
  const goBtn = $('catGoBtn');
  if (goBtn) goBtn.addEventListener('click', () => {
    initDeck();
    _nextCardBase();
    updateDeckInfo(); updateDrawMore();
    closeCats();
  });

  /* ── shuffle toggle: Arc vs Wild, a straight two-way switch ──
     Deep/Breadth are gone from the picker (see SHUFFLE_MODES' note in
     config.js) — Arc and Wild are the only two live shuffle modes, so this
     is a plain toggle inside the fold, not a list. */
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

  /* ── "Fine-tune the hand" fold: dials, shuffle toggle, card count ── */
  const finetuneToggle = $('finetuneToggle'), finetuneOptions = $('finetuneOptions');
  if (finetuneToggle && finetuneOptions) finetuneToggle.addEventListener('click', () => {
    const open = finetuneOptions.classList.toggle('open');
    finetuneToggle.classList.toggle('open', open);
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
/* ═════════ PLAY · EXPLORE — the two ways in ═══════════════════════════════
   Play asks what kind of evening this is: five chapters you can mix, and two
   dials that weight the draw inside them. Explore is the same deck as eight
   drawers, each opening onto the categories it is made of. One selection
   underneath both, and one spice toggle and After Dark link shared above
   both tabs, so neither view goes without them.                          */
(function(){
  const $ = id => document.getElementById(id);

  const CHAPTERS = {
    warmup:    ['quick','warm'],
    surface:   ['culture','life','home','work','unwind','world'],
    findout:   ['self','mind','body','values','wish',
                'connect','friends','date','attract','family','spirit'],
    deeper:    ['past','roots','deep','raw','shadow','grief'],
    aboutus:   ['us','usfriend','uslove'],
    afterdark: ['usintimate','flesh','carnal','bare','kinks'],
  };
  const inDeck = l => DECK_LEVELS.has(l);
  const chapterLevels = id => (CHAPTERS[id] || []).filter(inDeck);
  const bucketLevels  = id => [...document.querySelectorAll('.toggle-btn[data-bucket="'+id+'"]')]
                                .map(b => b.dataset.level).filter(inDeck);
  /* Ease In and After Dark each hold opt-in-only members (the ordered lists;
     Abyss) that a bulk click deliberately never turns on. Judging a bucket's
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

  // Name is historical — it used to also drop state.activePreset and
  // un-highlight the preset row, on the theory that touching a chapter or
  // Explore bucket meant you'd left the preset behind. A tweak on top of
  // Balanced is still Balanced, not nothing, so that part's gone: this now
  // only re-syncs which toggle buttons are visible/locked (safe mode,
  // in-deck, backup) — the preset identity itself survives an edit.
  function releasePresetMask(){
    document.querySelectorAll('.toggle-btn').forEach(b => {
      const lvl = b.dataset.level; if (!lvl) return;
      const lockedOut = (MASTER_SAFE || WORKPLACE_MODE) && SAFE_BLOCKED_LEVELS.includes(lvl);
      const hide = lockedOut || !inDeck(lvl) || (lvl === 'backup' && !window.SHOW_BACKUP);
      b.style.display = hide ? 'none' : '';
      b.classList.toggle('hard-locked', !hide && state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl));
    });
    if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
  }

  function openAfterDark(){
    if (MASTER_SAFE || WORKPLACE_MODE) return false;
    if (state.safeMode) { state.safeMode = false; state.spiceMode = true; updateAfterDarkBtn(); }
    return true;
  }

  function setLevels(levels, on){
    levels.forEach(l => {
      if (on) { if (!(state.safeMode && SAFE_BLOCKED_LEVELS.includes(l))) state.activeToggles.add(l); }
      else state.activeToggles.delete(l);
    });
  }

  const INT_WORDS = ['Easy','Gentle','Balanced','Deeper','Intense'];
  const FOC_WORDS = ['About you','Leaning you','Balanced','Leaning us','About us'];
  const word = (list, t) => list[Math.min(list.length - 1, Math.floor(t * list.length))];

  function syncIntentUI(){
    document.querySelectorAll('.chapter').forEach(btn => {
      const levels  = chapterLevels(btn.dataset.chapter);
      const visible = levels.filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const st = stateOf(visible);
      btn.classList.toggle('on',   st === 'on');
      btn.classList.toggle('part', st === 'part');
      /* a chapter with nothing reachable under it in the current mode doesn't
         belong on screen at all — the same rule an Explore drawer already
         follows (bkt-hidden), applied one level up. This is what used to
         hard-lock After Dark for Work/Family only; now it applies to any
         chapter in any mode, e.g. After Dark in New people/Solo, or
         Into the Deep in Work/Date/New people. */
      btn.classList.toggle('ch-hidden', visible.length === 0);
    });
    document.querySelectorAll('.cat-bucket').forEach(hdr => {
      const levels  = bucketLevels(hdr.dataset.bucket);
      const visible = levels.filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const st = stateOf(controllable(visible));
      hdr.classList.toggle('on',   st === 'on');
      hdr.classList.toggle('part', st === 'part');
      hdr.classList.toggle('bkt-hidden', visible.length === 0);
      const c = hdr.querySelector('.cbk-count');
      if (c) c.textContent = visible.length
        ? visible.filter(l => state.activeToggles.has(l)).length + ' / ' + visible.length
        : '';
    });
    const iv = $('dialIntVal'), fv = $('dialFocVal');
    if (iv) iv.textContent = word(INT_WORDS, intentIntensity);
    if (fv) fv.textContent = word(FOC_WORDS, (intentFocus + 1) / 2);
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.style.opacity = intentOn ? '1' : '.45';
    if (fi) fi.style.opacity = intentOn ? '1' : '.45';
    updateListModeNote();
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
    // Customize stays visible even in list mode — it's the only door into
    // Explore now that the tab strip is gone, so hiding it here dead-ended
    // anyone wanting to browse categories or switch fixed sets.
    if (text) {
      note.textContent = text;
      note.style.display = 'block';
      if (chaps) chaps.style.display = 'none';
    } else {
      note.style.display = 'none';
      if (chaps) chaps.style.display = '';
    }
  }

  function commit(){
    applyToggleUI();   // now calls syncIntentUI() itself
    initDeck();
    if (typeof renderShell === 'function') renderShell();
  }

  /* ── chapters: plain add/remove toggles on whatever's already selected —
     same rule as an Explore bucket, no matter what put the current
     selection there (a preset, Explore, another chapter). A chapter never
     wipes the rest of the room; it only ever adds or removes its own
     categories. ── */
  $('chapters').addEventListener('click', e => {
    if (e.target.closest('.spice-glyph')) return;   // the inline After Dark spice toggle handles itself
    const btn = e.target.closest('.chapter'); if (!btn) return;
    const id = btn.dataset.chapter;
    const turningOn = stateOf(controllable(chapterLevels(id))) !== 'on';
    if (id === 'afterdark' && turningOn && !openAfterDark()) return;
    releasePresetMask();
    intentOn = true;
    setLevels(chapterLevels(id), turningOn);
    commit();
  });

  /* ── dials ── */
  /* Halfway is the default — a magnetic dead zone around it, felt during the
     drag itself (like Android's system sliders, or Lightroom mobile's snap
     to 0): while the finger is within a few percent of 50, the thumb holds
     at exactly 50 instead of tracking the finger 1:1, so crossing centre
     takes a small deliberate push. That reads as a physical catch. The
     previous version only snapped once on release — the thumb tracked the
     finger the whole drag, then jumped to 50 after the fact, which read as
     the value being pulled there rather than the finger feeling anything. */
  function dial(el, apply){
    if (!el) return;
    const snap = () => { if (Math.abs(+el.value - 50) <= 4) el.value = 50; };
    el.addEventListener('input', () => { snap(); apply(+el.value / 100); intentOn = true; syncIntentUI(); });
    ['change','pointerup','touchend'].forEach(ev =>
      el.addEventListener(ev, () => {
        snap();
        apply(+el.value / 100); intentOn = true; commit();
      }, {passive:true}));
  }
  dial($('dialIntensity'), t => { intentIntensity = t; });
  dial($('dialFocus'),     t => { intentFocus = t * 2 - 1; });

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
      releasePresetMask();
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
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.value = d.intensity != null ? d.intensity : 50;
    if (fi) fi.value = d.focus != null ? d.focus : 50;
    intentOn = true;
  }

  /* ── Explore drawers: select and expand are separate buttons now, each
     with a real touch target, instead of one element with a tiny hot corner
     found via closest() — that ambiguity was why the drawer only opened
     some of the time. ── */
  document.querySelectorAll('.cat-bucket').forEach(hdr => {
    const id = hdr.dataset.bucket;
    const expandBtn = hdr.querySelector('.cbk-expand');
    if (expandBtn) expandBtn.addEventListener('click', () => {
      const open = hdr.classList.toggle('open');
      document.querySelectorAll('.toggle-btn[data-bucket="'+id+'"]')
        .forEach(b => b.classList.toggle('chip-folded', !open));
      if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
    });
    const selectBtn = hdr.querySelector('.cbk-select');
    if (selectBtn) selectBtn.addEventListener('click', () => {
      const levels = bucketLevels(id).filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const turningOn = stateOf(controllable(levels)) !== 'on';
      if (id === 'afterdarkb' && turningOn && !openAfterDark()) return;
      releasePresetMask();
      intentOn = false;   // an Explore edit only drops the dials' weighting — the
                          // selection itself stays exactly as edited
      setLevels(levels.filter(l => !(turningOn && OPT_IN_ONLY.includes(l))), turningOn);
      commit();
    });
  });

  /* A chip, preset or bulk All/None is a selection of its own — the dials
     stop weighting it, so a chapter tapped afterwards doesn't silently
     resume a weighting the player never asked for here. The selection
     itself is untouched; every route in (preset, Explore, a chapter) is a
     plain add/remove toggle on whatever's already there — nothing wipes
     the room out from under whatever came before it. */
  ['toggles','modeBar','selectAll','deselectAll'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => { intentOn = false; syncIntentUI(); }, true);
  });

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
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.value = d.intensity;
    if (fi) fi.value = d.focus;
    syncIntentUI();
  });

  /* Shape is always what the sheet opens to; Customize (under the chapters)
     is the only way down into Explore's category grid, and Back is the only
     way up again — no tab strip to flip between the two any more. */
  function showPane(name){
    $('panePlay').classList.toggle('on', name === 'play');
    $('paneExplore').classList.toggle('on', name === 'explore');
    syncIntentUI();   // looking is not choosing — switching panes never re-deals the hand
    if (typeof updateTimeOfDayHeading === 'function') updateTimeOfDayHeading();  // sheet title tracks the pane
    if (name === 'explore' && typeof updateGridScrollHint === 'function') updateGridScrollHint();
  }
  const customizeBtn = $('customizeBtn'), paneBackBtn = $('paneBackBtn');
  if (customizeBtn) customizeBtn.addEventListener('click', () => showPane('explore'));
  if (paneBackBtn)  paneBackBtn.addEventListener('click', () => showPane('play'));

  /* ── "Tune the hand" info tooltip — a tap target, not a permanent
     explainer line eating space in the console. ── */
  const fineInfoBtn = $('fineInfoBtn'), fineInfoTip = $('fineInfoTip');
  if (fineInfoBtn && fineInfoTip) {
    fineInfoBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = fineInfoTip.classList.toggle('open');
      fineInfoBtn.classList.toggle('open', open);
    });
    document.addEventListener('click', e => {
      if (fineInfoTip.classList.contains('open') && !fineInfoBtn.contains(e.target) && !fineInfoTip.contains(e.target)) {
        fineInfoTip.classList.remove('open');
        fineInfoBtn.classList.remove('open');
      }
    });
  }

  // Fixed sets (Colbert/The 36) stay collapsed until asked for — no
  // permanent space for something most sessions never touch.
  const fixedSeqToggle = $('fixedSeqToggle'), fixedSeqOptions = $('fixedSeqOptions');
  if (fixedSeqToggle && fixedSeqOptions) fixedSeqToggle.addEventListener('click', () => {
    const open = fixedSeqOptions.classList.toggle('open');
    fixedSeqToggle.classList.toggle('open', open);
  });

  /* ── move the re-homed presets into Play, where they belong ── */
  const presetHost = document.querySelector('.preset-host'), playPane = $('panePlay');
  if (presetHost && playPane) playPane.insertBefore(presetHost, playPane.firstChild);

  /* ── the app should never open empty: play the build's defaults now ── */
  applyDefaultSelection();
  commit();

  syncIntentUI();
})();

