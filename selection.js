// ── SELECTION ────────────────────────────────────────────────────────────────
// Category/preset selection: applyToggleUI/applyPreset, the category-count
// display, and the listeners for the preset row and category grid — the event
// wiring that's directly part of this domain. (Cross-cutting wiring and the
// app's boot sequence live in ui.js.)

function applyToggleUI() {
  const preset = PRESETS[state.activePreset];
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    const on  = state.activeToggles.has(lvl);
    btn.classList.toggle('on', on);
    /* "you could also go here" — in this room, not yet chosen */
    const suggested = !!preset && !on && !btn.classList.contains('hard-locked')
                      && preset.available.includes(lvl);
    btn.classList.toggle('suggested', suggested);
  });
  // category colors
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const isOn = btn.classList.contains('on');
    btn.style.color = isOn ? levelColor(lvl) : '';
  });
  if (typeof syncIntentUI === 'function') syncIntentUI();
}


// Colbert/The 36 are a fixed, ordered sequence — Twist (a random lens on
// whatever card is showing), Full Screen's party/pick-3 flow, and Draw
// Three (discard two of a random trio) all assume a hand you're mixing
// or drawing from at random, which an ordered sequence never is.
const FIXED_SEQ_PRESETS = ['colbertmode', 'aronmode'];

// The categories a preset turns on, given the current After Dark state.
// After Dark is opt-in: adult categories stay reachable but are never
// pre-activated unless this build ships with spice on (editor), which keeps
// them on in every mode that reaches them (OPT_IN_ONLY ones excepted).
function presetSelection(preset) {
  const on = new Set(preset.on.filter(l => DECK_LEVELS.has(l)));
  if (state.safeMode || !window.SPICE_MODE) SAFE_BLOCKED_LEVELS.forEach(l => on.delete(l));
  if (window.SPICE_MODE && !state.safeMode && !MASTER_SAFE && !WORKPLACE_MODE) {
    SAFE_BLOCKED_LEVELS
      .filter(l => !OPT_IN_ONLY.includes(l) && DECK_LEVELS.has(l) && (preset.on.includes(l) || preset.available.includes(l)))
      .forEach(l => on.add(l));
  }
  return on;
}

// The last preset applied. Going Custom keeps it, so undoing the edits can
// bring the preset back; it is not saved with sessions.
let _lastPreset = '';
const CUSTOM_SUBTITLE = 'Off script.';
// A preset's own line under the logo; no preset means a Custom deck.
const showSubtitle = preset => {
  const sub = document.getElementById('subtitle');
  if (sub) sub.textContent = preset?.subtitle ?? CUSTOM_SUBTITLE;
};

// The deck carries a preset's name only while the selection is exactly that
// preset's set (the active one, or the last applied after going Custom);
// any other selection is "Custom" (activePreset ''). After Dark categories
// don't count, except the ones a preset lists in `customisedBy`: opening
// After Dark is a safety switch, not a customisation. Fixed Sets are ordered
// lists with no editable selection, so they keep their own behaviour.
function syncActivePreset() {
  if (FIXED_SEQ_PRESETS.includes(state.activePreset)) return;
  const preset = FIXED_SEQ_PRESETS.includes(_lastPreset) ? undefined : PRESETS[_lastPreset];
  const counts = l => !SAFE_BLOCKED_LEVELS.includes(l) || !!preset?.customisedBy?.includes(l);
  const set = preset && [...presetSelection(preset)].filter(counts);
  const current = [...state.activeToggles].filter(counts);
  const matches = !!set && set.length === current.length && set.every(l => state.activeToggles.has(l));
  state.activePreset = matches ? _lastPreset : '';
  showSubtitle(matches ? preset : null);
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === state.activePreset));
}

// Which category buttons the sheet shows and which are locked behind After
// Dark. A preset limits the sheet to its own on + available categories; the
// limits belong to the last preset applied (_lastPreset), so going Custom
// keeps them and only tapping another preset changes them.
function syncCategoryButtons() {
  const limits = PRESETS[_lastPreset];
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const lockedOut = (MASTER_SAFE || WORKPLACE_MODE) && SAFE_BLOCKED_LEVELS.includes(lvl);
    const outsideLimits = !!limits && !limits.on.includes(lvl) && !limits.available.includes(lvl);
    const hidden = lockedOut || outsideLimits || !DECK_LEVELS.has(lvl) || (lvl === 'backup' && !window.SHOW_BACKUP);
    btn.style.display = hidden ? 'none' : '';
    btn.classList.toggle('hard-locked', !hidden && state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl));
  });
  if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
}

