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
function applyPreset(mode) {
  const preset = PRESETS[mode];
  if (!preset) return;
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
    } catch (error) { console.warn('Could not centre the active preset button:', error); }
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


// Category toggles (the buttons live in each chapter's panel inside #chapters)
document.getElementById('chapters').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  if (btn.classList.contains('hard-locked')) {
    // A locked After Dark category opens After Dark (same gate as its chapter row)
    // and switches on only itself, not the rest of the chapter.
    if (typeof openAfterDark !== 'function' || !openAfterDark()) return;
    syncCategoryButtons();
  }
  if (btn._longPressed) { btn._longPressed = false; return; }   // long-press reads, never toggles
  const lvl = btn.dataset.level;
  state.activeToggles[state.activeToggles.has(lvl) ? 'delete' : 'add'](lvl);
  syncActivePreset();   // a tweak that leaves the preset's set makes the deck Custom
  applyToggleUI();
  initDeck();
  // Show tooltip briefly then fade
  if (btn.dataset.tip) {
    btn.classList.remove('tip-fade');
    btn.classList.add('show-tip');
    setTimeout(() => { btn.classList.add('tip-fade'); btn.classList.remove('show-tip'); }, 1200);
    setTimeout(() => btn.classList.remove('tip-fade'), 1900);
  }
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

