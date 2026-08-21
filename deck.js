// ── DECK ─────────────────────────────────────────────────────────────────────
// Building, filtering, shuffling and advancing through the deck: from the
// intent dial's weighting and getFilteredCards() through applyRandomMode's
// four shuffle modes, initDeck/applyLimit, and the nextCard/skipCard/prevCard
// advance logic. No rendering beyond the couple of DOM calls advancing a card
// inherently needs (renderEndMessage, flipToCard calls) — the actual card-face
// rendering lives in card.js.


function intentWeight(lvl, lo, hi){
  const target = lo + intentIntensity * (hi - lo);
  const di = levelIntensity(lvl) - target;
  const df = levelFocus(lvl) - intentFocus;
  const w  = Math.exp(-(di*di) / (2*1.15*1.15)) * Math.exp(-(df*df) / (2*0.8*0.8));
  return Math.max(w, 0.05);          /* the floor is where the surprises live */
}

/* One weighted pass, no replacement, no bias in the ordering it leaves
   behind (Efraimidis–Spirakis). The shuffle mode then shapes what survives,
   so Arc still arcs and Breadth still cycles — over a pool the dials chose. */
function applyIntent(cards){
  if (!intentOn || cards.length < 8) return cards;
  const ints = [...new Set(cards.map(c => c.level))].map(levelIntensity);
  const lo = Math.min(...ints), hi = Math.max(...ints);
  const keyed = cards.map(c => ({ c, k: Math.pow(Math.random(), 1 / intentWeight(c.level, lo, hi)) }));
  keyed.sort((a, b) => b.k - a.k);
  return keyed.slice(0, Math.max(20, Math.ceil(keyed.length * 0.30))).map(x => x.c);
}


// ── DECK LOGIC ────────────────────────────────────────────────────────────────
function getFilteredCards() {
  const effectiveSafe = state.safeMode || MASTER_SAFE || WORKPLACE_MODE;
  let levels = [...state.activeToggles];
  if (effectiveSafe) levels = levels.filter(l => !SAFE_BLOCKED_LEVELS.includes(l));
  return ALL_CARDS.filter(c => {
    if (!levels.includes(c.level)) return false;
    if (effectiveSafe && c.safe === false) return false;
    return true;
  });
}


function orderedSoloLevel() {
  if (state.activeToggles.size !== 1) return null;
  const l = [...state.activeToggles][0];
  return ORDERED_SOLO_LEVELS.includes(l) ? l : null;
}
function getOrderedSolo(lvl) {
  return lvl === 'colbert' ? getOrderedColbert() : ALL_CARDS.filter(c => c.level === lvl);
}

function getOrderedColbert() {
  let cards = ALL_CARDS.filter(c => c.level === 'colbert');
  if (COLBERT_STRICT) cards = cards.filter(c => !COLBERT_OPTIONAL.includes(c.question));
  return cards;
}


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


