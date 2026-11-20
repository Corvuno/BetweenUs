// Start card back, round 7 (#195): set 1, rounds 4 and 5 in their own shapes with every line running on straight through the crossings; set 2, card backs built from the techno card, the mystic box and the Egyptian backs. Earlier rounds kept below for reference.
// Round 2 header follows. Five options, each a drawing in the 1640 x 1000 field that fills the
// frame's inner line (as the live back). Centred and mirrored like today; the window is the door the
// start words name; three layers (bold gold structure, fine gold lines, dark shaded or hatched areas);
// one area, one colour (petrol and amethyst, rose only in 1); every line ends on the frame or a line.
// Arrival: lines draw in from the frame toward the door (class d, ordered by --i), areas fade in after.
const W = 1640, H = 1000, CX = 820, CY = 500;
const GOLD = '#c9a84c', PETROL = '#2a7a78', AMETHYST = '#7a4a9e', ROSE = '#b0587e';
const f = n => (+n).toFixed(1);
const STRUCT = .62, MID = .34, FINE = .17;

function kit(phone) {
  const w = (phone ? 1.1 : 1.5) * .7;
  return {
    st: (op, sw = 1, col = GOLD) => `stroke="${col}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${f(w * sw)}"`,
    path(d, op, sw, i = 0, col) { return `<path class="d" style="--i:${i}" pathLength="1" d="${d}" ${this.st(op, sw, col)}/>`; },
  };
}
const area = (d, col, op, i = 0, extra = '') => `<path class="a" style="--i:${i}" d="${d}" fill="${col}" fill-opacity="${f(op)}" ${extra}/>`;
const svg = (b, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>${defs}</defs>${b}</svg>`;

// polyline with each corner rounded by its own radius (r[k] for vertex k); returns path data
function rounded(P, r) {
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let k = 1; k < P.length - 1; k++) {
    const [a, b, c] = [P[k - 1], P[k], P[k + 1]];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v);
    const cos = (u[0] * v[0] + u[1] * v[1]) / (lu * lv), th = Math.acos(Math.max(-1, Math.min(1, cos)));
    const rr = r[k] || 0;
    if (rr <= 0 || th > Math.PI - 1e-3) { d += `L${f(b[0])} ${f(b[1])}`; continue; }
    let t = rr / Math.tan(th / 2); t = Math.min(t, lu * .5, lv * .5);
    const rad = t * Math.tan(th / 2);
    const p1 = [b[0] + u[0] / lu * t, b[1] + u[1] / lu * t], p2 = [b[0] + v[0] / lv * t, b[1] + v[1] / lv * t];
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    d += `L${f(p1[0])} ${f(p1[1])}A${f(rad)} ${f(rad)} 0 0 ${cross > 0 ? 1 : 0} ${f(p2[0])} ${f(p2[1])}`;
  }
  const z = P[P.length - 1];
  return d + `L${f(z[0])} ${f(z[1])}`;
}
const mir = P => P.map(p => [W - p[0], p[1]]);
const flip = P => P.map(p => [p[0], H - p[1]]);
const rev = d => d; // paths are drawn from the frame inward by construction

// a half sun on the door's edge: filled half, inner arc, rays, a stone
function fan(k, cx, cy, r, up, step, i) {
  const s = up ? -1 : 1;
  const P = (a, rr) => [cx + rr * Math.cos(a), cy + s * rr * Math.sin(a)];
  const arc = rr => `M${f(P(Math.PI, rr)[0])} ${f(P(Math.PI, rr)[1])}A${rr} ${rr} 0 0 ${up ? 1 : 0} ${f(P(0, rr)[0])} ${f(P(0, rr)[1])}`;
  let b = `<path d="${arc(r)}Z" style="fill:var(--card-bg)"/>` + area(arc(r) + 'Z', GOLD, .06, i);
  b += k.path(arc(r), .42, .8, i) + k.path(arc(r * .6), .3, .6, i);
  for (let a = step; a < Math.PI - .01; a += step) b += k.path(`M${f(P(a, r * .6)[0])} ${f(P(a, r * .6)[1])}L${f(P(a, r)[0])} ${f(P(a, r)[1])}`, .24, .5, i);
  b += `<circle class="a" style="--i:${i}" cx="${cx}" cy="${cy}" r="${f(r * .16)}" fill="${GOLD}" fill-opacity=".45"/>`;
  return b;
}

// 1 · Your notes. Two streams: petrol from the sides, amethyst from top and bottom. Uneven spacing,
// rounded turns, no dots; they cross in the corners, and rose fills the band where they reach the door.
function notes(phone) {
  const k = kit(phone);
  const DL = 330, DR = W - DL, DT = 205, DB = H - DT, RD = 150;
  const offs = phone ? [26, 44, 58, 92, 108, 150, 168, 214, 240, 300] : [20, 34, 44, 70, 82, 112, 124, 158, 176, 218, 236, 290, 312];
  let b = '', defs = '';
  const door = rounded([[CX, DT], [DR, DT], [DR, DB], [DL, DB], [DL, DT], [CX, DT]], [0, RD, RD, RD, RD, 0]);
  // side stream: from the left edge, turn and hug the door's left side, meet its mirror on the centre line
  const side = (o, j) => { const x = DL - o, yIn = DT - 40 - o * 1.25 + (j % 3) * 14; return [[0, yIn], [x - 60, yIn], [x, yIn + 80], [x, CY]]; };
  const top = (o, j) => { const y = DT - o, xIn = DL + 70 - o * 1.5 + (j % 2) * 18; return [[xIn, 0], [xIn, y - 40], [xIn + 70, y], [CX, y]]; };
  const lines = [];
  offs.forEach((o, j) => {
    const sw = j % 4 === 3 ? 1.6 : j === 0 ? 1 : .6, op = j % 4 === 3 ? MID : j === 0 ? .5 : FINE + .06;
    const S = side(o, j), T = top(o, j);
    const rs = [0, 60, 90, 0], rt = [0, 60, 80, 0];
    for (const P of [S, flip(S), mir(S), flip(mir(S))]) lines.push([rounded(P, rs), op, sw, j, PETROL]);
    for (const P of [T, flip(T), mir(T), flip(mir(T))]) lines.push([rounded(P, rt), op, sw, j, AMETHYST]);
  });
  // areas: a band between two lines of one stream, drawn as a wide stroke along their middle so it turns
  // with them; petrol for the side streams, amethyst for top and bottom, kept out of each other's way:
  // the amethyst bands only above and below the door, so the corners where the lines cross stay dark
  defs += `<clipPath id="n1t"><rect x="${DL}" y="0" width="${DR - DL}" height="${H}"/></clipPath>`;
  let sa = '', ta = '';
  const band = (d, col, wdt, op) => `<path class="a" style="--i:6" d="${d}" fill="none" stroke="${col}" stroke-opacity="${f(op)}" stroke-width="${f(wdt)}"/>`;
  for (let j = 1; j + 1 < offs.length; j += 3) {
    const o1 = offs[j], o2 = offs[j + 1], om = (o1 + o2) / 2, op = .14 + .16 * j / offs.length;
    const S = side(om, j), T = top(om, j);
    for (const P of [S, flip(S), mir(S), flip(mir(S))]) sa += band(rounded(P, [0, 60, 90, 0]), PETROL, o2 - o1, op);
    for (const P of [T, flip(T), mir(T), flip(mir(T))]) ta += band(rounded(P, [0, 60, 80, 0]), AMETHYST, o2 - o1, op);
  }
  b += sa + `<g clip-path="url(#n1t)">${ta}</g>`;
  const ring = rounded([[CX, DT - offs[0]], [DR + offs[0], DT - offs[0]], [DR + offs[0], DB + offs[0]], [DL - offs[0], DB + offs[0]], [DL - offs[0], DT - offs[0]], [CX, DT - offs[0]]], [0, RD + offs[0], RD + offs[0], RD + offs[0], RD + offs[0], 0]);
  b += area(`${ring}Z ${door}Z`, ROSE, .2, 7, 'fill-rule="evenodd"');
  // lines: gold, the colour only as the area beside them
  for (const [d, op, sw, j] of lines) b += k.path(d, op, sw, offs.length - j);
  b += `<path d="${door}Z" style="fill:var(--card-bg)"/>` + k.path(door + 'Z', STRUCT, 1, 0);
  return svg(b, defs);
}

// 2 · Streamline. Today's bundles, but every turn is rounded, the lines turning together round one
// centre like the bands on a streamline house; a bold band rides beside the pinstripes. The colour
// turns with the card: petrol top left and bottom right, amethyst the other two, so it reads the same
// either way up.
function streamline(phone, mode = 'quarter') {
  const k = kit(phone), g = phone ? 30 : 20, XB = 212, Y0 = 200, MIDG = 22;
  const n = Math.ceil(520 / g), tan = Math.tan(Math.PI / 8);
  const pts = (i, s) => {
    const y = CY - s * (MIDG + i * g), yt = CY - s * (CY - Y0 + i * g), xb = XB - i * g * tan, climb = Math.abs(y - yt);
    return [[0, y], [xb, y], [xb + climb, yt], [W - xb - climb, yt], [W - xb, y], [W, y]];
  };
  const rad = (i, s) => { const a = Math.max(30, 230 - i * g * .9), c = 160 + i * g * .9; return [0, a, c, c, a, 0]; };
  const line = (i, s) => rounded(pts(i, s), rad(i, s));
  let defs = `<clipPath id="s2a"><rect width="${CX}" height="${CY}"/><rect x="${CX}" y="${CY}" width="${CX}" height="${CY}"/></clipPath><clipPath id="s2b"><rect x="${CX}" width="${CX}" height="${CY}"/><rect y="${CY}" width="${CX}" height="${CY}"/></clipPath>`;
  let A = '', B = '';
  for (const s of [1, -1]) for (let i = 1; i + 2 < n; i += 4) {
    const a = line(i, s), c = line(i + 2, s);
    // the band between line i and i+2: walk a, then back along c reversed (sampled via the polyline)
    const pc = pts(i + 2, s).slice().reverse();
    const d = `${a}L${rounded(pc, rad(i + 2, s).slice().reverse()).slice(1)}Z`;
    const op = .07 + .2 * i / n;
    A += area(d, PETROL, op, 6); B += area(d, AMETHYST, op, 6);
  }
  let b;
  if (mode === 'band') {
    // each band one colour from end to end; the colours take turns outward
    b = ''; let t = 0;
    for (let i = 1; i + 2 < n; i += 4, t++) for (const s of [1, -1]) {
      const a = line(i, s), pc = pts(i + 2, s).slice().reverse();
      const d = `${a}L${rounded(pc, rad(i + 2, s).slice().reverse()).slice(1)}Z`;
      b += area(d, t % 2 ? AMETHYST : PETROL, .09 + .2 * i / n, 6);
    }
  } else if (mode === 'seam') {
    // the colour changes on a gold seam: a bundle of three lines from each half sun to the frame
    const gap = 16;
    defs = `<clipPath id="s2a"><rect width="${CX - gap}" height="${CY}"/><rect x="${CX + gap}" y="${CY}" width="${CX - gap}" height="${CY}"/></clipPath><clipPath id="s2b"><rect x="${CX + gap}" width="${CX - gap}" height="${CY}"/><rect y="${CY}" width="${CX - gap}" height="${CY}"/></clipPath>`;
    b = `<g clip-path="url(#s2a)">${A}</g><g clip-path="url(#s2b)">${B}</g>`;
    const r = phone ? 110 : 88;
    for (const [dx, op, sw] of [[0, MID, 1.1], [-gap, FINE + .06, .6], [gap, FINE + .06, .6]]) {
      b += k.path(`M${CX + dx} 0L${CX + dx} ${Y0 - r}`, op, sw, 9) + k.path(`M${CX + dx} ${H}L${CX + dx} ${H - Y0 + r}`, op, sw, 9);
    }
  } else b = `<g clip-path="url(#s2a)">${A}</g><g clip-path="url(#s2b)">${B}</g>`;
  for (let i = n; i >= 0; i--) for (const s of [1, -1]) {
    const bold = i % 4 === 3;
    b += k.path(line(i, s), i === 0 ? STRUCT : bold ? MID : FINE, i === 0 ? 1 : bold ? 2.6 : .6, n - i);
  }
  for (const [cy, up] of [[Y0, true], [H - Y0, false]]) b += fan(k, CX, cy, phone ? 110 : 88, up, Math.PI / (phone ? 8 : 12), 2);
  for (const sx of [1, -1]) { const x = sx > 0 ? XB : W - XB; b += `<path class="a" style="--i:3" d="M${f(x + sx * 4)} ${CY - 12}L${f(x + sx * 22)} ${CY}L${f(x + sx * 4)} ${CY + 12}L${f(x - sx * 14)} ${CY}Z" fill="${AMETHYST}" ${k.st(.7, .8)}/>`; }
  return svg(b, defs);
}

// 3 · Arched door. The door's head is an arch at both ends, between a circle and a door. Nested arches
// step out from it to the frame; pinstripe columns stand beside it; the half suns sit on the arches'
// crowns as fans whose rays rise to the frame.
function arched(phone) {
  const k = kit(phone), g = phone ? 46 : 32, DW = 470, SAG = 150, TOPY = CY - 310;
  const R0 = (DW * DW + SAG * SAG) / (2 * SAG), cyT = TOPY + R0, cyB = H - cyT;
  const shape = i => {             // nested barrel i: arched top and bottom, upright sides
    const x = DW + i * g, r = R0 + i * g, dy = Math.sqrt(r * r - x * x);
    const yT = cyT - dy, yB = cyB + dy;
    return { x, r, yT, yB, d: `M${f(CX - x)} ${f(yT)}A${f(r)} ${f(r)} 0 0 1 ${f(CX + x)} ${f(yT)}L${f(CX + x)} ${f(yB)}A${f(r)} ${f(r)} 0 0 1 ${f(CX - x)} ${f(yB)}Z` };
  };
  const n = Math.ceil((CX - DW) / g) + 1;
  let b = '', defs = '';
  // arch bands: every third band amethyst; the band ring is shape(i+1) minus shape(i)
  for (let i = 1; i < n; i++) if (i % 3 === 1) b += area(`${shape(i + 1).d} ${shape(i).d}`, AMETHYST, .08 + .16 * i / n, 6, 'fill-rule="evenodd"');
  // columns: in the strips left and right of the door, below and above the arch springing, petrol areas
  const s0 = shape(0);
  defs += `<clipPath id="a3c"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${shape(2).d}"/></clipPath>`;
  let cols = '';
  const cw = phone ? 18 : 12;
  for (let x = 0, j = 0; x < CX - DW - 2 * g; x += cw, j++) for (const xx of [x, W - x]) {
    cols += k.path(`M${f(xx)} 0L${f(xx)} ${H}`, j % 5 === 0 ? MID : FINE * .8, j % 5 === 0 ? .9 : .5, 8 - Math.min(7, j / 3));
    if (j % 10 === 2) cols += area(`M${f(xx)} 0H${f(xx + (xx < CX ? cw * 3 : -cw * 3))}V${H}H${f(xx)}Z`, PETROL, .16, 6);
  }
  b += `<g clip-path="url(#a3c)">${cols}</g>`;
  // rays from each crown, behind the arches, to the frame
  defs += `<clipPath id="a3r"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${s0.d}"/></clipPath>`;
  let rays = '';
  for (const [cy, s] of [[TOPY, -1], [H - TOPY, 1]]) for (let a = 15; a <= 165; a += phone ? 10 : 6) {
    const t = a * Math.PI / 180, L = 900;
    rays += k.path(`M${f(CX + L * Math.cos(t))} ${f(cy + s * L * Math.sin(t))}L${CX} ${cy}`, .1, .5, 7);
  }
  b += `<g clip-path="url(#a3r)">${rays}</g>`;
  for (let i = n + 6; i >= 1; i--) b += k.path(shape(i).d, i % 3 === 0 ? MID : FINE, i % 3 === 0 ? .9 : .6, Math.min(8, i));
  b += `<path d="${s0.d}" style="fill:var(--card-bg)"/>` + k.path(s0.d, STRUCT, 1, 0);
  b += fan(k, CX, TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
  return svg(b, defs);
}

// 4 · Three layers (the lesson of the Egyptian backs). A bold figure faces the door from both sides:
// a spine from the frame and two wings of feathers that step out to the frame, each wing one amethyst
// area. Fine gold lines tier the feathers; dark petrol rays fill the field behind. The door is a
// cartouche with stepped corners, the frame's own corner.
function layers(phone) {
  const k = kit(phone);
  const DL = 350, DR = W - DL, DT = 210, DB = H - DT, st = 46;
  const cart = `M${DL + st} ${DT}H${DR - st}V${DT + st}H${DR}V${DB - st}H${DR - st}V${DB}H${DL + st}V${DB - st}H${DL}V${DT + st}H${DL + st}Z`;
  let b = '', defs = `<clipPath id="l4o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${cart}"/></clipPath>`;
  // dark layer: petrol rays from the centre to the frame
  let rays = '';
  for (let a = 0; a < 360; a += phone ? 3 : 2) { const t = a * Math.PI / 180; rays += k.path(`M${f(CX + 1200 * Math.cos(t))} ${f(CY + 1200 * Math.sin(t))}L${CX} ${CY}`, .22, .45, 9, PETROL); }
  b += `<g clip-path="url(#l4o)">${rays}</g>`;
  // the figure on each side: a spine on the centre line from the frame to the cartouche, and two wings
  // of feathers that fan out from it to the frame; each wing one amethyst area, the tiers fine gold
  const AX = DL, R0 = 70, tiers = [170, 290];
  for (const sx of [1, -1]) {
    const X = x => sx > 0 ? x : W - x;
    for (const sy of [1, -1]) {
      const a1 = 196, a2 = 252, nf = phone ? 9 : 14;
      const P = (a, r) => { const t = a * Math.PI / 180; return [X(AX + r * Math.cos(t)), CY + sy * r * Math.sin(t)]; };
      const reach = a => { const t = a * Math.PI / 180, c = Math.cos(t), sn = Math.abs(Math.sin(t)); return Math.min(AX / -c, (CY - 6) / sn); };
      // the wing area: from the inner arc out to the frame
      let w = `M${f(P(a1, R0)[0])} ${f(P(a1, R0)[1])}`;
      for (let a = a1; a <= a2; a += 2) w += `L${f(P(a, reach(a))[0])} ${f(P(a, reach(a))[1])}`;
      w += `L${f(P(a2, R0)[0])} ${f(P(a2, R0)[1])}Z`;
      b += area(w, AMETHYST, .22, 6);
      // feathers from the inner arc to the frame; every third bold
      for (let j = 0; j <= nf; j++) {
        const a = a1 + (a2 - a1) * j / nf, edge = j === 0 || j === nf;
        b += k.path(`M${f(P(a, reach(a))[0])} ${f(P(a, reach(a))[1])}L${f(P(a, R0)[0])} ${f(P(a, R0)[1])}`, edge ? STRUCT : j % 3 === 0 ? MID : FINE + .06, edge ? 1.1 : j % 3 === 0 ? .8 : .55, 7);
      }
      // tiers across the wing, and the inner arc the feathers grow from
      for (const [r, op, sw] of [[R0, STRUCT, 1], ...tiers.map(r => [r, MID, .7])]) {
        const lim = Math.min(...[a1, a2].map(reach));
        if (r < lim) b += k.path(`M${f(P(a1, r)[0])} ${f(P(a1, r)[1])}A${r} ${r} 0 0 ${(sx * sy) > 0 ? 1 : 0} ${f(P(a2, r)[0])} ${f(P(a2, r)[1])}`, op, sw, 5);
      }
    }
    // the spine: three lines on the centre line from the frame to the cartouche
    for (const [dy, op, sw] of [[0, STRUCT, 1.2], [-12, FINE + .1, .6], [12, FINE + .1, .6]]) b += k.path(`M${f(X(0))} ${CY + dy}L${f(X(AX - 2))} ${CY + dy}`, op, sw, 4);
    b += `<path class="a" style="--i:3" d="M${f(X(AX - 34))} ${CY}L${f(X(AX - 14))} ${CY - 16}L${f(X(AX + 6))} ${CY}L${f(X(AX - 14))} ${CY + 16}Z" fill="${GOLD}" fill-opacity=".7"/>`;
  }
  // the cartouche: a bold edge and a fine echo
  const echo = `M${DL + st - 14} ${DT - 14}H${DR - st + 14}V${DT + st - 14}H${DR + 14}V${DB - st + 14}H${DR - st + 14}V${DB + 14}H${DL + st - 14}V${DB - st + 14}H${DL - 14}V${DT + st - 14}H${DL + st - 14}Z`;
  b += `<path d="${echo}" style="fill:var(--card-bg)"/>` + k.path(echo, MID, .6, 1) + k.path(cart, STRUCT, 1, 0);
  b += fan(k, CX, DT - 14, phone ? 100 : 80, true, Math.PI / (phone ? 8 : 12), 2) + fan(k, CX, DB + 14, phone ? 100 : 80, false, Math.PI / (phone ? 8 : 12), 2);
  return svg(b, defs);
}

// 5 · Bookmatched (the outlier), from the owner's cabinet. Grain rings spread out from the door with an
// uneven rhythm and bend round four knots, mirrored like veneer laid from one log; each quarter is its
// own colour, petrol and amethyst crosswise. The door is the innermost ring.
function bookmatched(phone) {
  const k = kit(phone);
  const A0 = 520, B0 = 320, N0 = 6;
  const rhythm = phone ? [22, 22, 40, 22, 60, 26, 26, 26, 80, 30, 50, 30, 30, 90, 36, 60, 40, 110] : [16, 16, 28, 16, 44, 18, 18, 18, 60, 22, 36, 22, 22, 66, 26, 44, 28, 80, 30, 52, 34, 96];
  const knots = [[CX - 560, CY - 330], [CX + 560, CY - 330], [CX - 560, CY + 330], [CX + 560, CY + 330]];
  const ring = d => {
    const a = A0 + d, bb = B0 + d * .7, nn = Math.max(3.4, N0 + 2 - d * .01);
    let s = '';
    for (let q = 0; q <= 360; q += 2) {
      const t = q * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      let x = CX + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / nn), y = CY + bb * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / nn);
      for (const [kx, ky] of knots) {   // bend round a knot: push the line away from it
        const dx = x - kx, dy = y - ky, dist = Math.hypot(dx, dy), R = 120;
        if (dist < R * 2.2) { const p = (R * 2.2 - dist) / (R * 2.2), m = 64 * p; x += dx / (dist || 1) * m; y += dy / (dist || 1) * m; }
      }
      s += (q ? 'L' : 'M') + f(x) + ' ' + f(y);
    }
    return s + 'Z';
  };
  const ds = [0]; for (const r of rhythm) ds.push(ds[ds.length - 1] + r);
  let defs = `<clipPath id="b5a"><rect width="${CX}" height="${CY}"/><rect x="${CX}" y="${CY}" width="${CX}" height="${CY}"/></clipPath><clipPath id="b5b"><rect x="${CX}" width="${CX}" height="${CY}"/><rect y="${CY}" width="${CX}" height="${CY}"/></clipPath>`;
  let A = '', B = '';
  ds.forEach((d, j) => { if (j % 3 === 1 && ds[j + 1]) { const band = `${ring(ds[j + 1])} ${ring(d)}`, op = .08 + .2 * j / ds.length; A += area(band, PETROL, op, 6, 'fill-rule="evenodd"'); B += area(band, AMETHYST, op, 6, 'fill-rule="evenodd"'); } });
  let b = `<g clip-path="url(#b5a)">${A}</g><g clip-path="url(#b5b)">${B}</g>`;
  for (let j = ds.length - 1; j >= 1; j--) b += k.path(ring(ds[j]), rhythm[j - 1] >= 60 ? MID : FINE + .05, rhythm[j - 1] >= 60 ? .9 : .55, Math.min(9, Math.round(j / 2)));
  for (const [kx, ky] of knots) for (let r = 16; r <= 76; r += phone ? 20 : 14) b += k.path(`M${f(kx - r * 1.4)} ${ky}L${kx} ${f(ky - r)}L${f(kx + r * 1.4)} ${ky}L${kx} ${f(ky + r)}Z`, r < 30 ? MID : FINE + .08, r < 30 ? .8 : .55, 5);
  b += `<path d="${ring(0)}" style="fill:var(--card-bg)"/>` + k.path(ring(0), STRUCT, 1, 0);
  return svg(b, defs);
}


