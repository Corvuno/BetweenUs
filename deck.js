// ── DECK ─────────────────────────────────────────────────────────────────────
// Building, filtering, shuffling and advancing through the deck: from the
// intent dial's weighting and getFilteredCards() through applyRandomMode's
// shuffle modes, initDeck/applyLimit, and the nextCard/prevCard
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
  if (COLBERT_STRICT) cards = cards.filter(c => !COLBERT_OPTIONAL.includes(c.id));
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
  return _withWildcard(_sliceDraw(fullDeck, unseen));
}

/* Wildcards (#76): a hand may carry one wildcard card, an extra card on top of the hand size, so the
   Arc's shape and spread (built before this) stay as they were. Never first, never in the fixed sets
   (they return before this runs), never in these presets, never with the switch off. Rare on purpose:
   about one hand in seven has one (owner, 2026-11-04: "about 1 in 5 to 10 hands, it should be special"). */
const WILDCARD_SHARE = 1 / 7;
const NO_WILDCARD_PRESETS = ['work', 'newpeople'];
const WILDCARD_KEY = 'bu.wildcards';
function _withWildcard(hand) {
  if (!state.wildcards || NO_WILDCARD_PRESETS.includes(state.activePreset)) return hand;
  if (!hand.length || Math.random() >= WILDCARD_SHARE) return hand;
  const card = WILDCARD_CARDS[Math.floor(Math.random() * WILDCARD_CARDS.length)];
  const at = 1 + Math.floor(Math.random() * hand.length);   // 1 … hand.length: after the first card
  return [...hand.slice(0, at), card, ...hand.slice(at)];
}
/* The switch's state outlives the evening, like the screen-rotation flag: a device preference. */
function loadWildcardSwitch() {
  try { state.wildcards = localStorage.getItem(WILDCARD_KEY) !== '0'; } catch { /* storage blocked: on */ }
}
function setWildcardSwitch(on) {
  state.wildcards = on;
  try { localStorage.setItem(WILDCARD_KEY, on ? '1' : '0'); } catch { /* private mode: only this visit remembers */ }
}
loadWildcardSwitch();

/* Mirrors state.cardLimit onto the limit-button row's active class. All is
   Wild-only (owner, 2026-10-30): Arc hides it, since an arc needs a set length. */
function syncLimitButtons() {
  /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.limit-btn')).forEach(b => {
    b.classList.toggle('active', b.dataset.limit === (state.cardLimit === null ? 'all' : String(state.cardLimit)));
    if (b.dataset.limit === 'all') b.hidden = state.randomMode === 'arc';
  });
}

/* Arc has no All: arriving in Arc with All picked (switched over from Wild,
   a saved session, a profile default) lands on 20. Colbert / The 36 played
   alone still run their whole list, and give the old number back after. */
const ARC_ALL_FALLBACK = 20;
function _arcLimit() {
  if (state.randomMode === 'arc' && state.cardLimit === null && !orderedSoloLevel()) state.cardLimit = ARC_ALL_FALLBACK;
  syncLimitButtons();
}

function initDeck(isContinuation) {
  // isContinuation: true only from startNewHand() (Draw more / Next hand),
  // which draws a fresh hand under the SAME settings — the draw animation is
  // reserved for a hand that starts because something actually changed.
  state.skipDrawAnim = !!isContinuation;
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
  _arcLimit();
  _startFreshPassIfSpent();
  const built = buildFullDeck();
  state.fullDeck = built.deck;
  state.drawUnseen = built.unseen;
  state.currentIndex = -1;
  state.visibleDeck = sliceVisibleDeck(state.fullDeck, state.drawUnseen);
  renderProgress();
  if (isContinuation) clearCardFace(); else setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  document.getElementById('c-accent')?.classList.remove('accent-bloom');   // the face itself was cleared above
  renderShell();
}


/* Draw vs session: a draw comes from what this pass hasn't seen.
   "Seen" = the session log from state.seenFrom onward, plus the cards an older
   version skipped this pass (state.skippedSeen, kept for saved evenings and
   files that hold it: seen, but not in the history list). The log
   itself is the visible history and is never wiped; starting a fresh pass
   just moves seenFrom to the end of it and empties skippedSeen. */
