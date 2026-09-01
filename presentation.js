// Rendering that isn't specific to one card or one selection: progress dots,
// the app shell's token line, party-mode display, drawers, language
// switching, and the end-of-hand/end-of-round summaries — plus the listeners
// for the controls that directly trigger this domain's own rendering
// (language switch, drawer open/close buttons). (The app's boot sequence
// lives in ui.js.)

// Roman numerals for the counter's static readout — falls back to arabic
// past what reads cleanly as a numeral (beyond XXXIX).
const ROMAN_MAX = 39;
function toRoman(n) {
  const vals = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
                [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let out = '';
  for (const [v, sym] of vals) while (n >= v) { out += sym; n -= v; }
  return out || '0';
}

// Fullscreen's own count — "n / total" in roman rather than arabic, same
// plain-slash separator it already used. Caps lower than the main counter
// (twelve, not thirty-nine): at party size the numeral sits right next to
// the question in the same reading line, so it has to stay short enough
// not to compete with it — see FULLSCREEN.md.
function partyRomanCount(n, total) {
  const fmt = total > 12 ? String : toRoman;
  return `${fmt(n)} / ${fmt(total)}`;
}

// `currentOverride`, when given, replaces state.currentIndex for this render
// only — used by the end-of-round summary to show every card as passed
// without a "current" tick, without touching real session position.
//
// The rule is one flex tick per card, full stop — no dot-count scaling or
// sliding window for huge decks the way the old dot row needed. A hairline
// degrades gracefully at any density (unlike discrete dots, which stop
// being individually readable past a few dozen), so "All" in Everything
// (300+ cards) just renders as a very fine line with a spike at the
// current position — the numeral underneath is what actually reads at
// that size, same job it does at 5 or 10.
function renderProgress(currentOverride) {
  const container = document.getElementById('progress');
  const deckLen = state.visibleDeck.length;
  const cur = currentOverride === undefined ? state.currentIndex : currentOverride;

  const rule = document.createElement('div');
  rule.className = 'progress-rule' + (deckLen > 10 ? ' many' : '');
  for (let i = 0; i < deckLen; i++) {
    const card = state.visibleDeck[i];
    const tick = document.createElement('div');
    const isSeen    = i < cur;
    const isCurrent = i === cur;
    tick.className = 'progress-tick' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
    if (isSeen || isCurrent) tick.style.setProperty('--tick-color', levelColor(card.level));
    rule.appendChild(tick);
  }
  // The terminal diamond is a fixed cap on the line, not another card tick —
  // always present (unlike the old dot row's end-dot, which only appeared
  // near the end so an extra dot wasn't mistaken for a 6th card; a small
  // rotated diamond doesn't read as a card either way, so it can just mark
  // where the line ends from the first card on).
  if (deckLen > 0) {
    const end = document.createElement('div');
    end.className = 'progress-tick end' + (cur >= deckLen ? ' current' : '');
    rule.appendChild(end);
  }

  const num = document.createElement('div');
  num.className = 'progress-num';
  if (deckLen > 0) {
    const fmt = deckLen > ROMAN_MAX ? String : toRoman;
    const shown = Math.min(cur + 1, deckLen);
    num.innerHTML = `${fmt(shown)}<span class="progress-num-sep"> &middot; </span>`
                  + `<span class="progress-num-total">${fmt(deckLen)}</span>`;
  }

  container.innerHTML = '';
  container.appendChild(rule);
  container.appendChild(num);
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
  if (pa) { pa.style.background=giltRail(color); pa.classList.remove('accent-bloom'); void pa.offsetWidth; pa.classList.add('accent-bloom'); }
  if (pl) { pl.textContent=LEVEL_LABELS[card.level]||''; pl.style.color=color; }
  if (pq) { pq.style.opacity='0'; setTimeout(()=>{ pq.textContent=translateQ(card); pq.style.opacity='1'; },120); }
  if (pn) pn.textContent = partyRomanCount(state.currentIndex+1, state.visibleDeck.length);
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
function closeAllDrawers() {
  document.getElementById('overlay').classList.remove('open');
  if (typeof window.unlockBodyScroll === 'function') window.unlockBodyScroll();
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
  // playLeadFirst now lives in the sheet's own header row, next to Close —
  // it's the sheet's title, not a lead-in line above the chapters any more.
  const heading = document.getElementById('playLeadFirst');
  if (heading) heading.textContent = (state.lang === 'nl' ? 'Wat voor ' : 'What kind of ') + word + '?';
  // Static now, not time-of-day framed — it's a plain inline link next to
  // the Chapters label, not a headline, so it doesn't need the word.
  const customizeBtn = document.getElementById('customizeBtn');
  if (customizeBtn) customizeBtn.textContent = state.lang === 'nl' ? 'Verken categorieën' : 'Explore categories';
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
// Shared by the log drawer's own Export button and the end-of-set screen's
// "Export the log" action — one function, so the two can't drift into two
// different file formats. No-op-safe on an empty session.
function exportSessionLog() {
  if (!state.sessionLog.length) return;
  const favQ = new Set((state.favourites || []).map(f => f.question));
  const lines = state.sessionLog.map((c,i) => {
    const star = favQ.has(c.question) ? ' ★' : '';
    return `${i+1}. [${LEVEL_LABELS[c.level]||c.level}]${star}\n   ${c.question}`;
  }).join('\n\n');
  const blob = new Blob([`Between Us — ${new Date().toLocaleDateString()}\n${'─'.repeat(40)}\n\n${lines}`],{type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`between-us-${new Date().toISOString().slice(0,10)}.txt`; a.click();
}
document.getElementById('btnExport').addEventListener('click', exportSessionLog);
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
  if (vCats) {
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
    vCats.textContent = label;
    if (tokCats) col ? tokCats.style.setProperty('--tokc', col) : tokCats.style.removeProperty('--tokc');
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
  const nextLbl = nextBtn.querySelector('.btn-draw-label');
  if (!nextLbl) return;

  if (atSummary) {
    // The end-of-draw button starts a fresh hand — NOT "draw more" (which would
    // pile 10 extra cards onto the finished hand instead of dealing a new one).
    // This is the only state that skips straight to a new hand, and it always
    // needs the hold gesture — the last card of a hand still goes through this
    // screen first, never a one-tap shortcut around it.
    nextBtn.classList.add('hold-mode');   /* distinct colour: this one needs a hold */
    nextLbl.textContent = state.lang === 'nl' ? 'Houd vast om door te gaan' : 'Hold to continue';
  } else {
    nextBtn.classList.remove('hold-mode');
    // On the last card, the tap ahead lands on the summary, not another
    // card — say so, instead of promising "Next Card" and surprising people.
    const atLastCard = state.currentIndex >= 0 && state.currentIndex === state.visibleDeck.length - 1;
    nextLbl.textContent = atLastCard
      ? (state.lang === 'nl' ? 'Overzicht' : 'Summary')
      : state.currentIndex >= 0 ? (state.lang === 'nl' ? 'Volgende kaart' : 'Next Card') : (state.lang === 'nl' ? 'Trek kaart' : 'Draw Card');
  }
};

// ── End of set — one shared model for both the full-bleed end screen and
// its simplified fullscreen counterpart, so the sentence and the chip
// cloud can never disagree between the two views. Tallies only THIS hand
// (state.visibleDeck), not the whole multi-hand session log.
function computeEndScreenModel() {
  const drawn = {};
  state.visibleDeck.forEach(c => { drawn[c.level] = (drawn[c.level] || 0) + 1; });

  const chips = Object.keys(CATEGORIES)
    .filter(key => drawn[key] > 0)
    .map(key => ({ label: CATEGORIES[key].label, count: drawn[key], color: CATEGORIES[key].color }));

  // Chapters that actually appeared, in CHAPTERS_META's canonical order —
  // derived from CATEGORIES[key].chapter, the same field the chapter
  // drawer itself groups by, so this can't drift from what's on screen there.
  const visited = Object.keys(CHAPTERS_META)
    .filter(chId => Object.keys(CATEGORIES).some(key => CATEGORIES[key].chapter === chId && drawn[key] > 0))
    .map(chId => ({ label: CHAPTERS_META[chId].label, color: CHAPTERS_META[chId].color }));
  const first = visited[0] || null;
  const last = visited[visited.length - 1] || first;

  const favCount = state.visibleDeck.filter(c =>
    (state.favourites || []).some(f => f.question === c.question)).length;

  return { chips, moved: visited.length > 1, stayed: visited.length === 1, first, last, favCount };
}

const FAV_COUNT_WORDS = ['no','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

// "You began at {first} and ended {last}" / "The whole set stayed in {only}"
// — chapter names carry that chapter's own colour (lifted via labelColor()
// the same way the chapter drawer lifts After Dark's near-black lacquer).
function esSentenceHTML(model) {
  if (!model.first) return '';
  if (model.stayed) {
    const c = labelColor(model.first.color);
    return `The whole set stayed<br>in <span class="es-chapter" style="color:${c}">${esc(model.first.label)}</span>`;
  }
  const cf = labelColor(model.first.color), cl = labelColor(model.last.color);
  return `You began at <span class="es-chapter" style="color:${cf}">${esc(model.first.label)}</span><br>`
       + `and ended <span class="es-chapter" style="color:${cl}">${esc(model.last.label)}</span>`;
}

function esChipsHTML(model) {
  return model.chips.map(c => {
    const border = `color-mix(in srgb, ${c.color} 50%, transparent)`;
    const fill   = `color-mix(in srgb, ${c.color} 12%, transparent)`;
    const countColor = `color-mix(in srgb, ${c.color} 95%, transparent)`;
    const count = c.count > 1 ? `<span class="es-chip-count" style="color:${countColor}">${c.count}</span>` : '';
    return `<span class="es-chip" style="border-color:${border};background:${fill}">${esc(c.label)}${count}</span>`;
  }).join('');
}

function esFavsHTML(model) {
  if (!model.favCount) return '';
  const word = FAV_COUNT_WORDS[model.favCount] !== undefined ? FAV_COUNT_WORDS[model.favCount] : String(model.favCount);
  const line = model.favCount === 1 ? 'one card you starred' : `${word} cards you starred`;
  return `<span class="es-star">&#9733;</span>${esc(line)}`;
}

// Replaces the card face with the full-bleed end-of-set screen (in-card
// end message + old dot-based summary both retired). hideEndScreen() —
// called from setCardDisplay()/flipToCard() — reverses this the moment a
// real card is shown again, whatever path got there (another hand, a
// settings change, Explore/a preset picked mid-summary).
function showEndScreen() {
  clearTwist();
  const model = computeEndScreenModel();
  const sentence = document.getElementById('esSentence');
  const chips    = document.getElementById('esChips');
  const favs     = document.getElementById('esFavs');
  const hold     = document.getElementById('esHold');
  if (sentence) sentence.innerHTML = esSentenceHTML(model);
  if (chips)    chips.innerHTML = esChipsHTML(model);
  if (favs)     favs.innerHTML = esFavsHTML(model);
  if (hold)     hold.style.setProperty('--es-chapter', model.last ? model.last.color : 'var(--gold)');
  document.body.classList.add('showing-end-screen');
  // The display:none->flex swap happens the instant the class above is
  // added, with .in not yet present — opacity:0 (see styles.css) — so the
  // fade-in has a real starting point to animate from once .in lands a
  // frame later, instead of both landing in the same paint and skipping
  // the transition entirely.
  const es = document.getElementById('endScreen');
  if (es) { es.classList.remove('in'); requestAnimationFrame(() => es.classList.add('in')); }
  // Every tick reads as passed on the (now hidden) counter, none current —
  // keeps it correct for the instant hideEndScreen() reveals it again.
  renderProgress(state.visibleDeck.length);
}
function hideEndScreen() {
  const es = document.getElementById('endScreen');
  if (es) es.classList.remove('in');
  document.body.classList.remove('showing-end-screen');
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

// Fullscreen's own end-of-set moment — same model/sentence/chip-cloud as
// the full-bleed screen, simplified to fit inside the party card (no
// wordmark, no actions row: the overlay's existing hold-to-continue and
// exit chrome around the card keep doing that job unchanged).
function runPartySummary() {
  const model = computeEndScreenModel();
  const pl = document.getElementById('party-level');
  const pq = document.getElementById('party-question');
  const pn = document.getElementById('party-number');
  const pa = document.getElementById('party-accent');
  const chColor = model.last ? model.last.color : 'var(--gold-l)';
  if (pa) pa.style.background = chColor;
  if (pl) { pl.textContent = state.lang==='nl' ? 'De set is afgerond' : 'The set is finished'; pl.style.color = chColor; }
  if (pn) pn.textContent = '— end —';
  if (pq) {
    pq.innerHTML = `<div class="pes-wrap">`
      + `<div class="pes-sentence">${esSentenceHTML(model)}</div>`
      + `<div class="pes-chips">${esChipsHTML(model)}</div>`
      + (model.favCount ? `<div class="pes-favs">${esFavsHTML(model)}</div>` : '')
      + `</div>`;
  }
}