function applyRandomMode(arr) {
  switch (state.randomMode) {

    case 'wild':
      if (state.spiceMode && !state.safeMode) {
        // spiceMode on: bias toward spicy (roughly 1-in-3 spicy cards)
        const sp = shuffle(arr.filter(c => SPICY_LEVELS.includes(c.level)));
        const ns = shuffle(arr.filter(c => !SPICY_LEVELS.includes(c.level)));
        const r = []; let si=0, ni=0;
        while (si<sp.length || ni<ns.length) {
          if (ni<ns.length) r.push(ns[ni++]);
          if (ni<ns.length) r.push(ns[ni++]);
          if (si<sp.length) r.push(sp[si++]);
        }
        return r;
      }
      return shuffle(arr);

    case 'arc': {
      // Arc: cycling mini-arc pattern optimised for 5–20 card sessions.
      // Pattern per 4 cards: Warm → Deep → Deep → Cool (repeat).
      // After 70% of deck: Warm slot becomes Deep (full depth phase).
      // No recovery breaths — unnecessary at short session lengths.
      // Tiers read off the band table instead of a hardcoded list, so a future
      // rebalance of LEVEL_DEPTH doesn't quietly drift out of sync with this.
      // The gate (SPICY_LEVELS) is checked first and always wins 'S' — After
      // Dark is graded by depth *within* S (see the sort below), not folded
      // into L/M/H by its band number, since the gate is its own axis.
      const wt = c => {
        if (SPICY_LEVELS.includes(c.level)) return 'S';
        const d = levelDepth(c.level);
        if (d <= 2) return 'L';   // light/warm
        if (d >= 5) return 'H';   // heavy/deep
        return 'M';               // medium/cool
      };
      const pools = { L:[], M:[], H:[], S:[] };
      arr.forEach(c => pools[wt(c)].push(c));
      Object.values(pools).forEach(a => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} });
      // S ramps mild -> heavy by LEVEL_INTENSITY (stable sort keeps the shuffle
      // within each intensity tier, so it's a graded ramp, not a fixed order).
      pools.S.sort((a, b) => levelIntensity(a.level) - levelIntensity(b.level));
      let li=0, mi=0, hi=0, si=0;
      const total = arr.length;
      const result = [];
      // Slot pattern: L H H M
      const pat = ['L','H','H','M'];
      const draw = (type, pos) => {
        const progress = pos / Math.max(total, 1);
        // After 70%, L slots become H (full depth phase)
        const t = (type === 'L' && progress >= 0.7) ? 'H' : type;
        if (t === 'L') {
          if (li < pools.L.length) return pools.L[li++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (hi < pools.H.length) return pools.H[hi++];
        } else if (t === 'H') {
          if (hi < pools.H.length) return pools.H[hi++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (li < pools.L.length) return pools.L[li++];
        } else { // M / cool
          // Spice mode: weave S cards into cool slots
          if (state.spiceMode && si < pools.S.length && pos % 4 === 3) return pools.S[si++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (li < pools.L.length) return pools.L[li++];
          if (hi < pools.H.length) return pools.H[hi++];
          if (si < pools.S.length) return pools.S[si++];
        }
        return null;
      };
      const hasCards = () => li<pools.L.length || mi<pools.M.length || hi<pools.H.length || si<pools.S.length;
      let pos = 0;
      while (hasCards() && pos < total * 4) {
        const card = draw(pat[pos % pat.length], pos);
        if (card) result.push(card);
        pos++;
      }
      // Drain any remaining (shouldn't happen but safety net)
      while (si < pools.S.length) result.push(pools.S[si++]);
      return result;
    }
    default: return shuffle(arr);
  }
}


/* Builds a fresh fullDeck from the current filters/shuffle mode. Pure function
   of state: reads ALL_CARDS/state, writes nothing. In ordered-solo modes the
   whole set always plays in canonical order, so "unseen" doesn't apply there
   and comes back null. */
function buildFullDeck() {
  const solo = orderedSoloLevel();
  if (solo) return { deck: getOrderedSolo(solo), unseen: null };
  return _unseenFirst(applyRandomMode(applyIntent(getFilteredCards())));
}

/* Slices fullDeck down to the hand actually shown: honours cardLimit, and
   outside ordered-solo modes draws unseen cards first. */
function sliceVisibleDeck(fullDeck, unseen) {
  if (orderedSoloLevel()) {
    return state.cardLimit === null ? [...fullDeck] : fullDeck.slice(0, state.cardLimit);
  }
  return _sliceDraw(fullDeck, unseen);
}

/* Mirrors state.cardLimit onto the limit-button row's active class. */
function syncLimitButtons() {
  document.querySelectorAll('.limit-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.limit === (state.cardLimit === null ? 'all' : String(state.cardLimit)))
  );
}

function initDeck(isContinuation) {
  // isContinuation: true only from drawMore() (Draw more / hold-to-continue),
  // which deals a fresh hand under the SAME settings — the deal animation is
  // reserved for a hand that starts because something actually changed.
  state.skipDealAnim = !!isContinuation;
  state.skippedCards.clear();
  state.loggedQuestions.clear();
  if (orderedSoloLevel()) {
    if (state.colbertPrevLimit === null) state.colbertPrevLimit = state.cardLimit;   // remember to restore later
    state.cardLimit = null;
    syncLimitButtons();
  } else if (state.colbertPrevLimit !== null) {                          // leaving Colbert-solo: restore
    if (state.cardLimit === null) state.cardLimit = state.colbertPrevLimit;
    state.colbertPrevLimit = null;
    syncLimitButtons();
  }
  const built = buildFullDeck();
  state.fullDeck = built.deck;
  state.drawUnseen = built.unseen;
  state.currentIndex = -1;
  state.visibleDeck = sliceVisibleDeck(state.fullDeck, state.drawUnseen);
  renderProgress();
  setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  // clear accent on fresh deck
  const accent=document.getElementById('c-accent');
  if(accent){ accent.style.background=''; accent.classList.remove('accent-bloom'); }
  // init level
  const lv=document.getElementById('card-level');
  if(lv){ lv.classList.remove('in'); lv.textContent=''; }
  const qEl=document.getElementById('card-question');
  if(qEl){ qEl.classList.remove('in'); }
  setTimeout(()=>{ if(qEl) qEl.classList.add('in'); },20);
  renderShell();
}


/* Draw vs session: a draw is dealt from what this session hasn't seen. */

function _unseenFirst(deck){
  const seen = new Set(state.sessionLog.map(c => c.question));
  if (!seen.size) return {deck, unseen: deck.length};
  const fresh = deck.filter(c=>!seen.has(c.question));
  const used  = deck.filter(c=> seen.has(c.question));
  return {deck: fresh.concat(used), unseen: fresh.length};
}
function _sliceDraw(deck, unseen){
  /* deal only fresh cards; if none are left, the deck replays in full */
  const cap = unseen > 0 ? Math.min(unseen, state.cardLimit === null ? unseen : state.cardLimit)
                         : (state.cardLimit === null ? deck.length : Math.min(state.cardLimit, deck.length));
  if (state.randomMode === 'arc') return _arcHand(unseen > 0 ? deck.slice(0, unseen) : deck, cap);
  return deck.slice(0, cap);
}

/* One hand, one arc. Two things a hand needs that deck-wide ordering can't
   guarantee once seen cards are filtered out of it:
     - variety: prefer a category the hand hasn't used yet, so five cards mean
       five different categories whenever the selection allows, instead of three
       cards out of the same pool;
     - shape: order by depth so the hand opens warm, reaches its deepest card
       around the middle and eases down after it, rather than zig-zagging.
   The summary trace plots the same levelDepth, so the line reads as an arc too. */
function _arcHand(source, cap){
  if (source.length <= cap) return source.slice(0, cap);
  /* Later arcs start from a warmer baseline. A conversation already a hand or
     two in shouldn't drop back to small talk, so the floor rises one step per
     completed hand and stops at 3 — deep enough not to feel like starting over,
     shallow enough that the arc still has somewhere to climb and ease back to.
     Cards at or above the floor are simply offered first, so a narrow category
     selection quietly falls back to whatever is left. */
  const round = Math.floor(state.sessionLog.length / Math.max(cap, 1));
  const floor = Math.min(1 + round, 3);
  if (floor > 1) {
    const atFloor = source.filter(c => levelDepth(c.level) >= floor);
    const below   = source.filter(c => levelDepth(c.level) <  floor);
    source = atFloor.concat(below);
  }
  const picked = [], usedLevels = new Set(), spares = [];
  for (const c of source) {
    if (picked.length >= cap) break;
    if (usedLevels.has(c.level)) { spares.push(c); continue; }   // keep as a fallback
    usedLevels.add(c.level); picked.push(c);
  }
  for (let i = 0; picked.length < cap && i < spares.length; i++) picked.push(spares[i]);
  /* deepest card to the middle: walk the cards from shallow to deep, placing
     them alternately at the front and the back, so depth rises then falls */
  const byDepth = picked.slice().sort((a, b) => levelDepth(a.level) - levelDepth(b.level));
  const out = new Array(byDepth.length);
  let lo = 0, hi = byDepth.length - 1;
  byDepth.forEach((c, i) => { if (i % 2 === 0) out[lo++] = c; else out[hi--] = c; });

  /* An opener from After Dark reads as a different game than the one the
     table sat down for — fine as where a round lands, wrong as where it
     starts. Never the first card; a rare 5% chance it survives as the
     second; free everywhere from the third card on. Skipped when the hand
     is After-Dark-only (nothing else to open with) or has none at all. */
  const isAD = c => SPICY_LEVELS.includes(c.level);
  if (out.some(c => !isAD(c))) {
    const bump = (idx, surviveChance) => {
      if (!out[idx] || !isAD(out[idx]) || Math.random() < surviveChance) return;
      const swapAt = out.findIndex((c, i) => i > idx && !isAD(c));
      if (swapAt !== -1) [out[idx], out[swapAt]] = [out[swapAt], out[idx]];
    };
    bump(0, 0);      // spot 1: never
    bump(1, 0.05);   // spot 2: survives 5% of the time
  }
  return out;
}

function applyLimit() {
  state.skipDealAnim = false;   // a card-limit change is a settings change, not a continuation
  state.loggedQuestions.clear();
  const built = buildFullDeck();
  state.fullDeck = built.deck;
  state.drawUnseen = built.unseen;
  state.visibleDeck = sliceVisibleDeck(state.fullDeck, state.drawUnseen);
  state.currentIndex = -1;
  renderProgress();
  setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  renderShell();
}


function drawMore() {
  /* Deal a FRESH hand at the chosen limit rather than growing the current one.
     The hand is always the size you picked (5) — it never becomes 10 or 15.
     initDeck() deals unseen cards first, so a new hand doesn't repeat what this
     session already showed. Same behaviour as Continue on the end screen. */
  initDeck(true);
  _nextCardBase();
  updateDeckInfo();
  updateDrawMore();
  renderProgress();
}



// ── CARD DISPLAY ──────────────────────────────────────────────────────────────
// Shared by every "we've reached the end of this hand" case (out of fresh
// cards, all skipped, ...): swap the card face for an end message on the same
// 175ms beat flipToCard() uses, so different endings don't each reinvent the
// same DOM sequence with their own copy of the timing.
function renderEndMessage(html) {
  const el = document.getElementById('card');
  el.classList.add('flipping');
  setTimeout(() => {
    document.getElementById('card-level').className   = 'card-level';
    document.getElementById('card-level').textContent = '';
    document.getElementById('card-question').innerHTML = html;
    document.getElementById('card-number').textContent = '— end —';
    el.classList.remove('flipping');
    updateDrawMore();
  }, 175);
}

function _nextCardBase() {
  if (!state.visibleDeck.length) return;
  if (state.currentIndex < state.visibleDeck.length - 1) {
    // The deal animation marks a new hand actually starting from a settings
    // change — not "Draw more"/hold-to-continue, which extends play with the
    // same settings and should feel like a plain next card, not a re-deal.
    // initDeck(isContinuation) sets skipDealAnim accordingly on every reset.
    const isFirstDraw = state.currentIndex === -1 && !state.skipDealAnim;
    state.currentIndex++;
    flipToCard(state.visibleDeck[state.currentIndex], isFirstDraw);
    addToLog(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    if (state.currentIndex === state.visibleDeck.length - 1) updateDrawMore();
  } else {
    state.currentIndex = state.visibleDeck.length; // sentinel: prevents re-trigger on repeat tap
    const fresh = (()=>{const sn=new Set(state.sessionLog.map(c=>c.question));return state.fullDeck.filter(c=>!sn.has(c.question)).length;})();
    const html = fresh > 0
      ? `<span style="font-size:1rem;color:var(--muted)">That's your ${state.visibleDeck.length}.<br><br>${fresh} ${state.lang==='nl'?'nieuwe kaarten over — houd vast voor de volgende ronde.':(fresh===1?'new card left — hold to continue.':'new cards left — hold to continue.')}</span>`
      : `<span style="font-size:1rem;color:var(--muted)">${state.lang==='nl'
          ? `Dat was dit hele deck — alle ${state.visibleDeck.length} kaarten.<br><br>Kies meer categorieën om door te gaan, of houd vast om dit deck opnieuw te spelen.`
          : `That's the whole deck — all ${state.visibleDeck.length} cards.<br><br>Add categories to keep going, or hold to replay this deck.`}</span>`;
    renderEndMessage(html);
  }
}
// nextCard is defined below (APP SHELL section) — it wraps _nextCardBase with
// the end-of-draw hold gate and post-advance hooks (party/session summary).

function prevCard() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
  }
}

