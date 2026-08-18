// ── CARD ─────────────────────────────────────────────────────────────────────
// Everything about the single card in front of you: language selection
// (translateQ), face rendering (setCardDisplay/flipToCard), the Twist
// modifier, the favourite star, and the pick-3 picker UI.


// ── TWIST — a lens on the card, chosen the moment it's opened, not a
// follow-up on an answer that doesn't exist yet. Four modifiers, each one
// changing who's telling the story or what it costs to tell it — never a
// request to critique or reverse an answer already given, and never an
// abstract argument-for/against move (this deck is stories, not positions).
// The trigger lives in the control row (Twist/partyBtnTwist) and in the
// party header; tapping it doesn't add anything to the card — the counter
// that's already printed there ("1 / 5") swaps to the modifier in place.
// Never survives a new card; flipToCard/clearTwist reset it every draw.
const MODIFIERS = [
  { en: "How would you have answered this five years ago?", nl: "Hoe zou je dit vijf jaar geleden hebben beantwoord?" },
  { en: "What do you suspect you'll answer differently five years from now?", nl: "Wat denk je dat je hier over vijf jaar anders op zou antwoorden?" },
  { en: "What would someone close to you notice about this before you do?", nl: "Wat zou iemand die dicht bij je staat hieraan merken, voordat jij het zelf doorhebt?" },
  { en: "What would you say if there were no consequences at all?", nl: "Wat zou je zeggen als er totaal geen gevolgen waren?" },
];
let currentTwist = null;
function pickTwist() {
  const pool = MODIFIERS.filter(m => m !== currentTwist);
  return (pool.length ? pool : MODIFIERS)[Math.floor(Math.random() * (pool.length ? pool.length : MODIFIERS.length))];
}
function twistLabel() { return state.lang === 'nl' ? 'Wending' : 'Twist'; }
// Applies (or clears) the twist text on a counter element, leaving it alone
// entirely when there's nothing to show — the base "x / y" text is written
// by flipToCard/setCardDisplay/updatePartyDisplay just before this runs.
function applyTwistToCounter(el) {
  if (!el) return;
  if (currentTwist) {
    el.textContent = state.lang === 'nl' && currentTwist.nl ? currentTwist.nl : currentTwist.en;
    el.classList.add('twist');
  } else {
    el.classList.remove('twist');
  }
}
function renderTwist() {
  applyTwistToCounter(document.getElementById('card-number'));
  applyTwistToCounter(document.getElementById('party-number'));
  [document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
    if (btn) { btn.textContent = twistLabel(); btn.classList.toggle('active', !!currentTwist); }
  });
}
// Twist is a lens on a drawn card, so it only makes sense while one is
// actually showing — not before the first draw (currentIndex is -1) and
// not on the end-of-round summary (currentIndex >= visibleDeck.length).
// hasCurrentCard() lives in presentation.js, next to atEnd() — safe to call
// from here since this only ever runs from a click, well after every module
// has loaded.
function toggleTwist() { if (!hasCurrentCard()) return; currentTwist = pickTwist(); renderTwist(); }
function clearTwist() { currentTwist = null; renderTwist(); }

// ── TRANSLATION ───────────────────────────────────────────────────────────────
function translateQ(card) {
  return state.lang === 'nl' && card.nl ? card.nl : card.question;
}


async function toggleFavourite() {
  const card = state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null;
  if (!card) return;
  const idx = state.favourites.findIndex(f => f.question === card.question);
  if (idx >= 0) state.favourites.splice(idx, 1);
  else state.favourites.push({ question: card.question, level: card.level });
  try { localStorage.setItem('bu-favourites', JSON.stringify(state.favourites)); } catch(e) {}
  updateStarUI();
  renderFavourites();
}

function updateStarUI() {
  const card = state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null;
  const star = document.getElementById('cardStar');
  if (star) star.classList.toggle('active', !!card && state.favourites.some(f => f.question === card.question));
}