let _prevSafeModeHS = null;   // remembers your After Dark state across hard-safe modes

// The After Dark categories the player has switched on, kept across preset
// changes. Only categories the outgoing preset could show are updated from the
// selection; the ones it hid keep their remembered value, so they come back
// when a preset that offers them returns.
const _afterDarkOn = new Set();
const reachesLevel = (preset, l) => preset.on.includes(l) || preset.available.includes(l);
function rememberAfterDark() {
  const outgoing = PRESETS[_lastPreset];
  if (!outgoing || state.safeMode) return;
  SAFE_BLOCKED_LEVELS.filter(l => reachesLevel(outgoing, l))
    .forEach(l => state.activeToggles.has(l) ? _afterDarkOn.add(l) : _afterDarkOn.delete(l));
}

// The remembered After Dark categories the preset offers, while After Dark is open.
function carriedAfterDark(preset) {
  if (state.safeMode || MASTER_SAFE || WORKPLACE_MODE) return [];
  return [..._afterDarkOn].filter(l => DECK_LEVELS.has(l) && !OPT_IN_ONLY.includes(l) && reachesLevel(preset, l));
}

function applyPreset(mode) {
  const preset = PRESETS[mode];
  if (!preset) return;
  rememberAfterDark();
  state.activePreset = _lastPreset = mode;
  const isFixedSeq = FIXED_SEQ_PRESETS.includes(mode);
  document.body.classList.toggle('fixed-seq-mode', isFixedSeq);
  if (isFixedSeq) {
    // back out cleanly if either happened to already be on, through the
    // same toggles the buttons themselves use, instead of just hiding the
    // controls out from under an active state
    const pt = document.getElementById('pickToggle');
    if (pt && pt.classList.contains('on')) pt.click();
    clearTwist();
  }
  // Bring the active mode button into the centre of its own horizontal
  // strip — scrolling that strip's element directly (.preset-wrap's own
  // scrollLeft), not scrollIntoView(). scrollIntoView asks "make this
  // visible," and the preset row now lives inside the Categories sheet
  // (closed, position:fixed, off-screen until opened) — so it doesn't just
  // scroll the strip, it scrolls the whole page trying to reveal a button
  // that's deliberately hidden by app state, on every boot (applyPreset()
  // runs at startup). Setting scrollLeft on the one specific container
  // can't ever escape to the page, regardless of what's hiding it.
  requestAnimationFrame(() => {
    const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    const strip = activeBtn && activeBtn.closest('.preset-wrap');
    if (!strip) return;   // wrapped layouts (.preset-host) don't scroll — nothing to centre
    try {
      const target = activeBtn.offsetLeft - (strip.clientWidth - activeBtn.clientWidth) / 2;
      strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    } catch(e) {}
  });
  // A mode is hard-safe when none of its categories — on or merely available —
  // ever reach adult territory; such a mode locks After Dark away.
  const hasAfterDark = SAFE_BLOCKED_LEVELS.some(l => DECK_LEVELS.has(l) &&
                        (preset.on.includes(l) || preset.available.includes(l)));
  if (!hasAfterDark) {
    if (_prevSafeModeHS === null) _prevSafeModeHS = state.safeMode;
    state.safeMode = true;
  } else if (_prevSafeModeHS !== null) {
    state.safeMode = _prevSafeModeHS;
    _prevSafeModeHS = null;
  }
  showSubtitle(preset);
  state.activeToggles = presetSelection(preset);
  carriedAfterDark(preset).forEach(l => state.activeToggles.add(l));

  syncCategoryButtons();

  const glyphBtn = document.getElementById('spiceGlyphBtn');
  const reachable = hasAfterDark && !state.safeMode && !MASTER_SAFE && !WORKPLACE_MODE;
  const adBtn = document.getElementById('afterDarkToggle');
  if (adBtn) adBtn.classList.toggle('hidden', !hasAfterDark);
  /* the spice glyph is meaningless where no adult category exists */
  if (glyphBtn) glyphBtn.classList.toggle('spice-hidden', !reachable);

  updateAfterDarkBtn();
  applyToggleUI();
}


