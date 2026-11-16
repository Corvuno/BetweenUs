// Round 6: one network of lines from the frame to the window.
// The window is the innermost echo of the card's own frame: a rectangle with stepped corners.
// Mitre bundles run from the window's stepped corners into the frame's corners and cut the card
// into four areas; each area has its own fill. Nothing floats: every line ends on another line.
// Field 1640 x 1000 fills the frame's inner line.
const W = 1640, H = 1000, CX = 820, CY = 500;
const GOLD = '#c9a84c';
const f = n => n.toFixed(1);

function build(w, phone) {
  const st = (op, sw = 1) => `stroke="${GOLD}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${w * sw}"`;
  const L = (x1, y1, x2, y2, op, sw) => `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" ${st(op, sw)}/>`;
  const pts = a => a.map(p => `${f(p[0])} ${f(p[1])}`).join('L');
  const STRUCT = .5, FILL = .22, FINE = .16;
  const sp = phone ? 1.7 : 1;                       // phone: wider spacing, fewer lines

  // the window: the frame's stepped-corner rectangle, echoed inward
  const X0 = 392, X1 = W - 392, Y0 = 200, Y1 = H - 200, S = 38, E = 18;
  const win = e => { const a = X0 - e, b = X1 + e, c = Y0 - e, d = Y1 + e;
    return [[a + S, c], [b - S, c], [b - S, c + S], [b, c + S], [b, d - S], [b - S, d - S], [b - S, d], [a + S, d], [a + S, d - S], [a, d - S], [a, c + S], [a + S, c + S]]; };
  const A = [X0 - E, Y0 - E];                       // outer corner of the window's echo (top left)

  // the four areas, split along the mitres
  const areaL = [[0, 0], A, [A[0], H - A[1]], [0, H]];
  const areaT = [[0, 0], [W, 0], [W - A[0], A[1]], A];
  const mirrorX = a => a.map(p => [W - p[0], p[1]]), mirrorY = a => a.map(p => [p[0], H - p[1]]);
  let b = `<defs>
    <clipPath id="aL"><path d="M${pts(areaL)}Z"/><path d="M${pts(mirrorX(areaL))}Z"/></clipPath>
    <clipPath id="aT"><path d="M${pts(areaT)}Z"/><path d="M${pts(mirrorY(areaT))}Z"/></clipPath></defs>`;

  // ── left and right: the logo's level lines, from the frame to the window
  let lv = '';
  for (let y = 10; y < H; y += 17 * sp) lv += L(0, y, W, y, FILL, .7);
  b += `<g clip-path="url(#aL)">${lv}</g>`;

  // ── top and bottom: a rising fan from the window's edge, its rays ending on the frame
  const C = [CX, Y0 - E];
  const fanLines = (cy, dir) => {
    let r = '';
    const step = phone ? 9 : 5;
    for (let a = step / 2; a < 180; a += step) {
      const t = a * Math.PI / 180, i = Math.round((a - step / 2) / step);
      r += L(CX + 112 * Math.cos(t), cy - dir * 112 * Math.sin(t), CX + 1400 * Math.cos(t), cy - dir * 1400 * Math.sin(t), i % 2 ? FINE : FILL, .7);
    }
    return r;
  };
  b += `<g clip-path="url(#aT)">${fanLines(C[1], 1)}${fanLines(H - C[1], -1)}</g>`;
  // the fan's hub: two arcs resting on the window, the band between them ticked, a sunrise inside
  const hub = (cy, dir) => {
    const sweep = dir > 0 ? 1 : 0;
    let h = `<path d="M${CX - 112} ${cy}A112 112 0 0 ${sweep} ${CX + 112} ${cy}Z" style="fill:var(--card-bg)"/>`;
    h += `<path d="M${CX - 112} ${cy}A112 112 0 0 ${sweep} ${CX + 112} ${cy}" ${st(STRUCT)}/>`;
    h += `<path d="M${CX - 84} ${cy}A84 84 0 0 ${sweep} ${CX + 84} ${cy}" ${st(STRUCT * .8, .8)}/>`;
    for (let a = 4; a < 180; a += phone ? 8 : 4) { const t = a * Math.PI / 180; h += L(CX + 84 * Math.cos(t), cy - dir * 84 * Math.sin(t), CX + 112 * Math.cos(t), cy - dir * 112 * Math.sin(t), FINE + .06, .55); }
    for (let a = 30; a < 180; a += 30) { const t = a * Math.PI / 180; h += L(CX + 24 * Math.cos(t), cy - dir * 24 * Math.sin(t), CX + 66 * Math.cos(t), cy - dir * 66 * Math.sin(t), FILL + .1, .7); }
    h += `<path d="M${CX - 18} ${cy}A18 18 0 0 ${sweep} ${CX + 18} ${cy}Z" fill="${GOLD}" fill-opacity=".45"/>`;
    return h;
  };
  b += hub(C[1], 1) + hub(H - C[1], -1);

  // ── the layered diamond on the centre line of each side, tip to frame and tip to window
  const diamond = cx => {
    const hw = A[0] / 2, hh = 250;
    const D = s => [[cx, CY - hh * s], [cx + hw * s, CY], [cx, CY + hh * s], [cx - hw * s, CY]];
    let d = `<path d="M${pts(D(1))}Z" style="fill:var(--card-bg)" ${st(STRUCT)}/>`;
    d += `<path d="M${pts(D(.84))}Z" ${st(STRUCT * .7, .8)}/>`;
    // the band between the outer two diamonds: upright lines, the other way to the level lines around it
    let v = '';
    for (let x = cx - hw; x <= cx + hw; x += 12 * sp) v += L(x, CY - hh, x, CY + hh, FINE, .55);
    d += `<clipPath id="db${cx}"><path clip-rule="evenodd" d="M${pts(D(1))}Z M${pts(D(.84))}Z"/></clipPath><g clip-path="url(#db${cx})">${v}</g>`;
    d += `<path d="M${pts(D(.6))}Z" ${st(STRUCT * .8, .8)}/><path d="M${pts(D(.42))}Z" ${st(STRUCT * .6, .7)}/>`;
    d += L(cx - hw * .42, CY, cx + hw * .42, CY, FILL, .6);
    d += `<path d="M${pts(D(.16))}Z" style="fill:var(--preset-deep)" ${st(.7, .8)}/>`;
    return d;
  };
  b += diamond(A[0] / 2) + diamond(W - A[0] / 2);

  // ── the mitre bundles: three lines from the window's corner into the frame's corner, laddered
  const mitre = (p, q) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const g = phone ? 16 : 11;
    let m = `<path d="M${pts([[p[0] + nx * g * 1.6, p[1] + ny * g * 1.6], [q[0] + nx * g * 1.6, q[1] + ny * g * 1.6], [q[0] - nx * g * 1.6, q[1] - ny * g * 1.6], [p[0] - nx * g * 1.6, p[1] - ny * g * 1.6]])}Z" style="fill:var(--card-bg)"/>`;
    for (const o of [-g, 0, g]) m += L(p[0] + nx * o, p[1] + ny * o, q[0] + nx * o, q[1] + ny * o, o ? STRUCT * .8 : STRUCT, o ? .8 : 1);
    for (let s = 14; s < len; s += 16 * sp) m += L(p[0] + ux * s + nx * g, p[1] + uy * s + ny * g, p[0] + ux * s, p[1] + uy * s, FINE, .5);
    return m;
  };
  for (const [p, q] of [[A, [0, 0]], [[W - A[0], A[1]], [W, 0]], [[A[0], H - A[1]], [0, H]], [[W - A[0], H - A[1]], [W, H]]]) b += mitre(p, q);

  // ── the window: cut clean, its edge echoed once
  b += `<path d="M${pts(win(E))}Z" style="fill:var(--card-bg)" ${st(STRUCT * .7, .8)}/>`;
  b += `<path d="M${pts(win(0))}Z" ${st(.62)}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${b}</svg>`;
}
module.exports = { 'network': build };
