// Rendering that isn't specific to one card or one selection: progress dots,
// the app shell's token line, party-mode display, drawers, and the end-of-hand/end-of-round summaries — plus the listeners
// for the controls that directly trigger this domain's own rendering
// (drawer open/close buttons). (The app's boot sequence
// lives in ui.js.)

// Counter readout on both screens: "n / total" in digits.
function countLabel(n, total) {
  return `${n} / ${total}`;
}

// `currentOverride`, when given, replaces state.currentIndex for this render
// only — used by the end-of-round summary to show every card as passed
// without a "current" tick, without touching real session position.
//
// One tick per card, up to PROGRESS_CAP on screen. Past that the window
// slides to keep the current card (plus one ahead) in view; ticks before it
// have simply scrolled out of frame, not been compressed or restyled.
const PROGRESS_CAP = 20;
let _progressOverride, _progressWidth = 0;
function renderProgress(currentOverride) {
  _progressOverride = currentOverride;
  const container = document.getElementById('progress');
  const countEl = document.getElementById('progCountNum');
  const deckLen = state.visibleDeck.length;
  const cur = currentOverride === undefined ? state.currentIndex : currentOverride;

  let start = 0, end = deckLen - 1;
  if (deckLen > PROGRESS_CAP) {
    end = Math.min(deckLen - 1, cur + 1);         // current + one ahead, if it exists
    start = Math.max(0, end - (PROGRESS_CAP - 1)); // 20 dots ending there
  }
  const shown = Math.max(0, end - start + 1);

  // The line is exactly the card's width (CSS: .progress is 100% of a column
  // capped to the card); the pieces share that width, with room kept for the
  // end diamond (8px + its 6px/2px margins + one gap) when it is shown.
  const hasEnd = deckLen > 0 && end === deckLen - 1;
  const W = (container.clientWidth || 300) - (hasEnd ? 16 : 0), gapDefault = 4;
  _progressWidth = container.clientWidth;
  const gaps = hasEnd ? shown : shown - 1;
  let dotW = shown > 0 ? (W - gaps * gapDefault) / shown : 0;
  let gap = gapDefault;
  if (dotW < 3) { dotW = 3; gap = gaps > 0 ? Math.max(1.5, (W - shown * 3) / gaps) : 0; }
  // past 20 cards the line carries on beyond the card: fade the sides where
  // it does (not where the hand really starts or ends)
  container.classList.toggle('fade-l', deckLen > PROGRESS_CAP && start > 0);
  container.classList.toggle('fade-r', deckLen > PROGRESS_CAP && end < deckLen - 1);

  container.innerHTML = '';
  container.style.setProperty('--dot-gap', gap + 'px');
  for (let i = start; i <= end; i++) {
    const card = state.visibleDeck[i];
    const tick = document.createElement('div');
    const isSeen    = i < cur;
    const isCurrent = i === cur;
    tick.className = 'progress-tick' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
    tick.style.width = dotW + 'px';
    if (isSeen || isCurrent) tick.style.setProperty('--tick-color', levelColor(card.level));
    container.appendChild(tick);
  }
  // The terminal diamond only appears once the real last card is inside the
  // visible window — a window that's slid away from the end has nothing to
  // cap yet.
  if (hasEnd) {
    const endDot = document.createElement('div');
    endDot.className = 'progress-tick end' + (cur >= deckLen ? ' current' : '');
    container.appendChild(endDot);
  }

  if (countEl) {
    countEl.innerHTML = deckLen > 0
      ? countLabel(Math.min(cur + 1, deckLen), deckLen)
      : '';
  }
}

// the line follows the card's width: redraw when it changes (resize, rotate)
if (typeof ResizeObserver !== 'undefined') {
  const _pEl = document.getElementById('progress');
  if (_pEl) new ResizeObserver(() => {
    if (_pEl.clientWidth !== _progressWidth) renderProgress(_progressOverride);
  }).observe(_pEl);
}