// 3 · Arched door with ripples. Two families of rings, one round a centre below the card and one round
// a centre above it, as the Intermezzo's circles: the upper arches of the door's head and the lower
// ones cross at the sides into curved cells. The door keeps its arched heads and upright sides.
// mode 'family': upper rings shaded petrol, lower rings amethyst, and where their shaded bands cross
// the cell stays dark. mode 'checker': the crossing cells themselves take petrol and amethyst in turn.
function ripples(phone, mode = 'family') {
  const k = kit(phone), g = phone ? 44 : 30, DW = 470, SAG = 150, TOPY = CY - 310;
  const R0 = (DW * DW + SAG * SAG) / (2 * SAG), cT = [CX, TOPY + R0], cB = [CX, H - TOPY - R0];
  const dyT = Math.sqrt(R0 * R0 - DW * DW);
  const door = `M${CX - DW} ${f(cT[1] - dyT)}A${f(R0)} ${f(R0)} 0 0 1 ${CX + DW} ${f(cT[1] - dyT)}L${CX + DW} ${f(cB[1] + dyT)}A${f(R0)} ${f(R0)} 0 0 1 ${CX - DW} ${f(cB[1] + dyT)}Z`;
  const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] + r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] - r)} ${f(c[1])}Z`;
  const ann = (c, i) => `${circ(c, R0 + (i + 1) * g)} ${circ(c, R0 + i * g)}`;
  const n = Math.ceil(1250 / g);
  let defs = `<clipPath id="r3o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${door}"/></clipPath>`, b = '', fills = '';
  if (mode === 'family') {
    // masks: each family's shaded bands are cut where the other family's shaded bands lie
    const shaded = i => i % 3 === 1;
    let mT = '', mB = '';
    for (let i = 0; i < n; i++) if (shaded(i)) { mT += `<path d="${ann(cB, i)}" fill-rule="evenodd" fill="#000"/>`; mB += `<path d="${ann(cT, i)}" fill-rule="evenodd" fill="#000"/>`; }
    defs += `<mask id="r3mT" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${mT}</mask><mask id="r3mB" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${mB}</mask>`;
    let ft = '', fb = '';
    for (let i = 0; i < n; i++) if (shaded(i)) { const op = .1 + .18 * Math.min(1, i / 14); ft += area(ann(cT, i), PETROL, op, 6, 'fill-rule="evenodd"'); fb += area(ann(cB, i), AMETHYST, op, 6, 'fill-rule="evenodd"'); }
    fills = `<g mask="url(#r3mT)">${ft}</g><g mask="url(#r3mB)">${fb}</g>`;
  } else {
    // cells: where upper band i meets lower band j; every other diagonal is coloured, petrol and amethyst taking turns
    for (let j = 0; j < n; j++) defs += `<clipPath id="r3b${j}"><path clip-rule="evenodd" d="${ann(cB, j)}"/></clipPath>`;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if ((i + j) % 2) continue;
      const col = (i + j) % 4 === 0 ? PETROL : AMETHYST, op = .16 + .16 * Math.min(1, (i + j) / 24);
      fills += `<g clip-path="url(#r3b${j})">${area(ann(cT, i), col, op, 6, 'fill-rule="evenodd"')}</g>`;
    }
  }
  b += `<g clip-path="url(#r3o)">${fills}`;
  // the rings, gold: every third bolder; a quiet rule of rays from each crown behind them
  for (const [cy, s] of [[TOPY, -1], [H - TOPY, 1]]) for (let a = 15; a <= 165; a += phone ? 10 : 6) {
    const t = a * Math.PI / 180, L = 900;
    b += k.path(`M${f(CX + L * Math.cos(t))} ${f(cy + s * L * Math.sin(t))}L${CX} ${cy}`, .08, .5, 7);
  }
  for (let i = n; i >= 1; i--) for (const c of [cT, cB]) b += k.path(circ(c, R0 + i * g), i % 3 === 0 ? MID : FINE, i % 3 === 0 ? .85 : .55, Math.min(9, Math.ceil(i / 2)));
  // the door's upright sides run on to the frame as two pinstripes, so the jambs reach the edge
  for (const sx of [-1, 1]) for (const dx of [0, 14]) { const x = CX + sx * (DW + dx); b += k.path(`M${x} 0L${x} ${H}`, dx ? FINE : MID, dx ? .55 : .8, 8); }
  b += `</g><path d="${door}" style="fill:var(--card-bg)"/>` + k.path(door, STRUCT, 1, 0);
  b += fan(k, CX, TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
  return svg(b, defs);
}

// 5 · Bookmatched, refined. The same idea, drawn with a lighter hand: many fine grain lines with now
// and then a bolder one, rings that stay crisp and nearly square, a smooth swell round four small knots,
// and the four quarters meeting on gold seams down and across the centre, as veneer meets at its joint.
// Each quarter one colour, petrol and amethyst crosswise, in narrow bands.
function bookmatchedRefined(phone, mode = 'seams') {
  const k = kit(phone);
  const A0 = 500, B0 = 300;
  const base = phone ? [16, 16, 16, 26, 16, 16, 40, 18, 18, 18, 18, 30, 20, 20, 52, 22, 22, 22, 34, 24, 24, 60, 26, 26, 40] :
    [11, 11, 11, 18, 11, 11, 28, 12, 12, 12, 12, 20, 13, 13, 36, 14, 14, 14, 22, 15, 15, 42, 16, 16, 26, 17, 17, 48, 18, 18];
  const knots = [[CX - 590, CY - 320], [CX + 590, CY - 320], [CX - 590, CY + 320], [CX + 590, CY + 320]];
  const ring = d => {
    const a = A0 + d, bb = B0 + d * .72, nn = Math.max(4, 9 - d * .009);
    let s = '';
    for (let q = 0; q <= 360; q += 1.5) {
      const t = q * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      let x = CX + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / nn), y = CY + bb * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / nn);
      for (const [kx, ky] of knots) {   // a smooth swell round each knot
        const dx = x - kx, dy = y - ky, dist = Math.hypot(dx, dy) || 1, m = 46 * Math.exp(-(dist * dist) / (2 * 95 * 95));
        x += dx / dist * m; y += dy / dist * m;
      }
      s += (q ? 'L' : 'M') + f(x) + ' ' + f(y);
    }
    return s + 'Z';
  };
  const ds = [0]; for (const r of base) ds.push(ds[ds.length - 1] + r);
  const gap = 10;
  let defs = `<clipPath id="b6a"><rect width="${CX - gap}" height="${CY - gap}"/><rect x="${CX + gap}" y="${CY + gap}" width="${CX - gap}" height="${CY - gap}"/></clipPath><clipPath id="b6b"><rect x="${CX + gap}" width="${CX - gap}" height="${CY - gap}"/><rect y="${CY + gap}" width="${CX - gap}" height="${CY - gap}"/></clipPath>`;
  let A = '', B = '', b = '';
  const bands = []; ds.forEach((d, j) => { if (base[j] >= 26 && ds[j + 1]) bands.push([`${ring(ds[j + 1])} ${ring(d)}`, .1 + .14 * j / ds.length, j]); });
  if (mode === 'seams') {
    for (const [band, op] of bands) { A += area(band, PETROL, op, 6, 'fill-rule="evenodd"'); B += area(band, AMETHYST, op, 6, 'fill-rule="evenodd"'); }
    b = `<g clip-path="url(#b6a)">${A}</g><g clip-path="url(#b6b)">${B}</g>`;
  } else if (mode === 'diagonal') {
    // the bookmatch kept crosswise, petrol top left and bottom right, amethyst in the other two, but the quarters melt into each other at the joint instead of meeting on a line
    defs += `<filter id="b6blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="70"/></filter><mask id="b6m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g filter="url(#b6blur)"><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="black"/><rect x="${CX}" y="-200" width="${CX + 200}" height="${CY + 200}" fill="white"/><rect x="-200" y="${CY}" width="${CX + 200}" height="${CY + 200}" fill="white"/></g></mask>`;
    let P = '', M = '';
    for (const [band, op] of bands) { P += area(band, PETROL, op + .05, 6, 'fill-rule="evenodd"'); M += area(band, AMETHYST, op + .05, 6, 'fill-rule="evenodd"'); }
    b = `<g mask="url(#b6m)">${M}</g>`;
    // petrol everywhere the amethyst is not: an inverse mask
    defs += `<mask id="b6mi" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="white"/><g filter="url(#b6blur)"><rect x="${CX}" y="-200" width="${CX + 200}" height="${CY + 200}" fill="black"/><rect x="-200" y="${CY}" width="${CX + 200}" height="${CY + 200}" fill="black"/></g></mask>`;
    b += `<g mask="url(#b6mi)">${P}</g>`;
  } else if (mode === 'radial') {
    // the grain deepens outward: petrol by the door blending to amethyst at the frame
    defs += `<radialGradient id="b6r" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${W * .55}" gradientTransform="translate(${CX} ${CY}) scale(1 .62) translate(${-CX} ${-CY})"><stop offset=".45" stop-color="${PETROL}"/><stop offset="1" stop-color="${AMETHYST}"/></radialGradient>`;
    for (const [band, op] of bands) b += area(band, 'url(#b6r)', op + .06, 6, 'fill-rule="evenodd"');
  } else if (mode === 'rings') {
    // ring by ring: each band one colour all the way round, petrol and amethyst taking turns
    bands.forEach(([band, op], t) => { b += area(band, t % 2 ? AMETHYST : PETROL, op, 6, 'fill-rule="evenodd"'); });
  } else if (mode === 'checker') {
    // each band cut into sixteen pieces round the door, alternating like a harlequin, shifted band to band
    const S = 16;
    for (let q = 0; q < S; q++) {
      const a0 = q / S * 2 * Math.PI, a1 = (q + 1) / S * 2 * Math.PI, R = 2000;
      defs += `<clipPath id="b6q${q}"><path d="M${CX} ${CY}L${f(CX + R * Math.cos(a0))} ${f(CY + R * Math.sin(a0))}L${f(CX + R * Math.cos(a1))} ${f(CY + R * Math.sin(a1))}Z"/></clipPath>`;
    }
    bands.forEach(([band, op], t) => { for (let q = 0; q < S; q++) b += `<g clip-path="url(#b6q${q})">${area(band, (q + t) % 2 ? AMETHYST : PETROL, op + .03, 6, 'fill-rule="evenodd"')}</g>`; });
  }
  for (let j = ds.length - 1; j >= 1; j--) { const bold = base[j - 1] >= 40; b += k.path(ring(ds[j]), bold ? MID : FINE, bold ? .8 : .45, Math.min(9, Math.round(j / 3))); }
  // knots: a small stepped lozenge in fine line where the grain swells
  for (const [kx, ky] of knots) for (const [r, op, sw] of [[10, STRUCT, .8], [22, MID, .6], [34, FINE + .06, .5]]) b += k.path(`M${f(kx - r * 1.5)} ${ky}L${kx} ${f(ky - r)}L${f(kx + r * 1.5)} ${ky}L${kx} ${f(ky + r)}Z`, op, sw, 5);
  for (const [kx, ky] of knots) b += `<path class="a" style="--i:5" d="M${f(kx - 15)} ${ky}L${kx} ${ky - 10}L${f(kx + 15)} ${ky}L${kx} ${ky + 10}Z" fill="${GOLD}" fill-opacity=".45"/>`;
  // the seams: a gold line where the quarters meet, from the frame to the door
  const dT = CY - B0, dS = CX - A0;
  if (mode === 'seams') {
    b += k.path(`M${CX} 0L${CX} ${dT}`, MID, .8, 9) + k.path(`M${CX} ${H}L${CX} ${H - dT}`, MID, .8, 9);
    b += k.path(`M0 ${CY}L${dS} ${CY}`, MID, .8, 9) + k.path(`M${W} ${CY}L${W - dS} ${CY}`, MID, .8, 9);
  }
  b += `<path d="${ring(0)}" style="fill:var(--card-bg)"/>` + k.path(ring(0), STRUCT, 1, 0);
  return svg(b, defs);
}

