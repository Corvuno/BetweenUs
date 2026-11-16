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
const AMETHYST = '#7a4a9e', PETROL = '#2a7a78';
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
function circles(w, phone, C1 = AMETHYST, C2 = PETROL) {
  const k = kit(w), R = 650, d = 330, gap = phone ? 54 : 36;
  const cA = [CX, CY + d], cB = [CX, CY - d];        // A gives the window's top edge, B its bottom edge
  const lens = `M${CX - Math.sqrt(R * R - d * d)} ${CY}A${R} ${R} 0 0 1 ${CX + Math.sqrt(R * R - d * d)} ${CY}A${R} ${R} 0 0 1 ${CX - Math.sqrt(R * R - d * d)} ${CY}Z`;
  const id = 'cc' + (uid++);
  let rings = '';
  for (let r = R + gap; r < R + 1100; r += gap) {
    const i = Math.round((r - R) / gap);
    for (const c of [cA, cB]) {
      if (i % 3 === 1) rings += `<circle cx="${c[0]}" cy="${c[1]}" r="${r + gap / 2}" fill="none" stroke="${C1}" stroke-opacity=".09" stroke-width="${gap}"/>`;
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
  let b = `<defs><clipPath id="${id}"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${lens}"/></clipPath>
    <radialGradient id="${id}gA" gradientUnits="userSpaceOnUse" cx="${cA[0]}" cy="${cA[1]}" r="${R + 760}"><stop offset="${f(R / (R + 760))}" stop-color="${C1}" stop-opacity="0"/><stop offset="1" stop-color="${C1}" stop-opacity=".26"/></radialGradient>
    <radialGradient id="${id}gB" gradientUnits="userSpaceOnUse" cx="${cB[0]}" cy="${cB[1]}" r="${R + 760}"><stop offset="${f(R / (R + 760))}" stop-color="${C1}" stop-opacity="0"/><stop offset="1" stop-color="${C1}" stop-opacity=".26"/></radialGradient></defs>`;
  b += `<g clip-path="url(#${id})"><rect width="${W}" height="${H}" fill="url(#${id}gA)"/><rect width="${W}" height="${H}" fill="url(#${id}gB)"/>${rays}${rings}</g>`;
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
    b += stone(x0 + s * 2, CY, 9, .95).replace('fill="#c9a84c"', `fill="${C2}"`);
    for (let j = 1; j <= 3; j++) b += `<circle cx="${f(x0 + s * (90 + j * (phone ? 70 : 60)))}" cy="${CY}" r="${j === 2 ? 6 : 3.5}" fill="${GOLD}" fill-opacity=".5"/>`;
  }
  return svg(b);
}

// D · Streams: lines enter level from both sides and part around the window at forty-five degrees,
// each one parallel to the next. The window is the space they leave open.
function streams(w, phone, C1 = PETROL, C2 = AMETHYST) {
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
    b += `<path d="${a}L${c}Z" fill="${C1}" fill-opacity="${f(.05 + .22 * i / n)}"/>`;
  }
  for (let i = n; i >= 0; i--) for (const s of [1, -1]) {
    const op = i === 0 ? .62 : i % 4 === 0 ? STRUCT * .8 : FILL;
    b += `<path d="${path(i, s)}" ${k.st(op, i === 0 ? 1 : i % 4 === 0 ? .8 : .6)}/>`;
  }
  // the parting: a chain of stones on the centre line, from the frame to the window's point
  for (let x = 30, j = 0; x < XB - 20; x += phone ? 54 : 40, j++) for (const xx of [x, W - x]) {
    b += j % 3 === 1 ? stone(xx, CY, 11, .85).replace('fill="#c9a84c"', `fill="${C2}"`) : `<circle cx="${f(xx)}" cy="${CY}" r="${j % 3 ? 3 : 4.5}" fill="${GOLD}" fill-opacity=".4"/>`;
  }
  // where the streams turn, a tie across them: short rungs that mark each bend
  for (const sx of [1, -1]) for (const s of [1, -1]) {
    for (let i = 0; i <= n; i += 2) {
      const y = CY - s * (MID + i * g), xb = XB - i * g * tan, x = sx > 0 ? xb : W - xb;
      if (y > 0 && y < H) b += `<circle cx="${f(x)}" cy="${f(y)}" r="${phone ? 4.5 : 3.2}" fill="${GOLD}" fill-opacity=".45"/>`;
    }
  }
  for (const [cy, a0] of [[Y0, 180], [H - Y0, 0]]) b += fan(k, CX, cy, phone ? 110 : 88, a0, a0 + 180, phone ? 22.5 : 15, .42);
  b += `<path d="M${f(XB + 4)} ${CY - 12}L${f(XB + 22)} ${CY}L${f(XB + 4)} ${CY + 12}L${f(XB - 14)} ${CY}Z" fill="${C2}" ${k.st(.7, .8)}/>`;
  b += `<path d="M${f(W - XB - 4)} ${CY - 12}L${f(W - XB - 22)} ${CY}L${f(W - XB - 4)} ${CY + 12}L${f(W - XB + 14)} ${CY}Z" fill="${C2}" ${k.st(.7, .8)}/>`;
  b = b.replace(/stone\(/g, 'stone(');
  return svg(b);
}

function fourCircles(w, phone, C1 = AMETHYST, C2 = PETROL) {
  // the two great circles of 3 (above and below, amethyst) and one from each side (petrol) that cuts off
  // the eye's points: the window is what lies inside the first two and outside the side ones.
  const k = kit(w), R = 650, d = 330, gap = phone ? 50 : 34;
  const RS = 900, DS = 560;
  const cA = [CX, CY + d], cB = [CX, CY - d], cL = [-DS, CY], cR = [W + DS, CY];
  const id = 'fc' + (uid++);
  const tip = Math.sqrt(R * R - d * d);
  const lens = `M${CX - tip} ${CY}A${R} ${R} 0 0 1 ${CX + tip} ${CY}A${R} ${R} 0 0 1 ${CX - tip} ${CY}Z`;
  let defs = `<clipPath id="${id}o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${lens}"/></clipPath>`;
  for (const [j, c] of [cA, cB].entries()) defs += `<radialGradient id="${id}g${j}" gradientUnits="userSpaceOnUse" cx="${c[0]}" cy="${c[1]}" r="${R + 760}"><stop offset="${f(R / (R + 760))}" stop-color="${C1}" stop-opacity="0"/><stop offset="1" stop-color="${C1}" stop-opacity=".26"/></radialGradient>`;
  for (const [j, c] of [cL, cR].entries()) {
    defs += `<radialGradient id="${id}s${j}" gradientUnits="userSpaceOnUse" cx="${c[0]}" cy="${c[1]}" r="${RS}"><stop offset="${f((RS - 420) / RS)}" stop-color="${C2}" stop-opacity=".3"/><stop offset="1" stop-color="${C2}" stop-opacity=".04"/></radialGradient>`;
    defs += `<clipPath id="${id}c${j}"><circle cx="${c[0]}" cy="${c[1]}" r="${RS}"/></clipPath>`;
  }
  let b = '';
  // the two great circles: gradient, rays and rings outside the lens, as in 3
  let g = `<rect width="${W}" height="${H}" fill="url(#${id}g0)"/><rect width="${W}" height="${H}" fill="url(#${id}g1)"/>`;
  const step = phone ? 10 : 6;
  for (let a = -90 + step / 2; a < 90; a += step) for (const [c, s] of [[cA, -1], [cB, 1]]) {
    const t = a * Math.PI / 180;
    g += k.L(c[0] + R * Math.sin(t), c[1] + s * R * Math.cos(t), c[0] + 2000 * Math.sin(t), c[1] + s * 2000 * Math.cos(t), FINE, .55);
  }
  for (let r = R + gap, i = 1; r < R + 1100; r += gap, i++) for (const c of [cA, cB]) {
    if (i % 3 === 1) g += `<circle cx="${c[0]}" cy="${c[1]}" r="${r + gap / 2}" fill="none" stroke="${C1}" stroke-opacity=".09" stroke-width="${gap}"/>`;
    g += `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" ${k.st(i % 3 === 0 ? STRUCT * .8 : FILL, i % 3 === 0 ? .8 : .6)}/>`;
  }
  b += `<g clip-path="url(#${id}o)">${g}</g>`;
  b += `<path d="${lens}" style="fill:var(--card-bg)"/>`;
  // the side circles: laid over everything, their rings crossing the great circles' rings and the lens
  for (const [j, c] of [cL, cR].entries()) {
    let s = `<rect width="${W}" height="${H}" fill="url(#${id}s${j})"/>`;
    for (let r = RS - gap, i = 1; r > RS - 640; r -= gap, i++) {
      if (i % 3 === 2) s += `<circle cx="${c[0]}" cy="${c[1]}" r="${r + gap / 2}" fill="none" stroke="${C2}" stroke-opacity=".1" stroke-width="${gap}"/>`;
      s += `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" ${k.st(i % 3 === 0 ? STRUCT * .8 : FILL, i % 3 === 0 ? .8 : .6)}/>`;
    }
    const n = phone ? 12 : 20, base = j === 0 ? 0 : 180;
    for (let a = -36; a <= 36.01; a += 72 / n) { const t = (base + a) * Math.PI / 180; s += k.L(c[0] + (RS - 640) * Math.cos(t), c[1] + (RS - 640) * Math.sin(t), c[0] + RS * Math.cos(t), c[1] + RS * Math.sin(t), FINE, .5); }
    b += `<g clip-path="url(#${id}c${j})">${s}</g>`;
  }
  // every edge drawn whole, so the lens and the side circles cross each other
  b += `<clipPath id="${id}x"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z M${cL[0] - RS} ${CY}a${RS} ${RS} 0 1 0 ${2 * RS} 0a${RS} ${RS} 0 1 0 ${-2 * RS} 0Z M${cR[0] - RS} ${CY}a${RS} ${RS} 0 1 0 ${2 * RS} 0a${RS} ${RS} 0 1 0 ${-2 * RS} 0Z"/></clipPath>`;
  b += `<g clip-path="url(#${id}x)"><path d="${lens}" ${k.st(.55)}/></g>`;
  for (const c of [cL, cR]) b += `<circle cx="${c[0]}" cy="${c[1]}" r="${RS}" ${k.st(.5)}/><circle cx="${c[0]}" cy="${c[1]}" r="${RS + 16}" ${k.st(.28, .6)}/>`;
  // the window's four corners, where a side circle meets the lens: a stone on each
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const c = sy < 0 ? cA : cB, cs = sx < 0 ? cL : cR;
    let best = null;
    for (let x = CX - tip; x <= CX + tip; x += .5) {
      const y = c[1] + (sy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, R * R - (x - c[0]) ** 2));
      const e = Math.abs(Math.hypot(x - cs[0], y - cs[1]) - RS);
      if ((sx < 0 ? x < CX : x > CX) && (!best || e < best[2])) best = [x, y, e];
    }
    b += stone(best[0], best[1], 11, .8);
  }
  // on the middle of each side's arc, a small fan opening into the window's side, its stone in amethyst
  for (const [j, c] of [cL, cR].entries()) {
    const x = c[0] + (j ? -RS : RS);
    b += fan(k, x, CY, phone ? 60 : 44, j ? 90 : -90, j ? 270 : 90, 22.5, .42).replace(/fill-opacity=".06"/, `fill-opacity=".18" style="fill:${C2}"`);
    b += stone(x, CY, 8, .95).replace('fill="#c9a84c"', `fill="${C1}"`);
  }
  return svg(`<defs>${defs}</defs>${b}`);
}