function setCardDisplay(card) {
  const lvlEl  = document.getElementById('card-level');
  const qEl    = document.getElementById('card-question');
  const numEl  = document.getElementById('card-number');
  const nextBtn= document.getElementById('btn-next');
  const accent = document.getElementById('c-accent');

  if (!card) {
    if (lvlEl)    { lvlEl.textContent=''; lvlEl.classList.remove('in'); }
    if (accent)   { accent.style.background=''; }
    if (qEl)      { qEl.textContent = state.visibleDeck.length===0
      ? (state.lang==='nl' ? 'Selecteer minstens één categorie.' : 'Select at least one category.')
      : (state.lang==='nl' ? 'Een plek om te beginnen…'   : 'A place to begin…');
      qEl.classList.remove('in'); setTimeout(()=>qEl.classList.add('in'),20);
    }
    if (numEl)    numEl.textContent = '— — —';
    if (nextBtn)  nextBtn.textContent = state.lang==='nl' ? 'Trek kaart' : 'Draw Card';
    // Update party display too
    updatePartyDisplay(null);
    clearTwist();
    return;
  }
  const color = levelColor(card.level);
  if (accent) {
    accent.style.background = color;
  }
  if (lvlEl) {
    lvlEl.textContent = LEVEL_LABELS[card.level] || '';
    lvlEl.style.color = color;
  }
  if (qEl)   qEl.textContent = translateQ(card);
  if (numEl) numEl.textContent = `${state.currentIndex + 1} / ${state.visibleDeck.length}`;
  if (nextBtn) nextBtn.textContent = state.lang==='nl' ? 'Volgende kaart' : 'Next Card';
  // Update party display
  updatePartyDisplay(card);
  renderTwist();   // same modifier, re-rendered in whichever language is now active
};

// flipToCard — animates the flip and updates accent, arc indicator, fullscreen sync

function flipToCard(card) {
  clearTwist();   // a Twist never survives a new draw — it's a layer on this card, not the deck
  const el     = document.getElementById('card');
  const lvlEl  = document.getElementById('card-level');
  const accent = document.getElementById('c-accent');
  if (lvlEl) lvlEl.classList.remove('in');
  const qEl = document.getElementById('card-question');
  if (qEl)  qEl.classList.remove('in');
  el.classList.add('flipping');
  setTimeout(() => {
    const color = levelColor(card.level);
    if (accent) {
      accent.style.background = color;
      accent.classList.remove('accent-bloom');
      void accent.offsetWidth;
      accent.classList.add('accent-bloom');
    }
    if (lvlEl) { lvlEl.textContent = LEVEL_LABELS[card.level] || ''; lvlEl.style.color = color; }
    const qEl2 = document.getElementById('card-question');
    if (qEl2) qEl2.textContent = translateQ(card);
    const numEl = document.getElementById('card-number');
    if (numEl) numEl.textContent = `${state.currentIndex+1} / ${state.visibleDeck.length}`;
    /* let updateDrawMore own the button label — hard-coding "Next Card" here
       ran 175ms later and clobbered the "Draw more cards"/"Continue" states */
    updateDrawMore();
    requestAnimationFrame(() => {
      if (lvlEl) lvlEl.classList.add('in');
      if (qEl2)  qEl2.classList.add('in');
    });
    el.classList.remove('flipping');
    renderProgress();
    updatePartyDisplay(card);
    // Auto-save on every card
    autoSaveSession();
  }, 175);
};

// ── Party display sync ──

function openPicker(options) {
  const inParty = typeof state.partyMode !== 'undefined' && state.partyMode;
  const picker = document.getElementById(inParty ? 'partyPicker' : 'cardPicker');
  const optsEl = document.getElementById(inParty ? 'partyPickerOptions' : 'pickerOptions');
  if (!picker || !optsEl) return;

  optsEl.innerHTML = '';
  options.forEach(card => {
    const div = document.createElement('div');
    div.className = 'pick-opt';
    const color = levelColor(card.level);
    div.innerHTML = `
      <div class="pick-opt-accent" style="background:${color}"></div>
      <span class="pick-opt-level" style="color:${color}">${LEVEL_LABELS[card.level]||''}</span>
      <span class="pick-opt-q">${esc(translateQ(card))}</span>
    `;
    // stopPropagation prevents the card's own click handler from also firing
    div.addEventListener('click', e => { e.stopPropagation(); choosePick(card, options); });
    optsEl.appendChild(div);
  });

  picker.classList.add('open');
  state.pickerOpen = true;
}

function closePicker() {
  ['cardPicker','partyPicker'].forEach(id=>{
    const p=document.getElementById(id); if(p) p.classList.remove('open');
  });
  state.pickerOpen = false;
}