// 3 · Arched door, its lines running on (round 4). Round 2's option 3 as it was: the arched door, the
// nested arches, the jambs, the pinstripe columns, the rays and the half suns. What changes is how the
// lines end, as on the Intermezzo: each arch no longer stops on its jamb but runs on, curving down until
// it hits its mirror from below on the centre line, and each jamb runs on to the frame. So arches and
// uprights cross into curved cells at the sides. Colour, never blended: mode
//   'columns' arch bands amethyst and columns petrol, as round 2; where they cross the cell stays dark
//   'turns'   arch bands taking turns, petrol and amethyst, outward
//   'halves'  arch bands petrol above the centre line and amethyst below, meeting at the arches' points
//   'cells'   only the curved cells where an arch band crosses a jamb strip, petrol and amethyst in turn
function archedCross(phone, mode = 'columns') {
  const k = kit(phone), g = phone ? 46 : 32, DW = 470, SAG = 150, TOPY = CY - 310;
  const R0 = (DW * DW + SAG * SAG) / (2 * SAG), cT = [CX, TOPY + R0], cB = [CX, H - TOPY - R0];
  const shape = i => {
    const x = DW + i * g, r = R0 + i * g, dy = Math.sqrt(r * r - x * x);
    const yT = cT[1] - dy, yB = cB[1] + dy;
    return { x, r, yT, yB, d: `M${f(CX - x)} ${f(yT)}A${f(r)} ${f(r)} 0 0 1 ${f(CX + x)} ${f(yT)}L${f(CX + x)} ${f(yB)}A${f(r)} ${f(r)} 0 0 1 ${f(CX - x)} ${f(yB)}Z` };
  };
  const n = Math.ceil((CX - DW) / g) + 1, N = n + 6;
  const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] + r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] - r)} ${f(c[1])}Z`;
  // an arch band: the ring between arch i and i+1, upper (above the centre line) or lower
  const arcBand = (i, up) => `${circ(up ? cT : cB, R0 + (i + 1) * g)} ${circ(up ? cT : cB, R0 + i * g)}`;
  const s0 = shape(0);
  let defs = `<clipPath id="x3u"><rect width="${W}" height="${CY}"/></clipPath><clipPath id="x3d"><rect y="${CY}" width="${W}" height="${CY}"/></clipPath>`;
  defs += `<clipPath id="x3o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${s0.d}"/></clipPath>`;
  const bandOp = i => .1 + .16 * Math.min(1, i / n);
  const shaded = i => i % 3 === 1;
  let fills = '';
  const colsX = []; const cw = phone ? 18 : 12;
  for (let x = 0, j = 0; x < CX - DW - 2 * g; x += cw, j++) colsX.push([x, j]);
  const colStrips = () => { let c = ''; for (const [x, j] of colsX) if (j % 10 === 2) for (const xx of [x, W - x]) c += `M${f(xx)} 0H${f(xx + (xx < CX ? cw * 3 : -cw * 3))}V${H}H${f(xx)}Z `; return c; };
  const arcs = col => { let u = '', d = ''; for (let i = 1; i < N; i++) if (shaded(i)) { const c = typeof col === 'function' ? col(i) : col; u += area(arcBand(i, true), c[0], bandOp(i), 6, 'fill-rule="evenodd"'); d += area(arcBand(i, false), c[1], bandOp(i), 6, 'fill-rule="evenodd"'); } return `<g clip-path="url(#x3u)">${u}</g><g clip-path="url(#x3d)">${d}</g>`; };
  if (mode === 'columns') {
    defs += `<mask id="x3m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${colStrips()}" fill="#000"/></mask>`;
    let mA = ''; for (let i = 1; i < N; i++) if (shaded(i)) mA += `<path d="${arcBand(i, true)}" fill-rule="evenodd" clip-path="url(#x3u)" fill="#000"/><path d="${arcBand(i, false)}" fill-rule="evenodd" clip-path="url(#x3d)" fill="#000"/>`;
    defs += `<mask id="x3n" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${mA}</mask>`;
    fills = `<g mask="url(#x3m)">${arcs([AMETHYST, AMETHYST])}</g><g mask="url(#x3n)">${area(colStrips(), PETROL, .17, 6)}</g>`;
  } else if (mode === 'turns') {
    fills = arcs(i => { const t = (i - 1) / 3 % 2 ? AMETHYST : PETROL; return [t, t]; });
  } else if (mode === 'halves') {
    fills = arcs([PETROL, AMETHYST]);
  } else {
    // cells: arch band i (upper or lower) inside the jamb strip between jamb j and j+1, beyond arch i's own jamb
    for (let j = 0; j < N; j++) defs += `<clipPath id="x3s${j}"><path d="M${f(CX + DW + j * g)} 0H${f(CX + DW + (j + 1) * g)}V${H}H${f(CX + DW + j * g)}Z M${f(CX - DW - (j + 1) * g)} 0H${f(CX - DW - j * g)}V${H}H${f(CX - DW - (j + 1) * g)}Z"/></clipPath>`;
    for (let i = 0; i < N; i++) for (let j = i; j < N; j++) {
      if ((i + j) % 2) continue;
      const col = (i + j) % 4 === 0 ? PETROL : AMETHYST, op = .12 + .16 * Math.min(1, (i + j) / 16);
      fills += `<g clip-path="url(#x3s${j})"><g clip-path="url(#x3u)">${area(arcBand(i, true), col, op, 6, 'fill-rule="evenodd"')}</g><g clip-path="url(#x3d)">${area(arcBand(i, false), col, op, 6, 'fill-rule="evenodd"')}</g></g>`;
    }
  }
  let b = `<g clip-path="url(#x3o)">${fills}`;
  // columns (gold), rays, as round 2
  defs += `<clipPath id="x3c"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${shape(2).d}"/></clipPath>`;
  let cols = '';
  for (const [x, j] of colsX) for (const xx of [x, W - x]) cols += k.path(`M${f(xx)} 0L${f(xx)} ${H}`, j % 5 === 0 ? MID : FINE * .8, j % 5 === 0 ? .9 : .5, 8 - Math.min(7, j / 3));
  b += `<g clip-path="url(#x3c)">${cols}</g>`;
  for (const [cy, s] of [[TOPY, -1], [H - TOPY, 1]]) for (let a = 15; a <= 165; a += phone ? 10 : 6) {
    const t = a * Math.PI / 180, L = 900;
    b += k.path(`M${f(CX + L * Math.cos(t))} ${f(cy + s * L * Math.sin(t))}L${CX} ${cy}`, .1, .5, 7);
  }
  // the lines: each arch runs on past its jamb down to the centre line, where it meets its mirror;
  // each jamb runs on to the frame
  const dyc = cT[1] - CY;
  for (let i = N; i >= 1; i--) {
    const sh = shape(i), r = sh.r, op = i % 3 === 0 ? MID : FINE, sw = i % 3 === 0 ? .9 : .6, ii = Math.min(8, i);
    const xe = Math.sqrt(r * r - dyc * dyc);
    b += k.path(`M${f(CX - xe)} ${CY}A${f(r)} ${f(r)} 0 0 1 ${f(CX + xe)} ${CY}`, op, sw, ii);                 // upper arch, point to point
    b += k.path(`M${f(CX - xe)} ${CY}A${f(r)} ${f(r)} 0 0 0 ${f(CX + xe)} ${CY}`, op, sw, ii);                 // lower arch
    for (const sx of [-1, 1]) b += k.path(`M${f(CX + sx * sh.x)} 0L${f(CX + sx * sh.x)} ${H}`, op, sw, ii);    // jamb, frame to frame
  }
  b += `</g><path d="${s0.d}" style="fill:var(--card-bg)"/>` + k.path(s0.d, STRUCT, 1, 0);
  b += fan(k, CX, TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
  return svg(b, defs);
}


