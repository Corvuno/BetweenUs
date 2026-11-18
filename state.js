// ── STATE ────────────────────────────────────────────────────────────────────
// The app's mutable, cross-cutting variables: the `state` object plus the few
// loose globals read/written from more than one other file (the You–Us
// lean, shuffleModeIdx). Feature-local
// mutable variables (currentTwist, pickMode, lastMoodWord, …) stay declared
// next to the feature that owns them, in that feature's own file.

let intentFocus = 0;   /* the You–Us lean, -1 (about you) … 1 (about the two of you); 0 = no lean (deck.js) */


// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  activeToggles: new Set(),
  activePreset: '',       // tracks current preset so we avoid DOM queries
  activeSessionId: '',    // id of the stored session (bu-sessions) currently bound
                          // as "live" — autoSaveSession() mirrors into it on every
                          // card if set; '' means only the ephemeral bu-session slot
                          // is being written to.
  pickerOpen: false,      // tracks the pick-3 picker so nextCard() avoids a DOM query
  safeMode: false,
  spiceMode: false,
  randomMode: window.DEFAULT_SHUFFLE || 'wild',
  cardLimit: (window.DEFAULT_LIMIT === 0 ? null : (window.DEFAULT_LIMIT || 5)),
  wildcards: true,        // the Wildcards switch in The Deck (deck.js reads and remembers it)
  fullDeck: [],
  visibleDeck: [],
  drawUnseen: undefined,  // how many of fullDeck this session hasn't shown yet; set by buildFullDeck()
  currentIndex: -1,
  handSide: null,         // end of a hand: 'intermezzo' (card back + pause mark) or 'list' (the hand's questions); null otherwise (presentation.js)
  partyMode: false,
  sessionLog: [],               // {id, level, question} per card drawn
  seenFrom: 0,                  // index into sessionLog: cards logged from here on count as "seen" this pass (a fresh pass moves it to the end; the log itself is never wiped)
  loggedQuestions: new Set(),   // question numbers; per-round guard against duplicate log entries
  skippedSeen: new Set(),       // question numbers an older version skipped this pass, still read from saved evenings and files: they count as seen (_seenSet) without being in the history list; cleared when a fresh pass starts (seenFrom moves)
  handNo: 0,                    // counts the hands built this session (initDeck/applyLimit); the clock for sitOut
  sitOut: {},                   // question number -> first handNo it may be drawn again: the cards passed over in a Three pick sit out the next hand
  reachedIdx: -1,               // furthest index of this hand that has been shown (Three only offers options on steps not reached yet)
  handOffered: new Set(),       // question numbers already offered as Three options in this hand (never offered twice)
  pickOptions: null,            // {step, options, planned} while the Three options are on screen
  colbertPrevLimit: null,       // limit to restore after Colbert-solo play
  favourites: [],
  handStarred: new Set(),   // question numbers actually starred during THIS hand, via the star
                            // button — cleared by initDeck(). A card that was already a
                            // favourite from an earlier session doesn't count as "starred"
                            // for this hand's end-of-set summary unless the star was
                            // actually tapped this time.
  categoriesCollapsed: DEFAULT_COLLAPSED,
  skipDrawAnim: false,   // set by initDeck(isContinuation) — true while drawing a fresh
                          // hand under unchanged settings (Draw more, Next hand),
                          // so only a hand that starts from an actual settings change
                          // gets the "thrown onto the table" animation
  queryDeckActive: false, // set by applyQueryDeck() (?Q=214,friendship-7,...) — a hand pinned
                           // to specific cards by URL, for testing/demoing. Blocks
                           // autoSaveSession() so opening a test link never overwrites a
                           // real in-progress saved session.
};

let shuffleModeIdx = SHUFFLE_MODES.indexOf(state.randomMode);