// ── PROGRESS & INFO ───────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════
// FEATURE 3: SKIP CARD — swipe down (the touch handler that recognizes the
// gesture lives with the card's other touch handling, above)
// ═══════════════════════════════════════════════════════════
// skippedCards declared at top with state variables

// Skip-undo bookkeeping lives alongside skipCard itself (not in a wrapper —
// see the undo button listener below, which shares these three).


function skipCard() {
  // Captured before the guard below, and the "show undo button" step at the
  // end runs unconditionally too — matching the swipe-down caller, which
  // already never invokes skipCard() outside a valid index.
  const undoBtn = document.getElementById('skipUndo');
  if (undoBtn) { _undoCard = state.visibleDeck[state.currentIndex]; _undoIndex = state.currentIndex; }
  if (!(state.currentIndex < 0 || state.currentIndex >= state.visibleDeck.length || state.visibleDeck.length === 0)) {
    // Remove from visibleDeck only — fullDeck stays intact for new rounds
    const removed = state.visibleDeck.splice(state.currentIndex, 1)[0];
    state.skippedCards.add(removed.question);
    // Show next card (or skipped-all state)
    if (state.visibleDeck.length === 0) {
      state.currentIndex = state.visibleDeck.length; // sentinel: past end
      renderEndMessage(`<span style="font-size:1rem;color:var(--muted)">All cards skipped.<br><br>Hold to continue.</span>`);
    } else {
      if (state.currentIndex >= state.visibleDeck.length) state.currentIndex = state.visibleDeck.length - 1;
      flipToCard(state.visibleDeck[state.currentIndex]);
    }
    updateDeckInfo(); renderProgress(); updateDrawMore();
  }
  if (undoBtn) {
    undoBtn.classList.add('visible');
    clearTimeout(_undoTimer);
    _undoTimer = setTimeout(() => {
      undoBtn.classList.remove('visible');
      _undoCard = null; _undoIndex = null;
    }, 3000);
  }
}