// 3 · Two families. Round 2's arched door, unchanged in shape: arched heads, straight sides, the same
// steps, the suns and rays. As on the Intermezzo there are two families from two centres: the top
// arches (centred low, like the Intermezzo's lower circle) and the bottom arches (centred high). Instead
// of closing into one barrel, each family's straight sides run on to the far frame, through the other
// family's ground, so every head is crossed by the other family's rising sides. Because the card is
// mirrored, the two families' sides share the same uprights. Lines in threes (fine, fine, bold), every
// third band shaded; no dots, no eye. Colour never blends: each area is one colour or dark.
function archedFamilies(phone, mode = 'families') {
  const k = kit(phone), g = phone ? 46 : 32, DW = 470, SAG = 150, TOPY = CY - 310;
  const R0 = (DW * DW + SAG * SAG) / (2 * SAG), cT = [CX, TOPY + R0];
  const X = i => DW + i * g, R = i => R0 + i * g;
  const yS = i => cT[1] - Math.sqrt(R(i) * R(i) - X(i) * X(i));          // shoulder of top arch i
  const n = Math.ceil((CX - DW) / g) + 1, N = n + 6;
  const circ = r => `M${f(cT[0] - r)} ${f(cT[1])}A${f(r)} ${f(r)} 0 1 0 ${f(cT[0] + r)} ${f(cT[1])}A${f(r)} ${f(r)} 0 1 0 ${f(cT[0] - r)} ${f(cT[1])}Z`;
  const ring = i => `${circ(R(i + 1))} ${circ(R(i))}`;
  const door = `M${f(CX - DW)} ${f(yS(0))}A${f(R0)} ${f(R0)} 0 0 1 ${f(CX + DW)} ${f(yS(0))}L${f(CX + DW)} ${f(H - yS(0))}A${f(R0)} ${f(R0)} 0 0 1 ${f(CX - DW)} ${f(H - yS(0))}Z`;
  const shaded = i => i % 3 === 1;
  const op = i => .1 + .16 * Math.min(1, i / n);
  // clips (in the upper half's own coordinates; the lower half is the same group flipped)
  let defs = `<clipPath id="f5u"><rect width="${W}" height="${CY}"/></clipPath>`;
  defs += `<clipPath id="f5o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${door}"/></clipPath>`;
  defs += `<clipPath id="f5c"><rect x="${f(CX - DW)}" width="${2 * DW}" height="${H}"/></clipPath>`;
  for (let j = 0; j <= N; j++) {
    defs += `<clipPath id="f5s${j}"><path d="M${f(CX + X(j))} 0H${f(CX + X(j + 1))}V${H}H${f(CX + X(j))}Z M${f(CX - X(j + 1))} 0H${f(CX - X(j))}V${H}H${f(CX - X(j + 1))}Z"/></clipPath>`;
    defs += `<clipPath id="f5d${j}"><path d="${circ(R(j + 1))}"/></clipPath>`;
  }
  // the regions of the upper half: a head piece over the door (centre), a crossing cell (head band kk in
  // the strip of upright j, j < kk), and a strip's own stretch below its arch
  const piece = (clips, d, col, o) => clips.reduceRight((inner, c) => `<g clip-path="url(#${c})">${inner}</g>`, area(d, col, o, 6, 'fill-rule="evenodd"'));
  const half = (headCol, sideCol, cellCol) => {
    let s = '';
    for (let kk = 1; kk < N; kk++) {
      const hc = headCol(kk);
      if (hc) s += piece(['f5u', 'f5c'], ring(kk), hc, op(kk));
      for (let j = 0; j < kk; j++) { const c = cellCol(kk, j); if (c) s += piece(['f5u', `f5s${j}`], ring(kk), c[0], c[1]); }
    }
    for (let j = 0; j < N; j++) { const c = sideCol(j); if (c) s += piece(['f5u', `f5d${j}`], `M${f(CX + X(j))} 0H${f(CX + X(j + 1))}V${H}H${f(CX + X(j))}Z M${f(CX - X(j + 1))} 0H${f(CX - X(j))}V${H}H${f(CX - X(j + 1))}Z`, c, op(j)); }
    return s;
  };
  const both = (up, down) => `<g>${up}</g><g transform="matrix(1 0 0 -1 0 ${H})">${down}</g>`;
  let fills;
  if (mode === 'families') {
    // each family one colour: top arches and the sides they send down are petrol, bottom arches and the
    // sides they send up are amethyst. Where two shaded bands cross, the cell stays dark.
    const fam = (mine, other) => half(
      kk => shaded(kk) ? mine : null,
      j => shaded(j) ? other : null,
      (kk, j) => shaded(kk) && shaded(j) ? null : shaded(kk) ? [mine, op(kk)] : shaded(j) ? [other, op(j)] : null);
    fills = both(fam(PETROL, AMETHYST), fam(AMETHYST, PETROL));
  } else if (mode === 'turns') {
    // band by band: each shaded band, head and sides, is one colour, taking turns outward. Where two
    // bands of different colour cross, the cell stays dark; where the colours match it keeps it.
    const col = i => ((i - 1) / 3) % 2 ? AMETHYST : PETROL;
    const t = half(
      kk => shaded(kk) ? col(kk) : null,
      j => shaded(j) ? col(j) : null,
      (kk, j) => shaded(kk) && shaded(j) ? (col(kk) === col(j) ? [col(kk), Math.max(op(kk), op(j))] : null) : shaded(kk) ? [col(kk), op(kk)] : shaded(j) ? [col(j), op(j)] : null);
    fills = both(t, t);
  } else {
    // the crossings: only the cells where a head meets the other family's side take colour, in a
    // checker, petrol and amethyst in turn; the bands themselves stay dark.
    const c = half(() => null, () => null, (kk, j) => (kk + j) % 2 ? null : [(kk + j) % 4 === 0 ? PETROL : AMETHYST, .1 + .16 * Math.min(1, (kk + j) / 18)]);
    fills = both(c, c);
  }
  let b = `<g clip-path="url(#f5o)">${fills}`;
  // rays from each crown, as round 2
  for (const [cy, s] of [[TOPY, -1], [H - TOPY, 1]]) for (let a = 15; a <= 165; a += phone ? 10 : 6) {
    const t = a * Math.PI / 180, L = 900;
    b += k.path(`M${f(CX + L * Math.cos(t))} ${f(cy + s * L * Math.sin(t))}L${CX} ${cy}`, .1, .5, 7);
  }
  // the lines: both families' heads, and the uprights they share, frame to frame
  for (let i = N; i >= 1; i--) {
    const o = i % 3 === 0 ? MID : FINE, sw = i % 3 === 0 ? .9 : .6, ii = Math.min(8, i), y = yS(i);
    b += k.path(`M${f(CX - X(i))} ${f(y)}A${f(R(i))} ${f(R(i))} 0 0 1 ${f(CX + X(i))} ${f(y)}`, o, sw, ii);
    b += k.path(`M${f(CX - X(i))} ${f(H - y)}A${f(R(i))} ${f(R(i))} 0 0 0 ${f(CX + X(i))} ${f(H - y)}`, o, sw, ii);
    for (const sx of [-1, 1]) b += k.path(`M${f(CX + sx * X(i))} 0L${f(CX + sx * X(i))} ${H}`, o, sw, ii);
  }
  b += `</g><path d="${door}" style="fill:var(--card-bg)"/>` + k.path(door, STRUCT, 1, 0);
  b += fan(k, CX, TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
  return svg(b, defs);
}


// 6 · Everything runs on. Round 4's 3 and round 5's two families share the same lines: the arches of
// the top family are circles round a centre on the bottom edge, the bottom family's round a centre on
// the top edge, and the uprights stand beside the door. On round 4 and 5 the arches stopped (on the
// centre line, or on their own upright); here every arch is the whole circle the frame lets through, so
// the top family runs down past the centre line to the side frame and crosses the bottom family, as the
// Intermezzo's rings do, and every upright runs frame to frame. The door's own head arcs run on outside
// it too. One colour, petrol; each area is one tone of it or dark, nothing blends.
// Under it, the Intermezzo's lower layer: fine rays from the door out to the frame, and small gold
// sparkles where a ray meets a bold line.
//   'columns' (from round 4's 3a) the shaded arch rings and the pinstripe columns; where two shaded
//             areas cross the cell turns dark
//   'turns'   (from round 4's 3b) the shaded rings take turns, strong and faint; where they cross they
//             add up, as the Intermezzo's bands do
//   'doors'   (from round 5's b) each shaded band is a door: its head ring and its upright strip, taking
//             turns strong and faint; where two bands cross the cell turns dark
function runOn(phone, mode = 'columns') {
  const k = kit(phone), g = phone ? 46 : 32, DW = 470, SAG = 150, TOPY = CY - 310;
  const R0 = (DW * DW + SAG * SAG) / (2 * SAG), cT = [CX, TOPY + R0], cB = [CX, H - TOPY - R0];
  const X = i => DW + i * g, R = i => R0 + i * g;
  const yS = i => cT[1] - Math.sqrt(R(i) * R(i) - X(i) * X(i));
  const N = Math.ceil((Math.hypot(CX, H) - R0) / g) + 1;               // rings until the far corner
  const NU = Math.ceil((CX - DW) / g);                                  // uprights until the side frame
  const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] + r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] - r)} ${f(c[1])}Z`;
  const ring = (c, i) => `${circ(c, R(i + 1))} ${circ(c, R(i))}`;
  const strip = j => `M${f(CX + X(j))} 0H${f(CX + X(j + 1))}V${H}H${f(CX + X(j))}Z M${f(CX - X(j + 1))} 0H${f(CX - X(j))}V${H}H${f(CX - X(j + 1))}Z`;
  const door = `M${f(CX - DW)} ${f(yS(0))}A${f(R0)} ${f(R0)} 0 0 1 ${f(CX + DW)} ${f(yS(0))}L${f(CX + DW)} ${f(H - yS(0))}A${f(R0)} ${f(R0)} 0 0 1 ${f(CX - DW)} ${f(H - yS(0))}Z`;
  const shaded = i => i % 3 === 1, strong = i => ((i - 1) / 3) % 2 === 0;
  let defs = `<clipPath id="r6o"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${door}"/></clipPath>`;
  const cw = phone ? 18 : 12, colsX = [];
  for (let x = 0, j = 0; x < CX - DW - 2 * g; x += cw, j++) colsX.push([x, j]);
  const colStrips = () => { let c = ''; for (const [x, j] of colsX) if (j % 10 === 2) for (const xx of [x, W - x]) c += `M${f(xx)} 0H${f(xx + (xx < CX ? cw * 3 : -cw * 3))}V${H}H${f(xx)}Z `; return c; };
  // the shaded shapes, as path data, each with its tone
  const shapes = [];
  for (let i = 1; i < N; i++) if (shaded(i)) for (const c of [cT, cB]) shapes.push([ring(c, i), i]);
  if (mode === 'doors') for (let j = 0; j < NU; j++) if (shaded(j)) shapes.push([strip(j), j]);
  const tone = i => mode === 'columns' ? .2 : strong(i) ? .26 : .11;
  let fills = '';
  if (mode === 'turns') {
    // overlaps add up: every ring is its own area
    for (const [d, i] of shapes) fills += area(d, PETROL, tone(i), 6, 'fill-rule="evenodd"');
  } else {
    // where shaded areas cross, the cell turns dark: one even-odd clip of everything shaded
    const all = shapes.map(s => s[0]).join(' ') + (mode === 'columns' ? ' ' + colStrips() : '');
    defs += `<clipPath id="r6x"><path clip-rule="evenodd" d="${all}"/></clipPath>`;
    if (mode === 'columns') fills = `<g clip-path="url(#r6x)">${area(`M0 0H${W}V${H}H0Z`, PETROL, .2, 6)}</g>`;
    else {
      // strong bands over faint ones; the faint tone is masked out wherever a strong band lies
      let mS = '', mF = '';
      for (const [d, i] of shapes) { const e = `<path d="${d}" fill-rule="evenodd" fill="#fff"/>`; if (strong(i)) mS += e; else mF += e; }
      defs += `<mask id="r6s" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${mS}</mask>`;
      defs += `<mask id="r6f" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${mF}${mS.replace(/#fff/g, '#000')}</mask>`;
      fills = `<g clip-path="url(#r6x)"><g mask="url(#r6f)">${area(`M0 0H${W}V${H}H0Z`, PETROL, .11, 6)}</g><g mask="url(#r6s)">${area(`M0 0H${W}V${H}H0Z`, PETROL, .26, 6)}</g></g>`;
    }
  }
  let b = `<g clip-path="url(#r6o)">${fills}`;
  // the lower layer: rays from the door's centre, starting on the door's edge, out past the frame
  const nr = phone ? 40 : 56, rays = [];
  for (let q = 0; q < nr; q++) {
    const t = (q + .5) / nr * 2 * Math.PI, dx = Math.cos(t), dy = Math.sin(t);
    rays.push([dx, dy]);
    b += k.path(`M${f(CX + 1800 * dx)} ${f(CY + 1800 * dy)}L${CX} ${CY}`, .1, .5, 7);
  }
  // sparkles: where a ray meets a bold ring of either family, every other hit, mirrored by construction
  const hits = [];
  for (const [dx, dy] of rays) for (let i = 3; i < N; i += 3) for (const c of [cT, cB]) {
    // solve |C + t*d - c| = R(i) for t > 0
    const ox = CX - c[0], oy = CY - c[1], bq = ox * dx + oy * dy, cq = ox * ox + oy * oy - R(i) * R(i), disc = bq * bq - cq;
    if (disc < 0) continue;
    for (const t of [-bq - Math.sqrt(disc), -bq + Math.sqrt(disc)]) {
      if (t <= 0) continue;
      const x = CX + t * dx, y = CY + t * dy;
      if (x < 8 || x > W - 8 || y < 8 || y > H - 8) continue;
      hits.push([x, y, i]);
    }
  }
  hits.forEach(([x, y, i], q) => {
    const h = (Math.round(Math.abs(x - CX)) * 7 + Math.round(Math.abs(y - CY)) * 13 + i) % 5;
    if (h > 1) return;
    b += `<circle class="a" style="--i:7" cx="${f(x)}" cy="${f(y)}" r="${h ? 4 : 2.4}" fill="${GOLD}" fill-opacity="${h ? .32 : .26}"/>`;
  });
  // columns (gold pinstripes) in 'columns', as round 4
  if (mode === 'columns') for (const [x, j] of colsX) for (const xx of [x, W - x]) b += k.path(`M${f(xx)} 0L${f(xx)} ${H}`, j % 5 === 0 ? MID : FINE * .8, j % 5 === 0 ? .9 : .5, 8 - Math.min(7, j / 3));
  // the lines: every ring of both families whole, every upright frame to frame, the door's arcs too
  for (let i = N; i >= 0; i--) {
    const o = i % 3 === 0 ? MID : FINE, sw = i % 3 === 0 ? .9 : .6, ii = Math.min(8, i);
    b += k.path(circ(cT, R(i)), o, sw, ii) + k.path(circ(cB, R(i)), o, sw, ii);
    if (i >= 1 && i <= NU) for (const sx of [-1, 1]) b += k.path(`M${f(CX + sx * X(i))} 0L${f(CX + sx * X(i))} ${H}`, o, sw, ii);
  }
  b += `</g><path d="${door}" style="fill:var(--card-bg)"/>` + k.path(door, STRUCT, 1, 0);
  b += fan(k, CX, TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
  return svg(b, defs);
}