// Presets
document.querySelectorAll('.mode-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPreset(btn.dataset.mode);
    initDeck();
    // Colbert/The 36 are a fixed start-to-finish sequence, not a hand to
    // tune first — picking one should act like pressing Draw Cards: draw
    // straight into question 1 instead of leaving the sheet open on the
    // configuration screen.
    if (btn.classList.contains('fixed-seq-btn')) {
      _nextCardBase();
      updateDeckInfo();
      updateDrawMore();
      window.closeCats();
    }
  })
);


// ── Category lines ───────────────────────────────────────────────────────────
// Each category button carries its line (the category's desc). In the docked panel (a computer with a
// mouse, the same switch as styles.css "THE DECK, DOCKED") the lines are always on, in two columns. On the
// sheet they are off until the player holds any category for HOLD_MS; that switches them on or off for
// every chapter at once, and the phone remembers the choice. A hold never picks.
const dockedQuery = matchMedia('(min-width:1280px) and (min-height:560px) and (min-aspect-ratio:5/4) and (hover:hover) and (pointer:fine)');
const LINES_KEY = 'bu.catLines';
const HOLD_MS = 550;                // the same hold as the end of a hand (ui.js)
const LINES_EASE_MS = 450;          // names glide, lines fade, the panel resizes: all about .45s
const LINES_FADE_OUT_MS = 250;      // lines leave first, before the names glide back
const LINES_FADE_IN_DELAY_MS = 180; // lines arrive once the names are nearly home
const LINES_HINT_FADE_MS = 350;     // the hint leaves like "· tap to change" does
const linesRoot = document.documentElement;

let sheetLines = false;             // the player's choice for the sheet
try { sheetLines = localStorage.getItem(LINES_KEY) === '1'; } catch (error) { console.warn('Could not read the category lines choice:', error); }
const linesShown = () => linesRoot.dataset.lines === 'on';
const paintLines = () => { linesRoot.dataset.lines = dockedQuery.matches || sheetLines ? 'on' : 'off'; };
paintLines();
dockedQuery.addEventListener('change', paintLines);

// "Hold a category to see what it's about": under the categories of the first chapter opened, on the sheet only,
// gone for good after the first hold (state.js HINTS).
function showCategoryLinesHint(panel) {
  if (dockedQuery.matches || hintIsTaught('lines') || document.querySelector('.cat-hint') || !panel.dataset.chapter) return;
  panel.append(Object.assign(document.createElement('p'), { className: 'cat-hint', textContent: "Hold a category to see what it's about" }));
}

// A copy of an element that stays put and fades out: what leaves while the rest glides.
const ghostProps = ['fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight', 'textAlign', 'color'];
function fadeGhost(el, panel, ms) {
  const box = el.getBoundingClientRect(), frame = panel.getBoundingClientRect(), style = getComputedStyle(el);
  const ghost = el.cloneNode(true);
  ghostProps.forEach(prop => { ghost.style[prop] = style[prop]; });
  Object.assign(ghost.style, {
    display: 'block', position: 'absolute', margin: '0', padding: '0', pointerEvents: 'none', transition: 'none', animation: 'none',
    left: `${box.left - frame.left - panel.clientLeft}px`, top: `${box.top - frame.top - panel.clientTop}px`, width: `${box.width}px`,
  });
  panel.append(ghost);
  ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease' }).finished.then(() => ghost.remove());
}

