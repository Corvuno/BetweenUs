// Rendering that isn't specific to one card or one selection: progress dots,
// the app shell's token line, party-mode display, drawers, language
// switching, and the end-of-hand/end-of-round summaries — plus the listeners
// for the controls that directly trigger this domain's own rendering
// (language switch, drawer open/close buttons). (The app's boot sequence
// lives in ui.js.)

// The round as a line: one dot per card, in its category colour, placed by depth.
// Above ~48 cards the dots stop being readable, so the summary keeps to words.
function drawRoundTrace(cards) {
  if (!cards || cards.length < 2 || cards.length > 48) return '';
  const W = 240, H = 62, PAD = 10;
  const step = (W - PAD * 2) / (cards.length - 1);
  const pts = cards.map((c, i) => [
    +(PAD + i * step).toFixed(1),
    +(52 - (levelDepth(c.level) - 1) * 8).toFixed(1)
  ]);
  const line = pts.map(p => p.join(',')).join(' ');
  const dots = pts.map((p, i) =>
    `<circle cx="${p[0]}" cy="${p[1]}" r="${cards.length > 24 ? 2.2 : 3}" fill="${levelColor(cards[i].level)}"/>`
  ).join('');
  return `<svg class="sic-trace" viewBox="0 0 ${W} ${H}" role="img" aria-label="The hand you drew: ${cards.length} cards, from light to deep.">`
       + `<line x1="${PAD}" y1="58" x2="${W - PAD}" y2="58" stroke="currentColor" stroke-width="1" opacity=".12"/>`
       + `<polyline points="${line}" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".28"/>`
       + dots + `</svg>`;
}

// Dot size steps down as the deck grows, so a 5- or 10-card arc gets big,
// colorful dots while a 40-card round still fits on one line.
const DOT_SIZE_STEPS = [
  [8,  10, 8],
  [14, 8,  6],
  [24, 6,  5],
  [36, 5,  4],
  [Infinity, 4, 3],
];
// `currentOverride`, when given, replaces state.currentIndex for this render
// only — used by the end-of-round summary to show every card as passed
// without a "current" dot, without touching real session position.

function renderProgress(currentOverride) {
  const container = document.getElementById('progress');
  const deckLen = state.visibleDeck.length;
  container.innerHTML = '';
  const MAX_DOTS = 60;
  const cur = currentOverride === undefined ? state.currentIndex : currentOverride;
  if (deckLen <= MAX_DOTS) {
    // One dot per card. Passed and current cards reveal their category
    // colour; cards still ahead stay neutral gold so the shape of what's
    // coming isn't spoiled.
    const [, size, gap] = DOT_SIZE_STEPS.find(([max]) => deckLen <= max);
    container.style.setProperty('--dot-size', size + 'px');
    container.style.setProperty('--dot-gap', gap + 'px');
    for (let i = 0; i < deckLen; i++) {
      const card = state.visibleDeck[i];
      const dot = document.createElement('div');
      const isSeen    = i < cur;
      const isCurrent = i === cur;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      if (isSeen || isCurrent) dot.style.setProperty('--dot-color', levelColor(card.level));
      container.appendChild(dot);
    }
    // One extra dot past the last card, standing for the summary screen —
    // only from the last card onward, matching exactly when the next-card
    // button itself switches to "Summary". Showing it the whole hand made
    // a 5-card draw permanently look like 6 cards.
    if (cur >= deckLen - 1) container.appendChild(makeEndDot(cur >= deckLen));
  } else {
    // Large decks (e.g. 'All' in Everything, 300+ cards): a fixed-width
    // window of real per-card dots slides along the deck instead of
    // collapsing everything into averaged buckets. It always keeps one
    // neutral "next" dot in view, and drops the oldest passed dot off the
    // left edge as you advance — a continuous band, not a dulled-down summary.
    const WINDOW = 20;
    container.style.setProperty('--dot-size', '7px');
    container.style.setProperty('--dot-gap', '6px');
    const windowStart = Math.max(0, Math.min(cur - (WINDOW - 2), deckLen - WINDOW));
    const windowEnd = Math.min(deckLen, windowStart + WINDOW);
    for (let i = windowStart; i < windowEnd; i++) {
      const card = state.visibleDeck[i];
      const dot = document.createElement('div');
      const isSeen    = i < cur;
      const isCurrent = i === cur;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      if (isSeen || isCurrent) dot.style.setProperty('--dot-color', levelColor(card.level));
      container.appendChild(dot);
    }
    // Only tack the summary dot on once the sliding window has actually
    // reached the last real card, and only from the last card onward —
    // same rule as the small-deck branch above.
    if (windowEnd >= deckLen && cur >= deckLen - 1) container.appendChild(makeEndDot(cur >= deckLen));
  }
}