// ---------------------------------------------------------------------------------------------------
// Round 7, shared pieces. The door is round 2's arched door (round 4 and 5 used it unchanged).
const G7 = { DW: 470, SAG: 150, TOPY: CY - 310 };
G7.R0 = (G7.DW * G7.DW + G7.SAG * G7.SAG) / (2 * G7.SAG);
G7.cT = [CX, G7.TOPY + G7.R0];
G7.yS = (x, r) => G7.cT[1] - Math.sqrt(r * r - x * x);
const doorD = (o = 0) => { const x = G7.DW + o, r = G7.R0 + o, y = G7.yS(x, r); return `M${f(CX - x)} ${f(y)}A${f(r)} ${f(r)} 0 0 1 ${f(CX + x)} ${f(y)}L${f(CX + x)} ${f(H - y)}A${f(r)} ${f(r)} 0 0 1 ${f(CX - x)} ${f(H - y)}Z`; };
const inDoor = (x, y, o = 0) => Math.abs(x - CX) <= G7.DW + o && Math.hypot(x - CX, y - G7.cT[1]) <= G7.R0 + o && Math.hypot(x - CX, y - (H - G7.cT[1])) <= G7.R0 + o;
const doorAndSuns = (k, phone) => `<path d="${doorD()}" style="fill:var(--card-bg)"/>` + k.path(doorD(), STRUCT, 1, 0)
  + fan(k, CX, G7.TOPY, phone ? 112 : 90, true, Math.PI / (phone ? 8 : 12), 1) + fan(k, CX, H - G7.TOPY, phone ? 112 : 90, false, Math.PI / (phone ? 8 : 12), 1);
