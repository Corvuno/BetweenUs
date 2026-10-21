// ── CARD ─────────────────────────────────────────────────────────────────────
// Everything about the single card in front of you: question text
// (translateQ), face rendering (setCardDisplay/flipToCard), the Twist
// modifier, the favourite star, and the pick-3 picker UI.


// ── TWIST — a lens on the card, chosen the moment it's opened, not a
// follow-up on an answer that doesn't exist yet. Four modifiers, each one
// changing who's telling the story or what it costs to tell it — never a
// request to critique or reverse an answer already given, and never an
// abstract argument-for/against move (this deck is stories, not positions).
// The trigger lives in the control row (Twist/partyBtnTwist) and in the
// party header; tapping it doesn't replace anything on the card — it just
// shows the modifier at the bottom of the card, underneath the question
// (#twistSentence, main mode) or in the party header (#party-number, party
// mode). Never survives a new card; flipToCard/clearTwist reset it every
// draw.
const MODIFIERS = [
  { en: "How would you have answered this five years ago?" },
  { en: "What do you suspect you'll answer differently five years from now?" },
  { en: "What would someone close to you notice about this before you do?" },
  { en: "What would you say if there were no consequences at all?" },
];
let currentTwist = null;
function pickTwist() {
  const pool = MODIFIERS.filter(m => m !== currentTwist);
  return (pool.length ? pool : MODIFIERS)[Math.floor(Math.random() * (pool.length ? pool.length : MODIFIERS.length))];
}
function twistLabel() { return 'Twist'; }
// Applies (or clears) the twist text on a counter element. party-number shows
// only the Twist sentence (the count lives in #party-count), so clearing it
// just empties it out, same as twistSentence.
function applyTwistToCounter(el) {
  if (!el) return;
  if (currentTwist) {
    el.textContent = currentTwist.en;
    el.classList.add('twist');
  } else {
    el.textContent = '';
    el.classList.remove('twist');
  }
}
function renderTwist() {
  applyTwistToCounter(document.getElementById('twistSentence'));
  applyTwistToCounter(document.getElementById('party-number'));
  [document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
    if (!btn) return;
    // btnTwist carries an SVG icon alongside its label — overwriting the
    // button's full textContent would wipe the icon out along with it, so
    // only the label span gets the text update (both buttons have one).
    const label = btn.querySelector('.tt-label') || btn;
    label.textContent = twistLabel();
    btn.classList.toggle('active', !!currentTwist);
  });
}
// Twist is a lens on a drawn card, so it only makes sense while one is
// actually showing — not before the first draw (currentIndex is -1) and
// not on the end-of-round summary (currentIndex >= visibleDeck.length).
// hasCurrentCard() lives in presentation.js, next to atEnd() — safe to call
// from here since this only ever runs from a click, well after every module
// has loaded.
function toggleTwist() {
  if (!hasCurrentCard()) { shakeRowBtn(document.getElementById('btnTwist')); return; }   // can't be used right now — shake, no words
  if (currentTwist) { clearTwist(); return; }   // tap again to untwist
  currentTwist = pickTwist();
  renderTwist();
  hintRetire('twist');   // it has actually worked once — its hint is done
  flashTwist();
}
// Restart a one-shot CSS animation class on an element.
function replayClass(el, cls, ms) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;   // reflow so the animation restarts on a quick second tap
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
// A play-row button (Three, Spotlight, Twist) tapped at a moment it can't be
// used: it shakes (blinks instead under reduced motion). Does not count as
// using it, so its hint stays.
function shakeRowBtn(btn) { replayClass(btn, 'row-shake', 400); }
// Twist just landed: the word Twist and the new line on the card light up
// together, then settle.
function flashTwist() {
  const lbl = document.querySelector('#btnTwist .tt-label');
  replayClass(lbl, 'twist-lit', 520);
  replayClass(document.getElementById('twistSentence'), 'twist-lit', 520);
}
function clearTwist() { currentTwist = null; renderTwist(); }

