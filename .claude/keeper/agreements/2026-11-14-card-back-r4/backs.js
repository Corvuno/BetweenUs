// Round 4: a medallion back after the owner's tarot-box references, in this deck's gold and deco geometry.
// Zones: arched end panels with their own design; a dark field of rays; a ringed medallion for the name.
// Field 1640 x 1000 fills the frame's inner line.
const W = 1640, H = 1000, CX = 820, CY = 500, RX = 430, RY = 290;
const GOLD = '#c9a84c';
const f1 = n => n.toFixed(1);

function build(w, phone) {
  const st = (op, sw = 1) => `stroke="${GOLD}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${w * sw}"`;
  const L = (x1, y1, x2, y2, op, sw) => `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" ${st(op, sw)}/>`;
  const P = (t, s) => [CX + s * RX * Math.cos(t), CY + s * RY * Math.sin(t)];
  const dia = (x, y, r, fill, op) => `<path d="M${f1(x)} ${f1(y - r)}L${f1(x + r * .6)} ${f1(y)}L${f1(x)} ${f1(y + r)}L${f1(x - r * .6)} ${f1(y)}Z" style="fill:${fill}" fill-opacity="${op}"/>`;
  const dot = (x, y, r, op, fill = GOLD) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" style="fill:${fill}" fill-opacity="${op}"/>`;
  const k = phone ? 1.5 : 1;                         // phone: fewer, larger pieces
  const PW = 250, BULGE = 120;                       // end panel: arched inner edge
  // the field: top and bottom edges on the frame, ends arched outward into the panels
  const field = `M${PW} 0H${W - PW}Q${W - PW + BULGE * 2} ${CY} ${W - PW} ${H}H${PW}Q${PW - BULGE * 2} ${CY} ${PW} 0Z`;
  let b = `<defs><clipPath id="fld"><path d="${field}"/></clipPath></defs>`;

  // ── end panels: tinted ground, double arched edge, their own design
  const panel = () => {
    let p = `<path d="M0 0H${PW}Q${PW - BULGE * 2} ${CY} ${PW} ${H}H0Z" style="fill:${GOLD}" fill-opacity=".13"/>`;
    p += `<path d="M${PW} 0Q${PW - BULGE * 2} ${CY} ${PW} ${H}" ${st(.7)}/>`;
    p += `<path d="M${PW - 22} 0Q${PW - 22 - BULGE * 2} ${CY} ${PW - 22} ${H}" ${st(.4, .7)}/>`;
    // a fan in each corner, cut out of the panel
    for (const flip of [false, true]) {
      const cy = flip ? H : 0, d = flip ? -1 : 1, R = 120;
      p += `<path d="M0 ${cy}L${R} ${cy}A${R} ${R} 0 0 ${flip ? 0 : 1} 0 ${cy + d * R}Z" style="fill:var(--card-bg)"/>`;
      p += `<path d="M${R} ${cy}A${R} ${R} 0 0 ${flip ? 0 : 1} 0 ${cy + d * R}" ${st(.55)}/>`;
      p += `<path d="M${R * .62} ${cy}A${R * .62} ${R * .62} 0 0 ${flip ? 0 : 1} 0 ${cy + d * R * .62}" ${st(.35, .7)}/>`;
      for (let a = 15; a < 90; a += phone ? 22.5 : 15) {
        const t = a * Math.PI / 180;
        p += L(R * .62 * Math.cos(t), cy + d * R * .62 * Math.sin(t), R * Math.cos(t), cy + d * R * Math.sin(t), .35, .7);
      }
      p += dot(R * .28, cy + d * R * .28, 9 * k, .65);
    }
    // down the middle: a chain of diamonds and dots, cut out of the tint, one coloured stone at the centre
    const x = 92;
    p += dia(x, CY, 46, 'var(--card-bg)', 1) + dia(x, CY, 22, 'var(--preset-deep)', 1);
    p += `<path d="M${x} ${CY - 46}L${x + 27.6} ${CY}L${x} ${CY + 46}L${x - 27.6} ${CY}Z" ${st(.6)}/>`;
    for (const s of [-1, 1]) {
      p += dot(x, CY + s * 80, 7 * k, 1, 'var(--card-bg)') + dot(x, CY + s * 106, 5 * k, 1, 'var(--card-bg)');
      p += dia(x, CY + s * 160, 24, 'var(--card-bg)', 1);
      p += L(x, CY + s * 192, x, CY + s * 330, .45, .7);
      p += dot(x, CY + s * 352, 6 * k, 1, 'var(--card-bg)');
      // a chevron pair pointing at the centre
      for (const off of [236, 262]) p += `<path d="M${x - 26} ${CY + s * (off + 14)}L${x} ${CY + s * off}L${x + 26} ${CY + s * (off + 14)}" ${st(.5, .8)}/>`;
    }
    return p;
  };
  b += panel() + `<g transform="translate(${W} 0) scale(-1 1)">${panel()}</g>`;

  // ── the field: rays of varied length that lead to the medallion, pieces that sit on them
  let r = '';
  const N = phone ? 48 : 96;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const tier = i % 4 === 0 ? 0 : i % 2 === 0 ? 1 : 2;        // long, middle, short
    const s0 = 1.42, s1 = [2.4, 1.86, 1.62][tier];
    const [x0, y0] = P(t, s0), [x1, y1] = P(t, s1);
    r += L(x0, y0, x1, y1, tier === 0 ? .42 : .3, tier === 0 ? .9 : .7);
    if (tier === 1) { const [dx, dy] = P(t, s1 + .05); r += dot(dx, dy, 3.2 * k, .55); }
    if (tier === 0) {
      const [lx, ly] = P(t, 1.7);
      const ang = Math.atan2(ly - CY, lx - CX) * 180 / Math.PI + 90;
      r += `<g transform="translate(${f1(lx)} ${f1(ly)}) rotate(${f1(ang)})">${dia(0, 0, 15 * k, GOLD, .75)}</g>`;
      const [ex, ey] = P(t, 2.47); r += dot(ex, ey, 4 * k, .5);
    }
  }
  b += `<g clip-path="url(#fld)">${r}</g>`;

  // ── the medallion: a star of filled points, a ring of ticks, a double edge round the name
  let m = '';
  const NP = phone ? 40 : 64;
  for (let i = 0; i < NP; i++) {
    const t = (i / NP) * Math.PI * 2, dt = Math.PI / NP * .72;
    const tip = i % 4 === 0 ? 1.46 : i % 2 ? 1.27 : 1.36;
    const [ax, ay] = P(t - dt, 1.16), [bx, by] = P(t + dt, 1.16), [tx, ty] = P(t, tip);
    m += `<path d="M${f1(ax)} ${f1(ay)}L${f1(tx)} ${f1(ty)}L${f1(bx)} ${f1(by)}Z" style="fill:${GOLD}" fill-opacity="${i % 2 ? .12 : .24}" ${st(.5, .6)}/>`;
  }
  m += `<ellipse cx="${CX}" cy="${CY}" rx="${RX * 1.16}" ry="${RY * 1.16}" style="fill:var(--card-bg)" ${st(.55, .8)}/>`;
  const NT = phone ? 72 : 144;
  for (let i = 0; i < NT; i++) {
    const t = (i / NT) * Math.PI * 2, [x0, y0] = P(t, 1.07), [x1, y1] = P(t, i % 6 ? 1.11 : 1.135);
    m += L(x0, y0, x1, y1, i % 6 ? .3 : .5, .6);
  }
  m += `<ellipse cx="${CX}" cy="${CY}" rx="${RX * 1.06}" ry="${RY * 1.06}" ${st(.4, .6)}/>`;
  m += `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" ${st(.7)}/>`;
  b += m;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${b}</svg>`;
}
module.exports = { 'medallion': build };
