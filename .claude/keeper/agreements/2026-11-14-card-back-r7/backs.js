// Round 7: four directions, each built on a different principle. Field 1640 x 1000 fills the frame's inner line.
// All follow what the owner's references share: nothing floats, one figure edge to edge, lines echo
// the shape beside them, three weights, each area its own fill, the window is the shape the design leaves.
const W = 1640, H = 1000, CX = 820, CY = 500;
const GOLD = '#c9a84c';
const f = n => n.toFixed(1);
const pts = a => a.map(p => `${f(p[0])} ${f(p[1])}`).join('L');
const svg = b => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${b}</svg>`;
const kit = w0 => { const w = w0 * .7; return {
  st: (op, sw = 1) => `stroke="${GOLD}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${w * sw}"`,
  L(x1, y1, x2, y2, op, sw) { return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" ${this.st(op, sw)}/>`; },
}; };
const fan = (k, cx, cy, r, a0, a1, step, op = .3) => {   // a small sunrise: filled half, arcs, rays
  const P = (a, rr) => [cx + rr * Math.cos(a * Math.PI / 180), cy + rr * Math.sin(a * Math.PI / 180)];
  let s = `<path d="M${cx} ${cy}L${f(P(a0, r)[0])} ${f(P(a0, r)[1])}A${r} ${r} 0 0 1 ${f(P(a1, r)[0])} ${f(P(a1, r)[1])}Z" style="fill:var(--card-bg)"/>`;
  s += `<path d="M${cx} ${cy}L${f(P(a0, r)[0])} ${f(P(a0, r)[1])}A${r} ${r} 0 0 1 ${f(P(a1, r)[0])} ${f(P(a1, r)[1])}Z" fill="${GOLD}" fill-opacity=".06" ${k.st(op, .8)}/>`;
  s += `<path d="M${f(P(a0, r * .6)[0])} ${f(P(a0, r * .6)[1])}A${r * .6} ${r * .6} 0 0 1 ${f(P(a1, r * .6)[0])} ${f(P(a1, r * .6)[1])}" ${k.st(op * .7, .6)}/>`;
  for (let a = a0 + step; a < a1 - .01; a += step) s += k.L(...P(a, r * .6), ...P(a, r), op * .55, .5);
  s += `<circle cx="${cx}" cy="${cy}" r="${r * .16}" fill="${GOLD}" fill-opacity=".45"/>`;
  return s;
};
const stone = (x, y, r, op) => `<path d="M${f(x)} ${f(y - r)}L${f(x + r * .75)} ${f(y)}L${f(x)} ${f(y + r)}L${f(x - r * .75)} ${f(y)}Z" fill="${GOLD}" fill-opacity="${op}"/>`;
const STRUCT = .38, FILL = .15, FINE = .1;
let uid = 0;

// B · Stepped portals: the window is the innermost of nested stepped gateways; the bands between them
// alternate fills and dark, and the outer gateways run off into the frame.
function portals(w, phone) {
  const k = kit(w), g = phone ? 52 : 36;
  const P = e => {
    const xa = 392 - e, xb = 560 - e, xc = 700 - e, yo = 262 - e, ym = 222 - e, yc = 182 - e;
    const top = [[xa, yo], [xb, yo], [xb, ym], [xc, ym], [xc, yc], [W - xc, yc], [W - xc, ym], [W - xb, ym], [W - xb, yo], [W - xa, yo]];
    const bot = top.slice().reverse().map(p => [p[0], H - p[1]]);
    return top.concat(bot);
  };
  const id = 'pt' + (uid++);
  let b = '', defs = '';
  const n = Math.ceil(420 / g) + 1;
  const fills = ['v', '', 'd', '', 'h', ''];
  for (let i = 0; i < n; i++) {
    const kind = fills[i % fills.length];
    if (!kind) { defs += `<clipPath id="${id}${i}"><path clip-rule="evenodd" d="M${pts(P((i + 1) * g))}Z M${pts(P(i * g))}Z"/></clipPath>`; b += `<g clip-path="url(#${id}${i})"><rect width="${W}" height="${H}" fill="${GOLD}" fill-opacity="${i % 4 === 1 ? .055 : .025}"/></g>`; continue; }
    defs += `<clipPath id="${id}${i}"><path clip-rule="evenodd" d="M${pts(P((i + 1) * g))}Z M${pts(P(i * g))}Z"/></clipPath>`;
    let fl = '';
    const s = (phone ? 15 : 10);
    if (kind === 'v') for (let x = 0; x <= W; x += s) fl += k.L(x, 0, x, H, FILL, .6);
    if (kind === 'h') for (let y = 0; y <= H; y += s) fl += k.L(0, y, W, y, FILL, .6);
    if (kind === 'd') for (let c = -H; c <= W; c += s * 1.3) fl += k.L(c, 0, c + H, H, FINE, .6) + k.L(c + H, 0, c, H, FINE, .6);
    b += `<g clip-path="url(#${id}${i})">${fl}</g>`;
  }
  for (let i = n; i >= 0; i--) b += `<path d="M${pts(P(i * g))}Z" ${k.st(i === 0 ? .62 : STRUCT * (i % 2 ? .7 : 1), i ? .8 : 1)}/>`;
  // the centre line: a stone on each side where the gateways' sides cross it
  for (const x of [392 - n * g, W - 392 + n * g]) void x;
  for (let i = 1; i <= n; i += 2) for (const s of [-1, 1]) {
    const x = CX + s * (W / 2 - 392 + i * g);
    if (x > 0 && x < W) b += stone(x, CY, i % 4 === 1 ? 13 : 7, i % 4 === 1 ? .5 : .3);
  }
  for (const [cy, a0] of [[0, 0], [H, 180]]) b += fan(k, CX, cy, phone ? 120 : 96, a0, a0 + 180, phone ? 22.5 : 15, .38);
  for (const [cx, cy, a0] of [[0, 0, 0], [W, 0, 90], [W, H, 180], [0, H, 270]]) b += fan(k, cx, cy, phone ? 70 : 52, a0, a0 + 90, 18, .32);
  b += `<path d="M${pts(P(0))}Z" style="fill:var(--card-bg)" ${k.st(.55)}/>`;
  return svg(`<defs>${defs}</defs>${b}`);
}

