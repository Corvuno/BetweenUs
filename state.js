// ── STATE ────────────────────────────────────────────────────────────────────
// The app's mutable, cross-cutting variables: the `state` object plus the few
// loose globals read/written from more than one other file (the intent-dial
// trio, shuffleModeIdx, the skip-undo bookkeeping). Feature-local
// mutable variables (currentTwist, pickMode, lastMoodWord, …) stay declared
// next to the feature that owns them, in that feature's own file.

let intentIntensity = 0.5;   /* dial position, 0 … 1  */
let intentFocus     = 0;     /* dial position, -1 … 1 */
let intentOn        = false; /* Explore hands the deck back untouched */


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
  fullDeck: [],
  visibleDeck: [],
  drawUnseen: undefined,  // how many of fullDeck this session hasn't shown yet; set by buildFullDeck()
  currentIndex: -1,
  skippedCards: new Set(),
  partyMode: false,
  sessionLog: [],
  seenFrom: 0,                  // index into sessionLog: cards logged from here on count as "seen" this pass (a fresh pass moves it to the end; the log itself is never wiped)
  loggedQuestions: new Set(),   // per-round guard against duplicate log entries
  skippedSeen: new Set(),       // questions skipped this pass: they count as seen (_seenSet) without being in the history list; cleared when a fresh pass starts (seenFrom moves)
  handNo: 0,                    // counts the hands built this session (initDeck/applyLimit); the clock for sitOut
  sitOut: {},                   // question -> first handNo it may be drawn again: the cards passed over in a Three pick sit out the next hand
  reachedIdx: -1,               // furthest index of this hand that has been shown (Three only offers options on steps not reached yet)
  handOffered: new Set(),       // questions already offered as Three options in this hand (never offered twice)
  pickOptions: null,            // {step, options, planned} while the Three options are on screen
  colbertPrevLimit: null,       // limit to restore after Colbert-solo play
  favourites: [],
  handStarred: new Set(),   // questions actually starred during THIS hand, via the star
                            // button — cleared by initDeck(). A card that was already a
                            // favourite from an earlier session doesn't count as "starred"
                            // for this hand's end-of-set summary unless the star was
                            // actually tapped this time.
  customCards: [],
  categoriesCollapsed: DEFAULT_COLLAPSED,
  skipDrawAnim: false,   // set by initDeck(isContinuation) — true while drawing a fresh
                          // hand under unchanged settings (Draw more, hold-to-continue),
                          // so only a hand that starts from an actual settings change
                          // gets the "thrown onto the table" animation
  queryDeckActive: false, // set by applyQueryDeck() (?Q=Work1,Life7,...) — a hand pinned
                           // to specific cards by URL, for testing/demoing. Blocks
                           // autoSaveSession() so opening a test link never overwrites a
                           // real in-progress saved session.
};

let shuffleModeIdx = SHUFFLE_MODES.indexOf(state.randomMode);

let _undoCard = null, _undoIndex = null, _undoTimer = null, _undoLog = null, _undoReachedShift = false;



// ── HINTS ─────────────────────────────────────────────────────────────────────
// One shared store for every "teaching" hint. A hint retires for good (per
// device) once its control has actually worked, and "Show hints again" in the
// menu brings them all back. A future hint joins by adding one line here: its
// storage key, the body class that hides it, and (optionally) its element id
// for any inline fade. Nothing else needs to know about it.
const HINTS = {
  tok:       { key: 'bu.tokTaught',       cls: 'tok-taught' },          // "· tap to change"
  three:     { key: 'bu.hintThreeTaught', cls: 'hint-three-taught' },   // under Three
  spotlight: { key: 'bu.hintSpotTaught',  cls: 'hint-spot-taught' },    // under Spotlight
  twist:     { key: 'bu.hintTwistTaught', cls: 'hint-twist-taught' }    // under Twist
};
function hintIsTaught(id) {
  try { return !!localStorage.getItem(HINTS[id].key); } catch (e) { return document.body.classList.contains(HINTS[id].cls); }
}
function hintsApply() {
  Object.keys(HINTS).forEach(id => document.body.classList.toggle(HINTS[id].cls, hintIsTaught(id)));
}
// The control has worked: the hint goes and stays gone.
function hintRetire(id) {
  if (!HINTS[id]) return;
  try { localStorage.setItem(HINTS[id].key, '1'); } catch (e) {}
  document.body.classList.add(HINTS[id].cls);
}
// Every hint back, whoever's new.
function hintsReset() {
  Object.keys(HINTS).forEach(id => {
    try { localStorage.removeItem(HINTS[id].key); } catch (e) {}
    document.body.classList.remove(HINTS[id].cls);
  });
  const t = document.getElementById('tokHint'); if (t) t.style.opacity = '';
}
hintsApply();
