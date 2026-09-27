// ── SESSION ──────────────────────────────────────────────────────────────────
// The session log (addToLog/renderLog), the ephemeral autosave slot, and the
// multi-slot "Sessions" store: separate saved sessions (e.g. one per person/
// pairing you play with) that each keep their own deck/position/settings and
// don't overwrite each other. serializeSession()/restoreSessionData() are the
// single source of truth for what a saved session captures and how it's put
// back, shared by the ephemeral autosave and every named slot.

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

// Shared by the silent boot-time resume and openStoredSession() — puts a
// serializeSession() snapshot back into state and the DOM.
function restoreSessionData(data) {
  if (!data) return;
  try {
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
    renderShell();
  } catch(e) { console.error('restoreSessionData:',e); }
}

// ═══════════════════════════════════════════════════════════
// AUTO-SAVE — called from flipToCard on every card advance
// ═══════════════════════════════════════════════════════════
function autoSaveSession() {
  if (state.queryDeckActive) return;   // a ?Q= test deck never touches the real saved session
  if (!state.visibleDeck.length) return;
  try {
    const data = serializeSession();
    localStorage.setItem('bu-session', JSON.stringify(data));
    // Mirror into the bound stored slot, if any, so re-opening it later
    // ("Sessions" drawer) reflects the cards drawn since it was opened —
    // not just the moment it was stored.
    if (state.activeSessionId) {
      const list = getStoredSessions();
      const entry = list.find(s => s.id === state.activeSessionId);
      if (entry) {
        entry.data = data;
        entry.savedAt = data.savedAt;
        saveStoredSessions(list);
        renderSessionsList();
      } else {
        setActiveSessionId('');   // bound slot was deleted elsewhere
      }
    }
  } catch(e) {}
}

// Silent, automatic — no button to notice, no "Continue?" step. Called once
// at boot; if nothing was ever saved this is a no-op and the default preset
// deal from ui.js's init block stands.
function autoResumeSession() {
  try { state.activeSessionId = localStorage.getItem('bu-active-session-id') || ''; }
  catch(e) { state.activeSessionId = ''; }
  try {
    const v = localStorage.getItem('bu-session');
    if (!v) return;
    restoreSessionData(JSON.parse(v));
  } catch(e) { console.error('autoResumeSession:',e); }
}

// ═══════════════════════════════════════════════════════════
// NAMED SESSIONS — multiple independent saved slots (bu-sessions), so
// playing with one person doesn't overwrite where you left off with another.
// ═══════════════════════════════════════════════════════════
function getStoredSessions() {
  try { return JSON.parse(localStorage.getItem('bu-sessions') || '[]'); }
  catch(e) { return []; }
}
function saveStoredSessions(list) {
  try { localStorage.setItem('bu-sessions', JSON.stringify(list)); } catch(e) {}
}
function setActiveSessionId(id) {
  state.activeSessionId = id || '';
  try {
    if (id) localStorage.setItem('bu-active-session-id', id);
    else localStorage.removeItem('bu-active-session-id');
  } catch(e) {}
}
function presetDisplayName(preset) {
  if (preset === 'colbertmode') return 'Colbert';
  const btn = document.querySelector('.mode-btn[data-mode="' + preset + '"]');
  return btn ? btn.textContent.trim() : (preset || 'Custom');
}
function autoSessionName() {
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return presetDisplayName(state.activePreset) + ' · ' + dateStr;
}

// Stores what's currently live as a named slot. If a slot is already bound
// (state.activeSessionId), updates that same slot in place rather than
// creating a duplicate — matches "open it, keep playing, it stays live".
function storeCurrentSession(customName) {
  if (!state.visibleDeck.length) return null;
  const list = getStoredSessions();
  const data = serializeSession();
  const existing = state.activeSessionId ? list.find(s => s.id === state.activeSessionId) : null;
  let id;
  if (existing) {
    existing.data = data;
    existing.savedAt = data.savedAt;
    if (customName) existing.name = customName;
    id = existing.id;
  } else {
    id = 'sess-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    list.push({ id, name: customName || autoSessionName(), savedAt: data.savedAt, data });
    setActiveSessionId(id);
  }
  saveStoredSessions(list);
  renderSessionsList();
  return id;
}

function renameStoredSession(id, name) {
  if (!name || !name.trim()) return;
  const list = getStoredSessions();
  const entry = list.find(s => s.id === id);
  if (!entry) return;
  entry.name = name.trim();
  saveStoredSessions(list);
  renderSessionsList();
}

function deleteStoredSession(id) {
  const list = getStoredSessions().filter(s => s.id !== id);
  saveStoredSessions(list);
  if (state.activeSessionId === id) setActiveSessionId('');
  renderSessionsList();
}

// Loads a stored slot into the live view and binds it as active — from here
// on, autoSaveSession() keeps writing new cards back into this same slot.
function openStoredSession(id) {
  const list = getStoredSessions();
  const entry = list.find(s => s.id === id);
  if (!entry) return;
  restoreSessionData(entry.data);
  setActiveSessionId(id);
  renderSessionsList();
}

function renderSessionsList() {
  const el = document.getElementById('sessionsList');
  if (!el) return;
  const list = getStoredSessions().slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  el.innerHTML = list.length === 0
    ? '<div class="drawer-empty">No stored sessions yet.</div>'
    : list.map(s => {
        const isActive = s.id === state.activeSessionId;
        const dateStr = new Date(s.savedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return `<div class="drawer-item drawer-item--session${isActive ? ' drawer-item--active' : ''}" data-id="${esc(s.id)}">
          <div class="session-item-main" data-action="open">
            <div class="session-item-name">${esc(s.name)}${isActive ? ' <span class="session-live-tag">Live</span>' : ''}</div>
            <div class="drawer-item-meta">${dateStr}</div>
          </div>
          <button class="session-rename-btn" data-action="rename" title="Rename">&#9998;</button>
          <button class="drawer-remove-btn" data-action="delete" title="Delete">&#10005;</button>
        </div>`;
      }).join('');
}