function updateShuffleDisplay() {
  const name = SHUFFLE_MODES[shuffleModeIdx] || state.randomMode;
  state.randomMode = name;
  // Reflect the active mode straight onto the Shuffle token value.
  const vo = document.getElementById('valOrder');
  if (vo) vo.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

function updatePartyDisplay(card) {
  const pq  = document.getElementById('party-question');
  const pl  = document.getElementById('party-level');
  const pc  = document.getElementById('party-count');
  const pa  = document.getElementById('party-accent');
  const ps  = document.getElementById('partyStar');
  const pv  = document.getElementById('partyPrevBtn');
  if (pv) pv.disabled = state.currentIndex <= 0;
  applyCardMark(document.querySelector('.party-frame'), card);   // deck-mark corners (After Dark, Colbert, The 36) reach Spotlight too
  if (pq) pq.classList.remove('is-end-msg');
  if (!card) {
    if (pq) pq.textContent = 'Draw a card to begin.';
    if (pl) { pl.textContent=''; pl.style.color=''; }
    if (pc) pc.textContent = '';
    if (pa) giltRailPaint(pa, null);
    if (ps) ps.classList.remove('on');
    return;
  }
  const color = levelColor(card.level);
  if (pa) { giltRailPaint(pa, color); pa.classList.remove('accent-bloom'); void pa.offsetWidth; pa.classList.add('accent-bloom'); }
  if (pl) { pl.textContent=LEVEL_LABELS[card.level]||''; pl.style.color=labelColor(color); }
  const td = document.querySelector('.twist-div');   // Twist divider: question-side bar = the card's category colour, as the pick dividers use
  if (td) td.style.setProperty('--pd-a', color);
  if (pq) {
    pq.textContent = translateQ(card);
    pq.classList.add('entering');
    requestAnimationFrame(()=>requestAnimationFrame(()=>pq.classList.remove('entering')));
  }
  if (pc) pc.textContent = countLabel(state.currentIndex+1, state.visibleDeck.length);
  if (ps) ps.classList.toggle('on', state.favourites.some(f => f.question === card.question));
}

function toggleCategories() {
  state.categoriesCollapsed = !state.categoriesCollapsed;
  const wrap  = document.getElementById('toggles-wrap');
  const arrow = document.getElementById('catArrow');
  const lbl   = document.getElementById('catLabel');
  if (wrap)  wrap.classList.toggle('open', !state.categoriesCollapsed);
  if (arrow) arrow.textContent = state.categoriesCollapsed ? '▶' : '▼';
  if (lbl)   { lbl.classList.toggle('open', !state.categoriesCollapsed); lbl.blur(); }
};

function updateDeckInfo() {
  const shown = state.visibleDeck.length, total = state.fullDeck.length;
  const el = document.getElementById('deckCount');
  if (el) el.textContent = shown===0 ? 'No categories' : shown===total ? `${total} cards` : `${shown} / ${total}`;
};

// Entering party mode is handled inline by the #btnParty click handler below.
function exitParty() {
  state.partyMode = false;
  const overlay = document.getElementById('partyOverlay');
  if (overlay) overlay.classList.remove('open');
  movePickerToScreen();   // Three options up: they move along back to the main screen
};

// ── Drawer helpers ──
// btn-menu is the one drawer trigger that's never itself inside a drawer, so
// it's always a safe, visible place to return focus to when any drawer closes
// — the sub-drawer triggers (d-played, d-favs, ...) live inside menuDrawer, which
// is already closed by the time a sub-drawer closes, so focusing them back
// would land focus inside a hidden dialog.

const DRAWER_TRIGGERS = '#btn-menu, [data-menu][aria-expanded]';
function openDrawer(id, triggerEl) {
  document.getElementById('overlay').classList.remove('fading');
  document.getElementById('overlay').classList.add('open');
  const el = document.getElementById(id);
  el.classList.remove('leaving');
  el.classList.add('open');
  el.scrollTop = 0;   // reopening shouldn't land wherever a previous scroll left it
  if (typeof window.lockBodyScroll === 'function') window.lockBodyScroll();
  el.setAttribute('aria-hidden', 'false');
  if (triggerEl) triggerEl.setAttribute('aria-expanded', 'true');
  // preventScroll: these drawers are fixed-position overlays, not something
  // the page needs to scroll to reach — without this, focusing a drawer
  // that starts below the fold (or closing back to btn-menu, same issue
  // below) silently scrolled the whole page to bring it into view.
  el.focus({preventScroll: true});
}
// A drawer that has already faded (leaving) goes away without sliding or snapping back to full opacity.
function putAwayUnseen(el) {
  el.style.transition = 'none';
  el.classList.remove('open', 'leaving');
  el.getBoundingClientRect();   // settle the unanimated state before the transition comes back
  el.style.transition = '';
}
function closeAllDrawers() {
  document.getElementById('overlay').classList.remove('open', 'fading');
  if (typeof window.unlockBodyScroll === 'function') window.unlockBodyScroll();
  ['menuDrawer','menuSideDrawer','playedDrawer','favsDrawer','helpDrawer'].forEach(id=>{
    const el=document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('leaving')) putAwayUnseen(el);
    else el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll(DRAWER_TRIGGERS).forEach(el=>el.setAttribute('aria-expanded', 'false'));
  const btnMenu = document.getElementById('btn-menu');
  if (btnMenu) try { btnMenu.focus({preventScroll: true}); } catch(e) {}
}

// "What kind of evening?" only means something in the evening — asking it at
// 9am reads as a bug, not a deliberate choice of words. Read the real clock
// instead of hard-coding one time of day.
const TIME_OF_DAY_WORD = {
  morning:   'morning',
  afternoon: 'afternoon',
  evening:   'evening',
  night:     'night',
};
function timeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}
function timeOfDayWord() {
  return TIME_OF_DAY_WORD[timeOfDay()];
}
function updateTimeOfDayHeading() {
  const word = timeOfDayWord();
  // playLeadFirst now lives in the sheet's own header row, next to Close —
  // it's the sheet's title, not a lead-in line above the chapters any more.
  const heading = document.getElementById('playLeadFirst');
  if (heading) heading.textContent = 'What kind of ' + word + '?';
}

// ── Category label toggle ──
document.getElementById('catLabel').addEventListener('click', toggleCategories);

// Shuffle mode is chosen from the Shuffle token tray (see the order list in the
// app shell wiring below); the mode is applied via updateShuffleDisplay().
// ── Menu: the phone drawer, or (the condition The Deck is docked by) the side panel ──
// Both hold the same lines (between-us.html); each line's state is filled in every time the menu opens.
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

// How many cards a hand has, as the player reads it: a word up to twenty, "every card" for All.
function handSizeLabel(limit) {
  if (limit === null) return 'every card';
  return `${NUMBER_WORDS[limit] ?? limit} ${limit === 1 ? 'card' : 'cards'}`;
}

// Each line's state as short parts: joined by commas on the phone, stacked in the side panel's count column.
// A line with nothing true to say about a number says nothing.
function menuStates() {
  const seen = _seenSet();
  const total = state.fullDeck.length;
  const seenCount = state.fullDeck.filter(c => seen.has(c.question)).length;
  const drawn = state.sessionLog.length;
  const saved = getStoredSessions().length;
  const starred = state.favourites.length;
  return {
    cats: [document.getElementById('valCats').textContent, handSizeLabel(state.cardLimit)],
    start: total ? [`${seenCount} seen`, `${total - seenCount} left`] : [],
    played: [drawn ? `${drawn} drawn so far` : 'Nothing drawn yet', ...(saved ? [`${saved} saved`] : [])],
    favs: [starred ? `${starred} starred` : 'None starred yet'],
  };
}

function fillMenu() {
  const states = menuStates();
  const tokCats = document.getElementById('tokCats');
  document.querySelectorAll('[data-menu-state]').forEach((/** @type {HTMLElement} */ el) => {
    const spans = states[el.dataset.menuState].map(text => Object.assign(document.createElement('span'), { textContent: text }));
    // stacked in the side panel's count column, one sentence with commas on the phone
    el.replaceChildren(...(el.closest('.side-drawer') ? spans : spans.flatMap((span, i) => (i ? [', ', span] : [span]))));
    if (el.dataset.menuState !== 'cats') return;
    // the deck's name wears the colour the "Selected deck" line gives it, a gradient for a custom mix
    el.firstElementChild?.classList.add('menu-deck');
    el.classList.toggle('tok-multi', tokCats.classList.contains('tok-multi'));
    el.style.setProperty('--tokg', tokCats.style.getPropertyValue('--tokg'));
  });
}

function openMenu(trigger) {
  fillMenu();
  openDrawer(dockedQuery.matches ? 'menuSideDrawer' : 'menuDrawer', trigger);
}

// Crossing the line between the phone drawer and the side panel with a menu open: close it rather than leave a hidden drawer open under the overlay.
dockedQuery.addEventListener('change', closeAllDrawers);

// Start over: every card back in (a fresh pass; what was drawn stays in Played), and a fresh hand.
function startOver() {
  setActiveSessionId('');   // a fresh start: the next Save for later is a new evening, the saved one stays as it was
  startFreshPass();
  initDeck();
  updateDeckInfo(); updateDrawMore();
  closeAllDrawers();
}

// Menu to the next sheet in one move: the menu fades in place while the next sheet arrives as it always does,
// and the overlay stays up until the next sheet has its own dimming. Instant under reduced motion.
function leaveMenuFor(openNext) {
  const menu = /** @type {HTMLElement | null} */ (document.querySelector('#menuDrawer.open, #menuSideDrawer.open'));
  if (menu?.classList.contains('leaving')) return;   // already on its way out: a second tap opens nothing more
  if (!menu || matchMedia('(prefers-reduced-motion: reduce)').matches) { closeAllDrawers(); openNext(); return; }
  const overlay = document.getElementById('overlay');
  menu.classList.add('leaving');
  // each wait ends on its transition, with a timeout behind it (as closeCats does), and runs once
  const putAway = e => {
    if (e && e.target !== menu) return;   // a child's transition
    menu.removeEventListener('transitionend', putAway);
    if (menu.classList.contains('leaving')) putAwayUnseen(menu);   // not closed meanwhile (Escape, overlay)
  };
  menu.addEventListener('transitionend', putAway);
  setTimeout(() => putAway(null), 250);
  openNext();
  const w = /** @type {any} */ (window);
  if (typeof w.unlockBodyScroll === 'function') w.unlockBodyScroll();   // the next sheet holds its own scroll lock
  // The Deck dims with its own scrim (or, docked, not at all): the overlay eases out as it arrives
  if (!document.querySelector('[id$="Drawer"].open:not(.leaving)')) {
    overlay.classList.add('fading');
    const dropOverlay = () => {
      overlay.removeEventListener('transitionend', dropOverlay);
      if (overlay.classList.contains('fading')) overlay.classList.remove('open', 'fading');
    };
    overlay.addEventListener('transitionend', dropOverlay);
    setTimeout(dropOverlay, 700);
  }
}

const MENU_ACTIONS = {
  cats: () => leaveMenuFor(() => /** @type {any} */ (window).openCats()),   // openCats is published by ui.js
  start: startOver,
  played: trigger => leaveMenuFor(() => { renderLog(); renderSessionsList(); openDrawer('playedDrawer', trigger); }),
  favs: trigger => leaveMenuFor(() => { renderFavourites(); openDrawer('favsDrawer', trigger); }),
  help: trigger => { hintRetire('ways'); leaveMenuFor(() => openDrawer('helpDrawer', trigger)); },
  hints: () => { hintsReset(); closeAllDrawers(); },
  close: closeAllDrawers,
};
document.querySelectorAll('#menuDrawer, #menuSideDrawer').forEach(menu => menu.addEventListener('click', e => {
  const line = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-menu]'));
  if (line) MENU_ACTIONS[line.dataset.menu](line);
}));
document.getElementById('btn-menu').addEventListener('click', e => openMenu(e.currentTarget));
document.getElementById('overlay').addEventListener('click',closeAllDrawers);