const M4 = P => [P, [W - P[0], P[1]], [P[0], H - P[1]], [W - P[0], H - P[1]]];
const seg = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const poly = P => 'M' + P.map(p => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
// walk from p along dir until test(p) is true (or the field is left); returns the point
function walk(p, dir, test, max = 3000) {
  let [x, y] = p;
  for (let s = 0; s < max; s += 1) { x += dir[0]; y += dir[1]; if (test(x, y)) return [x, y]; if (x < -5 || x > W + 5 || y < -5 || y > H + 5) return [x, y]; }
  return [x, y];
}
// the sparkle layer, as on the Eye: fine rays from the door out past the frame, and small gold
// sparkles where a ray meets a bold line (bold lines given as polylines); mirrored by construction
function sparkleLayer(k, phone, bold) {
  let b = '';
  const nr = phone ? 40 : 56, rays = [];
  for (let q = 0; q < nr; q++) { const t = (q + .5) / nr * 2 * Math.PI; rays.push([Math.cos(t), Math.sin(t)]); b += k.path(`M${f(CX + 1800 * Math.cos(t))} ${f(CY + 1800 * Math.sin(t))}L${CX} ${CY}`, .1, .5, 7); }
  const seen = new Set();
  for (const [dx, dy] of rays) for (const P of bold) for (let j = 0; j + 1 < P.length; j++) {
    const [a, c] = [P[j], P[j + 1]], ex = c[0] - a[0], ey = c[1] - a[1], den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((a[0] - CX) * ey - (a[1] - CY) * ex) / den, u = ((a[0] - CX) * dy - (a[1] - CY) * dx) / den;
    if (t <= 0 || u < 0 || u > 1) continue;
    const x = CX + t * dx, y = CY + t * dy;
    if (x < 10 || x > W - 10 || y < 10 || y > H - 10 || inDoor(x, y, 8)) continue;
    const key = `${Math.round(Math.abs(x - CX))},${Math.round(Math.abs(y - CY))}`;
    const h = (Math.round(Math.abs(x - CX)) * 7 + Math.round(Math.abs(y - CY)) * 13) % 5;
    if (h > 1 || seen.has(key + (x < CX) + (y < CY))) continue;
    seen.add(key + (x < CX) + (y < CY));
    b += `<circle class="a" style="--i:7" cx="${f(x)}" cy="${f(y)}" r="${h ? 4 : 2.4}" fill="${GOLD}" fill-opacity="${h ? .32 : .26}"/>`;
  }
  return b;
}

// SET 1 · Running on, in their own shapes. Round 4's 3 and round 5's b exactly as they were; the one
// change is that a line no longer stops where it meets another: it carries on straight, along the
// direction it had, through the crossing and on to the frame. Round 4's arches met their mirror on the
// centre line and stopped: now each runs on past that point, so upper and lower arches cross in an X at
// the sides and their straight runs make a lattice there. Round 5's arches stopped on their own upright
// at the shoulder: now each runs on past the shoulder, straight, crossing the uprights to the frame. The
// arches stay arches (no circles), the door stays the door. One colour, petrol; the sparkle layer under.
// A tailed arch: an arc between two end points, with each end carried on straight along its tangent.
function tailed(c, r, xe, ye, s) {         // s 1: the arch above (centre below), -1: the mirror below
  const h = c[1] - ye, L = 2600, Y = y => s > 0 ? y : H - y;
  const Q = [CX - xe, Y(ye)], P = [CX + xe, Y(ye)];
  const fl = [Q[0] - L * h / r, Y(ye + L * xe / r)], fr = [P[0] + L * h / r, Y(ye + L * xe / r)];
  const sw = s > 0 ? 1 : 0;
  const pts = [fl]; const a0 = Math.atan2(ye - c[1], -xe), a1 = Math.atan2(ye - c[1], xe);
  for (let q = 0; q <= 48; q++) { const a = a0 + (a1 - a0) * q / 48; pts.push([c[0] + r * Math.cos(a), Y(c[1] + r * Math.sin(a))]); }
  pts.push(fr);
  return { Q, P, fl, fr, r, sw, pts, d: `M${f(fl[0])} ${f(fl[1])}L${f(Q[0])} ${f(Q[1])}A${f(r)} ${f(r)} 0 0 ${sw} ${f(P[0])} ${f(P[1])}L${f(fr[0])} ${f(fr[1])}` };
}
const tBand = (a, b) => `M${f(a.fl[0])} ${f(a.fl[1])}L${f(a.Q[0])} ${f(a.Q[1])}A${f(a.r)} ${f(a.r)} 0 0 ${a.sw} ${f(a.P[0])} ${f(a.P[1])}L${f(a.fr[0])} ${f(a.fr[1])}L${f(b.fr[0])} ${f(b.fr[1])}L${f(b.P[0])} ${f(b.P[1])}A${f(b.r)} ${f(b.r)} 0 0 ${1 - a.sw} ${f(b.Q[0])} ${f(b.Q[1])}L${f(b.fl[0])} ${f(b.fl[1])}Z`;

function runStraight(phone, shape = 'r4', mode = 'turns') {
  const k = kit(phone), g = phone ? 46 : 32, { DW, R0, cT } = G7;
  const X = i => DW + i * g, R = i => R0 + i * g, N = Math.ceil((CX - DW) / g) + 7;
  const dyc = cT[1] - CY;
  // the arches: round 4's end on the centre line, round 5's on their own upright (the shoulder)
  const arch = (i, s) => shape === 'r4' ? tailed(cT, R(i), Math.sqrt(R(i) * R(i) - dyc * dyc), CY, s) : tailed(cT, R(i), X(i), G7.yS(X(i), R(i)), s);
  const shaded = i => i % 3 === 1, strong = i => ((i - 1) / 3) % 2 === 0;
  let defs = `<clipPath id="q7o${shape}${mode}"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${doorD()}"/></clipPath>`;
  const id = shape + mode;
  const cw = phone ? 18 : 12, colsX = [];
  for (let x = 0, j = 0; x < CX - DW - 2 * g; x += cw, j++) colsX.push([x, j]);
  const colStrips = () => { let c = ''; for (const [x, j] of colsX) if (j % 10 === 2) for (const xx of [x, W - x]) c += `M${f(xx)} 0H${f(xx + (xx < CX ? cw * 3 : -cw * 3))}V${H}H${f(xx)}Z `; return c; };
  // shaded areas
  const bands = [];   // [d, i]
  for (let i = 1; i < N; i++) if (shaded(i)) for (const s of [1, -1]) bands.push([tBand(arch(i, s), arch(i + 1, s)), i]);
  if (shape === 'r5') for (let i = 1; i < N; i++) if (shaded(i)) {
    // round 5's door band: the side strip between the two families' shoulders, joined to its heads
    const y0 = G7.yS(X(i + 1), R(i + 1)), y1 = G7.yS(X(i), R(i));
    bands.push([`M${f(CX + X(i))} ${f(y1)}H${f(CX + X(i + 1))}V${f(H - y0)}L${f(CX + X(i))} ${f(H - y1)}Z M${f(CX - X(i + 1))} ${f(y0)}L${f(CX - X(i))} ${f(y1)}V${f(H - y1)}L${f(CX - X(i + 1))} ${f(H - y0)}Z`, i]);
  }
  let fills = '';
  if (mode === 'turns' && shape === 'r4') {
    for (const [d, i] of bands) fills += area(d, PETROL, strong(i) ? .26 : .11, 6);
  } else if (mode === 'columns') {
    defs += `<clipPath id="q7x${id}"><path clip-rule="evenodd" d="${bands.map(b => b[0]).join(' ')} ${colStrips()}"/></clipPath>`;
    fills = `<g clip-path="url(#q7x${id})">${area(`M0 0H${W}V${H}H0Z`, PETROL, .2, 6)}</g>`;
  } else {
    // round 5's rule: where a strong band meets a faint one the cell stays dark; like tones join
    let mS = '', mF = '';
    for (const [d, i] of bands) { const e = `<path d="${d}" fill="#fff"/>`; if (strong(i)) mS += e; else mF += e; }
    defs += `<mask id="q7s${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${mS}${mF.replace(/#fff/g, '#000')}</mask>`;
    defs += `<mask id="q7f${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${mF}${mS.replace(/#fff/g, '#000')}</mask>`;
    fills = `<g mask="url(#q7f${id})">${area(`M0 0H${W}V${H}H0Z`, PETROL, .11, 6)}</g><g mask="url(#q7s${id})">${area(`M0 0H${W}V${H}H0Z`, PETROL, .26, 6)}</g>`;
  }
  let b = `<g clip-path="url(#q7o${id})">${fills}`;
  const bold = [];
  for (let i = 1; i <= N; i++) if (i % 3 === 0) { bold.push(arch(i, 1).pts, arch(i, -1).pts); if (X(i) < CX) for (const sx of [-1, 1]) bold.push([[CX + sx * X(i), 0], [CX + sx * X(i), H]]); }
  b += sparkleLayer(k, phone, bold);
  if (mode === 'columns') for (const [x, j] of colsX) for (const xx of [x, W - x]) b += k.path(`M${f(xx)} 0L${f(xx)} ${H}`, j % 5 === 0 ? MID : FINE * .8, j % 5 === 0 ? .9 : .5, 8 - Math.min(7, j / 3));
  for (let i = N; i >= 1; i--) {
    const o = i % 3 === 0 ? MID : FINE, sw = i % 3 === 0 ? .9 : .6, ii = Math.min(8, i);
    b += k.path(arch(i, 1).d, o, sw, ii) + k.path(arch(i, -1).d, o, sw, ii);
    if (X(i) < CX) for (const sx of [-1, 1]) b += k.path(`M${f(CX + sx * X(i))} 0L${f(CX + sx * X(i))} ${H}`, o, sw, ii);
  }
  b += '</g>' + doorAndSuns(k, phone);
  return svg(b, defs);
}

// SET 2 · A card, not a graphic. What the three reference decks share: the drawing is made for the
// rectangle (a border, designed corners and ends, nothing cut off by the edge); it has zones, each with
// its own treatment; there is one object on the centre line that reads either way up; density is
// planned. Lines still run on through crossings, but every one ends on something: the border, the door,
// another line. The door, the half suns, the logo, the start words and today's frame stay. Petrol only.

// border: parallel lines inset from the frame, corners cut at 45° (the cut stays parallel line to line)
const chamferRect = (t, C) => { const c = C + t * (Math.SQRT2 - 2); return `M${f(t + c)} ${f(t)}H${f(W - t - c)}L${f(W - t)} ${f(t + c)}V${f(H - t - c)}L${f(W - t - c)} ${f(H - t)}H${f(t + c)}L${f(t)} ${f(H - t - c)}V${f(t + c)}Z`; };
const steppedRect = (t, s) => { // corners stepped twice, inward
  const P = [];
  const corner = (cx, cy, sx, sy) => [[cx, cy + sy * 2 * s], [cx + sx * s, cy + sy * 2 * s], [cx + sx * s, cy + sy * s], [cx + sx * 2 * s, cy + sy * s], [cx + sx * 2 * s, cy]];
  P.push(...corner(t, t, 1, 1));
  P.push(...corner(W - t, t, -1, 1).reverse());
  P.push(...corner(W - t, H - t, -1, -1));
  P.push(...corner(t, H - t, 1, -1).reverse());
  return poly(P);
};

// A · Lines and shapes (the techno card). The frame is the drawing: a bundle of lines runs round the
// border with its corners cut, and from each cut corner a bundle of 45° lines runs in to the door and
// ends on it. The bundles from above and below cross in front of the door's sides, a lattice of
// diamonds, the techno card's netted diamond; above and below the door, straight uprights hang from the
// border and end on the door's arch, stepping with it. Corner rings sit on the cut corners. Dense edges,
// an empty middle. Petrol: every fourth band of the lattice and of the uprights, crossings dark.
function techno(phone) {
  const k = kit(phone), sp = phone ? 26 : 18, T = [26, 38, 50], C0 = 120, tin = 50;
  const cIn = C0 + tin * (Math.SQRT2 - 2);
  const insideBorder = (x, y) => x > tin && y > tin && x < W - tin && y < H - tin && x + y > tin * 2 + cIn && (W - x) + y > tin * 2 + cIn && x + (H - y) > tin * 2 + cIn && (W - x) + (H - y) > tin * 2 + cIn;
  let b = '', bandsD = '';
  // the lattice, upper-left family (x - y = c), mirrored to the other three
  const fam = [];
  for (let c = -300, j = 0; c <= 40; c += sp, j++) {
    // start: where the line enters the border, walking back from deep outside
    const dir = [Math.SQRT1_2, Math.SQRT1_2];
    const s0 = c >= 0 ? [c, 0] : [0, -c];
    const start = walk(s0, dir, insideBorder);
    const end = walk(start, dir, (x, y) => inDoor(x, y) || !insideBorder(x, y) || (Math.abs(x - CX) < 140 && y < G7.TOPY + 10));
    fam.push([start, end, j]);
  }
  const lines = [];
  for (const [a, e, j] of fam) for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
    lines.push([m(a), m(e), j]);
  }
  for (let q = 0; q + 1 < fam.length; q++) if (q % 4 === 1) {
    const [a1, e1] = fam[q], [a2, e2] = fam[q + 1];
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
      bandsD += poly([m(a1), m(e1), m(e2), m(a2)]) + ' ';
    }
  }
  // uprights above and below the door, from the border to the arch
  const ups = [];
  for (let x = CX + 150, j = 0; x < CX + G7.DW - 6; x += sp, j++) {
    const y = G7.yS(x - CX, G7.R0);
    ups.push([x, y, j]);
  }
  for (let q = 0; q + 1 < ups.length; q++) if (q % 4 === 2) for (const sx of [1, -1]) for (const top of [true, false]) {
    const x1 = CX + sx * (ups[q][0] - CX), x2 = CX + sx * (ups[q + 1][0] - CX);
    const y1 = ups[q][1], y2 = ups[q + 1][1];
    bandsD += top ? poly([[x1, tin], [x2, tin], [x2, y2], [x1, y1]]) + ' ' : poly([[x1, H - tin], [x2, H - tin], [x2, H - y2], [x1, H - y1]]) + ' ';
  }
  // corner pieces: the cut corner's triangle in petrol
  const cc = cIn;
  const corners = M4([0, 0]).map(([x0, y0]) => { const sx = x0 ? -1 : 1, sy = y0 ? -1 : 1; return poly([[x0 + sx * tin, y0 + sy * tin], [x0 + sx * (tin + cc), y0 + sy * tin], [x0 + sx * tin, y0 + sy * (tin + cc)]]); }).join(' ');
  const defs = `<clipPath id="t7x"><path clip-rule="evenodd" d="${bandsD}"/></clipPath>`;
  b += `<g clip-path="url(#t7x)">${area(`M0 0H${W}V${H}H0Z`, PETROL, .22, 6)}</g>` + area(corners, PETROL, .3, 6);
  // lines
  T.forEach((t, q) => { b += k.path(chamferRect(t, C0), q === 1 ? MID : FINE + .06, q === 1 ? .9 : .6, 9); });
  for (const [a, e, j] of lines) b += k.path(seg(a, e), j % 4 === 0 ? MID : FINE + .04, j % 4 === 0 ? .9 : .6, 8 - Math.min(7, j / 3));
  for (const [x, y, j] of ups) for (const sx of [1, -1]) {
    const xx = CX + sx * (x - CX), o = j % 4 === 0 ? MID : FINE + .04, sw = j % 4 === 0 ? .9 : .6;
    b += k.path(`M${f(xx)} ${tin}L${f(xx)} ${f(y)}`, o, sw, 8) + k.path(`M${f(xx)} ${H - tin}L${f(xx)} ${f(H - y)}`, o, sw, 8);
  }
  // corner rings on the cut corners, the lattice's first line running through them
  for (const [x0, y0] of M4([0, 0])) {
    const sx = x0 ? -1 : 1, sy = y0 ? -1 : 1, cx = x0 + sx * (tin + cc * .5 + 28), cy = y0 + sy * (tin + cc * .5 + 28);
    b += `<circle cx="${f(cx)}" cy="${f(cy)}" r="30" style="fill:var(--card-bg)"/>`;
    for (const [r, o] of [[30, MID], [21, FINE + .08], [12, .4]]) b += `<circle class="d" style="--i:9" pathLength="1" cx="${f(cx)}" cy="${f(cy)}" r="${r}" ${k.st(o, .7)}/>`;
    b += `<circle class="a" style="--i:9" cx="${f(cx)}" cy="${f(cy)}" r="6" fill="${PETROL}" fill-opacity=".9"/>`;
  }
  b += doorAndSuns(k, phone);
  return svg(b, defs);
}