// C · Two great circles: one rising from below the card, one hanging from above. The window is where
// they overlap; their rings run outward and cross into a net of curved cells, their rays cross them.
function circles(w, phone) {
  const k = kit(w), R = 650, d = 330, gap = phone ? 54 : 36;
  const cA = [CX, CY + d], cB = [CX, CY - d];        // A gives the window's top edge, B its bottom edge
  const lens = `M${CX - Math.sqrt(R * R - d * d)} ${CY}A${R} ${R} 0 0 1 ${CX + Math.sqrt(R * R - d * d)} ${CY}A${R} ${R} 0 0 1 ${CX - Math.sqrt(R * R - d * d)} ${CY}Z`;
  const id = 'cc' + (uid++);
  let rings = '';
  for (let r = R + gap; r < R + 1100; r += gap) {
    const i = Math.round((r - R) / gap);
    for (const c of [cA, cB]) {
      if (i % 3 === 1) rings += `<circle cx="${c[0]}" cy="${c[1]}" r="${r + gap / 2}" fill="none" stroke="${GOLD}" stroke-opacity=".035" stroke-width="${gap}"/>`;
      rings += `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" ${k.st(i % 3 === 0 ? STRUCT * .8 : FILL, i % 3 === 0 ? .8 : .6)}/>`;
    }
    if (i <= 4) for (let a = -84; a <= 84; a += (phone ? 20 : 12)) for (const [c, sg] of [[cA, -1], [cB, 1]]) {
      const t = a * Math.PI / 180; rings += `<circle cx="${f(c[0] + r * Math.sin(t))}" cy="${f(c[1] + sg * r * Math.cos(t))}" r="${i % 2 ? 2.4 : 4}" fill="${GOLD}" fill-opacity="${i % 2 ? .3 : .45}"/>`;
    }
  }
  let rays = '';
  const step = phone ? 10 : 6;
  for (let a = -90 + step / 2; a < 90; a += step) {
    for (const [c, s] of [[cA, -1], [cB, 1]]) {
      const t = a * Math.PI / 180;
      rays += k.L(c[0] + R * Math.sin(t), c[1] + s * R * Math.cos(t), c[0] + 2000 * Math.sin(t), c[1] + s * 2000 * Math.cos(t), FINE, .55);
    }
  }
  let b = `<defs><clipPath id="${id}"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${lens}"/></clipPath></defs>`;
  b += `<g clip-path="url(#${id})">${rays}${rings}</g>`;
  // the window's edge, doubled
  b += `<path d="${lens}" style="fill:var(--card-bg)" ${k.st(.62)}/>`;
  const R2 = R - 20, hw2 = Math.sqrt(R2 * R2 - (d) * (d));
  b += `<path d="M${CX - hw2} ${CY}A${R2} ${R2} 0 0 1 ${CX + hw2} ${CY}A${R2} ${R2} 0 0 1 ${CX - hw2} ${CY}Z" ${k.st(.35, .7)}/>`;
  // from each point of the window, a bundle runs level to the frame, with a stone where it starts
  const tip = Math.sqrt(R * R - d * d);
  for (const s of [-1, 1]) {
    const x0 = CX + s * tip;
    b += `<path d="M${f(x0 + s * 6)} ${CY - 34}L${f(x0 + s * 6)} ${CY + 34}L${f(s > 0 ? W : 0)} ${CY + 34}L${f(s > 0 ? W : 0)} ${CY - 34}Z" style="fill:var(--card-bg)"/>`;
    for (const o of [-24, 0, 24]) b += k.L(x0 + s * (phone ? 74 : 56), CY + o, s > 0 ? W : 0, CY + o, o ? STRUCT * .7 : STRUCT, o ? .7 : 1);
    b += fan(k, x0, CY, phone ? 74 : 56, s > 0 ? -90 : 90, s > 0 ? 90 : 270, 20, .4);
    b += stone(x0 + s * 2, CY, 9, .9).replace('fill="#c9a84c"', 'style="fill:var(--preset-deep)"');
    for (let j = 1; j <= 3; j++) b += `<circle cx="${f(x0 + s * (90 + j * (phone ? 70 : 60)))}" cy="${CY}" r="${j === 2 ? 6 : 3.5}" fill="${GOLD}" fill-opacity=".5"/>`;
  }
  return svg(b);
}

