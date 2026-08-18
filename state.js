// ── STATE ────────────────────────────────────────────────────────────────────
// The app's mutable, cross-cutting variables: the `state` object plus the few
// loose globals read/written from more than one other file (the intent-dial
// trio, saveMode, shuffleModeIdx, the skip-undo bookkeeping). Feature-local
// mutable variables (currentTwist, pickMode, lastMoodWord, …) stay declared
// next to the feature that owns them, in that feature's own file.

let intentIntensity = 0.5;   /* dial position, 0 … 1  */
let intentFocus     = 0;     /* dial position, -1 … 1 */
let intentOn        = false; /* Explore hands the deck back untouched */


// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  activeToggles: new Set(),
  activePreset: '',       // tracks current preset so we avoid DOM queries
  pickerOpen: false,      // tracks the pick-3 picker so nextCard() avoids a DOM query
  safeMode: false,
  spiceMode: false,
  randomMode: window.DEFAULT_SHUFFLE || 'wild',
  lang: NL_DEFAULT ? 'nl' : (window.DEFAULT_LANGUAGE || 'en'),
  cardLimit: (window.DEFAULT_LIMIT === 0 ? null : (window.DEFAULT_LIMIT || 5)),
  fullDeck: [],
  visibleDeck: [],
  drawUnseen: undefined,  // how many of fullDeck this session hasn't shown yet; set by buildFullDeck()
  currentIndex: -1,
  skippedCards: new Set(),
  partyMode: false,
  sessionLog: [],
  loggedQuestions: new Set(),   // per-round guard against duplicate log entries
  colbertPrevLimit: null,       // limit to restore after Colbert-solo play
  favourites: [],
  customCards: [],
  categoriesCollapsed: DEFAULT_COLLAPSED,
};

let shuffleModeIdx = SHUFFLE_MODES.indexOf(state.randomMode);

let saveMode = '';

let _undoCard = null, _undoIndex = null, _undoTimer = null;