// B · Medallion (the mystic game's box). The door is the medallion: a ring of ticks round it, a second
// outline, then rays of two lengths running out, the long ones carrying a small diamond and ending on
// the end panels or the border, the short ones ending on an outer outline with a stone. At each end an
// arched panel in petrol holds a half fan rising from the border, like the box's arched end panels; a
// quarter fan sits in each corner. A border of two lines with small diamonds along it closes the card.
function medallion(phone) {
  const k = kit(phone), t0 = 30, t1 = 46, rp = 697, cxp = -397;   // panel arc: from x=300 at the middle to x=130 at the border
  const panel = sx => { const c = sx > 0 ? cxp : W - cxp; return `M${f(c)} ${CY - 1}m0 0` && `M${f(sx > 0 ? 0 : W)} 0V${H}H${f(sx > 0 ? 0 : W)}Z`; };
  const panelD = sx => { // region between the border and the arc
    const c = sx > 0 ? cxp : W - cxp, xe = r => sx > 0 ? c + Math.sqrt(rp * rp - Math.pow(r - CY, 2)) : c - Math.sqrt(rp * rp - Math.pow(r - CY, 2));
    const yt = t1, yb = H - t1, xb = sx > 0 ? t1 : W - t1;
    return `M${f(xb)} ${yt}L${f(xe(yt))} ${yt}A${rp} ${rp} 0 0 ${sx > 0 ? 1 : 0} ${f(xe(yb))} ${yb}L${f(xb)} ${yb}Z`;
  };
  const inPanel = (x, y) => Math.hypot(x - cxp, y - CY) < rp || Math.hypot(x - (W - cxp), y - CY) < rp;
  const inBorder = (x, y) => x > t1 && y > t1 && x < W - t1 && y < H - t1;
  let b = '', defs = '';
  b += area(panelD(1) + panelD(-1), PETROL, .2, 6);
  b += area(`${doorD(40)} ${doorD(18)}`, PETROL, .16, 6, 'fill-rule="evenodd"');
  // ticks between the door's outlines 18 and 40
  defs += `<clipPath id="m7t"><path clip-rule="evenodd" d="${doorD(40)} ${doorD(18)}"/></clipPath>`;
  let ticks = '';
  const nt = phone ? 120 : 160;
  for (let q = 0; q < nt; q++) { const a = (q + .5) / nt * 2 * Math.PI; ticks += k.path(`M${CX} ${CY}L${f(CX + 900 * Math.cos(a))} ${f(CY + 900 * Math.sin(a))}`, .3, .5, 3); }
  b += `<g clip-path="url(#m7t)">${ticks}</g>`;
  // rays: long to the panels or border, short to the outline at 170
  const nr = phone ? 36 : 48;
  for (let q = 0; q < nr; q++) {
    const a = (q + .5) / nr * 2 * Math.PI, d = [Math.cos(a), Math.sin(a)];
    const p0 = walk([CX, CY], d, (x, y) => !inDoor(x, y, 40));
    if (Math.abs(d[1]) < .08) continue;                                   // keep the sides free for the panels' fans
    if (q % 2 === 0) {
      const p1 = walk(p0, d, (x, y) => inPanel(x, y) || !inBorder(x, y));
      b += k.path(seg(p0, p1), MID, .8, 5);
      const pd = [p0[0] + d[0] * 70, p0[1] + d[1] * 70], s = 9;
      b += `<path class="a" style="--i:5" d="M${f(pd[0])} ${f(pd[1] - s)}L${f(pd[0] + s * .7)} ${f(pd[1])}L${f(pd[0])} ${f(pd[1] + s)}L${f(pd[0] - s * .7)} ${f(pd[1])}Z" fill="${PETROL}" fill-opacity=".9" stroke="${GOLD}" stroke-opacity=".5" stroke-width=".7" vector-effect="non-scaling-stroke"/>`;
    } else {
      const p1 = walk(p0, d, (x, y) => !inDoor(x, y, 170) || inPanel(x, y) || !inBorder(x, y));
      b += k.path(seg(p0, p1), FINE + .08, .6, 5);
      b += `<circle class="a" style="--i:5" cx="${f(p1[0])}" cy="${f(p1[1])}" r="4" fill="${GOLD}" fill-opacity=".45"/>`;
    }
  }
  // outlines round the door, crossing the rays; clipped off the panels
  defs += `<clipPath id="m7p"><path clip-rule="evenodd" d="M0 0H${W}V${H}H0Z ${panelD(1)} ${panelD(-1)}"/></clipPath>`;
  b += `<g clip-path="url(#m7p)">`;
  for (const [o, op, sw] of [[18, FINE + .1, .6], [40, MID, .9], [100, FINE, .5], [170, FINE + .06, .6], [240, FINE, .5]]) b += k.path(doorD(o), op, sw, 4);
  b += '</g>';
  // panels: double arc, half fan from the border's middle
  for (const sx of [1, -1]) {
    const c = sx > 0 ? cxp : W - cxp;
    for (const [dr, op] of [[0, MID], [-14, FINE + .06]]) {
      const r = rp + dr, xe = y => sx > 0 ? c + Math.sqrt(r * r - Math.pow(y - CY, 2)) : c - Math.sqrt(r * r - Math.pow(y - CY, 2));
      b += k.path(`M${f(xe(t1))} ${t1}A${r} ${r} 0 0 ${sx > 0 ? 1 : 0} ${f(xe(H - t1))} ${H - t1}`, op, .8, 6);
    }
    const ox = sx > 0 ? t1 : W - t1;
    for (const [r, op] of [[60, MID], [110, FINE + .06]]) b += k.path(`M${ox} ${CY - r}A${r} ${r} 0 0 ${sx > 0 ? 1 : 0} ${ox} ${CY + r}`, op, .7, 6);
    for (let a = -75; a <= 75; a += 15) {
      const t = a * Math.PI / 180, d = [sx * Math.cos(t), Math.sin(t)], p0 = [ox + d[0] * 60, CY + d[1] * 60];
      const p1 = walk(p0, d, (x, y) => !(Math.hypot(x - c, y - CY) < rp - 14));
      b += k.path(seg(p0, p1), a % 30 === 0 ? MID : FINE + .06, .6, 6);
    }
    b += `<circle class="a" style="--i:6" cx="${ox}" cy="${CY}" r="10" fill="${GOLD}" fill-opacity=".5"/>`;
  }
  // quarter fans in the corners
  for (const [x0, y0] of M4([t1, t1])) {
    const sx = x0 < CX ? 1 : -1, sy = y0 < CY ? 1 : -1;
    for (const [r, op] of [[64, MID], [40, FINE + .06]]) b += k.path(`M${f(x0 + sx * r)} ${f(y0)}A${r} ${r} 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x0)} ${f(y0 + sy * r)}`, op, .7, 9);
    for (let a = 15; a < 90; a += 15) { const t = a * Math.PI / 180; b += k.path(seg([x0 + sx * 40 * Math.cos(t), y0 + sy * 40 * Math.sin(t)], [x0 + sx * 64 * Math.cos(t), y0 + sy * 64 * Math.sin(t)]), FINE + .06, .5, 9); }
  }
  // border: two lines, small diamonds between them
  b += k.path(`M${t0} ${t0}H${W - t0}V${H - t0}H${t0}Z`, FINE + .1, .6, 9) + k.path(`M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z`, MID, .9, 9);
  const tm = (t0 + t1) / 2;
  for (let x = 140; x <= CX - 60; x += 70) for (const xx of [x, W - x]) for (const y of [tm, H - tm]) b += `<path class="a" style="--i:9" d="M${f(xx - 5)} ${y}L${xx} ${y - 4}L${f(xx + 5)} ${y}L${xx} ${y + 4}Z" fill="${GOLD}" fill-opacity=".4"/>`;
  b += doorAndSuns(k, phone);
  return svg(b, defs);
}