// ── TRANSLATION ───────────────────────────────────────────────────────────────
function translateQ(card) {
  return card.question;
}


async function toggleFavourite(forCard) {
  // No argument: the card on screen (the card's own star). The end-of-hand list
  // passes the question it is starring, so both go through this one store.
  const card = forCard || (state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null);
  if (!card) return;
  const idx = state.favourites.findIndex(f => f.question === card.question);
  if (idx >= 0) { state.favourites.splice(idx, 1); state.handStarred.delete(card.question); }
  else { state.favourites.push({ question: card.question, level: card.level }); state.handStarred.add(card.question); }
  try { localStorage.setItem('bu-favourites', JSON.stringify(state.favourites)); } catch(e) {}
  updateStarUI();
  renderFavourites();
  if (typeof syncHandStars === 'function') syncHandStars();
}

function updateStarUI() {
  const card = state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null;
  const star = document.getElementById('cardStar');
  const starred = !!card && state.favourites.some(f => f.question === card.question);
  if (star) star.classList.toggle('active', starred);
  const pStar = document.getElementById('partyStar');   // Spotlight's twin lights with it
  if (pStar) pStar.classList.toggle('on', starred);
}

// Deck-identity marking on the card face itself: After Dark categories get
// the full treatment (corners + border tint + radial wash + watermark, in
// the decided Alarm Red); Colbert and The 36 get corners + border tint only,
// each in its own existing CATEGORIES colour, no wash or watermark. Every
// other category is untouched. One place so setCardDisplay and flipToCard
// (the two card-render paths) can't drift apart on this.
function applyCardMark(el, card) {
  if (!el) return;
  el.classList.remove('mark-full', 'mark-border');
  el.style.removeProperty('--mark');
  if (!card) return;
  const meta = CATEGORIES[card.level];
  if (!meta) return;
  if (meta.bucket === 'afterdarkb') {
    el.style.setProperty('--mark', 'var(--mark-afterdark)');
    el.classList.add('mark-full');
  } else if (card.level === 'colbert' || card.level === 'aron') {
    el.style.setProperty('--mark', meta.color);
    el.classList.add('mark-border');
  }
}

/* The Intermezzo look is a variant of the back, so it stays while the back fades out and goes with it
   (at once when no back is showing, as on the list side). */
function dropIntermezzoWhenBackIsGone(el) {
  const back = el.querySelector('.card-back');
  const drop = () => { if (!el.classList.contains('is-start')) el.classList.remove('is-intermezzo'); };
  if (back && +getComputedStyle(back).opacity > 0) back.addEventListener('transitionend', drop, { once: true });
  else drop();
}

// The start card: the card's back with the "begin" text, shown only before
// the first draw. Pass the text to show it, or nothing to put the face back.
function setStartBack(text) {
  const el = document.getElementById('card');
  if (!el) return;
  const t = document.getElementById('cardBackText');
  if (text && t) t.textContent = text;
  const wasStart = el.classList.contains('is-start');
  el.classList.toggle('is-start', !!text);
  // A start back that newly appears while the deck sheet is open or still
  // sliding shut holds its logo undrawn until the sheet is fully gone.
  if (!text) el.classList.remove('logo-wait');
  else if (!wasStart && typeof window.catsBusy === 'function' && window.catsBusy()) {
    el.classList.add('logo-wait');
    window.afterCatsClosed(() => el.classList.remove('logo-wait'));
  }
  // The end-of-hand states (presentation.js) are variants of this back. A new
  // start text drops the Intermezzo look; showing a face drops the list side.
  // Intermezzo itself stays on while the back fades out, so its mark doesn't
  // change under the dissolve.
  if (text) el.classList.remove('is-intermezzo');
  else dropIntermezzoWhenBackIsGone(el);
  el.classList.remove('is-hand-list');
}