// The summary dot isn't a card, so it doesn't take a category color — a
// plain gold ring that fills solid once you're actually on the summary.
function makeEndDot(isCurrent) {
  const dot = document.createElement('div');
  dot.className = 'progress-dot end-dot' + (isCurrent ? ' current' : '');
  return dot;
}

// ── SAFE MODE & PRESETS ───────────────────────────────────────────────────────

function updateShuffleDisplay() {
  const name = SHUFFLE_MODES[shuffleModeIdx] || state.randomMode;
  state.randomMode = name;
  // Reflect the active mode straight onto the Shuffle token value.
  const vo = document.getElementById('valOrder');
  if (vo) vo.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

// setCardDisplay — updates card face, accent bar, and fullscreen sync

function updatePartyDisplay(card) {
  const pq  = document.getElementById('party-question');
  const pl  = document.getElementById('party-level');
  const pn  = document.getElementById('party-number');
  const pa  = document.getElementById('party-accent');
  if (!card) {
    if (pq) pq.textContent = 'Draw a card to begin.';
    if (pl) { pl.textContent=''; pl.style.color=''; }
    if (pn) pn.textContent = '';
    if (pa) pa.style.background = '';
    return;
  }
  const color = levelColor(card.level);
  if (pa) { pa.style.background=color; pa.classList.remove('accent-bloom'); void pa.offsetWidth; pa.classList.add('accent-bloom'); }
  if (pl) { pl.textContent=LEVEL_LABELS[card.level]||''; pl.style.color=color; }
  if (pq) { pq.style.opacity='0'; setTimeout(()=>{ pq.textContent=translateQ(card); pq.style.opacity='1'; },120); }
  if (pn) pn.textContent = `${state.currentIndex+1} / ${state.visibleDeck.length}`;
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
};

// ── Drawer helpers ──
// btn-menu is the one drawer trigger that's never itself inside a drawer, so
// it's always a safe, visible place to return focus to when any drawer closes
// — the sub-drawer triggers (d-log, d-favs, ...) live inside menuDrawer, which
// is already closed by the time a sub-drawer closes, so focusing them back
// would land focus inside a hidden dialog.

const DRAWER_TRIGGER_IDS = ['btn-menu', 'd-log', 'd-favs', 'd-custom', 'd-help'];
function openDrawer(id, triggerEl) {
  document.getElementById('overlay').classList.add('open');
  const el = document.getElementById(id);
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  if (triggerEl) triggerEl.setAttribute('aria-expanded', 'true');
  // preventScroll: these drawers are fixed-position overlays, not something
  // the page needs to scroll to reach — without this, focusing a drawer
  // that starts below the fold (or closing back to btn-menu, same issue
  // below) silently scrolled the whole page to bring it into view.
  el.focus({preventScroll: true});
}
function closeAllDrawers() {
  document.getElementById('overlay').classList.remove('open');
  ['menuDrawer','logDrawer','favsDrawer','customDrawer','helpDrawer'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  });
  DRAWER_TRIGGER_IDS.forEach(id=>{
    const el=document.getElementById(id); if(el) el.setAttribute('aria-expanded', 'false');
  });
  const btnMenu = document.getElementById('btn-menu');
  if (btnMenu) try { btnMenu.focus({preventScroll: true}); } catch(e) {}
}

// ── Language: single switch, menu row only now — the inline row toggle was
// removed to make room for the Twist trigger; the menu's own language row
// (d-lang) was already a full duplicate of it. ──

