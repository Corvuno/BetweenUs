/* Swap mockup engine. "Current" is a straight copy of flipToCard (card.js, non-first draw): same classes,
   same 175ms timer, same steps. The takes use the Web Animations API on transform and opacity only,
   in two beats (out, then in) with the text changed between them while it is invisible. */
(() => {
  const CARDS = window.MOCK_CARDS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const EASE_IN = 'cubic-bezier(.4,0,1,1)';           // the exit accelerates away
  const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';        // the entrance settles
  const EASE_BREATH = 'cubic-bezier(.3,0,.4,1)';

  const stageParts = (root) => ({
    root,
    el: root.querySelector('.card'),
    lvl: root.querySelector('.card-level'),
    q: root.querySelector('.card-question'),
    accent: root.querySelector('.c-accent'),
    frame: root.querySelector('.frame-group'),            // take stages only: card background, border, brackets, rail
    brackets: [...root.querySelectorAll('.br')],
    hair: root.querySelector('.hair'),
    lift: root.querySelector('.lift'),
    target: null, phase: 'idle', token: 0, anims: [],
  });

  const paintFace = (st, card) => {
    st.lvl.textContent = card.label;
    st.lvl.style.color = labelColor(card.color);
    st.q.textContent = card.question;
    giltRailPaint(st.accent, card.color);
    st.root.style.setProperty('--lift', giltStops(card.color).light);
  };

  /* ---- Current: copy of the live swap ---- */
  const swapCurrent = (st, card) => {
    st.target = card;
    st.lvl.classList.remove('in');
    st.q.classList.remove('in');
    st.el.classList.add('flipping');
    setTimeout(() => {
      if (st.target !== card) { st.el.classList.remove('flipping'); return; }   // a later tap owns the card now
      giltRailPaint(st.accent, card.color);
      st.accent.classList.remove('accent-bloom');
      void st.accent.offsetWidth;
      st.accent.classList.add('accent-bloom');
      st.lvl.textContent = card.label;
      st.lvl.style.color = labelColor(card.color);
      st.q.textContent = card.question;
      st.root.style.setProperty('--lift', giltStops(card.color).light);
      requestAnimationFrame(() => { st.lvl.classList.add('in'); st.q.classList.add('in'); });
      st.el.classList.remove('flipping');
    }, 175);
  };

  /* Hard rule: the question never changes size. Every scale below runs on st.frame (the card's background, border,
     brackets and rail), never on the card element that holds the text. */
  /* ---- Takes: each is { out(st), in(st) } returning [element, keyframes, options, pseudo?] lists ---- */
  const T = (el, keyframes, options, pseudo) => ({ el, keyframes, options, pseudo });
  const textOut = (st, d, delay = 0, y = -3) => [st.lvl, st.q].map(e =>
    T(e, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: `translateY(${y}px)` }],
      { duration: d, delay, easing: EASE_IN, fill: 'forwards' }));
  const textIn = (st, d, rise, qDelay = 30, lDelay = 0) => [
    T(st.lvl, [{ opacity: 0, transform: `translateY(${rise}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: d, delay: lDelay, easing: EASE_OUT, fill: 'backwards' }),
    T(st.q, [{ opacity: 0, transform: `translateY(${rise}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: d, delay: qDelay, easing: EASE_OUT, fill: 'backwards' }),
  ];
  const corners = (st, from, to, o) => st.brackets.map(b => T(b, [{ opacity: from }, { opacity: to }], o));

  const TAKES = {
    /* A: the whole card inhales; its hairline border and corner brackets brighten while the text goes out */
    breath: {
      out: (st) => [
        T(st.frame, [{ transform: 'scale(1)' }, { transform: 'scale(1.014)' }], { duration: 110, easing: EASE_BREATH, fill: 'forwards' }),
        T(st.hair, [{ opacity: 0 }, { opacity: .7 }], { duration: 110, easing: EASE_BREATH, fill: 'forwards' }),
        ...corners(st, .35, .85, { duration: 110, easing: EASE_BREATH, fill: 'forwards' }),
        ...textOut(st, 110),
      ],
      in: (st) => [
        T(st.frame, [{ transform: 'scale(1.014)' }, { transform: 'scale(1)' }], { duration: 210, easing: EASE_OUT }),
        T(st.hair, [{ opacity: .7 }, { opacity: 0 }], { duration: 210, easing: EASE_OUT }),
        ...corners(st, .85, .35, { duration: 210, easing: EASE_OUT }),
        ...textIn(st, 180, 8, 30),
      ],
    },
    /* B: the category rail leads: a lighter copy of it flares out from the centre first, the text follows, the rail settles */
    rail: {
      out: (st) => [
        T(st.lift, [{ opacity: 0, transform: 'scaleX(.5)' }, { opacity: .95, transform: 'scaleX(1)' }], { duration: 110, easing: EASE_OUT, fill: 'forwards' }),
        ...textOut(st, 80, 40, -2),
      ],
      in: (st) => [
        T(st.lift, [{ opacity: .95 }, { opacity: 0 }], { duration: 230, easing: EASE_OUT }),
        ...textIn(st, 190, 8, 40, 20),
      ],
    },
    /* C: the text leads; the card holds still, tightens a hair, then answers under the new text */
    answer: {
      out: (st) => [
        T(st.frame, [{ transform: 'scale(1)' }, { transform: 'scale(.992)' }], { duration: 100, easing: EASE_BREATH, fill: 'forwards' }),
        ...corners(st, .35, .6, { duration: 100, easing: EASE_BREATH, fill: 'forwards' }),
        ...textOut(st, 100, 0, -4),
      ],
      in: (st) => [
        T(st.frame, [{ transform: 'scale(.992)' }, { transform: 'scale(1)' }], { duration: 230, easing: EASE_OUT }),
        ...corners(st, .6, .35, { duration: 230, easing: EASE_OUT }),
        ...textIn(st, 200, 10, 30, 10),
      ],
    },
    /* D (bolder): the card dips and dims, then springs up past its size and settles; border and rail flash */
    spring: {
      out: (st) => [
        T(st.frame, [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(5px) scale(.962)', opacity: .55 }], { duration: 130, easing: EASE_IN, fill: 'forwards' }),
        T(st.hair, [{ opacity: 0 }, { opacity: .9 }], { duration: 130, easing: EASE_IN, fill: 'forwards' }),
        T(st.lift, [{ opacity: 0, transform: 'scaleX(.5)' }, { opacity: .95, transform: 'scaleX(1)' }], { duration: 130, easing: EASE_IN, fill: 'forwards' }),
        ...textOut(st, 90, 0, 4),
      ],
      in: (st) => [
        T(st.frame, [
          { transform: 'translateY(5px) scale(.962)', opacity: .55, easing: 'cubic-bezier(.2,.8,.3,1)' },
          { transform: 'translateY(-2px) scale(1.012)', opacity: 1, offset: .55, easing: 'cubic-bezier(.3,0,.3,1)' },
          { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: 230 }),
        T(st.hair, [{ opacity: .9 }, { opacity: 0 }], { duration: 230, easing: EASE_OUT }),
        T(st.lift, [{ opacity: .95 }, { opacity: 0 }], { duration: 230, easing: EASE_OUT }),
        ...textIn(st, 190, 14, 40, 20),
      ],
    },
  };

  /* Reduced motion: every take becomes a plain quick fade, no movement */
  const FADE = {
    out: (st) => [st.lvl, st.q].map(e => T(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 80, easing: 'linear', fill: 'forwards' })),
    in: (st) => [st.lvl, st.q].map(e => T(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'linear', fill: 'backwards' })),
  };

  const play = (spec) => spec.el.animate(spec.keyframes, { ...spec.options, ...(spec.pseudo ? { pseudoElement: spec.pseudo } : {}) });
  const settled = (anims) => Promise.all(anims.map(a => a.finished));

  const swapTake = (st, plan, card) => {
    st.target = card;
    if (st.phase === 'out') return;                       // still going out: it will pick up the newest card
    st.anims.forEach(a => a.cancel());                     // a tap during the entrance restarts the beat cleanly
    const token = ++st.token;
    const p = reduced.matches ? FADE : plan;
    st.phase = 'out';
    st.anims = p.out(st).map(play);
    settled(st.anims).then(() => {
      if (token !== st.token) return;
      paintFace(st, st.target);                            // text changes while invisible
      const inAnims = p.in(st).map(play);
      st.anims.forEach(a => a.cancel());                   // the out end-state is replaced by the in animation's start
      st.anims = inAnims;
      st.phase = 'in';
      settled(inAnims).then(() => { if (token === st.token) { st.phase = 'idle'; st.anims = []; } }).catch(() => {});
    }).catch(() => {});
  };

  /* ---- page wiring ---- */
  window.initSwapMock = (takeName) => {
    const cur = stageParts(document.getElementById('stage-current'));
    const take = stageParts(document.getElementById('stage-take'));
    let i = 0;
    const show = (st, card) => { st.target = card; paintFace(st, card); st.lvl.classList.add('in'); st.q.classList.add('in'); };
    show(cur, CARDS[0]); show(take, CARDS[0]);
    const step = (d) => {
      i = (i + d + CARDS.length) % CARDS.length;
      swapCurrent(cur, CARDS[i]);
      swapTake(take, TAKES[takeName], CARDS[i]);
    };
    document.getElementById('btn-next').addEventListener('click', () => step(1));
    document.getElementById('btn-prev').addEventListener('click', () => step(-1));
    [cur.el, take.el].forEach(c => c.addEventListener('click', () => step(1)));
    addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Backspace' || e.key.toLowerCase() === 'b') location.href = 'index.html';
    });
    const link = document.querySelector('.back-link');
    let hide;
    const reveal = () => { link.classList.add('show'); clearTimeout(hide); hide = setTimeout(() => link.classList.remove('show'), 2500); };
    addEventListener('mousemove', reveal); addEventListener('touchstart', reveal, { passive: true });
  };
})();