function streamsCross(w, phone, CA = PETROL, CB = AMETHYST) {
  // two stream systems that cross: A enters from the sides and parts above and below the window;
  // B enters from top and bottom and parts to the sides. The window is the space both leave open.
  // A's shaded bands are petrol, B's amethyst; where they cross the cell stays dark.
  const k = kit(w), g = phone ? 30 : 20, tan = Math.tan(Math.PI / 8);
  const MID = 22, XB = 212, Y0 = 200;                  // A
  const MIDB = 22, HB = 520, YB = -58;                 // B
  const nA = Math.ceil(520 / g), nB = Math.ceil(720 / g);
  const id = 'sx' + (uid++);
  const ptsA = (i, s) => {
    const y = CY - s * (MID + i * g), yt = CY - s * (CY - Y0 + i * g), xb = XB - i * g * tan, climb = Math.abs(y - yt);
    return [[0, y], [xb, y], [xb + climb, yt], [W - xb - climb, yt], [W - xb, y], [W, y]];
  };
  const ptsB = (i, s) => {
    const x = CX + s * (MIDB + i * g), xs = CX + s * (HB + i * g), yb = YB - i * g * tan, climb = Math.abs(xs - x);
    return [[x, -2000], [x, yb], [xs, yb + climb], [xs, H - yb - climb], [x, H - yb], [x, H + 2000]];
  };
  const d = a => 'M' + pts(a);
  const band = (P, i, s) => d(P(i, s).concat(P(i + 2, s).slice().reverse())) + 'Z';
  let bandsA = '', bandsB = '';
  for (const s of [1, -1]) {
    for (let i = 1; i < nA; i += 4) bandsA += band(ptsA, i, s) + ' ';
    for (let i = 1; i < nB; i += 4) bandsB += band(ptsB, i, s) + ' ';
  }
  let b = `<defs>
    <clipPath id="${id}na"><path clip-rule="evenodd" d="M-10 -10H${W + 10}V${H + 10}H-10Z ${bandsB}"/></clipPath>
    <clipPath id="${id}nb"><path clip-rule="evenodd" d="M-10 -10H${W + 10}V${H + 10}H-10Z ${bandsA}"/></clipPath></defs>`;
  // the shades: each colour only where the other is not
  for (const s of [1, -1]) {
    for (let i = 1; i < nA; i += 4) b += `<g clip-path="url(#${id}na)"><path d="${band(ptsA, i, s)}" fill="${CA}" fill-opacity="${f(.06 + .2 * i / nA)}"/></g>`;
    for (let i = 1; i < nB; i += 4) b += `<g clip-path="url(#${id}nb)"><path d="${band(ptsB, i, s)}" fill="${CB}" fill-opacity="${f(.07 + .22 * i / nB)}"/></g>`;
  }
  // the lines: B under A, both quiet; every fourth a little stronger
  for (let i = nB; i >= 0; i--) for (const s of [1, -1]) b += `<path d="${d(ptsB(i, s))}" ${k.st(i === 0 ? .5 : i % 4 === 0 ? STRUCT * .7 : FILL * .85, i === 0 ? .9 : .6)}/>`;
  for (let i = nA; i >= 0; i--) for (const s of [1, -1]) b += `<path d="${d(ptsA(i, s))}" ${k.st(i === 0 ? .5 : i % 4 === 0 ? STRUCT * .8 : FILL, i === 0 ? .9 : .6)}/>`;
  // the window: inside both systems' innermost lines
  const tA = CY - Y0 - MID;                            // A's climb for the innermost line
  const xTop = CX - MIDB - (Y0 - YB);                  // where B's diagonal meets A's top flat
  const win = [[xTop, Y0], [W - xTop, Y0], [CX + HB, YB + HB - MIDB], [CX + HB, H - (YB + HB - MIDB)], [W - xTop, H - Y0], [xTop, H - Y0], [CX - HB, H - (YB + HB - MIDB)], [CX - HB, YB + HB - MIDB]];
  void tA;
  b += `<path d="M${pts(win)}Z" style="fill:var(--card-bg)" ${k.st(.6)}/>`;
  // small pieces: a fan on the window's top and bottom, stones where the window's corners are, dots on crossings near it
  for (const [cy, a0] of [[Y0, 180], [H - Y0, 0]]) b += fan(k, CX, cy, phone ? 96 : 76, a0, a0 + 180, phone ? 22.5 : 15, .42);
  win.forEach(([x, y], j) => { b += stone(x, y, j % 2 ? 8 : 11, .9).replace('fill="#c9a84c"', `fill="${j < 2 || (j > 3 && j < 6) ? CB : CA}"`); });
  for (const s of [1, -1]) for (let i = 2; i <= 6; i += 2) {
    const yA = CY - s * (MID + i * g), xs = CX + (HB + i * g);
    for (const x of [xs, W - xs]) b += `<circle cx="${f(x)}" cy="${f(yA)}" r="${phone ? 4 : 3}" fill="#c9a84c" fill-opacity=".5"/>`;
  }
  return svg(b);
}

const network = require('./backs-frames.js').network;
module.exports = { 'streams-cross': streamsCross, 'streams-cross-petrol': (w, p) => streamsCross(w, p, PETROL, PETROL) };