// C · Wings (the Egyptian backs). A figure on the centre line: the door is its body, and from both its
// sides a wing spreads to the frame in tiers, longest at the middle, each tier cut at 45° at its tip,
// the tip's cut running on to the border. Above and below, the half suns get a crescent and a sunrise of
// rays behind it, ending on the border. Fine hatching fills the dark ground, as on the Egyptian backs; a
// border with stepped corners and a quarter fan in each corner closes it. Petrol: the wing tiers in turn.
function wings(phone) {
  const k = kit(phone), t0 = 28, t1 = 42, st = 26, hT = phone ? 46 : 40, nT = 5, xD = CX - G7.DW;
  let b = '', defs = '';
  // tiers of the left upper wing (mirrored four ways): tier q spans y from CY - (q+1)hT to CY - q hT
  const tier = q => { const y0 = CY - q * hT, y1 = CY - (q + 1) * hT, xo = 80 + q * 52; return { y0, y1, xo, P: [[xD, y0], [xo, y0], [xo + hT, y1], [xD, y1]] }; };
  const mir = (P, sx, sy) => P.map(p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]]);
  let wingsD = '', strongD = '', faintD = '';
  for (let q = 0; q < nT; q++) for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const d = poly(mir(tier(q).P, sx, sy)) + ' ';
    wingsD += d; if (q % 2 === 0) strongD += d; else faintD += d;
  }
  // hatch on the ground, kept off the door and the wings
  defs += `<clipPath id="w7h"><path clip-rule="evenodd" d="M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z ${doorD(6)} ${wingsD}"/></clipPath>`;
  let hatch = '';
  for (let c = -H; c < W; c += phone ? 16 : 11) hatch += `<path d="M${c} 0L${c + H} ${H}" stroke="${GOLD}" stroke-opacity=".07" stroke-width="${phone ? .5 : .4}" vector-effect="non-scaling-stroke" fill="none"/>`;
  b += `<g clip-path="url(#w7h)" class="a" style="--i:7">${hatch}</g>`;
  b += area(strongD, PETROL, .3, 6) + area(faintD, PETROL, .14, 6);
  // sunrise behind the crescents, from each half sun to the border
  const rS = phone ? 112 : 90, cr = [rS + 60, rS + 90];
  defs += `<clipPath id="w7s"><path clip-rule="evenodd" d="M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z ${doorD(0)} M${CX - cr[1]} ${G7.TOPY}a${cr[1]} ${cr[1]} 0 1 0 ${2 * cr[1]} 0a${cr[1]} ${cr[1]} 0 1 0 ${-2 * cr[1]} 0Z M${CX - cr[1]} ${H - G7.TOPY}a${cr[1]} ${cr[1]} 0 1 0 ${2 * cr[1]} 0a${cr[1]} ${cr[1]} 0 1 0 ${-2 * cr[1]} 0Z ${wingsD}"/></clipPath>`;
  let rays = '';
  for (const [cy, s] of [[G7.TOPY, -1], [H - G7.TOPY, 1]]) for (let a = 10; a <= 170; a += phone ? 8 : 5) {
    const t = a * Math.PI / 180;
    rays += k.path(`M${CX} ${cy}L${f(CX + 1200 * Math.cos(t))} ${f(cy + s * 1200 * Math.sin(t))}`, a % 20 === 10 ? MID * .8 : FINE + .04, .5, 7);
  }
  b += `<g clip-path="url(#w7s)">${rays}</g>`;
  // crescents: two arcs round each half sun, ending on the door's arch
  defs += `<clipPath id="w7c"><path clip-rule="evenodd" d="M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z ${doorD(0)}"/></clipPath>`;
  b += `<g clip-path="url(#w7c)">`;
  for (const cy of [G7.TOPY, H - G7.TOPY]) cr.forEach((r, q) => { b += `<circle class="d" style="--i:2" pathLength="1" cx="${CX}" cy="${cy}" r="${r}" ${k.st(q ? MID : FINE + .1, q ? .9 : .6)}/>`; });
  b += area(`M${CX - cr[1]} ${G7.TOPY}a${cr[1]} ${cr[1]} 0 1 0 ${2 * cr[1]} 0a${cr[1]} ${cr[1]} 0 1 0 ${-2 * cr[1]} 0Z M${CX - cr[0]} ${G7.TOPY}a${cr[0]} ${cr[0]} 0 1 0 ${2 * cr[0]} 0a${cr[0]} ${cr[0]} 0 1 0 ${-2 * cr[0]} 0Z M${CX - cr[1]} ${H - G7.TOPY}a${cr[1]} ${cr[1]} 0 1 0 ${2 * cr[1]} 0a${cr[1]} ${cr[1]} 0 1 0 ${-2 * cr[1]} 0Z M${CX - cr[0]} ${H - G7.TOPY}a${cr[0]} ${cr[0]} 0 1 0 ${2 * cr[0]} 0a${cr[0]} ${cr[0]} 0 1 0 ${-2 * cr[0]} 0Z`, PETROL, .22, 3, 'fill-rule="evenodd"');
  b += '</g>';
  // wing lines: each tier's outline, one feather line inside, and the tip's cut run on to the border
  for (let q = 0; q < nT; q++) for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const T = tier(q), P = mir(T.P, sx, sy), ym = (T.y0 + T.y1) / 2;
    b += k.path(seg(P[0], P[1]) + `L${f(P[2][0])} ${f(P[2][1])}L${f(P[3][0])} ${f(P[3][1])}`, q === 0 ? MID : FINE + .1, q === 0 ? .9 : .7, 6 - q);
    const fm = mir([[xD, ym], [T.xo + hT / 2 + 10, ym]], sx, sy);
    b += k.path(seg(fm[0], fm[1]), FINE, .5, 6 - q);
    // the cut at the tip, run on outward to the border
    const tip = mir([[T.xo, T.y0]], sx, sy)[0], dir = [-sx * Math.SQRT1_2, sy * Math.SQRT1_2];
    const e = walk(tip, dir, (x, y) => x < t1 || x > W - t1 || y < t1 || y > H - t1);
    b += k.path(seg(tip, e), FINE + .04, .5, 8);
  }
  // border with stepped corners, quarter fans in the corners
  b += k.path(steppedRect(t0, st), FINE + .1, .6, 9) + k.path(steppedRect(t1, st), MID, .9, 9);
  for (const [x0, y0] of M4([t1 + 2 * st, t1 + 2 * st])) {
    const sx = x0 < CX ? 1 : -1, sy = y0 < CY ? 1 : -1;
    b += `<path class="a" style="--i:9" d="M${f(x0)} ${f(y0)}L${f(x0 + sx * 46)} ${f(y0)}A46 46 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x0)} ${f(y0 + sy * 46)}Z" fill="${PETROL}" fill-opacity=".35"/>`;
    b += k.path(`M${f(x0 + sx * 46)} ${f(y0)}A46 46 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x0)} ${f(y0 + sy * 46)}`, MID, .7, 9);
    for (let a = 22.5; a < 90; a += 22.5) { const t = a * Math.PI / 180; b += k.path(seg([x0, y0], [x0 + sx * 46 * Math.cos(t), y0 + sy * 46 * Math.sin(t)]), FINE + .08, .5, 9); }
  }
  b += doorAndSuns(k, phone);
  return svg(b, defs);
}

// D · Cut areas (the outlier: the tarot box's "cut of areas that get their own design", carried all the
// way). Four double lines run from the border's corners to the door's shoulders and cut the card into four
// fields round the door, each with its own design: above and below, a sunrise from the half sun with two
// arcs crossing its rays; left and right, nested chevrons that point at the door, every band its own tone.
// A small diamond marks each cut where it meets the door. Every line ends on the border, a cut or the door.
function cutAreas(phone) {
  const k = kit(phone), t1 = 40, sp = phone ? 30 : 22, x0 = CX - G7.DW, yS0 = G7.yS(G7.DW, G7.R0);
  const shL = [x0, yS0];                                         // upper-left shoulder
  const cut = [[t1, t1], shL];
  const dv = [shL[0] - t1, shL[1] - t1], dl = Math.hypot(...dv), du = [dv[0] / dl, dv[1] / dl];
  // which field a point is in
  const side = (x, y) => { // >0 above the upper-left cut line (towards the top field)
    const ax = Math.abs(x - CX), ay = Math.abs(y - CY), px = CX - ax, py = CY - ay;   // fold into the upper-left quarter
    return (px - t1) * du[1] - (py - t1) * du[0];   // >0: below/left of the cut (left field), <0: above (top field)
  };
  let b = '', defs = '';
  // the top and bottom fields: sunrise and two arcs
  const topField = `M${t1} ${t1}L${f(shL[0])} ${f(shL[1])}A${f(G7.R0)} ${f(G7.R0)} 0 0 1 ${f(W - shL[0])} ${f(shL[1])}L${W - t1} ${t1}Z`;
  const botField = `M${t1} ${H - t1}L${f(shL[0])} ${f(H - shL[1])}A${f(G7.R0)} ${f(G7.R0)} 0 0 0 ${f(W - shL[0])} ${f(H - shL[1])}L${W - t1} ${H - t1}Z`;
  const leftField = `M${t1} ${t1}L${f(shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${t1} ${H - t1}Z`;
  const rightField = `M${W - t1} ${t1}L${f(W - shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${W - t1} ${H - t1}Z`;
  defs += `<clipPath id="d7tb"><path d="${topField} ${botField}"/></clipPath><clipPath id="d7lr"><path d="${leftField} ${rightField}"/></clipPath>`;
  // chevrons in the side fields: lines parallel to the two cuts, meeting on the centre line, nested out from the door
  let chev = '', chevA = '';
  const chevP = (j) => { const vx = shL[0] - j * sp; const a = [vx, CY], L = 900; return [[a[0] - du[0] * L, a[1] - du[1] * L], a, [a[0] - du[0] * L, a[1] + du[1] * L]]; };
  const nC = Math.ceil((shL[0] - t1) / sp) + 12;
  for (let j = 0; j < nC; j++) {
    const P = chevP(j);
    for (const sx of [1, -1]) { const Q = P.map(p => [sx > 0 ? p[0] : W - p[0], p[1]]); chev += k.path(`M${f(Q[0][0])} ${f(Q[0][1])}L${f(Q[1][0])} ${f(Q[1][1])}L${f(Q[2][0])} ${f(Q[2][1])}`, j % 3 === 0 ? MID : FINE + .06, j % 3 === 0 ? .9 : .6, 8 - Math.min(7, j / 2)); }
    if (j % 3 === 1) {
      const P2 = chevP(j + 1);
      for (const sx of [1, -1]) { const Q = [...P, ...P2.slice().reverse()].map(p => [sx > 0 ? p[0] : W - p[0], p[1]]); chevA += area(poly(Q), PETROL, (j - 1) / 3 % 2 ? .12 : .28, 6); }
    }
  }
  b += `<g clip-path="url(#d7lr)">${chevA}${chev}</g>`;
  // sunrise in the top and bottom fields, with two arcs crossing it
  let sun = '';
  for (const [cy, s] of [[G7.TOPY, -1], [H - G7.TOPY, 1]]) {
    for (let a = 4; a <= 176; a += phone ? 6 : 4) { const t = a * Math.PI / 180; sun += k.path(`M${CX} ${cy}L${f(CX + 1400 * Math.cos(t))} ${f(cy + s * 1400 * Math.sin(t))}`, a % 12 === 4 ? FINE + .1 : FINE * .7, .5, 7); }
  }
  const arcs = [[380, MID, .9], [430, FINE + .06, .6], [600, FINE + .06, .6]];
  let arcD = '';
  for (const cy of [G7.TOPY, H - G7.TOPY]) for (const [r, o, sw] of arcs) arcD += `<circle class="d" style="--i:4" pathLength="1" cx="${CX}" cy="${cy}" r="${r}" ${k.st(o, sw)}/>`;
  const bandTB = `M${CX - 430} ${G7.TOPY}a430 430 0 1 0 860 0a430 430 0 1 0 -860 0Z M${CX - 380} ${G7.TOPY}a380 380 0 1 0 760 0a380 380 0 1 0 -760 0Z M${CX - 430} ${H - G7.TOPY}a430 430 0 1 0 860 0a430 430 0 1 0 -860 0Z M${CX - 380} ${H - G7.TOPY}a380 380 0 1 0 760 0a380 380 0 1 0 -760 0Z`;
  b += `<g clip-path="url(#d7tb)">${area(bandTB, PETROL, .2, 6, 'fill-rule="evenodd"')}${sun}${arcD}</g>`;
  // the cuts: double lines from the corners to the shoulders, a diamond where they meet the door
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
    const nrm = [-du[1] * 7, du[0] * 7];
    b += k.path(seg(m(cut[0]), m(cut[1])), STRUCT, .9, 3);
    b += k.path(seg(m([cut[0][0] + nrm[0] * 1.6, cut[0][1] + nrm[1] * 1.6]), m([cut[1][0] + nrm[0] * 1.6, cut[1][1] + nrm[1] * 1.6])), FINE + .1, .6, 3);
    const p = m(shL), s = 12;
    b += `<path class="a" style="--i:3" d="M${f(p[0])} ${f(p[1] - s)}L${f(p[0] + s * .75)} ${f(p[1])}L${f(p[0])} ${f(p[1] + s)}L${f(p[0] - s * .75)} ${f(p[1])}Z" fill="${PETROL}" fill-opacity=".95" stroke="${GOLD}" stroke-opacity=".6" stroke-width=".8" vector-effect="non-scaling-stroke"/>`;
  }
  b += k.path(`M${t1 - 12} ${t1 - 12}H${W - t1 + 12}V${H - t1 + 12}H${t1 - 12}Z`, FINE + .1, .6, 9) + k.path(`M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z`, MID, .9, 9);
  b += doorAndSuns(k, phone);
  return svg(b, defs);
}

module.exports = {
  straightColumns: p => runStraight(p, 'r4', 'columns'),
  straightTurns: p => runStraight(p, 'r4', 'turns'),
  straightDoors: p => runStraight(p, 'r5', 'doors'),
  techno, medallion, wings, cutAreas,
};