// ── Played: the log (what was drawn now) and the saved sessions ──
document.getElementById('closePlayed').addEventListener('click',()=>closeAllDrawers());
// One file for a whole evening, from the Download button in Played and from the end-of-hand Save (one
// function, so the two can't drift into two file formats): the evening's name, the numbered list anyone can
// read, and at the very end the evening's state (serializeSession(), the one definition of what an evening
// captures) in a block a reader can ignore. No-op-safe on an empty list.
const STATE_FILE_FORMAT = 'between-us-state';
const STATE_BLOCK_MARK = '— state (for Open a list; you can ignore everything below this line) —';
function exportSessionLog() {
  if (!state.sessionLog.length) return;
  const favQ = new Set((state.favourites || []).map(f => f.question));
  const lines = state.sessionLog.map((c,i) => {
    const star = favQ.has(c.question) ? ' ★' : '';
    return `${i+1}. [${LEVEL_LABELS[c.level]||c.level}]${star}\n   ${c.question}`;
  }).join('\n\n');
  // at the end of a hand the position is the last card (the hand's end is not a card to come back to)
  const data = serializeSession();
  if (data.deckQuestions.length && data.position >= data.deckQuestions.length) data.position = data.deckQuestions.length - 1;
  const stateBlock = JSON.stringify({ format: STATE_FILE_FORMAT, version: 1, data }, null, 2);
  const rule = '─'.repeat(40);
  const text = `${eveningName()}\nBetween Us — ${new Date().toLocaleDateString()}\n${rule}\n\n${lines}\n\n${rule}\n${STATE_BLOCK_MARK}\n${stateBlock}\n`;
  const blob = new Blob([text],{type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`between-us-${new Date().toISOString().slice(0,10)}.txt`; a.click();
}
document.getElementById('btnExport').addEventListener('click', exportSessionLog);
// Save (end-of-hand screen, ui.js): the same single file.
function saveSessionFiles() { exportSessionLog(); }

// A whole evening back from its file: the state and the list, added to Saved under its name as the one playing now.
function openEveningFile(text) {
  // the marker is a line of its own, and the state is by design the last thing in the file: a question that
  // quotes the marker sits inside a line of text or a JSON string, never alone on a line
  const line = `\n${STATE_BLOCK_MARK}\n`;
  const at = text.lastIndexOf(line);
  if (at < 0) return false;
  let file = null;
  try { file = JSON.parse(text.slice(at + line.length)); } catch (error) { console.warn('Could not read the state in this file:', error); return false; }
  if (file?.format !== STATE_FILE_FORMAT || !file.data?.deckQuestions?.length) return false;   // nothing to restore: treat as an unreadable block
  const name = text.split('\n')[0].trim().slice(0, 80) || autoSessionName();
  restoreSessionData(file.data);
  setActiveSessionId('');
  storeCurrentSession(name);
  closeAllDrawers(); renderLog(); renderSessionsList(); openDrawer('playedDrawer');
  return true;
}

document.getElementById('btnImport') && document.getElementById('btnImport').addEventListener('click',()=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt,.json,text/plain,application/json';
  inp.onchange=async e=>{
    const text=await e.target.files[0]?.text(); if(!text) return;
    if (text.includes(STATE_BLOCK_MARK) && openEveningFile(text)) return;
    // an older state file restores the selection, settings and position
    if (text.trimStart().startsWith('{')) {
      let file = null;
      try { file = JSON.parse(text); } catch(err) {}
      if (file && file.format === STATE_FILE_FORMAT && file.data) { restoreSessionData(file.data); closeAllDrawers(); }
      return;
    }
    const qMap={}; ALL_CARDS.forEach(c=>{qMap[c.question.toLowerCase().trim()]=c;});
    const imported=[]; text.split('\n').forEach((line,i,arr)=>{
      if(/^\d+\. \[/.test(line.trim())){const q=arr[i+1]?.trim(); if(q) imported.push(qMap[q.toLowerCase()]||{question:q,level:'deep'});}
    });
    if(imported.length){state.sessionLog=imported;state.seenFrom=0;state.loggedQuestions=new Set(imported.map(c=>c.question));renderLog();closeAllDrawers();openDrawer('playedDrawer');}
  }; inp.click();
});

document.getElementById('btnClearLog').addEventListener('click', () => {
  state.sessionLog = []; state.seenFrom = 0; state.skippedSeen.clear(); state.loggedQuestions.clear(); renderLog();
  setActiveSessionId('');   // a fresh start: the next Save for later is a new evening, the saved one stays as it was
  renderSessionsList();
});

// ── Favourites ──
document.getElementById('closeFavs').addEventListener('click',()=>closeAllDrawers());

// ── Saved (multi-slot store, in Played) ──
document.getElementById('storeSessionBtn').addEventListener('click', ()=>{ storeCurrentSession(); });
// Delegated: the list re-renders on every store/rename/delete/open, so a
// direct per-row listener would need re-attaching each time — one listener
// on the container reads which row and which action (open the row itself,
// or one of the words Rename and Delete) from the click target instead.
document.getElementById('sessionsList').addEventListener('click', e => {
  const row = e.target.closest('[data-id]');
  if (!row) return;
  const id = row.dataset.id;
  const actionBtn = e.target.closest('[data-action]');
  const action = actionBtn ? actionBtn.dataset.action : 'open';
  if (action === 'delete') {
    deleteStoredSession(id);
  } else if (action === 'rename') {
    const entry = getStoredSessions().find(s => s.id === id);
    const name = window.prompt('Rename', entry ? entry.name : '');
    if (name) renameStoredSession(id, name);
  } else {
    openStoredSession(id);
    closeAllDrawers();
  }
});


// ── Help ──
document.getElementById('closeHelp').addEventListener('click',()=>closeAllDrawers());

function updateAfterDarkBtn() {
  const btn=document.getElementById('afterDarkToggle'); if(!btn) return;
  if (MASTER_SAFE || WORKPLACE_MODE) {
    // Hard lock: button gone AND every adult toggle stays hidden, in every mode
    btn.style.display='none';
    SAFE_BLOCKED_LEVELS.forEach(lvl=>{
      const b=document.querySelector(`.toggle-btn[data-level="${lvl}"]`);
      if(b){ b.style.display='none'; b.classList.remove('hard-locked'); }
    });
    return;
  }
  btn.classList.toggle('on',!state.safeMode);
  SAFE_BLOCKED_LEVELS.forEach(lvl=>{
    const b=document.querySelector(`.toggle-btn[data-level="${lvl}"]`);
    if(!b) return;
    if (b.style.display === 'none') return;   // not part of this mode — stays hidden, not just dimmed
    b.classList.toggle('hard-locked', state.safeMode);
  });
};





// ── SHELL RENDER ──────────────────────────────────────────────────────────────
// Single source of truth for the token-line labels. Every value is derived from
// state and written here; callers invoke renderShell() after a state change
// instead of the shell observing its own DOM for updates.
// Hex colour -> a deeper shade of it (see renderShell). Returns '' if not a hex.
function presetDeep(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h.replace(/./g, c => c + c);
  if (!/^[0-9a-f]{6}$/i.test(h)) return '';
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let L = (mx + mn) / 2, S = 0, H = 0;
  if (d) {
    S = d / (1 - Math.abs(2 * L - 1));
    H = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    H *= 60;
  }
  const L2 = L > 0.45 ? Math.max(0.45, L - 0.07) : L;
  return 'hsl(' + H.toFixed(1) + ',' + (S * 100).toFixed(1) + '%,' + (L2 * 100).toFixed(1) + '%)';
}
// ── CUSTOM: the picked categories' colours ───────────────────────────────────
// The selected, playable categories in CATEGORIES order (categories.js), same filter
// getFilteredCards() applies: switched on, in the deck, and not safe-blocked while
// safe mode is on.
function customPicks() {
  const safe = state.safeMode || MASTER_SAFE || WORKPLACE_MODE;
  return Object.keys(CATEGORIES).filter(k => state.activeToggles.has(k) && DECK_LEVELS.has(k) &&
    !(safe && SAFE_BLOCKED_LEVELS.includes(k)) && CATEGORIES[k].color).map(k => CATEGORIES[k].color);
}
// Which 2-3 picks are shown (logo line pairs, name gradient, --preset). With more
// than three picks they are chosen at random but kept readable and distinct: the
// first among the picks farther (Lab distance) from gold #c9a84c than the nearer
// half, so the line never reads gold; each next among the farther half of the
// remaining picks by distance to those already chosen. The choice is cached by the
// sorted picks, so it stays put until the set of picked categories changes.
// Returned in CATEGORIES order. With 3 or fewer picks all are shown.
const SHOWN_COUNT = 3;
let shownCache = { key: '', shown: [] };
function shownPicks(picks) {
  if (picks.length <= SHOWN_COUNT) return picks.slice();
  const key = [...picks].sort().join();
  if (shownCache.key === key) return shownCache.shown;
  const lab = hex => {
    const h = hex.replace('#', ''), c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const x = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047, y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
    const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const labs = picks.map(lab), gold = lab('#c9a84c');
  const chosen = [];
  // random index among the farther half of the unchosen picks, ranked by distance to the references
  const pickFar = refs => {
    const ranked = labs.map((l, i) => ({ i, d: Math.min(...refs.map(r => dist(l, r))) }))
      .filter(({ i }) => !chosen.includes(i)).sort((a, b) => b.d - a.d);
    return ranked[Math.floor(Math.random() * Math.ceil(ranked.length / 2))].i;
  };
  chosen.push(pickFar([gold]));
  while (chosen.length < SHOWN_COUNT) chosen.push(pickFar(chosen.map(i => labs[i])));
  shownCache = { key, shown: chosen.sort((a, b) => a - b).map(i => picks[i]) };
  return shownCache.shown;
}
// The start card's diamond and the rule under it (both fill from --preset-deep)
// drift into the next picked colour while the diamond is dim: from 0.8s to 2.4s
// of each 3.2s breath, centred on the faint point (imBreathe: faint 1.6s into
// each cycle, breath starting after its 2.4s delay), then hold. One Web Animation
// per element, locked to the diamond's own breath so the two never drift apart.
// It exists only while that breath runs: the card face showing, the deck sheet
// closing, or reduced motion all cancel it. No timer is involved.
// Blending needs --preset-deep registered as a <color>; without that support the
// colour steps at the faint point on #card instead, as it did before.
const BREATH_MS = 3200;
const BLEND_FROM = 0.25, BLEND_TO = 0.75;   // share of a breath: 0.8s to 2.4s
// strong ease-in-out: nearly all of the change lands around the faint point
const BLEND_EASING = 'cubic-bezier(0.77, 0, 0.175, 1)';
const deepIsBlendable = (() => {
  try {
    CSS.registerProperty({ name: '--preset-deep', syntax: '<color>', inherits: true, initialValue: '#c9a84c' });   // initial = the app's gold
    return true;
  } catch (e) { return e.name === 'InvalidModificationError'; }   // already registered counts as registered
})();
let _startCols = [];
let _startCycle = null;   // { src: the breath CSSAnimation, key, anims }
function stopStartCycle() { if (_startCycle) { _startCycle.anims.forEach(a => a.cancel()); _startCycle = null; } }
// Keyframes for n colours over n breaths: hold colour i, blend to the next in the dim half, hold again.
const startCycleFrames = (cols, blend) => {
  const n = cols.length;
  if (!blend) return [...cols.map((c, i) => ({ '--preset-deep': c, offset: i / n, easing: 'step-end' })), { '--preset-deep': cols[0], offset: 1 }];
  return [
    { '--preset-deep': cols[0], offset: 0 },
    ...cols.flatMap((c, i) => [
      { '--preset-deep': c, offset: (i + BLEND_FROM) / n, easing: BLEND_EASING },
      { '--preset-deep': cols[(i + 1) % n], offset: (i + BLEND_TO) / n },
    ]),
    { '--preset-deep': cols[0], offset: 1 },
  ];
};
function syncStartCycle() {
  const card = document.getElementById('card');
  const dm = card?.querySelector('.cb-mark:not(.cb-fermata) .lg-dm');
  const src = dm && card.classList.contains('is-start') && !card.classList.contains('is-intermezzo')
    ? dm.getAnimations().find(a => a.animationName === 'imBreathe') : null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const key = _startCols.join();
  if (!src || reduce || _startCols.length < 2) { stopStartCycle(); return; }
  if (_startCycle?.src === src && _startCycle.key === key) return;
  stopStartCycle();
  // a breath that has only just been set going has no start time yet: lock on once it has
  if (src.pending) { src.ready.then(syncStartCycle, () => {}); return; }
  const cols = _startCols.map(c => presetDeep(c) || c);
  const targets = deepIsBlendable ? [dm, card.querySelector('.cb-rule')] : [card];
  // blending: the first blend sits in the first full breath (breath delay 2.4s + 0.8s);
  // stepping: the step sits at the faint point of the first breath (4.0s).
  const delay = deepIsBlendable ? 2400 : 800;
  const anims = targets.map(el => {
    const anim = el.animate(startCycleFrames(cols, deepIsBlendable), { duration: BREATH_MS * cols.length, delay, iterations: Infinity, fill: 'backwards' });
    anim.startTime = src.startTime;
    return anim;
  });
  _startCycle = { src, key, anims };
}
document.addEventListener('animationstart', e => { if (e.target.classList && e.target.classList.contains('lg-dm')) syncStartCycle(); });
document.addEventListener('animationcancel', e => { if (e.target.classList && e.target.classList.contains('lg-dm')) syncStartCycle(); });

function renderShell() {
  // Entry token -> the active preset's own name and colour, read straight
  // off its .mode-btn (data-mode=state.activePreset) in the preset row —
  // the same --mc/--list-col custom property that row already colours
  // itself with, so the token can't drift out of sync with what "Balanced"
  // or "Strangers" mean there. No colour set (open/balanced) falls back to
  // gold via --tokc's own default.
  const vCats = document.getElementById('valCats');
  const tokCats = document.getElementById('tokCats');
  if (vCats) {
    const presetBtn = document.querySelector('.mode-btn[data-mode="' + state.activePreset + '"]');
    // A selection that is not exactly a preset's set leaves
    // state.activePreset '' (see syncActivePreset), so no button matches and
    // the deck reads "Custom".
    const label = state.activePreset === 'colbertmode' ? 'Colbert'
      : (presetBtn ? presetBtn.textContent.trim() : (state.activePreset || 'Custom'));
    const cs = presetBtn && getComputedStyle(presetBtn);
    const col = cs && (cs.getPropertyValue('--mc').trim() || cs.getPropertyValue('--list-col').trim());
    vCats.textContent = label;
    // "Custom" (no preset button matched) wears the colours of the categories
    // picked, in CATEGORIES order (see customPicks). One category: that colour
    // everywhere, still. Two or more: the top logo's inner line pairs split
    // left/right between the first two (--preset-a/-b); the preset name is a
    // left-to-right gradient of the first two or three (never more), --preset the first pick; the
    // start card's diamond and rule step through ALL of them (startCycle).
    const isCustom = !presetBtn && label === 'Custom';
    const picks = isCustom ? customPicks() : [];
    const shown = shownPicks(picks);
    const useCol = col || shown[0] || picks[0] || '';
    const root = document.documentElement;
    if (picks.length > 1) { root.style.setProperty('--preset-a', shown[0]); root.style.setProperty('--preset-b', shown[1]); }
    else { root.style.removeProperty('--preset-a'); root.style.removeProperty('--preset-b'); }
    // the diamond cycles through ALL picks, starting at the first shown colour
    { const at = picks.indexOf(shown[0]); _startCols = picks.length > 1 ? picks.slice(at).concat(picks.slice(0, at)) : []; }
    if (tokCats) {
      tokCats.classList.toggle('tok-multi', picks.length > 1);
      picks.length > 1 ? tokCats.style.setProperty('--tokg', 'linear-gradient(90deg,' + shown.join(',') + ')') : tokCats.style.removeProperty('--tokg');
    }
    if (tokCats) useCol ? tokCats.style.setProperty('--tokc', useCol) : tokCats.style.removeProperty('--tokc');
    useCol ? root.style.setProperty('--preset', useCol) : root.style.removeProperty('--preset');
    // (--preset and --tokc are the first pick; the name itself is a gradient of the first 2-3, .tok-multi.)
    // --preset-deep: the same colour a shade deeper, for filled areas (the start
    // card's diamond and rule), which read paler than thin letters. Same hue and
    // saturation, lightness down 7 points, never below 45%; colours already at or
    // below 45% stay as they are. Non-hex values just fall back to --preset.
    // With several picks the still colour is the first pick's.
    const deep = useCol && presetDeep(useCol);
    deep ? document.documentElement.style.setProperty('--preset-deep', deep) : document.documentElement.style.removeProperty('--preset-deep');
    syncStartCycle();
  }
  // Shuffle toggle (Arc/Wild), inside the "Fine-tune the hand" fold now
  // that the main-screen Shuffle token is gone.
  document.querySelectorAll('.shuffle-toggle-opt').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === state.randomMode));
  // Fullscreen mirror of the Draw-three toggle
  const pp = document.getElementById('partyPick'), pt = document.getElementById('pickToggle');
  if (pp && pt) { pp.classList.toggle('on', pt.classList.contains('on')); }
}

function updateDrawMore() {
  // This runs after every deck-state change (nextCard, skipCard, initDeck,
  // choosePick, …), so the end-of-hand hint updates from here too — no need
  // to separately observe the DOM for it.
  hint(atEnd());
  document.dispatchEvent(new Event('deckchange'));   // the between-hands moments (see the update check in between-us.html) follow from here
  // Always hide the standalone draw-more button — it floats awkwardly
  const standalone = document.getElementById('drawMoreBtn');
  if (standalone) standalone.classList.remove('visible');

  const atSummary  = state.visibleDeck.length > 0 && state.currentIndex >= state.visibleDeck.length;      // end-of-draw screen

  // Twist is a lens on a drawn card — nothing to twist before the first
  // draw or on the end-of-round summary.
  [document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
    if (btn) btn.classList.toggle('disabled', !hasCurrentCard());
  });
  // Three and Spotlight wait for the first card of a hand too (back-of-card
  // start screen). Unlike Twist they stay usable on the end-of-hand screen,
  // where the row is swapped out anyway. Exception: with Three already ON it
  // stays live on the start screen, so it can be switched off (never on).
  // (Reads the button's 'on' class: pickMode itself is declared in ui.js,
  // which loads after this file.)
  const pickBtn = document.getElementById('pickToggle');
  if (pickBtn) pickBtn.classList.toggle('disabled', state.currentIndex < 0 && !pickBtn.classList.contains('on'));
  const spotBtn = document.getElementById('btnParty');
  /* Options up for the first card of a hand: the hand has begun, so nothing on
     screen shows the start state */
  const begun = state.currentIndex >= 0 || state.pickerOpen;
  if (spotBtn) spotBtn.classList.toggle('disabled', !begun);
  // Back waits for the first card too (it has nothing to go back to).
  const prevBtn = document.getElementById('btn-prev');
  if (prevBtn) prevBtn.classList.toggle('disabled', state.currentIndex < 0);

  const nextBtn = document.getElementById('btn-next');
  if (!nextBtn) return;

  if (atSummary) {
    setPauseColour();   // the button, the diamond and the rule are this hand's last card colour from the first frame
    // The end-of-draw button starts a fresh hand — NOT "draw more" (which would
    // pile 10 extra cards onto the finished hand instead of drawing a new one).
    // This is the only state that skips straight to a new hand, and it always
    // needs the hold gesture — the last card of a hand still goes through this
    // screen first, never a one-tap shortcut around it.
    nextBtn.classList.add('hold-mode');   /* distinct look: this one needs a hold */
    // Intermezzo: the first hold turns the card to the list; on the list the
    // next hold starts the next hand (until Intermezzo is up, a hold continues).
    nextBtn.textContent = state.handSide === 'intermezzo' ? 'Tap to flip card' : 'Hold to continue';
    const hintEl = document.getElementById('endHint');
    if (hintEl) hintEl.textContent = nextBtn.textContent;
    // Fullscreen's quiet line: same words, the verb picked out in gold (CSS shows it at hand end only).
    const fsHint = document.getElementById('partyEndHint');
    if (fsHint) {
      const [verb, ...rest] = nextBtn.textContent.split(' ');
      fsHint.textContent = '';
      const v = document.createElement('b'); v.textContent = verb;
      fsHint.append(v, ' ' + rest.join(' '));
    }
  } else {
    nextBtn.classList.remove('hold-mode');
    // On the last card, the tap ahead lands on the end of the hand, not another
    // card — say so, instead of promising "Next Card" and surprising people.
    const atLastCard = state.currentIndex >= 0 && state.currentIndex === state.visibleDeck.length - 1;
    nextBtn.textContent = atLastCard
      ? 'End of hand'
      : begun ? 'Next Card' : 'Draw Card';
    nextBtn.classList.toggle('btn-draw--start', !begun);
  }
};