// The swipe-down gesture that calls skipCard() is recognized by the card's
// touch handler, above — skip is downward-swipe-only; a hold always means
// "continue" (see the end-of-draw hold gate below).

// ═══════════════════════════════════════════════════════════
// FEATURE 5: SESSION SUMMARY
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// nextCard — advances the deck and runs post-advance hooks (party/session summary)
// ═══════════════════════════════════════════════════════════
// Pure: given the current state (plus the hold-gate flag, which is state too,
// just not on the `state` object), decide what a "next" press should do. No
// DOM reads, no DOM writes, no side effects — so this decision can be
// reasoned about (or tested) on its own, separately from executing it.
function decideNextCardAction() {
  if (state.visibleDeck.length === 0 && state.skippedCards.size > 0) return { type: 'reshuffle' };  // all skipped: reshuffle straight into a card
  if (state.visibleDeck.length === 0) return { type: 'advance', wasAtEnd: false };  // _nextCardBase() no-ops safely on an empty deck

  // Already past end (sentinel) — a tap offers a new round, but only once a
  // completed hold has cleared it: the end of a draw is a deliberate stop,
  // so tapping through a session can never rush past the summary unseen.
  if (state.currentIndex >= state.visibleDeck.length) {
    if (!window._endHoldOK) return { type: 'blocked' };
    return { type: 'reshuffle', consumeHold: true };
  }

  if (state.pickerOpen) return { type: 'noop' };  // pick-3 intercept (works in fullscreen too)
  if (pickMode) {
    const startIdx = state.currentIndex + 1;
    if (startIdx < state.visibleDeck.length) {
      const count = Math.min(3, state.visibleDeck.length - startIdx);
      if (count >= 2) return { type: 'pick3', startIdx, count };
    }
  }

  return { type: 'advance', wasAtEnd: state.currentIndex >= state.visibleDeck.length - 1 };
}

