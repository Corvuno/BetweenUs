// ── SELECTION ────────────────────────────────────────────────────────────────
// Category/preset selection: applyToggleUI/applyPreset, the category-count
// display, and the listeners for the preset row, category grid, and select-
// all/none — the event wiring that's directly part of this domain. (Cross-
// cutting wiring and the app's boot sequence live in ui.js.)

function syncBandLabels(){
  document.querySelectorAll('.band-lbl,.cat-band').forEach(band=>{
    let any=false;
    for(let n=band.nextElementSibling; n && !(n.classList.contains('band-lbl')||n.classList.contains('cat-band')); n=n.nextElementSibling){
      if(n.classList.contains('toggle-btn') && n.style.display!=='none'){ any=true; break; }
    }
    band.classList.toggle('band-hidden', !any);
  });
}

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
  syncBandLabels();
  // category colors
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const isOn = btn.classList.contains('on');
    btn.style.color = isOn ? levelColor(lvl) : '';
  });
  if (typeof syncIntentUI === 'function') syncIntentUI();
}


let _prevSafeModeHS = null;   // remembers your After Dark state across hard-safe modes
function applyPreset(mode) {
  const preset = PRESETS[mode];
  if (!preset) return;
  state.activePreset = mode;
  // bring the active mode button into the centre of its scroll strip
  requestAnimationFrame(() => {
    const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (activeBtn && activeBtn.scrollIntoView) {
      try { activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch(e) {}
    }
  });
  // A mode is hard-safe when none of its categories — on or merely available —
  // ever reach adult territory. That used to be hardcoded to Work and Family;
  // it now covers any mode built that way, so a mode with nothing under
  // After Dark locks it away the same as Work and Family always did.
  const hasAfterDark = SAFE_BLOCKED_LEVELS.some(l => DECK_LEVELS.has(l) &&
                        (preset.on.includes(l) || preset.available.includes(l)));
  if (!hasAfterDark) {
    if (_prevSafeModeHS === null) _prevSafeModeHS = state.safeMode;
    state.safeMode = true;
  } else if (_prevSafeModeHS !== null) {
    state.safeMode = _prevSafeModeHS;
    _prevSafeModeHS = null;
  }
  const sub = document.getElementById('subtitle'); if (sub) sub.textContent = preset.subtitle;
  state.activeToggles = new Set(preset.on.filter(l => DECK_LEVELS.has(l)));
  // After Dark is opt-in: adult categories stay reachable but are never
  // pre-activated by a preset unless this build ships with spice on (editor).
  if (state.safeMode || !window.SPICE_MODE) SAFE_BLOCKED_LEVELS.forEach(l => state.activeToggles.delete(l));

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    const inMode = preset.on.includes(lvl) || preset.available.includes(lvl);
    const lockedOut = (MASTER_SAFE || WORKPLACE_MODE) && SAFE_BLOCKED_LEVELS.includes(lvl);
    const hidden = !inMode || lockedOut || !DECK_LEVELS.has(lvl) || (lvl === 'backup' && !window.SHOW_BACKUP);
    btn.style.display = hidden ? 'none' : '';
    const locked = !hidden && state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl);
    btn.classList.toggle('hard-locked', locked);
  });
  // Dev default: SPICE_MODE keeps adult categories switched on in every mode that reaches them,
  // not just at page load — otherwise leaving and returning to a mode silently drops them.
  if (window.SPICE_MODE && !state.safeMode && !MASTER_SAFE && !WORKPLACE_MODE) {
    SAFE_BLOCKED_LEVELS.forEach(lvl => {
      if (OPT_IN_ONLY.includes(lvl)) return;
      if (DECK_LEVELS.has(lvl) && (preset.on.includes(lvl) || preset.available.includes(lvl))) state.activeToggles.add(lvl);
    });
  }
  if (typeof updateGridScrollHint === 'function') updateGridScrollHint();

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
  })
);


// Category toggles
document.getElementById('toggles').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn || btn.classList.contains('hard-locked')) return;
  if (btn._longPressed) { btn._longPressed = false; return; }   // long-press reads, never toggles
  const lvl = btn.dataset.level;
  state.activeToggles[state.activeToggles.has(lvl) ? 'delete' : 'add'](lvl);
  // activePreset deliberately survives this — a category tweak on top of
  // Balanced is still "Balanced," not nothing. See releasePresetMask().
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

document.getElementById('selectAll').addEventListener('click', () => {
  document.querySelectorAll('.toggle-btn:not(.hard-locked)').forEach(btn => {
    if (OPT_IN_ONLY.includes(btn.dataset.level)) return;
    if (btn.dataset.level && btn.style.display !== 'none') state.activeToggles.add(btn.dataset.level);
  });
  state.activePreset = '';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  applyToggleUI();
  initDeck();
});

document.getElementById('deselectAll').addEventListener('click', () => {
  state.activeToggles.clear();
  state.activePreset = '';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  applyToggleUI();
  initDeck();
});


function updateCatCounts() {
  const counts = {};
  ALL_CARDS.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const span = btn.querySelector('.tb-count');
    if (span) span.remove();                       // buttons stay clean
    btn.dataset.count = counts[lvl] || 0;          // count lives in the tooltip instead
  });
}