// ── END OF HAND: Intermezzo ──────────────────────────────────────────────────
// The end of every hand is a pause, not a report. The card shows its lattice
// back with the pause mark and the word INTERMEZZO (side 'intermezzo'); a tap
// turns it over to the hand's questions, each with its own star (side 'list');
// a hold on either side starts the next hand (ui.js END_HOLD_TARGETS gate). Back on the
// list side returns to Intermezzo (prevCard in deck.js). state.handSide says
// which side is up ('intermezzo' | 'list' | null when no hand has ended).
// Fullscreen shows the same two sides in #partyOverlay; both surfaces are
// painted together so leaving or entering fullscreen mid-way stays in step.
//
// Hooks (for styling): body.showing-hand-summary (any end-of-hand side),
// body.hand-side-list (list side up), --im-color on <body> (last drawn card's
// category colour, lifted for legibility), #card.is-start.is-intermezzo (the
// back as Intermezzo), #card.is-hand-list (list side), #card.flipping while the
// swap is in progress, #partyOverlay.is-hand-end/.is-intermezzo/.is-hand-list.

let handSideToken = 0;   // a swap still waiting on its timer drops out if the hand side changed since
// Looks: true while Intermezzo is shown again after the list (Back): the pause mark
// then appears finished and breathing, without drawing itself in once more.
let handStill = false;
// True only for the paint that ends the closing (deck.js endMessageToIntermezzo): Spotlight's panel then joins
// the closing's beat (styles.css .im-wrap.closing).
let handClosing = false;