function _seenSet(){
  const from = Math.min(Math.max(state.seenFrom || 0, 0), state.sessionLog.length);
  const seen = new Set(state.sessionLog.slice(from).map(c => c.id));
  state.skippedSeen.forEach(id => seen.add(id));
  return seen;
}
function _unseenCount(cards){
  const seen = _seenSet();
  return cards.filter(c => !seen.has(c.id)).length;
}
/* A fresh pass: every card counts as unseen again; the log itself stays. */
function startFreshPass(){
  state.seenFrom = state.sessionLog.length;
  state.skippedSeen.clear();
}
/* Nothing in the selection is unseen any more: a fresh pass begins, every
   card in the selection counts as unseen again. Called when a new hand is
   about to be built (next hand / Draw more / any settings change). */
function _startFreshPassIfSpent(){
  if (orderedSoloLevel()) return;
  const cards = getFilteredCards();
  if (cards.length && _unseenCount(cards) === 0) startFreshPass();
}

/* A new hand is being built (initDeck / applyLimit): the hand counter moves on,
   Three's bookkeeping for the hand starts empty, and any options still on
   screen belong to the hand that just ended. */
function _newHandBookkeeping(){
  retireNote();
  state.handNo++;
  state.reachedIdx = -1;
  state.handOffered.clear();
  Object.keys(state.sitOut).forEach(q => { if (state.sitOut[q] <= state.handNo) delete state.sitOut[q]; });
  if (state.pickerOpen) closePicker();
  state.pickOptions = null;
}
function _sittingOut(c){ return (state.sitOut[c.id] || 0) > state.handNo; }

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

/* Unseen cards first, in draw order (dial-weighted or random); seen cards
   follow so fullDeck still holds the whole selection. */
function _unseenFirst(cards){
  const seen = _seenSet();
  const unseenCards = cards.filter(c => !seen.has(c.id));
  /* cards passed over in a Three pick sit out this hand; if that would leave
     nothing to draw, they are let back in rather than building an empty hand */
  let eligible = unseenCards.filter(c => !_sittingOut(c));
  if (!eligible.length) eligible = unseenCards;
  const eligSet = new Set(eligible);
  const size = state.cardLimit ?? eligible.length;
  const fresh = state.randomMode === 'arc'
    ? _arcRuns(orderUnseen(eligible, cards), size)
    : _spreadRuns(orderUnseen(eligible, cards), size, false);
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

/* Arc (owner, 2026-11-17): every Arc hand, 5, 10 or 20, is one arc on the
   same curve, set in shares of the hand rather than fixed counts, so the
   three sizes always have the same feel. The hand of five is the model: an
   easy climb, a short deep stretch, then a quicker way back down.
     climb  about half the hand: from the lightest selected depth upwards,
            never reaching the deepest
     deep   about three in ten: the deepest selected depth mixed with the
            depths just under it, never two of the deepest side by side
     down   the last fifth: back down, the last card at medium depth
   The split moves by a card either way from hand to hand (5 is 3/1/1 or
   2/2/1), and each place's depth wobbles a little within its stretch, so
   no two hands climb the same steps. Depth is the category's band; the
   depths counted are only the ones the selection has. */
const ARC_DEEP = 0.3;   // share of the hand in the deep stretch
const ARC_DOWN = 0.2;   // share of the hand coming back down
const _jitter = spread => (Math.random() * 2 - 1) * spread;

/* Which depth (as a step among the selected depths, 0 = lightest) each place
   of an `n`-card hand aims for, given `top` = the deepest step. */
function _arcSteps(n, top) {
  if (n < 3 || top < 1) return Array.from({ length: n }, (_, i) => Math.round(top * i / Math.max(1, n - 1)));
  const wobble = 0.5 + n * 0.03;
  let deep = Math.max(1, Math.round(n * ARC_DEEP + _jitter(wobble)));
  let down = Math.max(1, Math.round(n * ARC_DOWN + _jitter(wobble * 0.6)));
  while (n - deep - down < 2 && deep + down > 2) { if (deep >= down && deep > 1) deep--; else down--; }
  const climb = n - deep - down;
  const medium = Math.floor(top / 2);
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, Math.round(x)));
  /* climb: lightest first, then rising towards the step under the deepest */
  const climbTop = Math.max(0, top - 1);
  const up = [0, ...Array.from({ length: climb - 1 }, (_, i) =>
    clamp(climbTop * (i + 1) / climb + _jitter(0.6), 0, climbTop))].sort((a, b) => a - b);
  /* deep stretch: one or more of the deepest, larded with the steps under it */
  const tops = Math.max(1, Math.min(Math.ceil(deep / 2), Math.round(deep * 0.45 + _jitter(0.5))));
  const under = Array.from({ length: deep - tops }, () => clamp(top - 1 - (Math.random() < 0.35 ? 1 : 0), 0, top));
  const peak = [];
  let topFirst = Math.random() < 0.5 || tops > under.length;
  let t = tops, u = 0;
  while (peak.length < deep) {
    const wantTop = t > 0 && (topFirst || u >= under.length) && peak[peak.length - 1] !== top;
    if (wantTop || u >= under.length) { peak.push(top); t--; } else peak.push(under[u++]);
    topFirst = !topFirst;
  }
  /* way down: from just under the deep stretch to medium, last card medium */
  const fall = Array.from({ length: down }, (_, j) => j === down - 1 ? medium
    : clamp((top - 1) - (top - 1 - medium) * (j + 1) / down + _jitter(0.5), medium, top - 1)).sort((a, b) => b - a);
  return [...up, ...peak, ...fall];
}