// "What kind of evening?" only means something in the evening — asking it at
// 9am reads as a bug, not a deliberate choice of words. Read the real clock
// instead of hard-coding one time of day.
const TIME_OF_DAY_WORD = {
  morning:   { en: 'morning',   nl: 'ochtend' },
  afternoon: { en: 'afternoon', nl: 'middag' },
  evening:   { en: 'evening',   nl: 'avond' },
  night:     { en: 'night',     nl: 'nacht' },
};
function timeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}
function timeOfDayWord() {
  const w = TIME_OF_DAY_WORD[timeOfDay()];
  return state.lang === 'nl' ? w.nl : w.en;
}
function updateTimeOfDayHeading() {
  const word = timeOfDayWord();
  const heading = document.getElementById('playLeadFirst');
  if (heading) heading.textContent = (state.lang === 'nl' ? 'Wat voor ' : 'What kind of ') + word + '?';
  // Static now, not time-of-day framed — it sits after the console as a
  // plain "go deeper" link, not a headline, so it doesn't need the word.
  const customizeBtn = document.getElementById('customizeBtn');
  if (customizeBtn) customizeBtn.textContent = state.lang === 'nl' ? 'Verken elke categorie' : 'Explore every category';
  // The sheet's own title only actually describes Explore ("Categories") —
  // Play has its own heading + the console right there, so the title stays
  // hidden while Play is showing instead of duplicating that framing.
  const title = document.getElementById('catSheetTitle');
  if (title) {
    const exploring = document.getElementById('paneExplore') && document.getElementById('paneExplore').classList.contains('on');
    title.style.display = exploring ? '' : 'none';
    title.textContent = state.lang === 'nl' ? 'Categorieën' : 'Categories';
  }
}

function setLang(l, skipRefresh) {
  state.lang = l;
  document.documentElement.lang = l;
  const ic = document.getElementById('dLangIcon'); if (ic) ic.textContent = l.toUpperCase();
  const sub = document.getElementById('dLangSub');
  if (sub) sub.textContent = l === 'en' ? 'Switch to Nederlands' : 'Schakel naar English';
  updateTimeOfDayHeading();
  if (!skipRefresh) setCardDisplay(state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length ? state.visibleDeck[state.currentIndex] : null);
}
document.getElementById('d-lang').addEventListener('click', () => setLang(state.lang === 'en' ? 'nl' : 'en'));

// ── Category label toggle ──
document.getElementById('catLabel').addEventListener('click', toggleCategories);

// Shuffle mode is chosen from the Shuffle token tray (see the order list in the
// app shell wiring below); the mode is applied via updateShuffleDisplay().
// ── Reshuffle button: re-deal in the current shuffle mode ──
document.getElementById('d-reshuffle').addEventListener('click',()=>{
  initDeck();
  updateDeckInfo(); updateDrawMore();
  closeAllDrawers();
});

// ── Menu drawer ──
document.getElementById('btn-menu').addEventListener('click',(e)=>openDrawer('menuDrawer', e.currentTarget));
document.getElementById('overlay').addEventListener('click',closeAllDrawers);