/* The card between two hands of the same session (hold-to-continue, Draw more): the ended hand's
   face is emptied, and nothing else is painted. The card is not "back at the start", so the start
   card (logo, "A place to begin…") must not show: whatever back is up (Intermezzo) stays until the
   first card's flip dissolves it, and the list side just empties. The rails keep their colour until
   that card's face swap repaints them. */
function clearCardFace() {
  hideHandSummary();
  clearTwist();
  applyCardMark(document.getElementById('card'), null);
  const lvlEl = document.getElementById('card-level');
  if (lvlEl) { lvlEl.textContent = ''; lvlEl.classList.remove('in'); }
  const qEl = document.getElementById('card-question');
  if (qEl) { qEl.textContent = ''; qEl.classList.remove('in'); }
  ['party-question', 'party-level', 'party-count'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  document.getElementById('party-question')?.classList.remove('is-end-msg');
}

function setCardDisplay(card) {
  // Whatever got us here — a fresh hand, a settings change, the initial
  // boot placeholder — a real (or placeholder) card face is about to be
  // shown, so the previous hand's end-of-hand summary can't still be
  // showing. hideHandSummary() is a no-op if it wasn't showing.
  hideHandSummary();
  const el     = document.getElementById('card');
  const lvlEl  = document.getElementById('card-level');
  const qEl    = document.getElementById('card-question');
  const nextBtn= document.getElementById('btn-next');
  const accent = document.getElementById('c-accent');

  if (!card) {
    applyCardMark(el, null);
    if (lvlEl)    { lvlEl.textContent=''; lvlEl.classList.remove('in'); }
    if (accent)   { giltRailPaint(accent, null); }
    if (qEl)      { qEl.textContent = state.visibleDeck.length===0
      ? 'Select at least one category.'
      : 'A place to begin…';
      qEl.classList.remove('in'); setTimeout(()=>qEl.classList.add('in'),20);
    }
    // nothing to draw (no categories) keeps the plain message; otherwise the
    // start card shows the same "begin" text on the card's back
    setStartBack(state.visibleDeck.length===0 ? '' : 'A place to begin…');
    if (nextBtn) {
      nextBtn.textContent = 'Draw Card';
      // nothing's been drawn yet (fresh load, or a settings change just
      // reset the hand) — make this the obvious "start" tap, not just
      // another "next" tap.
      nextBtn.classList.add('btn-draw--start');
    }
    // Update party display too
    updatePartyDisplay(null);
    clearTwist();
    return;
  }
  setStartBack('');
  applyCardMark(el, card);
  const color = levelColor(card.level);
  if (accent) {
    giltRailPaint(accent, color);
  }
  if (lvlEl) {
    lvlEl.textContent = LEVEL_LABELS[card.level] || '';
    lvlEl.style.color = labelColor(color);
  }
  if (qEl)   qEl.textContent = translateQ(card);
  /* .card-level and .card-question are invisible until they carry `in` —
     every route that shows a card without the flip (Spotlight before the first
     draw, a restored session) must turn them on itself, or the category title
     stays at opacity 0. */
  if (lvlEl) lvlEl.classList.add('in');
  if (qEl)   qEl.classList.add('in');
  if (nextBtn) {
    nextBtn.textContent = 'Next Card';
    nextBtn.classList.remove('btn-draw--start');
  }
  // Update party display
  updatePartyDisplay(card);
  renderTwist();   // same modifier, re-rendered for the new card
}

// flipToCard — animates the flip and updates accent, arc indicator, fullscreen sync

/* The first-draw landing (styles.css .card.drawing-in: 520ms, ghosts 520ms after a 60ms delay; a 250ms
   fade under reduced motion). The question swaps in at ~60% so its fade overlaps the landing; the
   animation classes and ghosts stay until `done`, so the landing is never cut short. */
const DRAW_TIMING = {
  full:    { backFade: 60, swap: 310, done: 580 },
  reduced: { backFade: 0,  swap: 150, done: 250 },
};
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* The timers of the card currently changing, and how to undo its animation. A fast tap
   cancels the previous card's timers so only the latest card ever lands. */
let pendingFlip = null;

function flipToCard(card, isFirstDraw) {
  pendingFlip?.cancel();
  hideHandSummary();
  clearTwist();   // a Twist never survives a new draw — it's a layer on this card, not the deck
  const el      = document.getElementById('card');
  const lvlEl   = document.getElementById('card-level');
  const accent  = document.getElementById('c-accent');
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) nextBtn.classList.remove('btn-draw--start');
  if (lvlEl) lvlEl.classList.remove('in');
  const qEl = document.getElementById('card-question');
  if (qEl)  qEl.classList.remove('in');
  // The first draw of a hand gets thrown onto the table — two ghost cards
  // trail behind the real one as it drops in at an angle (shows the
  // settings that were just chosen are actually taking effect); every card
  // after that gets the plain, quicker flip. Ghosts are real, temporary
  // elements (not a pure-CSS trick) — removed once the animation is done.
  const animClass = isFirstDraw ? 'drawing-in' : 'flipping';
  el.classList.add(animClass);
  // The start card's back dissolves instead of cutting: on the first draw it
  // starts fading as the card drops and is gone as it lands; on a plain flip
  // it fades straight away.
  const timing = prefersReducedMotion.matches ? DRAW_TIMING.reduced : DRAW_TIMING.full;
  const timers = [];
  if (el.classList.contains('is-start')) timers.push(setTimeout(() => setStartBack(''), isFirstDraw ? timing.backFade : 0));
  let ghosts = [];
  if (isFirstDraw) {
    const area = el.parentElement;
    ghosts = [0, 1].map(i => {
      const g = document.createElement('div');
      g.className = 'draw-ghost';
      g.style.animationDelay = (i * 60) + 'ms';
      area.insertBefore(g, el);
      return g;
    });
  }
  const endAnimation = () => {
    el.classList.remove(animClass, 'face-in');
    ghosts.forEach(g => g.remove());
  };
  timers.push(setTimeout(() => {
    /* Three can now be used during the first draw's animation: if another card
       has taken this step meanwhile, this late face swap must not overwrite it */
    if (state.currentIndex < state.visibleDeck.length && state.visibleDeck[state.currentIndex] !== card) {
      pendingFlip.cancel();
      return;
    }
    setStartBack('');   // the back turns over with the face swap, not before
    applyCardMark(el, card);
    const color = levelColor(card.level);
    if (accent) {
      giltRailPaint(accent, color);
      accent.classList.remove('accent-bloom');
      void accent.offsetWidth;
      accent.classList.add('accent-bloom');
    }
    if (lvlEl) { lvlEl.textContent = LEVEL_LABELS[card.level] || ''; lvlEl.style.color = labelColor(color); }
    const qEl2 = document.getElementById('card-question');
    if (qEl2) qEl2.textContent = translateQ(card);
    /* let updateDrawMore own the button label — hard-coding "Next Card" here
       ran 175ms later and clobbered the "Draw more cards"/"Continue" states */
    updateDrawMore();
    requestAnimationFrame(() => {
      if (lvlEl) lvlEl.classList.add('in');
      if (qEl2)  qEl2.classList.add('in');
    });
    if (isFirstDraw) el.classList.add('face-in');   // the question may show now; the landing runs on to `done`
    else { endAnimation(); pendingFlip = null; }
    renderProgress();
    updatePartyDisplay(card);
    // Auto-save on every card
    autoSaveSession();
  }, isFirstDraw ? timing.swap : 175));
  if (isFirstDraw) timers.push(setTimeout(() => { endAnimation(); pendingFlip = null; }, timing.done));
  pendingFlip = { cancel: () => { timers.forEach(clearTimeout); endAnimation(); pendingFlip = null; } };
}

