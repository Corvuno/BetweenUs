/* Stand-in for the app's own script in the round-2 mockup pages (issue #85).
   - a tap picks / unpicks a category (colour, line and rail ease); the chapter row's count follows
   - a chapter's arrow opens and closes it
   - phone: a long press on any category switches the lines on or off for every chapter at once; the press never picks
   - the first long press retires the hint for good
   - ?auto=1 plays a pretend finger doing it, on a loop (for the side-by-side demo)
   Page state comes from the address: ?look=today|list|cards  ?lines=on|off  ?hint=a|b|c|none  ?auto=1
   (PC pages carry their look and lines in the file and have no long press.) */
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const isPhone = root.dataset.device === 'phone';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD_MS = 550;     // the app's own hold (end of a hand)
  const EASE_MS = 450;     // everything eases about .45s
  const LINE_OUT_MS = 250; // lines leave first, before the names glide back
  const LINE_IN_DELAY = 180; // lines arrive once the names are nearly home
  const HINTS = {
    a: "Hold a category to see what it's about",
    b: 'Hold any category to show every line',
    c: "What's behind a name? Hold it.",
  };
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
  const picked = btn => btn.classList.contains('on');
  const openPanels = () => $$('.chapter-panel.open');

  /* ── starting state ── */
  if (isPhone) {
    const look = ['today', 'list', 'cards'].includes(params.get('look')) ? params.get('look') : 'list';
    root.dataset.look = look;
    root.dataset.lines = look !== 'today' && params.get('lines') === 'on' ? 'on' : 'off';
  }

  /* ── the hint, in the first chapter a player opens (here: the chapter open on arrival) ── */
  let hint = null;
  const addHint = (fade = false) => {
    const text = HINTS[params.get('hint')];
    const panel = openPanels()[0];
    if (!isPhone || !text || !panel || root.dataset.look === 'today' || root.dataset.lines === 'on') return;
    hint = Object.assign(document.createElement('p'), { className: fade ? 'cat-hint in' : 'cat-hint', textContent: text });
    panel.append(hint);
  };
  addHint();

  /* ── tap picks (stand-in for the app) ── */
  const syncChapter = group => {
    const buttons = $$('.toggle-btn', group);
    const on = buttons.filter(picked).length;
    const row = $('.chapter', group);
    row.classList.toggle('on', on === buttons.length);
    row.classList.toggle('part', on > 0 && on < buttons.length);
    $('.ch-ct', row).textContent = `${on} / ${buttons.length}`;
  };
  document.addEventListener('click', e => {
    const btn = e.target.closest('.chapter-panel .toggle-btn');
    if (!btn) return;
    btn.classList.toggle('on');
    btn.style.color = picked(btn) ? getComputedStyle(btn).getPropertyValue('--c') : '';
    syncChapter(btn.closest('.chapter-group'));
  });

  /* ── a chapter's arrow opens and closes it ── */
  document.addEventListener('click', e => {
    const fold = e.target.closest('.ch-fold');
    if (!fold || fold.classList.contains('ch-fold--row')) return;
    const group = fold.closest('.chapter-group');
    const panel = $('.chapter-panel', group);
    if (!panel) return;
    const opening = !panel.classList.contains('open');
    const from = panel.getBoundingClientRect().height;
    panel.classList.toggle('open', opening);
    group.classList.toggle('open', opening);
    fold.setAttribute('aria-expanded', String(opening));
    panel.style.maxHeight = opening ? 'none' : '';
    const to = panel.getBoundingClientRect().height;
    if (!reduceMotion) panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: EASE_MS, easing: 'ease' });
  });

  /* ── lines on / off, for every chapter at once ──
     Names and dots glide from where they were to where they are; the panel grows or shrinks to the new height;
     lines fade in, and fade out where they were. The hint fades away on the first switch. */
  const ghostProps = ['fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight', 'textAlign', 'color', 'textWrap', 'fontSizeAdjust'];
  const ghostOf = (el, panel, ms) => {
    const r = el.getBoundingClientRect(), p = panel.getBoundingClientRect(), cs = getComputedStyle(el);
    const ghost = el.cloneNode(true);
    ghostProps.forEach(prop => { ghost.style[prop] = cs[prop]; });
    Object.assign(ghost.style, {
      display: 'block', position: 'absolute', margin: '0', padding: '0', pointerEvents: 'none', transition: 'none', animation: 'none',
      left: `${r.left - p.left - panel.clientLeft}px`, top: `${r.top - p.top - panel.clientTop}px`, width: `${r.width}px`,
    });
    panel.append(ghost);
    ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease' }).finished.then(() => ghost.remove());
  };
  const glidingParts = btn => [$('.cat-dot', btn), $('.cat-name', btn)];
  let switchTimer = 0;

  const setLines = (on, { instant = false } = {}) => {
    const next = on ? 'on' : 'off';
    if (root.dataset.lines === next) return;
    const animate = !instant && !reduceMotion;
    const panels = openPanels();
    const parts = panels.flatMap(panel => $$('.toggle-btn', panel)).flatMap(glidingParts);
    const before = animate ? new Map(parts.map(el => [el, el.getBoundingClientRect()])) : null;
    const heights = animate ? panels.map(panel => panel.getBoundingClientRect().height) : [];
    if (animate) {
      panels.forEach(panel => {
        if (on) $$('.cat-hint', panel).forEach(h => ghostOf(h, panel, 350));      // the hint fades like "· tap to change" does
        else $$('.cat-line', panel).forEach(l => ghostOf(l, panel, LINE_OUT_MS));
      });
    }
    root.dataset.lines = next;
    if (on && hint) { hint.remove(); hint = null; }       // the hint is gone for good after the first switch
    if (!animate) return;
    root.classList.add('switching');
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => root.classList.remove('switching'), EASE_MS + 250);
    panels.forEach((panel, i) => {
      panel.animate([{ height: `${heights[i]}px` }, { height: `${panel.getBoundingClientRect().height}px` }], { duration: EASE_MS, easing: 'ease' });
      if (on) $$('.cat-line', panel).forEach(l => l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: EASE_MS - LINE_IN_DELAY, delay: LINE_IN_DELAY, easing: 'ease', fill: 'backwards' }));
    });
    before.forEach((from, el) => {
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left, dy = from.top - to.top;
      if (dx || dy) el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: EASE_MS, easing: 'ease' });
    });
  };

  /* ── the long press (phone) ── */
  let holdTimer = 0, holdBtn = null, startX = 0, startY = 0, swallowClick = false;
  const cancelHold = () => {
    clearTimeout(holdTimer);
    holdBtn?.classList.remove('holding');
    holdBtn = null;
  };
  const startHold = (btn, x = 0, y = 0) => {
    cancelHold();
    swallowClick = false;
    holdBtn = btn; startX = x; startY = y;
    btn.classList.add('holding');
    holdTimer = setTimeout(() => {
      swallowClick = true;                       // the release that follows must not pick
      cancelHold();
      setLines(root.dataset.lines !== 'on');
    }, HOLD_MS);
  };
  if (isPhone) {
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest('.chapter-panel .toggle-btn');
      if (btn && e.button === 0 && root.dataset.look !== 'today') startHold(btn, e.clientX, e.clientY);
    });
    ['pointerup', 'pointercancel'].forEach(type => document.addEventListener(type, cancelHold));
    document.addEventListener('pointermove', e => {
      if (holdBtn && Math.hypot(e.clientX - startX, e.clientY - startY) > 10) cancelHold();
    });
    document.addEventListener('contextmenu', e => { if (e.target.closest('.chapter-panel .toggle-btn')) e.preventDefault(); });
    document.addEventListener('click', e => {
      if (!swallowClick) return;
      swallowClick = false;
      e.stopImmediatePropagation(); e.preventDefault();
    }, true);
  }

  /* ── the moving demo: a pretend finger, on a loop ── */
  if (isPhone && params.get('auto')) {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const finger = Object.assign(document.createElement('div'), { className: 'finger' });
    document.body.append(finger);
    const press = async level => {
      const btn = $(`.chapter-panel.open .toggle-btn[data-level="${level}"]`);
      const name = $('.cat-name', btn).getBoundingClientRect();
      finger.style.left = `${name.left + name.width / 2}px`;
      finger.style.top = `${name.top + name.height / 2}px`;
      finger.classList.add('show');
      await sleep(650);
      finger.classList.add('down');
      startHold(btn);
      await sleep(HOLD_MS + 450);                // the lines come up under a finger that is still down
      finger.classList.remove('down');
      cancelHold();
      await sleep(250);
      finger.classList.remove('show');
    };
    const reset = () => {
      $$('.cat-hint').forEach(h => h.remove());
      setLines(false, { instant: true });
      addHint(true);
    };
    const loop = async () => {
      for (;;) {
        reset();
        await sleep(2200);
        await press('connect');
        await sleep(3600);
        await press('wish');
        await sleep(2400);
      }
    };
    const begin = () => addEventListener('message', e => { if (e.data === 'go') loop(); }, { once: true });
    if (params.get('auto') === 'sync') begin();
    else addEventListener('load', loop);
  }

  /* ── "‹ Overview": shows on mouse move (never in screenshots); Backspace or B goes back too ── */
  const back = Object.assign(document.createElement('a'), { className: 'mock-back', href: 'index.html', textContent: '‹ Overview' });
  back.target = '_top';
  document.body.append(back);
  let hideTimer;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    back.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => back.classList.remove('show'), 2200);
  });
  addEventListener('keydown', e => {
    if (e.key === 'Backspace' || e.key.toLowerCase() === 'b') back.click();
  });

  /* ── bring the open chapter into view, as a player would have scrolled it ── */
  const group = $('.chapter-group.open[data-group]:not(.chapter-group--fixed)');
  const scroller = (() => { for (let el = group?.parentElement; el; el = el.parentElement) { if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el; } })();
  window.focusChapter = (where = 'start') => {
    if (!group || !scroller) return;
    const sticky = $('.preset-host', scroller);
    const stickyH = sticky && getComputedStyle(sticky).position === 'sticky' ? sticky.offsetHeight : 0;
    const top = group.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = where === 'end' ? top + group.offsetHeight - scroller.clientHeight + 8 : top - stickyH + 1;
  };
  addEventListener('load', () => focusChapter());
})();
