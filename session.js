// ── SESSION ──────────────────────────────────────────────────────────────────
// The session log (addToLog/renderLog) and save/restore: serializeSession()
// is the single source of truth for what a saved session captures, shared by
// the manual Save button and the after-every-card autosave.

// ── LOG & FAVOURITES ──────────────────────────────────────────────────────────
function addToLog(card) {
  if (!card) return;
  if (state.loggedQuestions.has(card.question)) return;   // re-visiting via prev/next must not re-log
  state.loggedQuestions.add(card.question);
  state.sessionLog.push({ question: card.question, level: card.level });
  renderLog();
}

function renderLog() {
  const el = document.getElementById('logList');
  el.innerHTML = state.sessionLog.length === 0
    ? '<div class="drawer-empty">No cards drawn yet.</div>'
    : [...state.sessionLog].reverse().map(c =>
        `<div class="drawer-item drawer-item--lvl" style="--lvl:${levelColor(c.level)}">
          <div class="drawer-item-meta">${LEVEL_LABELS[c.level] || esc(c.level)}</div>
          ${esc(c.question)}
        </div>`
      ).join('');
}

function serializeSession() {
  return {
    deckQuestions: state.visibleDeck.map(c=>c.question),
    fullDeckQuestions: state.fullDeck.map(c=>c.question),
    position: state.currentIndex, toggles:[...state.activeToggles],
    safeMode: state.safeMode, spiceMode: state.spiceMode, randomMode: state.randomMode, cardLimit: state.cardLimit, lang: state.lang,
    activePreset: state.activePreset,
    sessionLog: window.LOG_PERSIST ? state.sessionLog : undefined,
    savedAt: new Date().toISOString(),
  };
}

function saveSession() {
  if (!state.visibleDeck.length) return;
  try {
    localStorage.setItem('bu-session', JSON.stringify(serializeSession()));
    const lbl = document.getElementById('saveBtnLabel');
    if (lbl) { lbl.textContent='Saved ✓'; setTimeout(()=>{ lbl.textContent='Save session'; },2000); }
  } catch(e){}
};
function checkSavedSession() {
  try {
    const v = localStorage.getItem('bu-session');
    if (!v) return;
    saveMode = 'continue';
    const lbl = document.getElementById('saveBtnLabel');
    if (lbl) lbl.textContent = 'Continue session →';
  } catch(e){}
};
function continueSession() {
  try {
    const v = localStorage.getItem('bu-session'); if(!v) return;
    const data = JSON.parse(v);
    state.safeMode=data.safeMode||false; state.spiceMode=data.spiceMode||false;
    state.randomMode=data.randomMode||'wild'; state.cardLimit=data.cardLimit;
    shuffleModeIdx=SHUFFLE_MODES.indexOf(state.randomMode); if(shuffleModeIdx<0) shuffleModeIdx=7;
    updateShuffleDisplay();
    state.activeToggles=new Set(data.toggles||[]);
    if (MASTER_SAFE) SAFE_BLOCKED_LEVELS.forEach(l => state.activeToggles.delete(l));
    // restore preset highlight
    state.activePreset = data.activePreset || '';
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.activePreset));
    // restore language (also updates lang UI + html lang attribute)
    setLang(data.lang || 'en', true);
    // restore session log
    if (window.LOG_PERSIST && Array.isArray(data.sessionLog)) {
      state.sessionLog = data.sessionLog;
      state.loggedQuestions = new Set(state.sessionLog.map(c => c.question));
      renderLog();
    }
    // sync spice glyph
    if (window.syncSpiceGlyph) window.syncSpiceGlyph();
    updateAfterDarkBtn(); applyToggleUI();
    const qMap={}; ALL_CARDS.forEach(c=>{qMap[c.question]=c;});
    state.visibleDeck=(data.deckQuestions||[]).map(q=>qMap[q]).filter(Boolean);
    state.fullDeck=(data.fullDeckQuestions||data.deckQuestions||[]).map(q=>qMap[q]).filter(Boolean);
    state.currentIndex=data.position??-1;
    syncLimitButtons();
    updateDeckInfo(); updateDrawMore(); renderProgress();
    setCardDisplay(state.currentIndex>=0 ? state.visibleDeck[state.currentIndex] : null);
    const lbl=document.getElementById('saveBtnLabel'); if(lbl) lbl.textContent='Save session';
    saveMode='';
    renderShell();
  } catch(e){ console.error('continueSession:',e); }
};


// ═══════════════════════════════════════════════════════════
// AUTO-SAVE — called from flipToCard on every card advance
// ═══════════════════════════════════════════════════════════
function autoSaveSession() {
  if (!state.visibleDeck.length) return;
  try {
    localStorage.setItem('bu-session', JSON.stringify(serializeSession()));
  } catch(e) {}
}