/* The Arc hand, already in playing order, followed by the unseen cards it
   didn't take (in draw order). Each place takes, at its depth (or the nearest
   depth that still has cards), the earliest card in draw order that is not
   the category of the card before it and keeps its run of five at two per
   category, the least used category in the hand first. After Dark never
   opens the hand while the opening depth has anything else, and is the
   second card only one hand in twenty: an After Dark opener reads as a
   different game than the one the table sat down for. When After Dark is all
   there is, or is the lightest thing selected, it opens. */
function _arcRuns(ordered, handSize) {
  const n = Math.min(handSize, ordered.length);
  const bands = [...new Set(ordered.map(c => levelDepth(c.level)))].sort((a, b) => a - b);
  const steps = _arcSteps(n, bands.length - 1);
  const isAD = c => SPICY_LEVELS.includes(c.level);
  const keepSecond = Math.random() < 0.05;
  const rest = [...ordered];
  const used = new Map();
  const hand = [];
  steps.forEach((step, i) => {
    const runStart = Math.floor(i / RUN) * RUN;
    const inRun = level => hand.slice(runStart).filter(c => c.level === level).length;
    const prev = hand[i - 1]?.level;
    /* nearest depth first; on the climb a lighter one before a deeper, on the rest the reverse */
    const order = bands.map((b, k) => k)
      .filter(k => rest.some(c => levelDepth(c.level) === bands[k]))
      .sort((x, y) => Math.abs(x - step) - Math.abs(y - step) || (i < n / 2 ? x - y : y - x));
    const atDepth = k => {
      let at = rest.filter(c => levelDepth(c.level) === bands[k]);
      if (i === 0 || (i === 1 && !keepSecond)) {
        const calm = at.filter(c => !isAD(c));
        if (calm.length) at = calm;
      }
      return at;
    };
    /* Arc is the base (owner, 2026-10-30): the depth holds; a repeat or a
       third in the run only when that depth has nothing else */
    const at = atDepth(order[0]);
    const tiers = [c => c.level !== prev && inRun(c.level) < RUN_CAP, c => c.level !== prev, () => true];
    let card;
    for (const ok of tiers) {
      const fit = at.filter(ok);
      if (fit.length) { card = fit.reduce((best, c) => ((used.get(c.level) ?? 0) < (used.get(best.level) ?? 0) ? c : best)); break; }
    }
    rest.splice(rest.indexOf(card), 1);
    used.set(card.level, (used.get(card.level) ?? 0) + 1);
    hand.push(card);
  });
  return [...hand, ...rest];
}

