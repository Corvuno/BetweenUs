// Round 6: one network of lines from the frame to the window.
// The window is the innermost echo of the card's own frame: a rectangle with stepped corners.
// Mitre bundles run from the window's stepped corners into the frame's corners and cut the card
// into four areas; each area has its own fill. Nothing floats: every line ends on another line.
// Field 1640 x 1000 fills the frame's inner line.
const W = 1640, H = 1000, CX = 820, CY = 500;
const GOLD = '#c9a84c';
const f = n => n.toFixed(1);

function build(w0, phone) {
  const w = w0 * .7;
  const st = (op, sw = 1) => `stroke="${GOLD}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${w * sw}"`;
  const L = (x1, y1, x2, y2, op, sw) => `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" ${st(op, sw)}/>`;
  const pts = a => a.map(p => `${f(p[0])} ${f(p[1])}`).join('L');
  const STRUCT = .4, FILL = .15, FINE = .1;
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
  b += `<g clip-path="url(#aL)"><rect width="${W}" height="${H}" fill="${GOLD}" fill-opacity=".035"/>${lv}</g>`;
  b += `<g clip-path="url(#aT)"><rect width="${W}" height="70" fill="${GOLD}" fill-opacity=".05"/><rect y="${H - 70}" width="${W}" height="70" fill="${GOLD}" fill-opacity=".05"/></g>`;

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

  // ── each side: a small sunrise springing from the frame, a row of stones running in to the window
  const side = sx => {
    const x0 = sx > 0 ? 0 : W, dir = sx;
    let d = '';
    const R = phone ? 150 : 128;
    d += `<path d="M${x0} ${CY - R}A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${x0} ${CY + R}Z" style="fill:var(--card-bg)"/>`;
    d += `<path d="M${x0} ${CY - R}A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${x0} ${CY + R}Z" fill="${GOLD}" fill-opacity=".06" ${st(STRUCT)}/>`;
    for (const r of [R * .72, R * .44]) d += `<path d="M${x0} ${CY - r}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x0} ${CY + r}" ${st(FILL + .08, .7)}/>`;
    for (let a = -75; a <= 75; a += phone ? 25 : 12.5) {
      const t = a * Math.PI / 180;
      d += L(x0 + dir * R * .44 * Math.cos(t), CY + R * .44 * Math.sin(t), x0 + dir * R * Math.cos(t), CY + R * Math.sin(t), FINE + .04, .5);
    }
    d += `<path d="M${x0} ${CY - R * .2}A${R * .2} ${R * .2} 0 0 ${dir > 0 ? 1 : 0} ${x0} ${CY + R * .2}Z" fill="${GOLD}" fill-opacity=".4"/>`;
    // the centre line from the sunrise to the window: a cut in the level lines, stones of two sizes riding in it
    const xa = x0 + dir * (R + 14), xb = sx > 0 ? A[0] : W - A[0];
    d += `<path d="M${f(xa)} ${CY - 9}H${f(xb)}V${CY + 9}H${f(xa)}Z" style="fill:var(--card-bg)"/>`;
    d += L(xa, CY - 9, xb, CY - 9, FILL, .6) + L(xa, CY + 9, xb, CY + 9, FILL, .6);
    const n = phone ? 4 : 6;
    for (let i = 0; i < n; i++) {
      const x = xa + (xb - xa) * (i + .5) / n, r = i % 2 ? 4 : 7;
      d += `<path d="M${f(x)} ${CY - r}L${f(x + r * .8)} ${CY}L${f(x)} ${CY + r}L${f(x - r * .8)} ${CY}Z" fill="${GOLD}" fill-opacity="${i % 2 ? .3 : .5}"/>`;
    }
    d += `<path d="M${f(xb)} ${CY - 13}L${f(xb - dir * 10)} ${CY}L${f(xb)} ${CY + 13}Z" style="fill:var(--preset-deep)"/>`;
    return d;
  };
  b += side(1) + side(-1);
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

  // small pieces where the mitres meet the frame: a quarter fan in each corner
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) {
    const r = phone ? 64 : 48;
    let q = `<path d="M${cx} ${cy}L${cx + sx * r} ${cy}A${r} ${r} 0 0 ${sx * sy > 0 ? 1 : 0} ${cx} ${cy + sy * r}Z" style="fill:var(--card-bg)" ${st(STRUCT * .8, .8)}/>`;
    for (let a = 15; a < 90; a += 15) { const t = a * Math.PI / 180; q += L(cx + sx * r * .35 * Math.cos(t), cy + sy * r * .35 * Math.sin(t), cx + sx * r * Math.cos(t), cy + sy * r * Math.sin(t), FINE + .05, .5); }
    b += q;
  }
  // ── the window: cut clean, its edge echoed once
  b += `<path d="M${pts(win(E))}Z" style="fill:var(--card-bg)" ${st(STRUCT * .7, .8)}/>`;
  b += `<path d="M${pts(win(0))}Z" ${st(.62)}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${b}</svg>`;
}
module.exports = { 'network': build };