// The colour of the pause: raw (rail) and the lifted one (diamond, rule, button) — labelColor
// lifts After Dark's near-black lacquer. Takes the last drawn card's category colour.
function handEndColors() {
  const last = state.visibleDeck[state.visibleDeck.length - 1];
  const base = last && CATEGORIES[last.level] && levelColor(last.level);
  if (!base) return { raw: null, label: null };
  return { raw: base, label: labelColor(base) };
}

// The pause colour on <body>: --im-color (eased there: diamond, rule) and --im-target (not eased: the
// button eases itself). One place, called the moment a hand's end begins (the end message appears, see
// deck.js _nextCardBase and updateDrawMore) and again when Intermezzo is painted, so nothing at the
// end of a hand reads the previous hand's colour.
function setPauseColour() {
  const col = handEndColors();
  if (col.label) {
    document.body.style.setProperty('--im-color', col.label);
    document.body.style.setProperty('--im-target', col.label);
  }
  return col;
}

const HAND_STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" stroke-width="1.5" stroke-linejoin="round"/></svg>';

function isFavouriteCard(c) { return !!c && state.favourites.some(f => f.question === c.question); }

// The hand's questions, in the order they were drawn: category diamond,
// the question in full, its own star (outline = not a favourite, filled = one).
function handListHTML() {
  const rows = state.visibleDeck.map((c, i) => {
    const on = isFavouriteCard(c);
    return `<li class="hd-row"><span class="hd-d" style="background:${levelColor(c.level)}"></span>`
         + `<span class="hd-q">${esc(translateQ(c))}</span>`
         + `<button type="button" class="hd-star${on ? ' on' : ''}" data-i="${i}" aria-pressed="${on}" aria-label="Favourite this question">${HAND_STAR_SVG}</button></li>`;
  }).join('');
  return `<div class="hd-box"><ol class="hd-list">${rows}</ol><span class="hd-track" aria-hidden="true"><i class="hd-thumb"></i></span></div>`;
}

