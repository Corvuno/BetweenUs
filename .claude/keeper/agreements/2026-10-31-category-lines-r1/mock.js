/* Small stand-in for the app's own script, so the mockup pages respond to taps:
   a category picks / unpicks (the colour, line and rail ease), the chapter row's count and state follow.
   Also the way back to the overview. */
(() => {
  const root = document.documentElement;
  const picked = btn => btn.classList.contains('on');

  const syncChapter = group => {
    const buttons = [...group.querySelectorAll('.toggle-btn')];
    const on = buttons.filter(picked).length;
    const row = group.querySelector('.chapter');
    row.classList.toggle('on', on === buttons.length);
    row.classList.toggle('part', on > 0 && on < buttons.length);
    row.querySelector('.ch-ct').textContent = `${on} / ${buttons.length}`;
  };

  document.addEventListener('click', e => {
    const btn = e.target.closest('.chapter-panel .toggle-btn');
    if (!btn) return;
    btn.classList.toggle('on');
    btn.style.color = picked(btn) ? getComputedStyle(btn).getPropertyValue('--c') : '';
    syncChapter(btn.closest('.chapter-group'));
  });

  // "‹ Overview": shows on mouse move (never in screenshots); Backspace or B goes back too
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
    if (e.key === 'Backspace' || e.key.toLowerCase() === 'b') top.location.href = 'index.html';
  });

  // bring the open chapter into view, as a player would have scrolled it
  const group = document.querySelector('.chapter-group.open[data-group]:not(.chapter-group--fixed)');
  const scroller = (() => { for (let el = group?.parentElement; el; el = el.parentElement) { if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el; } })();
  // does the open chapter need scrolling to see all of it?
  window.chapterIsTall = () => !!group && !!scroller && group.offsetHeight > scroller.clientHeight;
  window.focusChapter = (where = 'start') => {
    if (!group || !scroller) return;
    const sticky = scroller.querySelector('.preset-host');
    const stickyH = sticky && getComputedStyle(sticky).position === 'sticky' ? sticky.offsetHeight : 0;
    const top = group.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = where === 'end' ? top + group.offsetHeight - scroller.clientHeight + 8 : top - stickyH + 1;
  };
  addEventListener('load', () => focusChapter());
})();