// Everything below is the execution side: run the DOM/side-effect step the
// decision calls for. nextCard() itself is now just a dispatcher.

function nextCard() {
  const action = decideNextCardAction();
  switch (action.type) {
    case 'blocked':
      _nudgeEndHold();
      return;
    case 'noop':
      return;
    case 'reshuffle':
      if (action.consumeHold) window._endHoldOK = false;
      initDeck(true);   /* same settings, next hand — no deal animation */
      _nextCardBase();   /* deal straight into the next hand — no blank card */
      return;
    case 'pick3':
      openPicker(state.visibleDeck.slice(action.startIdx, action.startIdx + action.count));
      return;
    case 'advance':
      _nextCardBase();
      if (action.wasAtEnd) {
        if (state.partyMode) setTimeout(runPartySummary, 250);
        else                 setTimeout(showSessionSummary, 500);
      }
      return;
  }
}

function choosePick(chosen, allOptions) {
  // Remove unchosen cards from both decks silently
  allOptions.forEach(c => {
    if (c.question === chosen.question) return;
    const vi = state.visibleDeck.findIndex(x => x.question === c.question);
    if (vi >= 0) state.visibleDeck.splice(vi, 1);
    const fi = state.fullDeck.findIndex(x => x.question === c.question);
    if (fi >= 0) state.fullDeck.splice(fi, 1);
  });
  // Set currentIndex to the chosen card
  const newIdx = state.visibleDeck.findIndex(x => x.question === chosen.question);
  if (newIdx >= 0) state.currentIndex = newIdx;
  closePicker();
  flipToCard(chosen);
  if (typeof state.partyMode !== 'undefined' && state.partyMode && typeof updatePartyDisplay === 'function') updatePartyDisplay(chosen);
  addToLog(chosen);
  updateStarUI();
  updateDeckInfo();
  renderProgress();
  updateDrawMore();
}

// Pick toggle