// D · Streams: lines enter level from both sides and part around the window at forty-five degrees,
// each one parallel to the next. The window is the space they leave open.
function streams(w, phone) {
  const k = kit(w), g = phone ? 30 : 20, XB = 212, Y0 = 200, MID = 22;
  const n = Math.ceil(520 / g);
  const tan = Math.tan(Math.PI / 8);
  let b = '';
  const path = (i, s) => {
    const y = CY - s * (MID + i * g), yt = CY - s * (CY - Y0 + i * g), xb = XB - i * g * tan;
    const climb = Math.abs(y - yt);
    return `M0 ${f(y)}L${f(xb)} ${f(y)}L${f(xb + climb)} ${f(yt)}L${f(W - xb - climb)} ${f(yt)}L${f(W - xb)} ${f(y)}L${W} ${f(y)}`;
  };
  for (let i = 0; i < n; i += 4) for (const s of [1, -1]) {
    const band = `M${path(i, s).slice(1)}L${W} ${f(CY - s * (MID + (i + 2) * g))}` ;
    void band;
  }
  for (const s of [1, -1]) for (let i = 1; i < n; i += 4) {
    const a = path(i, s), c = path(i + 2, s).replace('M', 'L').split('L').slice(1).reverse().join('L');
    b += `<path d="${a}L${c}Z" fill="${GOLD}" fill-opacity="${i % 8 === 1 ? .05 : .028}"/>`;
  }
  for (let i = n; i >= 0; i--) for (const s of [1, -1]) {
    const op = i === 0 ? .62 : i % 4 === 0 ? STRUCT * .8 : FILL;
    b += `<path d="${path(i, s)}" ${k.st(op, i === 0 ? 1 : i % 4 === 0 ? .8 : .6)}/>`;
  }
  // the parting: a chain of stones on the centre line, from the frame to the window's point
  for (let x = 30, j = 0; x < XB - 20; x += phone ? 54 : 40, j++) for (const xx of [x, W - x]) {
    b += j % 3 === 1 ? stone(xx, CY, 11, .5) : `<circle cx="${f(xx)}" cy="${CY}" r="${j % 3 ? 3 : 4.5}" fill="${GOLD}" fill-opacity=".4"/>`;
  }
  // where the streams turn, a tie across them: short rungs that mark each bend
  for (const sx of [1, -1]) for (const s of [1, -1]) {
    for (let i = 0; i <= n; i += 2) {
      const y = CY - s * (MID + i * g), xb = XB - i * g * tan, x = sx > 0 ? xb : W - xb;
      if (y > 0 && y < H) b += `<circle cx="${f(x)}" cy="${f(y)}" r="${phone ? 4.5 : 3.2}" fill="${GOLD}" fill-opacity=".45"/>`;
    }
  }
  for (const [cy, a0] of [[Y0, 180], [H - Y0, 0]]) b += fan(k, CX, cy, phone ? 110 : 88, a0, a0 + 180, phone ? 22.5 : 15, .42);
  b += `<path d="M${f(XB + 4)} ${CY - 12}L${f(XB + 22)} ${CY}L${f(XB + 4)} ${CY + 12}L${f(XB - 14)} ${CY}Z" style="fill:var(--preset-deep)" ${k.st(.7, .8)}/>`;
  b += `<path d="M${f(W - XB - 4)} ${CY - 12}L${f(W - XB - 22)} ${CY}L${f(W - XB - 4)} ${CY + 12}L${f(W - XB + 14)} ${CY}Z" style="fill:var(--preset-deep)" ${k.st(.7, .8)}/>`;
  return svg(b);
}

const network = require('./backs-frames.js').network;
module.exports = { 'a-frames': network, 'b-portals': portals, 'c-circles': circles, 'd-streams': streams };
