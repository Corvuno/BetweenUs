/* Tempo page engine. Four sections, each a set of small synced cards with one button that plays all of them.
   Every version has a factor k (how many times slower); each duration and delay is multiplied by it, curves stay.
   "Before this week" is k = 1 on the old values (git: the commit before e2e355c). */
(() => {
  const CARDS = window.MOCK_CARDS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const VERSIONS = {
    today: { k: 1, label: 'Today' },
    slow15: { k: 1.5, label: '1.5× slower' },
    slow2: { k: 2, label: '2× slower' },
    old: { k: 1, label: 'Before this week' },
  };
  const tpl = (id) => document.getElementById(id).innerHTML;
  let uid = 0;

  /* The card, with its back, as the app's #card (index.html), ids made unique */
  const cardMarkup = () => `
    <div class="card-area"><div class="card">
      <div class="c-accent"><i class="c-lift"></i></div>
      <button class="card-star" tabindex="-1">&#9733;</button>
      <div class="card-body-inner"><div class="card-level"></div><div class="card-question"></div></div>
      ${tpl('tpl-back').replaceAll('__U', `_${++uid}`)}
    </div></div>`;

  const paintFace = (parts, card) => {
    parts.lvl.textContent = card.label;
    parts.lvl.style.color = labelColor(card.color);
    parts.q.textContent = card.question;
    giltRailPaint(parts.accent, card.color);
  };
  const partsOf = (stage) => ({
    stage, area: stage.querySelector('.card-area'), el: stage.querySelector('.card'),
    body: stage.querySelector('.card-body-inner'), lvl: stage.querySelector('.card-level'),
    q: stage.querySelector('.card-question'), accent: stage.querySelector('.c-accent'),
    lift: stage.querySelector('.c-lift'),
  });
  const showFace = (parts, card) => { paintFace(parts, card); parts.lvl.classList.add('in'); parts.q.classList.add('in'); };

  const stagesOf = (kind) => [...document.querySelectorAll(`.sec[data-kind=${kind}] .tstage`)].map((stage) => {
    const version = VERSIONS[stage.dataset.version];
    stage.style.setProperty('--k', version.k);
    return { stage, k: version.k, old: stage.dataset.version === 'old', version };
  });
  const caption = ({ stage, version }, withCard = true) => {
    stage.innerHTML = (withCard ? cardMarkup() : '') + `<p class="tcap">${version.label}</p>`;
    return stage;
  };

  /* ───────── 1. The first draw: copy of flipToCard's first-draw branch (card.js) + styles.css .drawing-in ───────── */
  const initDraw = () => {
    const draws = stagesOf('draw').map((s) => ({ ...s, parts: partsOf(caption(s)), timers: [], ghosts: [] }));
    let next = 0;
    const timing = ({ k, old }) => reduced.matches ? { back: 0, swap: 150 * k, done: 250 * k }
      : old ? { back: 600, swap: 1050, done: 1050 }                    // the old drop: back dissolves at 600, face at the very end
      : { back: 60 * k, swap: 310 * k, done: 580 * k };
    const stop = ({ parts, timers, ghosts }) => {
      timers.splice(0).forEach(clearTimeout);
      parts.el.classList.remove('drawing-in', 'face-in');
      ghosts.splice(0).forEach((g) => g.remove());
    };
    const rest = (d) => {                       // back up, face hidden
      stop(d);
      d.parts.el.classList.add('no-anim', 'is-start');
      d.parts.lvl.classList.remove('in'); d.parts.q.classList.remove('in');
      void d.parts.el.offsetWidth;
      d.parts.el.classList.remove('no-anim');
    };
    const play = (d, card) => {
      const { parts, k, old } = d;
      const t = timing(d);
      rest(d);
      parts.el.classList.add('drawing-in');
      d.ghosts = [0, 1].map((i) => {
        const g = document.createElement('div');
        g.className = 'draw-ghost';
        g.style.animationDelay = `${i * (old ? 40 : 60) * k}ms`;
        parts.area.insertBefore(g, parts.el);
        return g;
      });
      d.timers.push(setTimeout(() => parts.el.classList.remove('is-start'), t.back));
      d.timers.push(setTimeout(() => {
        parts.el.classList.remove('is-start');
        paintFace(parts, card);
        requestAnimationFrame(() => { parts.lvl.classList.add('in'); parts.q.classList.add('in'); });
        parts.accent.classList.remove('accent-bloom');
        void parts.accent.offsetWidth;
        parts.accent.classList.add('accent-bloom');
        parts.el.classList.add('face-in');
      }, t.swap));
      d.timers.push(setTimeout(() => stop(d), t.done));
    };
    const drawAll = () => { const card = CARDS[next++ % CARDS.length]; draws.forEach((d) => play(d, card)); };
    draws.forEach((d) => { paintFace(d.parts, CARDS[0]); next = 1; d.parts.el.classList.add('is-start'); });
    document.getElementById('btn-draw').addEventListener('click', drawAll);
    draws.forEach((d) => d.parts.el.addEventListener('click', drawAll));
    return drawAll;
  };

  /* ───────── 2. The card change: copy of the app's B+C swap (card.js playSwapOut / playSwapIn / flipToCard) ───────── */
  const SWAP_EASE = { leave: 'cubic-bezier(.4,0,1,1)', settle: 'cubic-bezier(.16,1,.3,1)', breath: 'cubic-bezier(.3,0,.4,1)' };
  const FRAME_TIGHT = .992, CORNER_LIFT = .6, FLARE_PEAK = .95;
  const currentLook = ({ el, body, lift, lvl, q }) => {
    const look = (e, ...props) => Object.fromEntries(props.map((p) => [p, getComputedStyle(e)[p]]));
    return {
      lift: look(lift, 'opacity', 'transform'), card: look(el, 'transform'), body: look(body, 'transform'),
      corners: { opacity: getComputedStyle(el, '::before').opacity },
      text: [lvl, q].map((e) => look(e, 'opacity', 'transform')),
    };
  };
  const RESTING_LOOK = { lift: { opacity: 0, transform: 'scaleX(.5)' }, card: {}, body: {}, corners: {}, text: [{}, {}] };
  const playSwapOut = ({ el, body, lift, lvl, q }, k, from = RESTING_LOOK) => {
    const text = [lvl, q];
    if (reduced.matches) return text.map((e, i) => e.animate([from.text[i], { opacity: 0 }], { duration: 80 * k, easing: 'linear', fill: 'forwards' }));
    const hold = { duration: 110 * k, easing: SWAP_EASE.breath, fill: 'forwards' };
    return [
      lift.animate([from.lift, { opacity: FLARE_PEAK, transform: 'scaleX(1)' }], { ...hold, easing: SWAP_EASE.settle }),
      el.animate([from.card, { transform: `scale(${FRAME_TIGHT})` }], hold),
      body.animate([from.body, { transform: `scale(${1 / FRAME_TIGHT})` }], hold),
      ...['::before', '::after'].map((pseudoElement) => el.animate([from.corners, { opacity: CORNER_LIFT }], { ...hold, pseudoElement })),
      ...text.map((e, i) => e.animate([from.text[i], { opacity: 0, transform: 'translateY(-2px)' }], { duration: 80 * k, delay: 30 * k, easing: SWAP_EASE.leave, fill: 'both' })),
    ];
  };
  const playSwapIn = ({ el, body, lift, lvl, q }, k) => {
    const text = [lvl, q];
    if (reduced.matches) return text.map((e) => e.animate([{ offset: 0, opacity: 0 }], { duration: 120 * k, easing: 'linear', fill: 'backwards' }));
    const settle = { duration: 230 * k, easing: SWAP_EASE.settle };
    const rise = (delay) => ({ duration: 190 * k, delay: delay * k, easing: SWAP_EASE.settle, fill: 'backwards' });
    return [
      lift.animate([{ offset: 0, opacity: FLARE_PEAK }], settle),
      el.animate([{ offset: 0, transform: `scale(${FRAME_TIGHT})` }], settle),
      body.animate([{ offset: 0, transform: `scale(${1 / FRAME_TIGHT})` }], settle),
      ...['::before', '::after'].map((pseudoElement) => el.animate([{ offset: 0, opacity: CORNER_LIFT }], { ...settle, pseudoElement })),
      ...text.map((e, i) => e.animate([{ offset: 0, opacity: 0, transform: 'translateY(8px)' }], rise(20 * (i + 1)))),
    ];
  };
  const settled = (animations) => Promise.all(animations.map((a) => a.finished));

  const initSwap = () => {
    const swaps = stagesOf('swap').map((s) => ({ ...s, parts: partsOf(caption(s)), run: null }));
    let index = 0;
    const swapTo = (s, card) => {
      if (s.run?.phase === 'out') { s.run.card = card; return; }      // a fast tap while leaving lands on the newest card
      const from = s.run ? currentLook(s.parts) : undefined;           // a restart during the in beat continues from what is on screen
      s.run?.animations.forEach((a) => a.cancel());
      const run = s.run = { card, phase: 'out', animations: playSwapOut(s.parts, s.k, from) };
      settled(run.animations).then(() => {
        if (s.run !== run) return;
        paintFace(s.parts, run.card);
        const entering = playSwapIn(s.parts, s.k);
        run.animations.forEach((a) => a.cancel());
        run.animations = entering;
        run.phase = 'in';
        settled(entering).then(() => { if (s.run === run) s.run = null; }).catch(() => {});
      }).catch(() => {});
    };
    const step = (d) => { index = (index + d + CARDS.length) % CARDS.length; swaps.forEach((s) => swapTo(s, CARDS[index])); };
    swaps.forEach((s) => showFace(s.parts, CARDS[0]));
    document.getElementById('btn-next').addEventListener('click', () => step(1));
    document.getElementById('btn-prev').addEventListener('click', () => step(-1));
    swaps.forEach((s) => s.parts.el.addEventListener('click', () => step(1)));
    return step;
  };

  /* ───────── 3. The card turn: .turning / .turning-back, face swapped at the midpoint (deck.js, presentation.js) ───────── */
  const initTurn = () => {
    const turns = stagesOf('turn').map((s) => ({ ...s, parts: partsOf(caption(s)), timers: [], onFace: true }));
    const setSide = (d, face) => {
      const { el } = d.parts;
      el.classList.toggle('is-start', !face);
      el.classList.toggle('is-intermezzo', !face);
      el.classList.toggle('im-still', !face);        // the Intermezzo back at rest: its own drawing-in is not what is being compared
      d.onFace = face;
    };
    const turnSeconds = (d) => parseFloat(getComputedStyle(d.stage).getPropertyValue('--turn'));
    const go = (d) => {
      const { el } = d.parts;
      d.timers.splice(0).forEach(clearTimeout);
      if (d.target !== undefined) setSide(d, d.target);               // a press during a turn finishes it first
      const toBack = d.onFace, ms = turnSeconds(d) * 1000;
      d.target = !d.onFace;
      el.classList.remove('turning', 'turning-back');
      void el.offsetWidth;
      el.classList.add(toBack ? 'turning' : 'turning-back');
      d.timers.push(setTimeout(() => setSide(d, d.target), reduced.matches ? 0 : ms / 2));
      d.timers.push(setTimeout(() => { el.classList.remove('turning', 'turning-back'); d.target = undefined; }, ms));
    };
    turns.forEach((d) => { showFace(d.parts, CARDS[4]); d.target = undefined; });
    const all = () => turns.forEach(go);
    document.getElementById('btn-turn').addEventListener('click', all);
    turns.forEach((d) => d.parts.el.addEventListener('click', all));
    return all;
  };

  /* ───────── 4. The menu: a miniature phone per version; the drawer's classes toggle together ───────── */
  const initMenu = () => {
    const phones = stagesOf('menu').map((s) => {
      const stage = s.stage;
      stage.innerHTML = `
        <div class="phone-wrap"><div class="phone">
          <div class="ph-title">Between Us</div>
          <div class="ph-card">${cardMarkup()}</div>
          <div class="ph-btn"><button class="btn-draw" tabindex="-1">Next Card</button></div>
          <div class="m-overlay"></div>
          <div class="mdrawer" aria-hidden="true"><div class="drawer-handle"><div class="handle-bar"></div></div>${tpl('tpl-menu')}</div>
        </div></div><p class="tcap">${s.version.label}</p>`;
      const parts = partsOf(stage);
      showFace(parts, CARDS[3]);
      stage.querySelector('.card').classList.remove('is-start');
      return stage;
    });
    const fit = () => phones.forEach((stage) => {
      const wrap = stage.querySelector('.phone-wrap');
      stage.querySelector('.phone').style.setProperty('--z', wrap.clientWidth / 392);
    });
    new ResizeObserver(fit).observe(document.querySelector('#sec-menu .tgrid'));
    fit();
    const button = document.getElementById('btn-menu');
    let open = false;
    const toggle = () => {
      open = !open;
      phones.forEach((stage) => stage.querySelectorAll('.mdrawer,.m-overlay').forEach((e) => e.classList.toggle('open', open)));
      button.textContent = open ? 'Close' : 'Open';
    };
    button.addEventListener('click', toggle);
    return toggle;
  };

  window.tempo = { drawAll: initDraw(), step: initSwap(), turn: initTurn(), menu: initMenu() };
})();
