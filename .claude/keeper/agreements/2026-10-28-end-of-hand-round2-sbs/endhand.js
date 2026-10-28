/* End-of-hand page engine. Four small cards play the same end of a hand together: the last card, the message after it
   (same swap as the app's renderEndMessage), the message's dwell (1.1s, as in the app), then each version's own move to
   Intermezzo. "Flip to list" is the app's sideways turn (0.84s, face swapped edge-on at 420ms) in all four. */
(() => {
  const CARDS = window.MOCK_CARDS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MSG_SWAP_MS = 175, MSG_READ_MS = 1100, TURN_MID_MS = 420, TURN_END_MS = 870;
  /* The held empty beat the owner loves in "The card closes": measured from the finished back (lattice and frame drawn,
     about 99% settled) to the first line of the pause mark. One value, shared by the versions that hold it. */
  const BEAT_S = .45, MSG_FADE_MS = 450, VEIL_FADE_S = .9, MARK_LEAD_S = .5;   // the mark's own start delay in the app
  const HAND = CARDS.slice(0, 5), LAST = CARDS[2];            // the hand's questions; the last drawn card sets the pause colour
  const MESSAGE = `<span class="end-msg"><span style="display:block">Those were your ${HAND.length} cards.</span></span>`;
  const HAND_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const tpl = document.getElementById('tpl-back').innerHTML;
  let uid = 0;

  const listHTML = () => `<div class="hd-box"><ol class="hd-list">${HAND.map((c, i) =>
    `<li class="hd-row"><span class="hd-d" style="background:${labelColor(c.color)}"></span><span class="hd-q">${c.question}</span>`
    + `<button type="button" class="hd-star${i === 1 ? ' on' : ''}" tabindex="-1">${HAND_STAR}</button></li>`).join('')}</ol></div>`;

  /* Each version: what happens at the moment the dwell ends. enter() puts the card on its Intermezzo side (the app's
     classes); lead is when the mark's drawing starts, counted from enter(). at() runs a step ms after the move starts. */
  const VERSIONS = {
    current: { label: 'Current', sub: 'sideways turn', lead: 0, move: ({ el, enter, at }) => {
      el.classList.add('turning');
      at(TURN_MID_MS, enter); at(TURN_END_MS, () => el.classList.remove('turning'));
    } },
    closes: { label: 'The card closes', sub: 'lattice and frame draw in', lead: .85, move: ({ el, q, enter, at }) => {
      el.classList.add('mv-build', 'mv-keep');
      q.classList.add('mv-fade');
      enter(); at(700, () => el.classList.remove('mv-keep'));
    } },
    /* 5a: message fades out, the plain card waits one beat, then the back fades up in place; the mark follows the fade as in round 1 */
    veilBetween: { label: 'The veil, empty between (5a)', sub: 'empty card, then back', lead: VEIL_FADE_S - MARK_LEAD_S - .1, move: ({ el, q, enter, at }) => {
      el.classList.add('mv-veil', 'mv-keep');
      q.classList.add('mv-fade');
      const gap = MSG_FADE_MS + BEAT_S * 1000;
      at(gap, enter); at(gap + 1000, () => el.classList.remove('mv-keep'));
    } },
    /* 5b: the back fades up over the message; the finished back waits one beat, then the mark draws */
    veilFrame: { label: 'The veil, empty frame (5b)', sub: 'back, empty frame, mark', lead: VEIL_FADE_S + BEAT_S - MARK_LEAD_S, capDelay: VEIL_FADE_S, move: ({ el, enter, at }) => {
      el.classList.add('mv-veil', 'mv-keep');
      enter(); at(1000, () => el.classList.remove('mv-keep'));
    } },
  };

  const stages = [...document.querySelectorAll('.tstage')].map((stage) => {
    const version = VERSIONS[stage.dataset.version];
    stage.innerHTML = `<div class="card-area"><div class="card">
        <div class="c-accent"><i class="c-lift"></i></div>
        <button class="card-star" tabindex="-1">&#9733;</button>
        <div class="card-body-inner"><div class="card-level"></div><div class="card-question"></div></div>
        ${tpl.replaceAll('__U', `_${++uid}`)}
      </div></div><p class="tcap">${version.label}<br><span style="color:var(--muted-l)">${version.sub}</span></p>`;
    const el = stage.querySelector('.card');
    el.style.setProperty('--im-color', labelColor(LAST.color));
    el.style.setProperty('--lead', `${version.lead}s`);
    if (version.capDelay) el.style.setProperty('--cap-delay', `${version.capDelay}s`);
    return { stage, version, el, lvl: stage.querySelector('.card-level'), q: stage.querySelector('.card-question'),
      accent: stage.querySelector('.c-accent'), timers: [], side: 'face' };
  });

  const clear = (d) => { d.timers.splice(0).forEach(clearTimeout); };
  const later = (d, ms, fn) => d.timers.push(setTimeout(fn, ms));
  const MOVE_CLASSES = ['turning', 'mv-keep', 'mv-build', 'mv-veil', 'flipping', 'is-start', 'is-intermezzo', 'is-hand-list', 'im-still'];

  const paintFace = (d, card) => {
    d.lvl.className = 'card-level in';
    d.lvl.textContent = card.label;
    d.lvl.style.color = labelColor(card.color);
    d.q.className = 'card-question in';
    d.q.textContent = card.question;
    giltRailPaint(d.accent, card.color);
  };
  /* the last drawn card, at rest, nothing running */
  const toLastCard = (d) => {
    clear(d);
    d.el.classList.add('no-anim');
    d.el.classList.remove(...MOVE_CLASSES);
    paintFace(d, LAST);
    void d.el.offsetWidth;
    d.el.classList.remove('no-anim');
    d.side = 'face';
  };
  const enter = (d) => { d.el.classList.add('is-start', 'is-intermezzo'); d.side = 'intermezzo'; };

  /* the message after the last card: the app's renderEndMessage (card fades, text swaps at 175ms, fades up) */
  const showMessage = (d) => {
    d.el.classList.add('flipping');
    later(d, MSG_SWAP_MS, () => {
      d.lvl.className = 'card-level'; d.lvl.textContent = '';
      d.q.innerHTML = MESSAGE;
      d.el.classList.remove('flipping');
      d.side = 'message';
    });
  };

  const playEnd = (d) => {
    toLastCard(d);
    void d.el.offsetWidth;
    showMessage(d);
    later(d, MSG_READ_MS, () => {
      const at = (ms, fn) => later(d, ms, fn);
      if (reduced.matches) { d.el.classList.add('mv-veil'); enter(d); return; }       // a calm fade, whatever the version
      d.version.move({ el: d.el, q: d.q, enter: () => enter(d), at });
    });
  };

  /* Intermezzo finished at once, so a press of "Flip to list" mid-move turns from the resting back */
  const settleIntermezzo = (d) => {
    clear(d);
    d.el.classList.add('no-anim');
    d.el.classList.remove(...MOVE_CLASSES);
    d.q.className = 'card-question in'; d.q.textContent = 'Intermezzo';
    d.lvl.className = 'card-level'; d.lvl.textContent = '';
    d.el.classList.add('is-start', 'is-intermezzo', 'im-still');
    void d.el.offsetWidth;
    d.el.classList.remove('no-anim');
    d.side = 'intermezzo';
  };

  /* the app's turn to the hand list (presentation.js renderHandSide): sideways, face swapped edge-on */
  const flipToList = (d) => {
    if (d.side !== 'list' && !d.el.classList.contains('im-still')) settleIntermezzo(d);
    const toList = d.side !== 'list';
    const swap = () => {
      d.el.classList.remove('is-start', 'im-still', 'is-hand-list');
      if (toList) {
        d.el.classList.add('is-intermezzo', 'is-hand-list');
        d.q.innerHTML = listHTML();
      } else {
        d.el.classList.add('is-start', 'is-intermezzo', 'im-still');
        d.q.textContent = 'Intermezzo';
      }
      d.side = toList ? 'list' : 'intermezzo';
    };
    clear(d);
    if (reduced.matches) { swap(); return; }
    d.el.classList.remove('turning'); void d.el.offsetWidth; d.el.classList.add('turning');
    later(d, TURN_MID_MS, swap);
    later(d, TURN_END_MS, () => d.el.classList.remove('turning'));
  };

  const button = document.getElementById('btn-flip');
  const label = () => { button.textContent = stages.every((d) => d.side === 'list') ? 'Flip back' : 'Flip to list'; };
  document.getElementById('btn-play').addEventListener('click', () => { stages.forEach(playEnd); button.textContent = 'Flip to list'; });
  button.addEventListener('click', () => {
    stages.forEach(flipToList);
    setTimeout(label, TURN_MID_MS + 40);
  });

  /* start: the last card on screen, as at the moment before the message */
  stages.forEach(toLastCard);
  window.endhand = { playEnd: () => stages.forEach(playEnd), flip: () => button.click() };
})();