function openPicker(options, step) {
  const inParty = state.partyMode;
  const picker = document.getElementById(inParty ? 'partyPicker' : 'cardPicker');
  const optsEl = document.getElementById(inParty ? 'partyPickerOptions' : 'pickerOptions');
  if (!picker || !optsEl) return;

  optsEl.innerHTML = '';
  let prevColor = null;
  options.forEach(card => {
    const div = document.createElement('div');
    div.className = 'pick-opt';
    const color = levelColor(card.level);
    const { light } = giltStops(color);
    div.style.setProperty('--pc-solid', color);   // arrow colour on the normal-screen Three
    div.style.setProperty('--pc', `linear-gradient(180deg,${color},${light} 50%,${color})`);
    div.innerHTML = `
      <div class="pick-opt-accent" style="background:linear-gradient(90deg,${color},${light} 50%,${color})"></div>
      <div class="pick-opt-text">
        <span class="pick-opt-level" style="color:${color}">${LEVEL_LABELS[card.level]||''}</span>
        <span class="pick-opt-q">${esc(translateQ(card))}</span>
      </div>`;
    // stopPropagation prevents the card's own click handler from also firing
    // Spotlight: the divider between options, a bar in each neighbour's category colour (styles.css .pick-div)
    if (inParty && prevColor) {
      const d = document.createElement('i');
      d.className = 'pick-div'; d.setAttribute('aria-hidden', 'true');
      d.style.setProperty('--pd-a', prevColor); d.style.setProperty('--pd-b', color);
      div.appendChild(d);
    }
    prevColor = color;
    div.addEventListener('click', e => { e.stopPropagation(); choosePick(card, options, step); });
    optsEl.appendChild(div);
  });

  picker.classList.add('open');
  state.pickerOpen = true;
  state.pickOptions = { step, options, planned: state.visibleDeck[step] };
  document.getElementById('partyOverlay')?.classList.toggle('picking', inParty);
  if (inParty) fitPartyPicker(); else fitPicker(optsEl);
  updateDrawMore();
}