// Stars follow the favourites store (the card's own star writes to it too).
function syncHandStars() {
  document.querySelectorAll('.hd-star').forEach(b => {
    const on = isFavouriteCard(state.visibleDeck[+b.dataset.i]);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

// Wire a freshly written list: stars, and the thin scroll indicator.
function bindHandList(root) {
  if (!root) return;
  root.querySelectorAll('.hd-star').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); e.preventDefault();   // a star is not a tap on the card
    const c = state.visibleDeck[+b.dataset.i];
    if (c) toggleFavourite(c);
  }));
  const list = root.querySelector('.hd-list'), track = root.querySelector('.hd-track'), thumb = root.querySelector('.hd-thumb');
  if (!list || !track || !thumb) return;
  const place = () => {
    const over = list.scrollHeight - list.clientHeight;
    track.style.display = over > 2 ? '' : 'none';
    if (over <= 2) return;
    const H = track.clientHeight, h = Math.max(18, H * list.clientHeight / list.scrollHeight);
    thumb.style.height = h + 'px';
    thumb.style.top = ((H - h) * list.scrollTop / over) + 'px';
  };
  list.addEventListener('scroll', place, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(place).observe(list);
  requestAnimationFrame(place);
}

// Spotlight's Intermezzo: the pause mark, its rule and the word, built from the card back's own mark.
function imWrapHTML() {
  const mark = document.querySelector('#cardBack .cb-fermata');
  const flags = [handStill && 'still', handClosing && 'closing'].filter(Boolean).join(' ');
  return `<div class="im-wrap ${flags}">${mark?.outerHTML ?? ''}<span class="im-rule"></span><span class="im-word">Intermezzo</span></div>`;
}

