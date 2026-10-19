// ── DECK ─────────────────────────────────────────────────────────────────────
// Building, filtering, shuffling and advancing through the deck: from the
// intent dial's weighting and getFilteredCards() through applyRandomMode's
// shuffle modes, initDeck/applyLimit, and the nextCard/skipCard/prevCard
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
   behind (Efraimidis–Spirakis). It only ORDERS: nothing is cut away, so every
   card in the pool stays in play and the dial-suited ones just tend to come
   first, fading naturally into the normal mix as they run out. `ref` is the
   whole selection, so the dial's target doesn't drift as cards get used up. */
function applyIntent(cards, ref){
  ref = ref || cards;
  if (!intentOn || ref.length < 8) return shuffle(cards);
  const ints = [...new Set(ref.map(c => c.level))].map(levelIntensity);
  const lo = Math.min(...ints), hi = Math.max(...ints);
  const keyed = cards.map(c => ({ c, k: Math.pow(Math.random(), 1 / intentWeight(c.level, lo, hi)) }));
  keyed.sort((a, b) => b.k - a.k);
  return keyed.map(x => x.c);
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


/* The order the unseen cards are drawn in: dial-weighted random when the
   dials are on, plain random when off. Spice mode (After Dark on, not safe)
   weaves roughly one After Dark card in three through that order, keeping
   each side's own order so the dial weighting survives the weave. The
   Random/Arc difference is only what happens inside the hand (_sliceDraw). */
function orderUnseen(cards, ref) {
  const ordered = applyIntent(cards, ref);
  if (state.spiceMode && !state.safeMode) {
    const sp = ordered.filter(c => SPICY_LEVELS.includes(c.level));
    const ns = ordered.filter(c => !SPICY_LEVELS.includes(c.level));
    const r = []; let si = 0, ni = 0;
    while (si < sp.length || ni < ns.length) {
      if (ni < ns.length) r.push(ns[ni++]);
      if (ni < ns.length) r.push(ns[ni++]);
      if (si < sp.length) r.push(sp[si++]);
    }
    return r;
  }
  return ordered;
}


/* Builds a fresh fullDeck from the current filters/shuffle mode. Pure function
   of state: reads ALL_CARDS/state, writes nothing. In ordered-solo modes the
   whole set always plays in canonical order, so "unseen" doesn't apply there
   and comes back null. */
function buildFullDeck() {
  const solo = orderedSoloLevel();
  if (solo) return { deck: getOrderedSolo(solo), unseen: null };
  return _unseenFirst(getFilteredCards());
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
  // which draws a fresh hand under the SAME settings — the draw animation is
  // reserved for a hand that starts because something actually changed.
  state.skipDrawAnim = !!isContinuation;
  state.skippedCards.clear();
  state.loggedQuestions.clear();
  state.handStarred.clear();
  _newHandBookkeeping();
  if (orderedSoloLevel()) {
    if (state.colbertPrevLimit === null) state.colbertPrevLimit = state.cardLimit;   // remember to restore later
    state.cardLimit = null;
    syncLimitButtons();
  } else if (state.colbertPrevLimit !== null) {                          // leaving Colbert-solo: restore
    if (state.cardLimit === null) state.cardLimit = state.colbertPrevLimit;
    state.colbertPrevLimit = null;
    syncLimitButtons();
  }
  _startFreshPassIfSpent();
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
  if(accent){ giltRailPaint(accent, null); accent.classList.remove('accent-bloom'); }
  // init level
  const lv=document.getElementById('card-level');
  if(lv){ lv.classList.remove('in'); lv.textContent=''; }
  const qEl=document.getElementById('card-question');
  if(qEl){ qEl.classList.remove('in'); }
  setTimeout(()=>{ if(qEl) qEl.classList.add('in'); },20);
  renderShell();
}


/* Draw vs session: a draw comes from what this pass hasn't seen.
   "Seen" = the session log from state.seenFrom onward, plus the cards skipped
   this pass (state.skippedSeen: seen, but not in the history list). The log
   itself is the visible history and is never wiped; starting a fresh pass
   just moves seenFrom to the end of it and empties skippedSeen. */
function _seenSet(){
  const from = Math.min(Math.max(state.seenFrom || 0, 0), state.sessionLog.length);
  const seen = new Set(state.sessionLog.slice(from).map(c => c.question));
  state.skippedSeen.forEach(q => seen.add(q));
  return seen;
}
function _unseenCount(cards){
  const seen = _seenSet();
  return cards.filter(c => !seen.has(c.question)).length;
}
/* Nothing in the selection is unseen any more: a fresh pass begins, every
   card in the selection counts as unseen again. Called when a new hand is
   about to be built (hold-to-continue / Draw more / any settings change). */
function _startFreshPassIfSpent(){
  if (orderedSoloLevel()) return;
  const cards = getFilteredCards();
  if (cards.length && _unseenCount(cards) === 0) { state.seenFrom = state.sessionLog.length; state.skippedSeen.clear(); }
}

/* A new hand is being built (initDeck / applyLimit): the hand counter moves on,
   Three's bookkeeping for the hand starts empty, and any options still on
   screen belong to the hand that just ended. */
function _newHandBookkeeping(){
  state.handNo++;
  state.reachedIdx = -1;
  state.handOffered.clear();
  Object.keys(state.sitOut).forEach(q => { if (state.sitOut[q] <= state.handNo) delete state.sitOut[q]; });
  if (state.pickerOpen) closePicker();
  state.pickOptions = null;
}
function _sittingOut(c){ return (state.sitOut[c.question] || 0) > state.handNo; }

const RUN = 5;      // a run: five consecutive cards of a hand, the unit of an Arc and of the spread
const RUN_CAP = 2;  // most cards of one category in a run

/* The later runs of a hand (`places` places after the current run), summed
   once per run for _canFillRuns: `outside[k]` is the places in all but the
   first k later runs, `cap[k]` how many cards of one category those first k
   runs can take (a short final run takes fewer). */
function _laterRunsPlan(places) {
  const sizes = Array.from({ length: Math.ceil(places / RUN) }, (_, i) => Math.min(RUN, places - i * RUN));
  const outside = new Array(sizes.length + 1).fill(0);
  for (let k = sizes.length - 1; k >= 0; k--) outside[k] = outside[k + 1] + sizes[k];
  const cap = sizes.reduce((sums, size) => [...sums, sums[sums.length - 1] + Math.min(RUN_CAP, size)], [0]);
  return { outside, cap };
}

/* Which numbers k of later runs (the k largest) _canFillRuns has to try. All
   later runs have five places except the last, which may be shorter. While the
   runs are full the cut value is concave in k (a falling straight line plus a
   category supply that only flattens), so its lowest point is at an end, and
   only the last run can break that. So: k = 0; k = last - 1 (all later runs
   but the final one: when the final run is short these are exactly the full
   runs, when it is full it is the second-to-last run's count); and k = last
   (all later runs, final one included). */
function _cutPoints(plan) {
  const last = plan.cap.length - 1;
  return new Set([0, Math.max(0, last - 1), last]);
}

/* Can `places` still be filled with at most RUN_CAP cards of a category per run?
   `left` counts the cards still available per category; the current run has
   `runRoom` places left and `inRun` cards so far; `plan` is the later runs
   (_laterRunsPlan). The count condition (Hall / min-cut): for the current run
   in or out of the cut and every number k of later runs in it, the places
   outside the cut plus what the categories can supply into it must reach
   `places`. */
function _canFillRuns(left, places, runRoom, inRun, plan) {
  const roomIn = level => Math.max(0, Math.min(RUN_CAP - (inRun.get(level) ?? 0), runRoom));
  const holds = (k, withCurrent) => {
    let supply = plan.outside[k] + (withCurrent ? 0 : runRoom);
    for (const [level, n] of left) supply += Math.min(n, plan.cap[k] + (withCurrent ? roomIn(level) : 0));
    return supply >= places;
  };
  return [..._cutPoints(plan)].every(k => holds(k, false) && holds(k, true));
}

/* The earliest card of each category, in draw order. */
function _earliestPerCategory(cards) {
  const seen = new Set();
  return cards.filter(c => !seen.has(c.level) && seen.add(c.level));
}

/* The card for the next place: the earliest head that is under the cap (Arc:
   one per category first) and still lets the hand be filled; if none does, a
   third can't be avoided, so the least used category in the run. */
function _placeCard(heads, count, fits, distinctFirst) {
  const caps = distinctFirst ? [1, RUN_CAP] : [RUN_CAP];
  for (const cap of caps) {
    const card = heads.find(c => count(c) < cap && fits(c));
    if (card) return card;
  }
  return heads.reduce((best, c) => (count(c) < count(best) ? c : best));
}

/* Category spread: chooses the hand's cards so that no run of five holds more
   than two of one category, wherever the unseen cards allow. One pass over the
   unseen cards in draw order, BEFORE the hand is cut: each place takes the
   earliest card whose category is under the cap (Arc: one per category first,
   so five cards mean five categories when the pool allows) AS LONG AS the
   places still to come can be filled afterwards (_canFillRuns). That look-ahead
   keeps a heavy category from being left to pile up in the last runs;
   otherwise the draw order (dials, After Dark weave) decides. Unseen cards
   only; cards not taken stay behind the hand, in order. */
function _spreadRuns(ordered, handSize, distinctFirst) {
  const size = Math.min(handSize, ordered.length);
  const rest = [...ordered];
  const left = new Map();
  rest.forEach(c => left.set(c.level, (left.get(c.level) ?? 0) + 1));
  const drawPos = new Map(ordered.map((c, i) => [c, i]));
  const hand = [];
  while (hand.length < size) {
    const runLen = Math.min(RUN, size - hand.length);
    const plan = _laterRunsPlan(size - hand.length - runLen);
    const inRun = new Map();
    const run = [];
    const count = card => inRun.get(card.level) ?? 0;
    const take = (card, by) => {
      left.set(card.level, left.get(card.level) - by);
      inRun.set(card.level, count(card) + by);
    };
    const fits = card => {
      take(card, 1);
      const ok = _canFillRuns(left, size - hand.length - run.length - 1, runLen - run.length - 1, inRun, plan);
      take(card, -1);
      return ok;
    };
    while (run.length < runLen) {
      const card = _placeCard(_earliestPerCategory(rest), count, fits, distinctFirst);
      rest.splice(rest.indexOf(card), 1);
      take(card, 1);
      run.push(card);
    }
    hand.push(...run.sort((x, y) => drawPos.get(x) - drawPos.get(y)));   // draw order inside the run
  }
  return [...hand, ...rest];
}

const _spreadHolds = run => run.every(c => run.filter(d => d.level === c.level).length <= RUN_CAP);
/* an arc rises to its deepest card, then eases down */
const _isArcShaped = run => {
  const depths = run.map(c => levelDepth(c.level));
  let i = 0;
  while (i < depths.length - 1 && depths[i] <= depths[i + 1]) i++;
  while (i < depths.length - 1 && depths[i] >= depths[i + 1]) i++;
  return i >= depths.length - 1;
};
/* Would swapping cards i and j leave both of their runs passing `holds`? */
function _swapKeeps(cards, i, j, holds) {
  const swapped = [...cards];
  [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
  return [i, j].every(k => holds(swapped.slice(Math.floor(k / RUN) * RUN, Math.floor(k / RUN) * RUN + RUN)));
}

/* Unseen cards first, in draw order (dial-weighted or random); seen cards
   follow so fullDeck still holds the whole selection. */
function _unseenFirst(cards){
  const seen = _seenSet();
  const unseenCards = cards.filter(c => !seen.has(c.question));
  /* cards passed over in a Three pick sit out this hand; if that would leave
     nothing to draw, they are let back in rather than building an empty hand */
  let eligible = unseenCards.filter(c => !_sittingOut(c));
  if (!eligible.length) eligible = unseenCards;
  const eligSet = new Set(eligible);
  const fresh = _spreadRuns(orderUnseen(eligible, cards), state.cardLimit ?? eligible.length, state.randomMode === 'arc');
  const used  = shuffle(cards.filter(c => !eligSet.has(c)));
  return {deck: fresh.concat(used), unseen: fresh.length};
}
/* The hand: the first N unseen cards in draw order (N = the limit, or every
   unseen card for All); fewer only when fewer unseen cards are left. */
function _sliceDraw(deck, unseen){
  const n = state.cardLimit === null ? unseen : Math.min(unseen, state.cardLimit);
  const hand = deck.slice(0, n);
  return state.randomMode === 'arc' ? _arcHand(hand) : hand;
}

/* Arc: the hand plays as consecutive mini arcs of 5 cards (a 5 is one arc, a
   10 two, All as many as it takes; a short last group is its own small arc).
   The hand's cards are taken in their draw order, five at a time, and each
   group is shaped on its own:
     - variety: already settled when the hand was chosen (_spreadRuns: each
       run of five prefers different categories and never holds more than two
       of one), so a group is simply the next five cards in line;
     - shape: order by depth so the group opens warm, reaches its deepest card
       around the middle and eases down after it.
   The summary trace plots the same levelDepth, so the line reads as arcs. */
function _arcHand(hand){
  const out = [];
  let rest = hand.slice();
  while (rest.length) {
    const picked = rest.slice(0, RUN);
    rest = rest.slice(picked.length);
    /* deepest card to the middle: walk the cards from shallow to deep, placing
       them alternately at the front and the back, so depth rises then falls */
    const byDepth = picked.slice().sort((a, b) => levelDepth(a.level) - levelDepth(b.level));
    const arc = new Array(byDepth.length);
    let lo = 0, hi = byDepth.length - 1;
    byDepth.forEach((c, i) => { if (i % 2 === 0) arc[lo++] = c; else arc[hi--] = c; });
    out.push(...arc);
  }

  /* An opener from After Dark reads as a different game than the one the
     table sat down for — fine as where a round lands, wrong as where it
     starts. Never the hand's first card; a rare 5% chance it survives as the
     second; free everywhere from the third card on. Skipped when the hand
     is After-Dark-only (nothing else to open with) or has none at all.
     A rising-then-falling arc read backwards is still an arc, so the first
     group is turned around when that fixes the opening; only if it doesn't
     does a later non-After-Dark card swap in. */
  const isAD = c => SPICY_LEVELS.includes(c.level);
  if (out.some(c => !isAD(c))) {
    const keepSecond = Math.random() < 0.05;
    const openOK = () => !isAD(out[0]) && (keepSecond || !isAD(out[1]));
    if (!openOK()) {
      const n = Math.min(RUN, out.length);
      out.splice(0, n, ...out.slice(0, n).reverse());
      if (!openOK()) out.splice(0, n, ...out.slice(0, n).reverse());   // turn it back
    }
    const bump = (idx, survive) => {
      if (!out[idx] || !isAD(out[idx]) || survive) return;
      /* prefer a swap that keeps both the spread and the arc's shape, then one
         that keeps the spread; the opener rule wins if none does */
      const later = out.flatMap((c, i) => (i > idx && !isAD(c) ? [i] : []));
      const keepsAll = run => _spreadHolds(run) && _isArcShaped(run);
      const swapAt = later.find(i => _swapKeeps(out, idx, i, keepsAll))
        ?? later.find(i => _swapKeeps(out, idx, i, _spreadHolds)) ?? later[0] ?? -1;
      if (swapAt !== -1) [out[idx], out[swapAt]] = [out[swapAt], out[idx]];
    };
    bump(0, false);        // spot 1: never
    bump(1, keepSecond);   // spot 2: survives 5% of the time
  }
  return out;
}

function applyLimit() {
  state.skipDrawAnim = false;   // a card-limit change is a settings change, not a continuation
  state.loggedQuestions.clear();
  _newHandBookkeeping();
  _startFreshPassIfSpent();
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


// ── ?Q= TEST DECK ─────────────────────────────────────────────────────────
// Debug/demo shortcut: ?Q=Work1,Life7,Carnal4 renders exactly those cards, in
// that order, as the whole hand — instead of the normal random draw — so a
// specific card can be pulled up or shown to someone without clicking
// through category selection. Id = a CATEGORIES key (case-insensitive) plus
// a 1-based index counted in questions.js order for that category, e.g.
// "Work1" is the first Work card as currently written; inserting a card
// earlier in a category shifts every later number in it, so these are
// throwaway test addresses, not stable ones. An id that doesn't parse or
// doesn't resolve is skipped rather than breaking the whole link. Sets
// state.queryDeckActive so autoSaveSession() (session.js) leaves the real
// saved session alone.
function applyQueryDeck() {
  const raw = new URLSearchParams(location.search).get('Q');
  if (!raw) return false;
  const byLevel = {};
  ALL_CARDS.forEach(c => { (byLevel[c.level] = byLevel[c.level] || []).push(c); });
  const cards = raw.split(',').map(s => s.trim()).filter(Boolean).map(id => {
    const m = id.match(/^([a-zA-Z]+)(\d+)$/);
    if (!m) return null;
    const pool = byLevel[m[1].toLowerCase()];
    return pool ? (pool[parseInt(m[2], 10) - 1] || null) : null;
  }).filter(Boolean);
  if (!cards.length) return false;

  state.queryDeckActive = true;
  state.skipDrawAnim = false;
  state.loggedQuestions.clear();
  state.fullDeck = cards;
  state.drawUnseen = cards.length;
  state.cardLimit = cards.length;
  state.visibleDeck = cards;
  state.currentIndex = -1;
  syncLimitButtons();
  renderProgress();
  setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  state.categoriesCollapsed = true;
  document.getElementById('toggles')?.classList.add('collapsed');
  const ca = document.getElementById('catArrow');
  if (ca) ca.textContent = '▶';
  renderShell();
  _nextCardBase();
  return true;
}


function drawMore() {
  /* Draw a FRESH hand at the chosen limit rather than growing the current one.
     The hand is always the size you picked (5) — it never becomes 10 or 15.
     initDeck() draws unseen cards first, so a new hand doesn't repeat what this
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
    el.classList.remove('flipping');
    updateDrawMore();
  }, 175);
}

/* The message after the last card of a hand (in the card, and in fullscreen):
   it stays up long enough to read, then the card turns over on its side to its
   back (the shared .turning, see styles.css) and showHandSummary() swaps the face
   at the edge-on midpoint. Timers are kept so a new card or hand shown in the
   meantime (hold-to-continue, a settings change) cancels the pending turn —
   hideHandSummary() calls clearEndTimers(). */
const END_MSG_READ_MS = { 1: 1100, 2: 1900 };   // from the start of the swap to the start of the turn
const TURN_MID_MS = 450, TURN_END_MS = 940;     // the turn: 0.9s, edge-on at 450ms (matches styles.css cardTurn)
let _endTimers = [];
let _endMsgLines = 1;
let _endTurnNodes = [];
function clearEndTimers() {
  _endTimers.forEach(clearTimeout); _endTimers = [];
  _endTurnNodes.forEach(n => n.classList.remove('turning')); _endTurnNodes = [];   // a cancelled turn must not stay on the card
}
function endMessageToIntermezzo() {
  clearEndTimers();
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = END_MSG_READ_MS[_endMsgLines] || END_MSG_READ_MS[1];
  _endTimers.push(setTimeout(() => {
    if (reduced) { showHandSummary(); return; }
    const c = document.getElementById('card'), pc = document.querySelector('#partyOverlay .party-card');
    const ns = _endTurnNodes = [c, pc].filter(Boolean);
    ns.forEach(n => { n.classList.remove('turning', 'turning-back'); void n.offsetWidth; n.classList.add('turning'); });
    _endTimers.push(setTimeout(showHandSummary, TURN_MID_MS));
    _endTimers.push(setTimeout(() => clearEndTimers(), TURN_END_MS));
  }, wait));
}

function _nextCardBase() {
  if (!state.visibleDeck.length) return;
  if (state.currentIndex < state.visibleDeck.length - 1) {
    // The draw animation marks a new hand actually starting from a settings
    // change — not "Draw more"/hold-to-continue, which extends play with the
    // same settings and should feel like a plain next card, not a re-draw.
    // initDeck(isContinuation) sets skipDrawAnim accordingly on every reset.
    const isFirstDraw = state.currentIndex === -1 && !state.skipDrawAnim;
    state.currentIndex++;
    state.reachedIdx = Math.max(state.reachedIdx, state.currentIndex);
    flipToCard(state.visibleDeck[state.currentIndex], isFirstDraw);
    addToLog(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    /* Three and Spotlight are live from the moment the first card is drawn, not
       only once its draw animation has landed (updateDrawMore runs from flipToCard
       at the end of it) */
    if (state.currentIndex === 0) ['pickToggle', 'btnParty'].forEach(id => document.getElementById(id)?.classList.remove('disabled'));
    if (state.currentIndex === state.visibleDeck.length - 1) updateDrawMore();
  } else {
    state.currentIndex = state.visibleDeck.length; // sentinel: prevents re-trigger on repeat tap
    const fresh = _unseenCount(state.fullDeck);
    /* Each line is its own block. Unseen cards left in the selection: one line.
       Nothing unseen left: two lines, with M = the whole selection (fullDeck),
       not the hand. */
    const n = state.visibleDeck.length;
    const lines = fresh > 0
      ? [`Th${n===1?'at was':'ose were'} your ${n} ${n===1?'card':'cards'}.`]
      : [`You've drawn all ${state.fullDeck.length} cards in your selection.`, `Add categories to keep going.`];
    _endMsgLines = lines.length;
    const html = `<span class="end-msg">${lines.map((l,i) => `<span style="display:block${i?';margin-top:1.4em':''}">${l}</span>`).join('')}</span>`;
    renderEndMessage(html);
    // fullscreen: the same message, centred in the fullscreen card
    const pq = document.getElementById('party-question');
    const pl = document.getElementById('party-level');
    if (pl) { pl.textContent = ''; pl.style.color = ''; }
    if (pq) { pq.innerHTML = html; pq.classList.add('is-end-msg'); }
  }
}
// nextCard is defined below (APP SHELL section) — it wraps _nextCardBase with
// the end-of-draw hold gate and post-advance hooks (party/session summary).

function prevCard() {
  /* Three options on screen: Back leaves them (no pick, nothing sits out) and
     is the card behind them again — the card of the step before. */
  if (state.pickerOpen) { closePicker(); state.pickOptions = null; return; }
  /* The hand's list is up: Back turns the card over to Intermezzo (nothing else). */
  if (state.handSide === 'list') { showHandIntermezzo(); return; }
  if (state.currentIndex > 0) {
    state.currentIndex--;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
  }
}

// ═══════════════════════════════════════════════════════════
// SKIP CARD — swipe down (the touch handler that recognizes the gesture
// lives in ui.js). The undo bookkeeping (_undoCard/_undoIndex/_undoTimer,
// declared in state.js) is shared with the undo button listener in ui.js.
// ═══════════════════════════════════════════════════════════

function skipCard() {
  // Captured before the guard below, and the "show undo button" step at the
  // end runs unconditionally too — matching the swipe-down caller, which
  // already never invokes skipCard() outside a valid index.
  const undoBtn = document.getElementById('skipUndo');
  _undoLog = null; _undoReachedShift = false;
  if (undoBtn) { _undoCard = state.visibleDeck[state.currentIndex]; _undoIndex = state.currentIndex; }
  if (!(state.currentIndex < 0 || state.currentIndex >= state.visibleDeck.length || state.visibleDeck.length === 0)) {
    // Remove from visibleDeck only — fullDeck stays intact for new rounds
    const removed = state.visibleDeck.splice(state.currentIndex, 1)[0];
    /* cards after the skipped one move down a place: when the skip is behind
       the front of the hand (after Back), reachedIdx moves with them so the
       next step not yet reached still offers three */
    _undoReachedShift = state.currentIndex < state.reachedIdx;
    if (_undoReachedShift) state.reachedIdx--;
    state.reachedIdx = Math.min(state.reachedIdx, state.visibleDeck.length - 1);
    state.skippedCards.add(removed.question);
    /* a skipped card counts as seen (not drawn again this pass) but is not
       part of the history list: out of the log, into skippedSeen */
    state.skippedSeen.add(removed.question);
    _undoLog = removeFromLog(removed.question);
    // Show next card (or skipped-all state)
    if (state.visibleDeck.length === 0) {
      state.currentIndex = state.visibleDeck.length; // sentinel: past end
      renderEndMessage(`<span style="font-size:1rem;color:var(--muted)">All cards skipped.<br><br>Hold to continue.</span>`);
    } else {
      if (state.currentIndex >= state.visibleDeck.length) state.currentIndex = state.visibleDeck.length - 1;
      flipToCard(state.visibleDeck[state.currentIndex]);
      /* the card that slides into the slot is shown, so it is logged and
         counts as seen like any shown card (no-op if already in the log, e.g.
         a card visited earlier). Undo leaves it logged: it was shown. */
      addToLog(state.visibleDeck[state.currentIndex]);
    }
    updateDeckInfo(); renderProgress(); updateDrawMore();
  }
  if (undoBtn) {
    undoBtn.classList.add('visible');
    clearTimeout(_undoTimer);
    _undoTimer = setTimeout(() => {
      undoBtn.classList.remove('visible');
      _undoCard = null; _undoIndex = null; _undoLog = null; _undoReachedShift = false;
    }, 3000);
  }
}

// Skip is downward-swipe-only; a hold always means "continue" (see the
// end-of-draw hold gate below).

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
  /* Three: each step of the hand not shown yet is offered as three cards (the
     planned one plus two). Steps already reached (after Back) just advance. */
  if (pickMode) {
    const step = state.currentIndex + 1;
    if (step < state.visibleDeck.length && step > state.reachedIdx) return { type: 'pick3', step };
  }

  return { type: 'advance', wasAtEnd: state.currentIndex >= state.visibleDeck.length - 1 };
}

// Everything below is the execution side: run the DOM/side-effect step the
// decision calls for. nextCard() itself is just a dispatcher.

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
      initDeck(true);   /* same settings, next hand — no draw animation */
      _nextCardBase();   /* draw straight into the next hand — no blank card */
      return;
    case 'pick3': {
      const options = buildPickOptions(action.step);
      if (options.length < 2) { _nextCardBase(); return; }   // nothing to set beside the planned card: the single card
      openPicker(options, action.step);
      return;
    }
    case 'advance':
      _nextCardBase();
      if (action.wasAtEnd) {
        endMessageToIntermezzo();   // message, fade, then the card turns to Intermezzo (both surfaces)
      }
      return;
  }
}

/* Three, inside the hand. The options for a step are the card the hand
   planned there plus two more drawn the way that step's card would be:
   Arc takes two unseen cards from the selection at the planned card's depth
   (levelDepth), or the nearest depth when fewer exist; Wild takes the next
   two in the dial-weighted draw order. Never a card already in this hand,
   offered earlier in this hand, and unseen cards come first. In Arc the After
   Dark opener rule holds (none as an option on step 1; on step 2 only 1 time
   in 20). If fewer than two unseen cards are left, cards already seen this
   pass fill in (so Three keeps working late in a pass), then the sit-outs from
   last hand; fewer options only when the selection can't supply two others. */
function buildPickOptions(step) {
  const planned = state.visibleDeck[step];
  if (!planned) return [];
  const inHand = new Set(state.visibleDeck.map(c => c.question));
  const seen = _seenSet();
  const all = getFilteredCards();
  const others = all.filter(c => !inHand.has(c.question) && !state.handOffered.has(c.question));
  const isArc = state.randomMode === 'arc';
  const isAD = c => SPICY_LEVELS.includes(c.level);
  const noADOpener = isArc && !isAD(planned) && step <= 1 && !(step === 1 && Math.random() < 0.05);
  const d = isArc ? levelDepth(planned.level) : 0;
  /* Tiers, in order: unseen cards, then cards already seen this pass, then the
     sit-outs from last hand (unseen first). Later tiers only top up what the
     earlier ones couldn't supply, so Three keeps working late in a pass. */
  const tiers = [
    others.filter(c => !seen.has(c.question) && !_sittingOut(c)),
    others.filter(c => seen.has(c.question) && !_sittingOut(c)),
    others.filter(c => !seen.has(c.question) && _sittingOut(c)),
    others.filter(c => seen.has(c.question) && _sittingOut(c)),
  ];
  /* Category spread: a pick takes this step's place in its run of five, so an
     option from a category the rest of that run already holds twice would make
     a third. Such options come last within their tier (a third only when the
     tier has nothing else). Seen cards never jump the queue to avoid it. */
  const runStart = Math.floor(step / RUN) * RUN;
  const runLevels = state.visibleDeck.slice(runStart, runStart + RUN)
    .flatMap((c, k) => (c && runStart + k !== step ? [c.level] : []));
  const full = c => runLevels.filter(level => level === c.level).length >= RUN_CAP;
  const picked = [];
  tiers.forEach((tier, ti) => {
    if (picked.length >= 2 || !tier.length) return;
    if (noADOpener) {
      const noAD = tier.filter(c => !isAD(c));
      if (noAD.length >= 2) tier = noAD;
    }
    let cand = (ti === 1 || ti === 3) ? shuffle(tier) : orderUnseen(tier, all);
    if (isArc) {
      cand = cand.map((c, i) => ({ c, i, k: Math.abs(levelDepth(c.level) - d) }))
                 .sort((x, y) => x.k - y.k || x.i - y.i).map(x => x.c);
    }
    /* Within the tier, take one card at a time: first one that keeps the
       run of five at two per category and brings a category not yet among the
       options (the planned card's included), then one that only keeps the run
       within the cap, then one that only brings a new category, then the
       first. Freshness still comes first: a later tier is never used while
       this one can supply a card. */
    while (picked.length < 2 && cand.length) {
      const used = new Set([planned.level, ...picked.map(c => c.level)]);
      let at = cand.findIndex(c => !used.has(c.level) && !full(c));   // the cap first, then variety
      if (at < 0) at = cand.findIndex(c => !full(c));
      if (at < 0) at = cand.findIndex(c => !used.has(c.level));
      picked.push(cand.splice(at < 0 ? 0 : at, 1)[0]);
    }
  });
  return shuffle([planned, ...picked]);
}

/* The player picks one of the options for `step`. It takes the step in the
   hand. The ones passed over sit out the next hand (drawable again from the
   hand after) and are not logged as seen. `noConsequence` is Three being
   switched off with the options up: the planned card takes the step and the
   others just go back. */
function choosePick(chosen, options, step, noConsequence) {
  if (step == null) step = state.pickOptions ? state.pickOptions.step : state.currentIndex + 1;
  state.visibleDeck[step] = chosen;
  if (!noConsequence) {
    options.forEach(c => {
      state.handOffered.add(c.question);
      if (c.question !== chosen.question) state.sitOut[c.question] = state.handNo + 2;
    });
  }
  state.currentIndex = step;
  state.reachedIdx = Math.max(state.reachedIdx, step);
  closePicker();
  state.pickOptions = null;
  flipToCard(chosen);
  if (state.partyMode) updatePartyDisplay(chosen);
  addToLog(chosen);
  updateStarUI();
  updateDeckInfo();
  renderProgress();
  updateDrawMore();
}

// Pick toggle