let linesSwitchTimer = 0;
// Switch the lines for every open chapter. Names and dots glide from where they were to where they are, the panel
// grows or shrinks, the lines fade in (or out where they were). Reduced motion switches at once.
function setSheetLines(on) {
  sheetLines = on;
  try { localStorage.setItem(LINES_KEY, on ? '1' : '0'); } catch (error) { console.warn('Could not save the category lines choice:', error); }
  hintRetire('lines');
  const hint = document.querySelector('.cat-hint');
  const panels = [...document.querySelectorAll('.chapter-panel.open[data-chapter]')];
  const glides = panels.flatMap(panel => [...panel.querySelectorAll('.toggle-btn .cat-dot, .toggle-btn .cat-name')]);
  const before = new Map(glides.map(el => [el, el.getBoundingClientRect()]));
  const heights = panels.map(panel => panel.getBoundingClientRect().height);
  const animated = !prefersReducedMotion.matches;
  if (animated) {
    if (hint) fadeGhost(hint, hint.parentElement, LINES_HINT_FADE_MS);
    if (!on) panels.forEach(panel => panel.querySelectorAll('.cat-line').forEach(line => fadeGhost(line, panel, LINES_FADE_OUT_MS)));
  }
  hint?.remove();
  paintLines();
  if (!animated) return;
  linesRoot.classList.add('switching');   // the sheet's picks ease at the same pace while it moves
  clearTimeout(linesSwitchTimer);
  linesSwitchTimer = setTimeout(() => linesRoot.classList.remove('switching'), LINES_EASE_MS + 250);
  panels.forEach((panel, i) => {
    panel.animate([{ height: `${heights[i]}px` }, { height: `${panel.getBoundingClientRect().height}px` }], { duration: LINES_EASE_MS, easing: 'ease' });
    if (on) panel.querySelectorAll('.cat-line').forEach(line => line.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: LINES_EASE_MS - LINES_FADE_IN_DELAY_MS, delay: LINES_FADE_IN_DELAY_MS, easing: 'ease', fill: 'backwards' }));
  });
  before.forEach((from, el) => {
    const to = el.getBoundingClientRect();
    const dx = from.left - to.left, dy = from.top - to.top;
    if (dx || dy) el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: LINES_EASE_MS, easing: 'ease' });
  });
}

// The hold: the button presses in and dims (.holding) across HOLD_MS, then the lines switch. The release that
// follows must not pick, and the switch moves the layout, so its click can land on any element (a chapter row,
// a lock): the next click anywhere is swallowed.
let holdTimer = 0, holdButton = null, holdStart = { x: 0, y: 0 };
const swallowClick = (/** @type {Event} */ e) => { e.preventDefault(); e.stopPropagation(); };
const stopSwallowing = () => document.removeEventListener('click', swallowClick, true);
function cancelHold() {
  clearTimeout(holdTimer);
  holdButton?.classList.remove('holding');
  holdButton = null;
}
const chaptersEl = document.getElementById('chapters');
chaptersEl.addEventListener('pointerdown', e => {
  stopSwallowing();
  const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('.chapter-panel[data-chapter] .toggle-btn'));
  if (!btn || e.button !== 0 || dockedQuery.matches) return;
  cancelHold();
  holdButton = btn;
  holdStart = { x: e.clientX, y: e.clientY };
  btn.classList.add('holding');
  holdTimer = setTimeout(() => {
    document.addEventListener('click', swallowClick, true);
    cancelHold();
    setSheetLines(!linesShown());
  }, HOLD_MS);
});
// The release of a fired hold is followed by a click at once, or by none: stop swallowing shortly after,
// so a click that never comes cannot swallow a later keyboard Enter or Space.
const HOLD_CLICK_WINDOW_MS = 100;
['pointerup', 'pointercancel'].forEach(type => document.addEventListener(type, () => {
  cancelHold();
  setTimeout(stopSwallowing, HOLD_CLICK_WINDOW_MS);
}));
document.addEventListener('pointermove', e => {
  if (holdButton && Math.hypot(e.clientX - holdStart.x, e.clientY - holdStart.y) > 10) cancelHold();   // a scroll, not a hold
});
chaptersEl.addEventListener('contextmenu', e => { if (/** @type {HTMLElement} */ (e.target).closest('.toggle-btn')) e.preventDefault(); });

// Category toggles (the buttons live in each chapter's panel inside #chapters)
chaptersEl.addEventListener('click', e => {
  const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('.toggle-btn'));
  if (!btn) return;
  if (btn.classList.contains('hard-locked')) {
    // A locked After Dark category opens After Dark (same gate as its chapter row)
    // and switches on only itself, not the rest of the chapter.
    if (typeof openAfterDark !== 'function' || !openAfterDark()) return;
    syncCategoryButtons();
  }
  const lvl = btn.dataset.level;
  state.activeToggles[state.activeToggles.has(lvl) ? 'delete' : 'add'](lvl);
  syncActivePreset();   // a tweak that leaves the preset's set makes the deck Custom
  applyToggleUI();
  initDeck();
});

function updateCatCounts() {
  const counts = {};
  ALL_CARDS.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    btn.dataset.count = counts[lvl] || 0;          // count lives in the tooltip
  });
}