function paintHandSide() {
  const side = state.handSide;
  if (!side) return;
  const isList = side === 'list';
  const col = setPauseColour();

  // — the card on the main screen
  const el = document.getElementById('card');
  const lvlEl = document.getElementById('card-level');
  const qEl = document.getElementById('card-question');
  const accent = document.getElementById('c-accent');
  if (accent) {
    giltRailPaint(accent, col.raw);
    accent.classList.remove('accent-bloom'); void accent.offsetWidth; accent.classList.add('accent-bloom');
  }
  if (lvlEl) { lvlEl.classList.remove('in'); lvlEl.textContent = ''; }
  if (el) {
    el.classList.toggle('im-still', handStill);
    if (isList) { el.classList.remove('is-start'); el.classList.add('is-intermezzo', 'is-hand-list'); }
    else        { el.classList.remove('is-hand-list'); el.classList.add('is-start', 'is-intermezzo'); }
  }
  if (qEl) {
    if (isList) { qEl.innerHTML = handListHTML(); bindHandList(qEl); }
    else        { qEl.textContent = 'Intermezzo'; }   // under the back: not shown, not announced
    qEl.classList.add('in');
  }

  paintSpotlightSide(isList, col);
}

// — fullscreen: the same side in the overlay
function paintSpotlightSide(isList, col) {
  const pq = document.getElementById('party-question');
  const pl = document.getElementById('party-level');
  const pc = document.getElementById('party-count');
  const pa = document.getElementById('party-accent');
  if (pa) giltRailPaint(pa, col.raw || getComputedStyle(document.documentElement).getPropertyValue('--gold-l').trim());
  if (pl) { pl.textContent = ''; pl.style.color = ''; }
  if (pc) pc.textContent = '';   // the count slot stays empty at the end of a hand
  if (!pq) return;
  pq.classList.remove('is-end-msg');
  if (isList) { pq.innerHTML = handListHTML(); bindHandList(pq); }
  else pq.innerHTML = imWrapHTML();
}