// ── HINTS ─────────────────────────────────────────────────────────────────────
// One shared store for every "teaching" hint. A hint retires for good (per
// device) once its control has actually worked, and "Show hints again" in the
// menu brings them all back. A future hint joins by adding one line here: its
// storage key, the body class that hides it, and (optionally) its element id
// for any inline fade. Nothing else needs to know about it. `settles: true` marks
// the hints in The Deck's plate, whose going folds the box: they wait until no
// finger or button is down, and a mouse has left that setting's row, then fold.
const HINTS = {
  tok:       { key: 'bu.tokTaught',       cls: 'tok-taught' },          // "· tap to change"
  spotlight: { key: 'bu.hintSpotTaught',  cls: 'hint-spot-taught' },    // under Spotlight
  save:      { key: 'bu.hintSaveTaught',  cls: 'hint-save-taught' },     // under Save (Spotlight's place at the end of a hand)
  lines:     { key: 'bu.hintLinesTaught', cls: 'hint-lines-taught' },    // "Hold a category…" under each chapter opened (phone)
  ways:      { key: 'bu.hintWaysTaught',  cls: 'hint-ways-taught' },     // under Ways to play (menu)
  waysWord:  { key: 'bu.hintWaysWordTaught', cls: 'hint-ways-word-taught' },  // under Ways to play (Spotlight's place before the first card)
  shuffle:   { key: 'bu.hintShuffleTaught', cls: 'hint-shuffle-taught', settles: true }, // under Shuffle in The Deck
  cards:     { key: 'bu.hintCardsTaught',   cls: 'hint-cards-taught',   settles: true }, // under Cards in The Deck
  three:     { key: 'bu.hintThreeTaught',   cls: 'hint-three-taught',   settles: true }, // under Three in The Deck
  lean:      { key: 'bu.hintLeanTaught',    cls: 'hint-lean-taught',    settles: true }  // under About (the You–Us lean) in The Deck
};
function hintIsTaught(id) {
  try { return !!localStorage.getItem(HINTS[id].key); }
  catch (error) {
    console.warn(`Could not read hint "${id}" from storage:`, error);
    return document.body.classList.contains(HINTS[id].cls);   // storage unavailable: this visit's state is all we have
  }
}
function hintsApply() {
  Object.keys(HINTS).forEach(id => document.body.classList.toggle(HINTS[id].cls, hintIsTaught(id)));
}
/* Hands on the screen: the pointers now down. A plate hint that has been
   retired waits (hintsWaiting) while any is down, so the box never folds
   under a finger still on a control; a short pause after the last one lifts,
   and for a mouse until it has left that setting's row, it folds. */
const pointersDown = new Set();
const hintsWaiting = new Set();
let hintSettleTimer = 0;
function hintsSettle() {
  clearTimeout(hintSettleTimer);
  if (pointersDown.size || !hintsWaiting.size) return;
  hintSettleTimer = setTimeout(() => {
    if (pointersDown.size) return;
    [...hintsWaiting].forEach(id => {
      const row = document.querySelector(`.seg-hint[data-hint="${id}"]`)?.closest('.seg');
      if (row && hintMouseOver(row)) { row.addEventListener('mouseleave', hintsSettle, { once: true }); return; }
      hintsWaiting.delete(id);
      document.body.classList.add(HINTS[id].cls);
    });
  }, 250);
}
let lastMouse = /** @type {{x:number,y:number}|null} */ (null);
function hintMouseOver(row) {
  if (!lastMouse) return false;
  const r = row.getBoundingClientRect();
  return lastMouse.x >= r.left && lastMouse.x <= r.right && lastMouse.y >= r.top && lastMouse.y <= r.bottom;
}
document.addEventListener('pointerdown', e => { pointersDown.add(e.pointerId); clearTimeout(hintSettleTimer); }, true);
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, e => { pointersDown.delete(/** @type {PointerEvent} */ (e).pointerId); hintsSettle(); }, true));
document.addEventListener('pointermove', e => { lastMouse = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null; }, { capture: true, passive: true });
window.addEventListener('blur', () => { pointersDown.clear(); hintsSettle(); });
// The control has worked: the hint goes and stays gone.
function hintRetire(id) {
  if (!HINTS[id]) return;
  try { localStorage.setItem(HINTS[id].key, '1'); }
  catch (error) { console.warn(`Could not save hint "${id}":`, error); }
  if (HINTS[id].settles && !document.body.classList.contains(HINTS[id].cls)) { hintsWaiting.add(id); hintsSettle(); return; }
  document.body.classList.add(HINTS[id].cls);
}
// Every hint back, whoever's new.
function hintsReset() {
  hintsWaiting.clear();
  Object.keys(HINTS).forEach(id => {
    try { localStorage.removeItem(HINTS[id].key); }
    catch (error) { console.warn(`Could not reset hint "${id}":`, error); }
    document.body.classList.remove(HINTS[id].cls);
  });
  const t = document.getElementById('tokHint'); if (t) t.style.opacity = '';
}
hintsApply();