// ── Log ──
document.getElementById('d-log').addEventListener('click',(e)=>{ closeAllDrawers(); renderLog(); openDrawer('logDrawer', e.currentTarget); });
document.getElementById('closeLog').addEventListener('click',()=>closeAllDrawers());
document.getElementById('btnExport').addEventListener('click', () => {
  if (!state.sessionLog.length) return;
  const lines = state.sessionLog.map((c,i)=>`${i+1}. [${LEVEL_LABELS[c.level]||c.level}]\n   ${c.question}`).join('\n\n');
  const blob = new Blob([`Between Us — ${new Date().toLocaleDateString()}\n${'─'.repeat(40)}\n\n${lines}`],{type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`between-us-${new Date().toISOString().slice(0,10)}.txt`; a.click();
});
document.getElementById('btnImport') && document.getElementById('btnImport').addEventListener('click',()=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt';
  inp.onchange=async e=>{
    const text=await e.target.files[0]?.text(); if(!text) return;
    const qMap={}; ALL_CARDS.forEach(c=>{qMap[c.question.toLowerCase().trim()]=c;});
    const imported=[]; text.split('\n').forEach((line,i,arr)=>{
      if(/^\d+\. \[/.test(line.trim())){const q=arr[i+1]?.trim(); if(q) imported.push(qMap[q.toLowerCase()]||{question:q,level:'deep'});}
    });
    if(imported.length){state.sessionLog=imported;state.loggedQuestions=new Set(imported.map(c=>c.question));renderLog();closeAllDrawers();openDrawer('logDrawer');}
  }; inp.click();
});

document.getElementById('btnClearLog').addEventListener('click', () => {
  state.sessionLog = []; state.loggedQuestions.clear(); renderLog();
});

// ── Favourites ──
document.getElementById('d-favs').addEventListener('click',(e)=>{ closeAllDrawers(); renderFavourites(); openDrawer('favsDrawer', e.currentTarget); });
document.getElementById('closeFavs').addEventListener('click',()=>closeAllDrawers());

// ── Save / Continue ──


// ── Custom cards ──
document.getElementById('d-custom').addEventListener('click',(e)=>{ closeAllDrawers(); renderCustomList(); openDrawer('customDrawer', e.currentTarget); });
document.getElementById('closeCustom').addEventListener('click',()=>closeAllDrawers());
document.getElementById('customAddBtn').addEventListener('click',addCustomCard);
document.getElementById('customText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addCustomCard();}});

// ── Help ──
document.getElementById('d-help').addEventListener('click',(e)=>{ closeAllDrawers(); openDrawer('helpDrawer', e.currentTarget); });
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
function renderShell() {
  // Entry token -> the active preset's own name and colour, read straight
  // off its .mode-btn (data-mode=state.activePreset) in the preset row —
  // the same --mc/--list-col custom property that row already colours
  // itself with, so the token can't drift out of sync with what "Balanced"
  // or "Strangers" mean there. No colour set (open/balanced) falls back to
  // gold via --tokc's own default.
  const vCats = document.getElementById('valCats');
  const tokCats = document.getElementById('tokCats');
  const presetHostVal = document.getElementById('presetHostVal');
  if (vCats || presetHostVal) {
    const presetBtn = document.querySelector('.mode-btn[data-mode="' + state.activePreset + '"]');
    // Toggling an individual category directly (outside a preset's own bulk
    // toggle) clears state.activePreset to '' — no button matches that, so
    // presetBtn is null and the label used to fall through to the empty
    // string itself, leaving just the dropdown chevron with nothing to
    // anchor to. "Custom" names what's actually true instead of showing
    // nothing at all.
    const label = state.activePreset === 'colbertmode' ? 'Colbert'
      : (presetBtn ? presetBtn.textContent.trim() : (state.activePreset || 'Custom'));
    const cs = presetBtn && getComputedStyle(presetBtn);
    const col = cs && (cs.getPropertyValue('--mc').trim() || cs.getPropertyValue('--list-col').trim());
    if (vCats) vCats.textContent = label;
    if (tokCats) col ? tokCats.style.setProperty('--tokc', col) : tokCats.style.removeProperty('--tokc');
    // "Starting from" mirrors the same name + colour, in place, inside the
    // sheet — one source of truth, not a second label that can drift.
    if (presetHostVal) {
      presetHostVal.textContent = label;
      col ? presetHostVal.style.setProperty('color', col) : presetHostVal.style.removeProperty('color');
    }
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
  // Always hide the standalone draw-more button — it floats awkwardly
  const standalone = document.getElementById('drawMoreBtn');
  if (standalone) standalone.classList.remove('visible');

  const atSummary  = state.visibleDeck.length > 0 && state.currentIndex >= state.visibleDeck.length;      // end-of-draw screen

  // Twist is a lens on a drawn card — nothing to twist before the first
  // draw or on the end-of-round summary.
  [document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
    if (btn) btn.classList.toggle('disabled', !hasCurrentCard());
  });

  const nextBtn = document.getElementById('btn-next');
  if (!nextBtn) return;

  if (atSummary) {
    // The end-of-draw button starts a fresh hand — NOT "draw more" (which would
    // pile 10 extra cards onto the finished hand instead of dealing a new one).
    // This is the only state that skips straight to a new hand, and it always
    // needs the hold gesture — the last card of a hand still goes through this
    // screen first, never a one-tap shortcut around it.
    nextBtn.classList.add('hold-mode');   /* distinct colour: this one needs a hold */
    nextBtn.textContent = state.lang === 'nl' ? 'Houd vast om door te gaan' : 'Hold to continue';
  } else {
    nextBtn.classList.remove('hold-mode');
    // On the last card, the tap ahead lands on the summary, not another
    // card — say so, instead of promising "Next Card" and surprising people.
    const atLastCard = state.currentIndex >= 0 && state.currentIndex === state.visibleDeck.length - 1;
    nextBtn.textContent = atLastCard
      ? (state.lang === 'nl' ? 'Overzicht' : 'Summary')
      : state.currentIndex >= 0 ? (state.lang === 'nl' ? 'Volgende kaart' : 'Next Card') : (state.lang === 'nl' ? 'Trek kaart' : 'Draw Card');
  }
};

function showSessionSummary() {
  const isArc = state.randomMode === 'arc';

  // Build arc progression — unique categories of THIS DRAW, in order
  const seen = new Set(), cats = [];
  state.visibleDeck.forEach(c => { if (!seen.has(c.level)) { seen.add(c.level); cats.push(c.level); } });
  const arcLine = cats.map(l => LEVEL_LABELS[l] || l).join(' · ');
  const drawCount = state.visibleDeck.length;

  // Starred cards from this session
  const logQ = new Set(state.sessionLog.map(c => c.question));
  const starred = (state.favourites || []).filter(c => logQ.has(c.question)).slice(0, 3);

  // ── Update the card face ──
  const accent = document.getElementById('c-accent');
  if (accent) {
    accent.style.background = 'var(--gold-l)';
    accent.classList.remove('accent-bloom');
    void accent.offsetWidth;
    accent.classList.add('accent-bloom');
  }

  const lvlEl = document.getElementById('card-level');
  if (lvlEl) {
    lvlEl.classList.remove('in');
    lvlEl.textContent = isArc
      ? (state.lang === 'nl' ? 'Arc voltooid' : 'Arc complete')
      : (state.lang === 'nl' ? 'Ronde afgerond' : 'Draw complete');
    lvlEl.style.color = 'var(--gold-l)';
    void lvlEl.offsetWidth;
    lvlEl.classList.add('in');
  }

  const qEl = document.getElementById('card-question');
  if (qEl) {
    qEl.classList.remove('in');
    let html = `<div class="sic-wrap">`;
    if (arcLine) {
      html += `<div class="sic-label">${isArc ? 'You went' : 'You covered'} — ${drawCount} ${state.lang==='nl' ? 'kaarten' : 'cards'}</div>`;
      html += drawRoundTrace(state.visibleDeck);
      html += `<div class="sic-arc">${arcLine}</div>`;
    }
    if (starred.length > 0) {
      html += `<div class="sic-stars">`;
      starred.forEach(c => { html += `<div class="sic-star">&#9733;&nbsp; ${esc(translateQ(c))}</div>`; });
      html += `</div>`;
    }
    if (state.fullDeck.length - state.visibleDeck.length <= 0) {
      html += `<div class="sic-note">${state.lang==='nl'
        ? 'Dat was dit hele deck. Kies meer categorieën om door te gaan — of houd vast om opnieuw te schudden.'
        : 'That was the whole deck for this selection. Add categories to keep going — or hold to reshuffle it.'}</div>`;
    }
    html += `</div>`;
    qEl.innerHTML = html;
    void qEl.offsetWidth;
    qEl.classList.add('in');
    // Re-render the arc line with per-category colors (same `cats` computed above)
    const arcEl = qEl.querySelector('.sic-arc');
    if (arcEl) {
      arcEl.innerHTML = cats.map(l =>
        `<span style="color:${levelColor(l)}">${LEVEL_LABELS[l]||l}</span>`
      ).join('<span style="opacity:.35"> · </span>');
    }
  }

  // A Twist held over from the last card doesn't belong on the summary —
  // clear it before writing "— end —" so it can't get overwritten back to
  // a modifier sentence, and so the button itself stops reading as active.
  clearTwist();
  const numEl = document.getElementById('card-number');
  if (numEl) numEl.textContent = '— end —';

  // The round is over — every dot reads as passed, none as "current".
  renderProgress(state.visibleDeck.length);
}

// ── End-of-draw hold gate ──
// The end screen is a stop, not something you tap through: continuing takes a
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

function runPartySummary() {
  const isArc = state.randomMode === 'arc';
  const pl = document.getElementById('party-level');
  const pq = document.getElementById('party-question');
  const pn = document.getElementById('party-number');
  const pa = document.getElementById('party-accent');
  if (pa) pa.style.background = 'var(--gold-l)';
  if (pl) { pl.textContent = isArc ? (state.lang==='nl'?'Arc voltooid':'Arc complete') : (state.lang==='nl'?'Ronde afgerond':'Draw complete'); pl.style.color = 'var(--gold-l)'; }
  if (pn) pn.textContent = '— end —';
  if (pq) {
    const seen2 = new Set(), cats2 = [];
    state.sessionLog.forEach(c => { if (!seen2.has(c.level)) { seen2.add(c.level); cats2.push(c.level); } });
    const arcHtml = cats2.map(l =>
      `<span style="color:${levelColor(l)}">${LEVEL_LABELS[l]||l}</span>`
    ).join('<span style="opacity:.35"> · </span>');
    pq.innerHTML = `<div class="sic-wrap">${drawRoundTrace(state.visibleDeck)}<div class="sic-arc" style="font-size:.85rem">${arcHtml}</div></div>`;
  }
}