// Brings both surfaces to state.handSide. animate: the swap rides the card's
// existing flip beat (the face changes while it is turned away).
function renderHandSide(animate) {
  const side = state.handSide;
  if (!side) return;
  const token = ++handSideToken;
  const isList = side === 'list';
  document.body.classList.add('showing-hand-summary');
  document.body.classList.toggle('hand-side-list', isList);
  // Save's hint follows the device's local time of day.
  const sh = document.getElementById('saveHint');
  if (sh) { const hr = new Date().getHours(); sh.textContent = 'take ' + (hr >= 5 && hr < 12 ? 'this morning' : hr < 18 && hr >= 12 ? 'this afternoon' : hr >= 18 ? 'this evening' : 'tonight') + ' with you'; }
  // Fullscreen's side classes also set its layout (the list sits higher than the mark), so on a turn
  // they change with the face, edge-on, never before: else the mark jumps before the card turns.
  const ov = document.getElementById('partyOverlay');
  const setOverlaySide = () => { if (ov) { ov.classList.add('is-hand-end'); ov.classList.toggle('is-intermezzo', !isList); ov.classList.toggle('is-hand-list', isList); } };
  if (!animate) setOverlaySide();
  const el = document.getElementById('card');
  const swap = () => {
    if (token !== handSideToken || state.handSide !== side) return;
    if (animate) setOverlaySide();
    paintHandSide();
    if (el) el.classList.remove('flipping');
  };
  if (animate && el) {
    setTimeout(swap, TURN_MID_MS);
    // The card turns over on its side (styles.css .turning, 0.84s): edge-on at 420ms, which is
    // when the face swaps (no .flipping text fade here: the edge hides the swap). Back to
    // Intermezzo turns the other way round.
    const turn = isList ? 'turning' : 'turning-back';
    const pc = document.querySelector('#partyOverlay .party-card');
    [el, pc].forEach(n => { if (n) { n.classList.remove('turning', 'turning-back'); void n.offsetWidth; n.classList.add(turn); } });
    setTimeout(() => { [el, pc].forEach(n => { if (n && (token === handSideToken || !state.handSide)) n.classList.remove(turn); }); }, TURN_END_MS);
  }
  else swap();
}

function showHandSummary({ closing = false } = {}) {
  clearTwist();
  state.handSide = 'intermezzo';
  handStill = false;
  handClosing = closing;
  renderHandSide(false);
  handClosing = false;
  renderProgress(state.visibleDeck.length);
  updateDrawMore();
}
// A tap while the closing is still drawing (not after it has finished, when the mark is already breathing): Intermezzo lands finished (mark drawn, nothing masked or
// delayed) before the card turns, and stays finished when Back returns to it.
function settleClosing() {
  const el = document.getElementById('card');
  if (!el?.classList.contains('mv-live')) return;
  el.classList.remove('mv-build', 'mv-live');
  el.classList.add('im-still');
  handStill = true;
  document.querySelector('#party-question .im-wrap')?.classList.replace('closing', 'still');
}
// A tap on Intermezzo: turn the card over to the list.
function flipHandList() {
  if (state.handSide !== 'intermezzo') return;
  settleClosing();
  state.handSide = 'list';
  renderHandSide(true);
  updateDrawMore();
}
// Back on the list side: turn it over again to Intermezzo.
function showHandIntermezzo() {
  if (state.handSide !== 'list') return;
  state.handSide = 'intermezzo';
  handStill = true;
  renderHandSide(true);
  updateDrawMore();
}
// Called from setCardDisplay()/flipToCard() — the moment a real card (or the
// start card) is shown again, whatever path got there (next hand, a settings
// change, Explore or a preset picked mid-way). Card-face classes are dropped by
// setStartBack() so the back can fade out with its mark intact.
function hideHandSummary() {
  clearEndTimers();   // a pending end-message fade / turn belongs to the hand that just ended
  const was = !!state.handSide;
  handSideToken++;
  handStill = false;
  state.handSide = null;
  document.body.classList.remove('showing-hand-summary', 'hand-side-list');
  const ov = document.getElementById('partyOverlay');
  if (ov) ov.classList.remove('is-hand-end', 'is-intermezzo', 'is-hand-list');
  if (was) { const el = document.getElementById('card'); if (el) el.classList.remove('flipping'); }
}

// ── End-of-draw hold gate ──
// The end-of-hand summary is a stop, not something you tap through: continuing takes a
// deliberate hold, in normal mode and fullscreen alike. Releasing a hold fires
// touchend/click, so the gate opens a short swallow window that those handlers
// (here and on the fullscreen overlay) check, keeping one hold to one advance.
//
// atEnd/hint are plain top-level functions (not nested in the IIFE below) so
// updateDrawMore() — already the one place every deck-state change routes
// through — can call hint(atEnd()) directly. That replaces a MutationObserver
// that used to watch #card-question's DOM for changes to infer the same
// thing: explicit state instead of observing what the DOM did as a result of it.

function atEnd(){ return state.currentIndex >= state.visibleDeck.length && state.visibleDeck.length > 0; }
// True only while a real, drawn card is on screen — false before the
// first draw (currentIndex -1) and at the end-of-round summary alike.
function hasCurrentCard(){ return state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length; }
function hint(on){
  const el = document.getElementById('endHint');
  if (el) el.classList.toggle('visible', !!on);
}

// Fullscreen's end of hand is the same Intermezzo/list flow (showHandSummary
// paints both the card and the fullscreen overlay).
function runPartySummary() { showHandSummary(); }