function closePicker() {
  ['cardPicker','partyPicker'].forEach(id=>{
    const p=document.getElementById(id); if(p) p.classList.remove('open');
  });
  document.getElementById('partyOverlay')?.classList.remove('picking');
  state.pickerOpen = false;
}

/* The player moved between the main screen and Spotlight with the Three
   options up: the same options (same step) open in the screen they went to. */
function movePickerToScreen() {
  if (!state.pickerOpen || !state.pickOptions) return;
  const o = state.pickOptions;
  closePicker();
  openPicker(o.options, o.step);
}

/* Three in Spotlight: the options sit under Close, Back, Twist, Three and Next
   (those stay tappable, see .party-overlay.picking in styles.css); this keeps
   the options clear of the bottom row, whatever the layout puts there. */
function fitPartyPicker() {
  const ov = document.getElementById('partyOverlay'), pk = document.getElementById('partyPicker');
  const bar = ov && ov.querySelector('.party-bottom');
  if (!pk || !bar) return;
  const o = ov.getBoundingClientRect(), b = bar.getBoundingClientRect();
  // in a turned Spotlight the content's bottom edge is the screen's right (ccw) or left (cw) edge
  const need = { ccw: o.right - b.left, cw: b.right - o.left }[ov.dataset.turn] ?? o.bottom - b.top;
  const pad = parseFloat(getComputedStyle(pk).paddingBottom) || 0;
  pk.style.setProperty('--pk-x', Math.max(0, need - pad) + 'px');
}

// Normal screen only: if a question needs a 3rd line, step the text down (max 20%).
function fitPicker(el) {
  el.style.removeProperty('--pq');
  const base = parseFloat(getComputedStyle(el).fontSize);
  const over = () => [...el.children].some(o => o.scrollHeight > o.clientHeight + 1);
  for (let px = base; over() && px > base * 0.8; px -= 0.5) el.style.setProperty('--pq', px + 'px');
}
window.addEventListener('resize', () => {
  if (state.pickerOpen && !state.partyMode) fitPicker(document.getElementById('pickerOptions'));
  if (state.pickerOpen && state.partyMode) fitPartyPicker();
});