/* An Arc hand arrives in playing order from _arcRuns. */
function _arcHand(hand){
  return hand;
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
// Test/demo link: ?Q=214,friendship-7,the36-5 (or ?q=, any case) renders exactly those cards, in that order,
// as the whole hand — instead of the normal random draw — so a specific card can be pulled up or shown to
// someone without clicking through category selection. Each comma-separated token is one of:
//   - a question number (214): stable, it stays with the card when its wording is improved;
//   - a slot (friendship7 or friendship-7, usfriends4, the36-5): the category's display name and the card's
//     place in it as the deck is laid out today (cardSlot, categories.js), so it moves if cards are added or
//     removed ahead of it in that category;
//   - an older code-key form (date3, friends7, kinks2): the category's key and its place, same caveat.
// A token that doesn't resolve is skipped rather than breaking the whole link. Sets state.queryDeckActive
// so autoSaveSession() (session.js) leaves the real saved session alone.
function cardForQueryToken(token) {
  const t = token.trim().toLowerCase();
  if (/^\d+$/.test(t)) return CARDS_BY_ID.get(+t) ?? null;
  const bySlot = CARDS_BY_SLOT.get(t.replace('-', ''));
  if (bySlot) return bySlot;
  const m = t.match(/^([a-z]+)(\d+)$/);
  return m ? (ALL_CARDS.filter(c => c.level === m[1])[+m[2] - 1] ?? null) : null;
}
function applyQueryDeck() {
  const params = new URLSearchParams(location.search);
  const raw = params.get('Q') ?? params.get('q');
  if (!raw) return false;
  const cards = raw.split(',').map(cardForQueryToken).filter(Boolean);
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
  startNewHand();
  updateDeckInfo();
  updateDrawMore();
  renderProgress();
}



// ── CARD DISPLAY ──────────────────────────────────────────────────────────────
// Shared by every "we've reached the end of this hand" case (out of fresh
// cards, ...): swap the card face for an end message on the same
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

/* The message after the last card of a hand (in the card, and in fullscreen): it stays up long enough
   to read, then the card closes into Intermezzo (styles.css "The card closes"): the message fades,
   the back's lattice and frame draw in over it, and showHandSummary() takes over once the back is up.
   Timers are kept so a new card or hand shown in the meantime (next hand, Back, a settings
   change) cancels the pending closing — hideHandSummary() calls clearEndTimers(). */
const END_MSG_READ_MS = { 1: 1100, 2: 1900 };   // from the start of the swap to the start of the closing
const TURN_MID_MS = 420, TURN_END_MS = 870;     // the sideways turn (Intermezzo and the list): 0.84s, edge-on at 420ms (matches styles.css cardTurn)
const CLOSE_HANDOVER_MS = 700;                  // the back is opaque and the message gone; the face is painted
const CLOSE_END_MS = 3600;                      // the mark is drawn: the closing is over (styles.css: lead .85s + the mark's 2.7s)
let _endTimers = [];
let _endMsgLines = 1;
// Drops the pending closing and everything it put on the card, so a card shown meanwhile is clean.
function clearEndTimers() {
  _endTimers.forEach(clearTimeout); _endTimers = [];
  document.getElementById('card')?.classList.remove('mv-build', 'mv-keep', 'mv-live');
  document.getElementById('card-question')?.classList.remove('mv-fade');
}
function endMessageToIntermezzo() {
  clearEndTimers();
  const wait = END_MSG_READ_MS[_endMsgLines] ?? END_MSG_READ_MS[1];
  _endTimers.push(setTimeout(() => {
    const card = document.getElementById('card');
    const question = document.getElementById('card-question');
    // mv-live: the closing is still drawing (settleClosing only acts then)
    card?.classList.add('mv-build', 'mv-keep', 'mv-live', 'is-start', 'is-intermezzo');   // the back comes up over the message
    question?.classList.add('mv-fade');
    document.querySelector('#party-question .end-msg')?.classList.add('out');
    _endTimers.push(setTimeout(() => {
      card?.classList.remove('mv-keep');
      question?.classList.remove('mv-fade');
      showHandSummary({ closing: true });
    }, CLOSE_HANDOVER_MS));
    _endTimers.push(setTimeout(() => card?.classList.remove('mv-live'), CLOSE_END_MS));
  }, wait));
}

// The last card is behind: the end-of-hand message, on the card and in Spotlight.
function showEndMessage() {
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
  setPauseColour();   // this hand's last card colour, before the message and the button show it (presentation.js)
  const html = `<span class="end-msg">${lines.map((l,i) => `<span style="display:block${i?';margin-top:1.4em':''}">${l}</span>`).join('')}</span>`;
  renderEndMessage(html);
  // fullscreen: the same message, centred in the fullscreen card
  const pq = document.getElementById('party-question');
  const pl = document.getElementById('party-level');
  if (pl) { pl.textContent = ''; pl.style.color = ''; }
  if (pq) { pq.innerHTML = html; pq.classList.add('is-end-msg'); }
}

function _nextCardBase() {
  if (!state.visibleDeck.length) return;
  if (state.currentIndex < state.visibleDeck.length - 1) {
    // The draw animation marks a new hand actually starting from a settings
    // change — not "Draw more"/next hand, which extends play with the
    // same settings and should feel like a plain next card, not a re-draw.
    // initDeck(isContinuation) sets skipDrawAnim accordingly on every reset.
    const isFirstDraw = state.currentIndex === -1 && !state.skipDrawAnim;
    state.currentIndex++;
    state.reachedIdx = Math.max(state.reachedIdx, state.currentIndex);
    flipToCard(state.visibleDeck[state.currentIndex], isFirstDraw);
    addToLog(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    if (state.currentIndex === state.visibleDeck.length - 1) updateDrawMore();
  } else {
    showEndMessage();
  }
}
// nextCard is defined below (APP SHELL section) — it wraps _nextCardBase with
// the double-press guard and post-advance hooks (party/session summary).

function prevCard() {
  if (dismissBroughtBack()) return;   // Back from a card brought back from Played or Favourites: the hand's own view
  /* Three options on screen: Back leaves them (no pick, nothing sits out) and
     is the card behind them again — the card of the step before. */
  if (state.pickerOpen && state.currentIndex < 0) return;   // first card of a hand: no card behind the options, they stay
  if (state.pickerOpen) { closePicker(); state.pickOptions = null; updateDrawMore(); return; }
  /* The hand's list is up: Back turns the card over to Intermezzo (nothing else). */
  if (state.handSide === 'list') { showHandIntermezzo(); return; }
  if (state.currentIndex > 0) {
    state.currentIndex--;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
  }
}

// ═══════════════════════════════════════════════════════════
// nextCard — advances the deck and runs post-advance hooks (party/session summary)
// ═══════════════════════════════════════════════════════════
// Pure: given the current state, decide what a "next" press should do. No
// DOM reads, no DOM writes, no side effects — so this decision can be
// reasoned about (or tested) on its own, separately from executing it.
function decideNextCardAction() {
  if (state.visibleDeck.length === 0) return { type: 'advance', wasAtEnd: false };  // _nextCardBase() no-ops safely on an empty deck

  // Already past end (sentinel): the press is "Next hand".
  if (state.currentIndex >= state.visibleDeck.length) return { type: 'reshuffle' };

  if (state.pickerOpen) return { type: 'repick' };  // Three others (works in fullscreen too)
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

/* One step of a hand drawn the Three way: the options when the selection can
   supply two besides the planned card, otherwise just the planned card. */
function drawStep(step) {
  const options = buildPickOptions(step);
  if (options.length < 2) _nextCardBase();
  else openPicker(options, step);
}

/* Same settings, next hand (next hand and Draw more), drawn straight
   into its first card — no draw animation, no blank card. With Three on that
   first card is offered as three like every other step. */
function startNewHand() {
  initDeck(true);
  drawFirstCard();
}

/* The first card of a freshly built hand: three options with Three on, else the card itself */
function drawFirstCard() {
  if (pickMode) drawStep(0);
  else _nextCardBase();
}

/* Three others: the options on screen are passed over like the unchosen ones of a pick (offered this hand, they
   sit out the next) and three other cards take their place at the same step. When the selection can't supply
   two other cards the options stay. */
function offerOtherThree() {
  const { step, options } = state.pickOptions;
  const others = buildPickOptions(step, options);
  if (others.length < 2) return;
  options.forEach(c => { state.handOffered.add(c.id); state.sitOut[c.id] = state.handNo + 2; });
  state.visibleDeck[step] = others[0];
  openPicker(others, step);
}

/* The main action (button, card tap, Spotlight's next, ArrowRight, swipe left) ignores a second press for a
   moment: after a draw, so a double tap draws one card, and while the pause after the last card arrives, so
   "Next hand" is never hit by the tail of a double tap. The one guard, in the one entry. */
const NEXT_GUARD_MS = { draw: 500, pause: 1000 };
let _nextLockedUntil = 0;

function nextCard() {
  if (performance.now() < _nextLockedUntil) return;
  dismissBroughtBack();   // Draw carries on the hand where it was
  const action = decideNextCardAction();
  _nextLockedUntil = performance.now() + (action.type === 'advance' && action.wasAtEnd ? NEXT_GUARD_MS.pause : NEXT_GUARD_MS.draw);
  switch (action.type) {
    case 'reshuffle':
      startNewHand();
      return;
    case 'repick':
      offerOtherThree();
      return;
    case 'pick3':
      drawStep(action.step);
      return;
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
function buildPickOptions(step, replacing = null) {
  const planned = state.visibleDeck[step];
  if (!planned) return [];
  const inHand = new Set(state.visibleDeck.map(c => c.id));
  const seen = _seenSet();
  const all = getFilteredCards();
  const shown = new Set((replacing ?? []).map(c => c.id));   // Three others: the options on screen are not offered again
  const others = all.filter(c => !inHand.has(c.id) && !state.handOffered.has(c.id) && !shown.has(c.id));
  const kept = replacing ? [] : [planned];   // Three others offers three new cards, the planned one included in the old ones
  const need = 3 - kept.length;
  const isArc = state.randomMode === 'arc';
  const isAD = c => SPICY_LEVELS.includes(c.level);
  const noADOpener = isArc && !isAD(planned) && step <= 1 && !(step === 1 && Math.random() < 0.05);
  const d = isArc ? levelDepth(planned.level) : 0;
  /* Tiers, in order: unseen cards, then cards already seen this pass, then the
     sit-outs from last hand (unseen first). Later tiers only top up what the
     earlier ones couldn't supply, so Three keeps working late in a pass. */
  const tiers = [
    others.filter(c => !seen.has(c.id) && !_sittingOut(c)),
    others.filter(c => seen.has(c.id) && !_sittingOut(c)),
    others.filter(c => !seen.has(c.id) && _sittingOut(c)),
    others.filter(c => seen.has(c.id) && _sittingOut(c)),
  ];
  /* Category spread: a pick takes this step's place in its run of five, so an
     option from a category the rest of that run already holds twice would make
     a third. Such options come last within their tier (a third only when the
     tier has nothing else). Seen cards never jump the queue to avoid it. */
  const runStart = Math.floor(step / RUN) * RUN;
  const runLevels = state.visibleDeck.slice(runStart, runStart + RUN)
    .flatMap((c, k) => (c && runStart + k !== step ? [c.level] : []));
  /* Arc: also no option of the same category as the cards either side */
  const sides = isArc
    ? [state.visibleDeck[step - 1], state.visibleDeck[step + 1]].flatMap(c => (c ? [c.level] : []))
    : [];
  const full = c => runLevels.filter(level => level === c.level).length >= RUN_CAP || sides.includes(c.level);
  const picked = [];
  if (isArc) {
    /* Arc is the base (owner, 2026-10-30): the options sit at the planned
       card's depth, or the nearest depth there is, before anything else.
       Within that depth: unseen before seen, then the variety preferences. */
    const pool = tiers.flatMap((tier, ti) => {
      if (noADOpener) {
        const noAD = tier.filter(c => !isAD(c));
        if (noAD.length >= 2) tier = noAD;
      }
      const cand = (ti === 1 || ti === 3) ? shuffle(tier) : orderUnseen(tier, all);
      return cand.map((c, i) => ({ c, ti, i, k: Math.abs(levelDepth(c.level) - d) }));
    }).sort((x, y) => x.k - y.k || x.ti - y.ti || x.i - y.i);
    while (picked.length < need && pool.length) {
      const group = pool.filter(x => x.k === pool[0].k && x.ti === pool[0].ti).map(x => x.c);
      const used = new Set([...kept, ...picked].map(c => c.level));
      const card = group.find(c => !used.has(c.level) && !full(c)) ?? group.find(c => !full(c))
        ?? group.find(c => !used.has(c.level)) ?? group[0];
      picked.push(card);
      pool.splice(pool.findIndex(x => x.c === card), 1);
    }
    return shuffle([...kept, ...picked]);
  }
  tiers.forEach((tier, ti) => {
    if (picked.length >= need || !tier.length) return;
    if (noADOpener) {
      const noAD = tier.filter(c => !isAD(c));
      if (noAD.length >= 2) tier = noAD;
    }
    const cand = (ti === 1 || ti === 3) ? shuffle(tier) : orderUnseen(tier, all);
    /* Within the tier, take one card at a time: first one that keeps the
       run of five at two per category and brings a category not yet among the
       options (the planned card's included), then one that only keeps the run
       within the cap, then one that only brings a new category, then the
       first. Freshness still comes first: a later tier is never used while
       this one can supply a card. */
    while (picked.length < need && cand.length) {
      const used = new Set([...kept, ...picked].map(c => c.level));
      let at = cand.findIndex(c => !used.has(c.level) && !full(c));   // the cap first, then variety
      if (at < 0) at = cand.findIndex(c => !full(c));
      if (at < 0) at = cand.findIndex(c => !used.has(c.level));
      picked.push(cand.splice(at < 0 ? 0 : at, 1)[0]);
    }
  });
  return shuffle([...kept, ...picked]);
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
      state.handOffered.add(c.id);
      if (c.id !== chosen.id) state.sitOut[c.id] = state.handNo + 2;
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

