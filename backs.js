// backs.js — the start card's seven backs and the Intermezzo's two extra ornaments (#195), as drawn in the round pages:
// 2a turn by turn (round 3), 5a bookmatched (round 4), 8a cut areas (round 8), 8d split by zone in its
// clear order and 8f lines and shapes with jewellery, both in two colours (round 9); 8a in purple with glints (round 12);
// threshold, radiant, four lamps and winged door (round 13). The start card uses 2a, 5a, 8a purple and the round 13 four. Each function returns
// one SVG string for the 1640 x 1000 field that fills the frame's inner line; phone = the lighter drawing.
// Class "d" marks a line that draws in (pathLength 1, ordered by --i), class "a" an area that fades in.
// Plain script: the drawing code lives in one function scope and publishes `Backs` on window.

(function () {

  const W = 1640, H = 1000, CX = 820, CY = 500;

  const GOLD = '#c9a84c', PETROL = '#2a7a78', AMETHYST = '#7a4a9e';

  const WHOLE_FIELD = `M0 0H${W}V${H}H0Z`;

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

  // 2 · Streamline. Today's bundles, but every turn is rounded, the lines turning together round one
  // centre like the bands on a streamline house; a bold band rides beside the pinstripes. The colour
  // turns with the card: petrol top left and bottom right, amethyst the other two, so it reads the same
  // either way up.
  // the streamline's lines: line i of the top (s = 1) or bottom (s = -1) bundle, as corner points and radii
  function streamGeometry(phone) {
    const g = phone ? 30 : 20, XB = 212, Y0 = 200, MIDG = 22;
    const n = Math.ceil(520 / g), tan = Math.tan(Math.PI / 8);
    const pts = (i, s) => {
      const y = CY - s * (MIDG + i * g), yt = CY - s * (CY - Y0 + i * g), xb = XB - i * g * tan, climb = Math.abs(y - yt);
      return [[0, y], [xb, y], [xb + climb, yt], [W - xb - climb, yt], [W - xb, y], [W, y]];
    };
    const rad = i => { const a = Math.max(30, 230 - i * g * .9), c = 160 + i * g * .9; return [0, a, c, c, a, 0]; };
    const line = (i, s) => rounded(pts(i, s), rad(i));
    return { XB, Y0, n, pts, rad, line };
  }

  function streamline(phone, mode = 'quarter') {
    const k = kit(phone), { XB, Y0, n, pts, rad, line } = streamGeometry(phone);
    let defs = `<clipPath id="s2a"><rect width="${CX}" height="${CY}"/><rect x="${CX}" y="${CY}" width="${CX}" height="${CY}"/></clipPath><clipPath id="s2b"><rect x="${CX}" width="${CX}" height="${CY}"/><rect y="${CY}" width="${CX}" height="${CY}"/></clipPath>`;
    let A = '', B = '';
    for (const s of [1, -1]) for (let i = 1; i + 2 < n; i += 4) {
      const a = line(i, s);
      // the band between line i and i+2: walk a, then back along c reversed (sampled via the polyline)
      const pc = pts(i + 2, s).slice().reverse();
      const d = `${a}L${rounded(pc, rad(i + 2).slice().reverse()).slice(1)}Z`;
      const op = .07 + .2 * i / n;
      A += area(d, PETROL, op, 6); B += area(d, AMETHYST, op, 6);
    }
    let b;
    if (mode === 'band') {
      // each band one colour from end to end; the colours take turns outward
      b = ''; let t = 0;
      for (let i = 1; i + 2 < n; i += 4, t++) for (const s of [1, -1]) {
        const a = line(i, s), pc = pts(i + 2, s).slice().reverse();
        const d = `${a}L${rounded(pc, rad(i + 2).slice().reverse()).slice(1)}Z`;
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
      if (i === 0) b += k.path(line(i, s), STRUCT, 1, n - i);
      else b += k.path(line(i, s), bold ? MID : FINE, bold ? 2.6 : .6, n - i);
    }
    for (const [cy, up] of [[Y0, true], [H - Y0, false]]) b += fan(k, CX, cy, phone ? 110 : 88, up, Math.PI / (phone ? 8 : 12), 2);
    for (const sx of [1, -1]) { const x = sx > 0 ? XB : W - XB; b += `<path class="a" style="--i:3" d="M${f(x + sx * 4)} ${CY - 12}L${f(x + sx * 22)} ${CY}L${f(x + sx * 4)} ${CY + 12}L${f(x - sx * 14)} ${CY}Z" fill="${AMETHYST}" ${k.st(.7, .8)}/>`; }
    return svg(b, defs);
  }

  // 5 · Bookmatched, refined. The same idea, drawn with a lighter hand: many fine grain lines with now
  // and then a bolder one, rings that stay crisp and nearly square, a smooth swell round four small knots,
  // and the four quarters meeting on gold seams down and across the centre, as veneer meets at its joint.
  // Each quarter one colour, petrol and amethyst crosswise, in narrow bands.
  // The grain: ring d (its distance out from the door) at angle q in degrees, nearly square, swelling round four knots.
  const A0 = 500, B0 = 300;
  const KNOTS = [[CX - 590, CY - 320], [CX + 590, CY - 320], [CX - 590, CY + 320], [CX + 590, CY + 320]];
  function grainPoint(d, q) {
    const a = A0 + d, bb = B0 + d * .72, nn = Math.max(4, 9 - d * .009);
    const t = q * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
    let x = CX + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / nn), y = CY + bb * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / nn);
    for (const [kx, ky] of KNOTS) {   // a smooth swell round each knot
      const dx = x - kx, dy = y - ky, dist = Math.hypot(dx, dy) || 1, m = 46 * Math.exp(-(dist * dist) / (2 * 95 * 95));
      x += dx / dist * m; y += dy / dist * m;
    }
    return [x, y];
  }

  // The spacing between grain rings outward from the door; a step of 26 or more carries a colour band. The computer
  // drawing has the same rings and bands reaching just as far, with each narrow step split in two for a finer grain.
  const PHONE_GRAIN = [16, 16, 16, 26, 16, 16, 40, 18, 18, 18, 18, 30, 20, 20, 52, 22, 22, 22, 34, 24, 24, 60, 26, 26, 40];
  const COMPUTER_GRAIN = PHONE_GRAIN.flatMap(r => (r >= 26 ? [r] : [r * .55, r * .45]));

  function bookmatchedRefined(phone, mode = 'seams') {
    const k = kit(phone), base = phone ? PHONE_GRAIN : COMPUTER_GRAIN, knots = KNOTS;
    const ring = d => {
      let s = '';
      for (let q = 0; q <= 360; q += 1.5) { const [x, y] = grainPoint(d, q); s += (q ? 'L' : 'M') + f(x) + ' ' + f(y); }
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
    for (let s = 0; s < max; s += 1) {
        x += dir[0]; y += dir[1];
        if (test(x, y) || x < -5 || x > W + 5 || y < -5 || y > H + 5) return [x, y];
      }
    return [x, y];
  }

  // border: parallel lines inset from the frame, corners cut at 45° (the cut stays parallel line to line)
  const chamferRect = (t, C) => { const c = C + t * (Math.SQRT2 - 2); return `M${f(t + c)} ${f(t)}H${f(W - t - c)}L${f(W - t)} ${f(t + c)}V${f(H - t - c)}L${f(W - t - c)} ${f(H - t)}H${f(t + c)}L${f(t)} ${f(H - t - c)}V${f(t + c)}Z`; };

  // D · Cut areas (the outlier: the tarot box's "cut of areas that get their own design", carried all the
  // way). Four double lines run from the border's corners to the door's shoulders and cut the card into four
  // fields round the door, each with its own design: above and below, a sunrise from the half sun with two
  // arcs crossing its rays; left and right, nested chevrons that point at the door, every band its own tone.
  // A small diamond marks each cut where it meets the door. Every line ends on the border, a cut or the door.
  // the cuts' geometry: the border inset t1, the upper-left shoulder shL, the cut's direction du, the chevron spacing sp,
  // and chevP(j), the j-th chevron out from the door in the left field
  function cutGeometry(phone) {
    const t1 = 40, sp = phone ? 30 : 22, shL = [CX - G7.DW, G7.yS(G7.DW, G7.R0)];
    const dv = [shL[0] - t1, shL[1] - t1], dl = Math.hypot(...dv), du = [dv[0] / dl, dv[1] / dl];
    const chevP = j => { const vx = shL[0] - j * sp; const a = [vx, CY], L = 900; return [[a[0] - du[0] * L, a[1] - du[1] * L], a, [a[0] - du[0] * L, a[1] + du[1] * L]]; };
    return { t1, sp, shL, du, chevP, nC: Math.ceil((shL[0] - t1) / sp) + 12 };
  }

  /** @param {{ side: (t: number) => any[], tb: string, dia: string }} [pal] */
  function cutAreas(phone, pal = { side: t => [PETROL, null], tb: PETROL, dia: PETROL }, ex = {}) {
    const k = kit(phone), { t1, shL, du, chevP, nC } = cutGeometry(phone);
    // with 2a's frame (an extra layer) the cut starts where it meets the frame's inner line
    const fr = ex.frame ? techFrame(kit(phone), true, pal.side(0)[0]) : null;
    const cut = [fr ? walk([t1, t1], du, fr.inside) : [t1, t1], ex.ring ? walk(shL, [-du[0], -du[1]], (x, y) => !inDoor(x, y, 40)) : shL];
    // which field a point is in
    const side = (x, y) => { // >0: the top field side of the upper-left cut, <0: the left field side
      const ax = Math.abs(x - CX), ay = Math.abs(y - CY), px = CX - ax, py = CY - ay;   // fold into the upper-left quarter
      return (px - t1) * du[1] - (py - t1) * du[0];
    };
    let b = '', defs = '';
    // the top and bottom fields: sunrise and two arcs
    const topField = `M${t1} ${t1}L${f(shL[0])} ${f(shL[1])}A${f(G7.R0)} ${f(G7.R0)} 0 0 1 ${f(W - shL[0])} ${f(shL[1])}L${W - t1} ${t1}Z`;
    const botField = `M${t1} ${H - t1}L${f(shL[0])} ${f(H - shL[1])}A${f(G7.R0)} ${f(G7.R0)} 0 0 0 ${f(W - shL[0])} ${f(H - shL[1])}L${W - t1} ${H - t1}Z`;
    const leftField = `M${t1} ${t1}L${f(shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${t1} ${H - t1}Z`;
    const rightField = `M${W - t1} ${t1}L${f(W - shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${W - t1} ${H - t1}Z`;
    defs += `<clipPath id="d7tb"><path d="${topField} ${botField}"/></clipPath><clipPath id="d7lr"><path d="${leftField} ${rightField}"/></clipPath>`;
    // with the ring round the door, the fields stop on the ring's outer line, so nothing runs under it
    defs += `<clipPath id="d7o"><path clip-rule="evenodd" d="${WHOLE_FIELD} ${ex.ring ? doorD(40) : doorD()}"/></clipPath>`;
    // chevrons in the side fields: lines parallel to the two cuts, meeting on the centre line, nested out from the door
    let chev = '', chevA = '';
    for (let j = 0; j < nC; j++) {
      const P = chevP(j);
      for (const sx of [1, -1]) { const Q = P.map(p => [sx > 0 ? p[0] : W - p[0], p[1]]); chev += k.path(`M${f(Q[0][0])} ${f(Q[0][1])}L${f(Q[1][0])} ${f(Q[1][1])}L${f(Q[2][0])} ${f(Q[2][1])}`, j % 3 === 0 ? MID : FINE + .06, j % 3 === 0 ? .9 : .6, 8 - Math.min(7, j / 2)); }
      if (j % 3 === 1) {
        const P2 = chevP(j + 1);
        for (const sx of [1, -1]) { const Q = [...P, ...P2.slice().reverse()].map(p => [sx > 0 ? p[0] : W - p[0], p[1]]); const t = (j - 1) / 3 % 2, [col, op] = pal.side(t); chevA += area(poly(Q), col, op ?? (t ? .12 : .28), 6); }
      }
    }
    b += `<g clip-path="url(#d7o)"><g clip-path="url(#d7lr)">${chevA}${chev}</g></g>`;
    // sunrise in the top and bottom fields, with two arcs crossing it
    let sun = '';
    for (const [cy, s] of [[G7.TOPY, -1], [H - G7.TOPY, 1]]) {
      for (let a = 4; a <= 176; a += phone ? 6 : 4) { const t = a * Math.PI / 180; sun += k.path(`M${CX} ${cy}L${f(CX + 1400 * Math.cos(t))} ${f(cy + s * 1400 * Math.sin(t))}`, a % 12 === 4 ? FINE + .1 : FINE * .7, .5, 7); }
    }
    const arcs = [[380, MID, .9], [430, FINE + .06, .6], [600, FINE + .06, .6]];
    let arcD = '';
    for (const cy of [G7.TOPY, H - G7.TOPY]) for (const [r, o, sw] of arcs) arcD += `<circle class="d" style="--i:4" pathLength="1" cx="${CX}" cy="${cy}" r="${r}" ${k.st(o, sw)}/>`;
    const bandTB = `M${CX - 430} ${G7.TOPY}a430 430 0 1 0 860 0a430 430 0 1 0 -860 0Z M${CX - 380} ${G7.TOPY}a380 380 0 1 0 760 0a380 380 0 1 0 -760 0Z M${CX - 430} ${H - G7.TOPY}a430 430 0 1 0 860 0a430 430 0 1 0 -860 0Z M${CX - 380} ${H - G7.TOPY}a380 380 0 1 0 760 0a380 380 0 1 0 -760 0Z`;
    if (ex.jewels) {
      // 2b's jewels on the long rays: a diamond between the arcs, a stone beyond, kept clear of the cuts
      for (const [cy, sg] of [[G7.TOPY, -1], [H - G7.TOPY, 1]]) for (let a = 4, q = 0; a <= 176; a += phone ? 6 : 4) {
        const t = a * Math.PI / 180, at = /** @type {(r: number) => [number, number]} */ (r => [CX + r * Math.cos(t), cy + sg * r * Math.sin(t)]), ok = /** @type {(p: number[]) => boolean} */ (([x, y]) => side(x, y) > 18 && !inDoor(x, y, ex.ring ? 56 : 16) && x > t1 + 14 && x < W - t1 - 14 && y > t1 + 14 && y < H - t1 - 14);
        const dir = [Math.cos(t), sg * Math.sin(t)], p0 = at(150), p1 = walk(p0, dir, (x, y) => !ok([x, y]));
        const mix = u => [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u];
        if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 90) continue;
        const pd = mix(.5), ps = mix(.8), s9 = 8, even = (q++) % 2 === 0;
        if (even && ok(pd)) sun += `<path class="a" style="--i:5" d="M${f(pd[0])} ${f(pd[1] - s9)}L${f(pd[0] + s9 * .7)} ${f(pd[1])}L${f(pd[0])} ${f(pd[1] + s9)}L${f(pd[0] - s9 * .7)} ${f(pd[1])}Z" fill="${pal.tb}" fill-opacity=".9" stroke="${GOLD}" stroke-opacity=".5" stroke-width=".7" vector-effect="non-scaling-stroke"/>`;
        if (!even && ok(ps)) sun += `<circle class="a" style="--i:5" cx="${f(ps[0])}" cy="${f(ps[1])}" r="4" fill="${GOLD}" fill-opacity=".45"/>`;
      }
    }
    b += `<g clip-path="url(#d7o)"><g clip-path="url(#d7tb)">${area(bandTB, pal.tb, pal.tb === AMETHYST ? .3 : .2, 6, 'fill-rule="evenodd"')}${sun}${arcD}</g></g>`;
    // the cuts: double lines from the corners to the shoulders, a diamond where they meet the door
    for (const sx of [1, -1]) for (const sy of [1, -1]) {
      const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
      const nrm = [-du[1] * 7, du[0] * 7];
      b += k.path(seg(m(cut[0]), m(cut[1])), STRUCT, .9, 3);
      b += k.path(seg(m([cut[0][0] + nrm[0] * 1.6, cut[0][1] + nrm[1] * 1.6]), m([cut[1][0] + nrm[0] * 1.6, cut[1][1] + nrm[1] * 1.6])), FINE + .1, .6, 3);
      const p = m(cut[1]), s = 12;
      b += `<path class="a" style="--i:3" d="M${f(p[0])} ${f(p[1] - s)}L${f(p[0] + s * .75)} ${f(p[1])}L${f(p[0])} ${f(p[1] + s)}L${f(p[0] - s * .75)} ${f(p[1])}Z" fill="${pal.dia}" fill-opacity=".95" stroke="${GOLD}" stroke-opacity=".6" stroke-width=".8" vector-effect="non-scaling-stroke"/>`;
    }
    if (fr) { defs += `<clipPath id="d7fr"><path d="${chamferRect(fr.tin, 120)}"/></clipPath>`; b = `<g clip-path="url(#d7fr)">${b}</g>` + fr.b; }
    else b += k.path(`M${t1 - 12} ${t1 - 12}H${W - t1 + 12}V${H - t1 + 12}H${t1 - 12}Z`, FINE + .1, .6, 9) + k.path(`M${t1} ${t1}H${W - t1}V${H - t1}H${t1}Z`, MID, .9, 9);
    if (ex.ring) { const d = []; b += medRing(k, phone, d, 'd7'); defs += d.join(''); }
    b += doorAndSuns(k, phone);
    return svg(b, defs);
  }

  // Round 8 · 2a and 2b together. Pieces of each, so the combinations share one hand.
  // 2a's frame: a bundle of three lines with cut corners, the cut corner's triangle in petrol, rings on the cut.
  function techFrame(k, rings = true, cornerCol = PETROL) {
    const T = [26, 38, 50], C0 = 120, tin = 50, cc = C0 + tin * (Math.SQRT2 - 2);
    let b = '';
    const corners = M4([0, 0]).map(([x0, y0]) => { const sx = x0 ? -1 : 1, sy = y0 ? -1 : 1; return poly([[x0 + sx * tin, y0 + sy * tin], [x0 + sx * (tin + cc), y0 + sy * tin], [x0 + sx * tin, y0 + sy * (tin + cc)]]); }).join(' ');
    b += area(corners, cornerCol, cornerCol === AMETHYST ? .36 : .3, 6);
    T.forEach((t, q) => { b += k.path(chamferRect(t, C0), q === 1 ? MID : FINE + .06, q === 1 ? .9 : .6, 9); });
    if (rings) for (const [x0, y0] of M4([0, 0])) {
      const sx = x0 ? -1 : 1, sy = y0 ? -1 : 1, cx = x0 + sx * (tin + cc * .5 + 28), cy = y0 + sy * (tin + cc * .5 + 28);
      b += `<circle cx="${f(cx)}" cy="${f(cy)}" r="30" style="fill:var(--card-bg)"/>`;
      for (const [r, o] of [[30, MID], [21, FINE + .08], [12, .4]]) b += `<circle class="d" style="--i:9" pathLength="1" cx="${f(cx)}" cy="${f(cy)}" r="${r}" ${k.st(o, .7)}/>`;
      b += `<circle class="a" style="--i:9" cx="${f(cx)}" cy="${f(cy)}" r="6" fill="${cornerCol}" fill-opacity=".9"/>`;
    }
    return { b, tin, cc, inside: (x, y) => x > tin && y > tin && x < W - tin && y < H - tin && x + y > tin * 2 + cc && (W - x) + y > tin * 2 + cc && x + (H - y) > tin * 2 + cc && (W - x) + (H - y) > tin * 2 + cc };
  }
  // 2a's netted diamond: 45° lines from the border in to the door, both ways, in every quarter; every
  // fourth band shaded. clipTest limits where a line may run (it stops where the test fails).
  function techLattice(k, phone, inside, stop = (x, y) => false) {
    const sp = phone ? 26 : 18, /** @type {[number[], number[], number][]} */ fam = [];
    for (let c = -300, j = 0; c <= 40; c += sp, j++) {
      const dir = [Math.SQRT1_2, Math.SQRT1_2];
      const start = walk(c >= 0 ? [c, 0] : [0, -c], dir, inside);
      const end = walk(start, dir, (x, y) => inDoor(x, y) || !inside(x, y) || stop(x, y) || (Math.abs(x - CX) < 140 && y < G7.TOPY + 10));
      fam.push([start, end, j]);
    }
    let lines = '', bandsD = '';
    const Q4 = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (const [a, e, j] of fam) for (const [sx, sy] of Q4) {
      const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
      lines += k.path(seg(m(a), m(e)), j % 4 === 0 ? MID : FINE + .04, j % 4 === 0 ? .9 : .6, 8 - Math.min(7, j / 3));
    }
    for (let q = 0; q + 1 < fam.length; q++) if (q % 4 === 1) for (const [sx, sy] of Q4) {
      const m = p => [sx > 0 ? p[0] : W - p[0], sy > 0 ? p[1] : H - p[1]];
      bandsD += poly([m(fam[q][0]), m(fam[q][1]), m(fam[q + 1][1]), m(fam[q + 1][0])]) + ' ';
    }
    return { lines, bandsD };
  }
  // 2b's medallion: the tick ring round the door (petrol), its outlines
  function medRing(k, phone, defs, id) {
    let b = area(`${doorD(40)} ${doorD(18)}`, PETROL, .16, 6, 'fill-rule="evenodd"');
    defs.push(`<clipPath id="${id}t"><path clip-rule="evenodd" d="${doorD(40)} ${doorD(18)}"/></clipPath>`);
    let ticks = ''; const nt = phone ? 120 : 160;
    for (let q = 0; q < nt; q++) { const a = (q + .5) / nt * 2 * Math.PI; ticks += k.path(`M${CX} ${CY}L${f(CX + 900 * Math.cos(a))} ${f(CY + 900 * Math.sin(a))}`, .3, .5, 3); }
    b += `<g clip-path="url(#${id}t)">${ticks}</g>`;
    b += k.path(doorD(18), FINE + .1, .6, 4) + k.path(doorD(40), MID, .9, 4);
    return b;
  }
  // 2b's rays: long ones with a diamond, ending where end() says; short ones ending on the outline at 170
  function medRays(k, phone, end, keep = d => true) {
    let b = ''; const nr = phone ? 36 : 48;
    for (let q = 0; q < nr; q++) {
      const a = (q + .5) / nr * 2 * Math.PI, d = [Math.cos(a), Math.sin(a)];
      if (!keep(d)) continue;
      const p0 = walk([CX, CY], d, (x, y) => !inDoor(x, y, 40));
      if (q % 2 === 0) {
        const p1 = walk(p0, d, end);
        b += k.path(seg(p0, p1), MID, .8, 5);
        const pd = [p0[0] + d[0] * 70, p0[1] + d[1] * 70], s = 9;
        b += `<path class="a" style="--i:5" d="M${f(pd[0])} ${f(pd[1] - s)}L${f(pd[0] + s * .7)} ${f(pd[1])}L${f(pd[0])} ${f(pd[1] + s)}L${f(pd[0] - s * .7)} ${f(pd[1])}Z" fill="${PETROL}" fill-opacity=".9" stroke="${GOLD}" stroke-opacity=".5" stroke-width=".7" vector-effect="non-scaling-stroke"/>`;
      } else {
        const p1 = walk(p0, d, (x, y) => !inDoor(x, y, 170) || end(x, y));
        b += k.path(seg(p0, p1), FINE + .08, .6, 5);
        b += `<circle class="a" style="--i:5" cx="${f(p1[0])}" cy="${f(p1[1])}" r="4" fill="${GOLD}" fill-opacity=".45"/>`;
      }
    }
    return b;
  }

  // 8d · Split by zone. 2a's frame and its netted diamonds at both ends; 2b's medallion above and below:
  // the tick ring round the door and its rays of two lengths, which end on the border or on the lattice's
  // outermost line. Corners and ends are 2a, the centre is 2b.
  function comboZones(phone, two = false, clean = false) {
    const k = kit(phone), defs = [], fr = techFrame(k, true, two ? AMETHYST : PETROL);
    const lat = techLattice(k, phone, fr.inside, clean ? (x, y) => inDoor(x, y, 40) : () => false);
    // the lattice's reach: the outer line of the upper-left family runs from the cut corner to the door's shoulder
    defs.push(`<clipPath id="z8x"><path clip-rule="evenodd" d="${lat.bandsD}"/></clipPath>`);
    let b = `<g clip-path="url(#z8x)">${area(WHOLE_FIELD, two ? AMETHYST : PETROL, two ? .3 : .22, 6)}</g>`;
    b += fr.b + lat.lines;
    const latHit = (x, y) => (CX - Math.abs(x - CX)) - (CY - Math.abs(y - CY)) < 40 + 30 && Math.abs(x - CX) > G7.DW - 40;
    if (clean) {
      // a clear order: the lattice owns the ends, the medallion the top and bottom. A ray is kept only when
      // it reaches the border without coming near the lattice, so no ray, jewel or stone touches a side line.
      b += medRays(k, phone, (x, y) => !fr.inside(x, y), d => { const p0 = walk([CX, CY], d, (x, y) => !inDoor(x, y, 40)); const p1 = walk(p0, d, (x, y) => !fr.inside(x, y) || latHit(x, y)); return !latHit(p1[0], p1[1]); });
    } else b += medRays(k, phone, (x, y) => !fr.inside(x, y) || (CX - Math.abs(x - CX)) - (CY - Math.abs(y - CY)) < 40 + 2 && Math.abs(x - CX) > G7.DW);
    b += medRing(k, phone, defs, 'z8');
    b += doorAndSuns(k, phone);
    return svg(b, defs.join(''));
  }

  // 8f · 2a led. The lines-and-shapes card as it was, wearing 2b's jewellery: the tick ring round the door,
  // and the uprights above and below become 2b's two lengths, long ones hanging from the border to the
  // tick ring with a small diamond, short ones stopping halfway on a stone. Small diamonds along the frame.
  function comboTechno(phone, two = false) {
    const k = kit(phone), defs = [], fr = techFrame(k, true, two ? AMETHYST : PETROL), sp = phone ? 26 : 18, tin = fr.tin;
    const lat = techLattice(k, phone, fr.inside, (x, y) => inDoor(x, y, 40));
    const ups = [];
    for (let x = CX + 150, j = 0; x < CX + G7.DW + 30; x += sp, j++) ups.push([x, G7.yS(x - CX, G7.R0 + 40) , j]);
    let bandsD = two ? '' : lat.bandsD;
    for (let q = 0; q + 1 < ups.length; q++) if (q % 4 === 2) for (const sx of [1, -1]) {
      const x1 = CX + sx * (ups[q][0] - CX), x2 = CX + sx * (ups[q + 1][0] - CX), y1 = ups[q][1], y2 = ups[q + 1][1];
      bandsD += poly([[x1, tin], [x2, tin], [x2, y2], [x1, y1]]) + ' ' + poly([[x1, H - tin], [x2, H - tin], [x2, H - y2], [x1, H - y1]]) + ' ';
    }
    defs.push(`<clipPath id="f8x"><path clip-rule="evenodd" d="${bandsD}"/></clipPath>`);
    let b = `<g clip-path="url(#f8x)">${area(WHOLE_FIELD, PETROL, .22, 6)}</g>`;
    if (two) { defs.push(`<clipPath id="f8l"><path clip-rule="evenodd" d="${lat.bandsD}"/></clipPath>`); b += `<g clip-path="url(#f8l)">${area(WHOLE_FIELD, AMETHYST, .3, 6)}</g>`; }
    b += fr.b + lat.lines;
    for (const [x, y, j] of ups) for (const sx of [1, -1]) for (const top of [1, -1]) {
      const xx = CX + sx * (x - CX), Y = v => top > 0 ? v : H - v, long = j % 2 === 0;
      const yEnd = long ? y : tin + (y - tin) * .55;
      b += k.path(`M${f(xx)} ${f(Y(tin))}L${f(xx)} ${f(Y(yEnd))}`, long && j % 4 === 0 ? MID : FINE + .06, long ? .8 : .6, 8);
      if (long) { const yd = Y(y - 40), s = 8; b += `<path class="a" style="--i:5" d="M${f(xx)} ${f(yd - s)}L${f(xx + s * .7)} ${f(yd)}L${f(xx)} ${f(yd + s)}L${f(xx - s * .7)} ${f(yd)}Z" fill="${PETROL}" fill-opacity=".9" stroke="${GOLD}" stroke-opacity=".5" stroke-width=".7" vector-effect="non-scaling-stroke"/>`; }
      else b += `<circle class="a" style="--i:5" cx="${f(xx)}" cy="${f(Y(yEnd))}" r="4" fill="${GOLD}" fill-opacity=".45"/>`;
    }
    // small diamonds along the frame's outer pair
    const tm = 32;
    for (let x = 220; x <= CX - 60; x += 70) for (const xx of [x, W - x]) for (const y of [tm, H - tm]) b += `<path class="a" style="--i:9" d="M${f(xx - 5)} ${y}L${xx} ${y - 4}L${f(xx + 5)} ${y}L${xx} ${y + 4}Z" fill="${GOLD}" fill-opacity=".4"/>`;
    b += medRing(k, phone, defs, 'f8');
    b += doorAndSuns(k, phone);
    return svg(b, defs.join(''));
  }

  // Round 10: depth for 2a and 5a, the job the Eye's lower layer does in their own language: something running the
  // other way behind the main lines, and something much smaller placed unevenly. Placed by a seeded generator, so the
  // drawing is the same every time. Each returns the extra pieces for withDepth: under everything, or over the lines.
  const GLINT = '#e8c97a';

  function seeded(seed) {
    let t = seed;
    return () => {
      t = (t + 0x6D2B79F5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  const fineStroke = (phone, col, op, sw) => `stroke="${col}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${f((phone ? 1.1 : 1.5) * .7 * sw)}"`;

  // the extra pieces go in under the whole drawing, and over its lines but under the door and the half suns
  function withDepth(svgText, { defs = '', under = '', over = '' }) {
    const s = svgText.replace('</defs>', `${defs}</defs>${under}`);
    const cut = s.lastIndexOf('<path', s.indexOf('style="fill:var(--card-bg)"'));
    return s.slice(0, cut) + over + s.slice(cut);
  }

  // 2a: fine upright ribs, as fluted glass, in the dark strips between the bands, fading before the door; and short
  // glints of light along the lines, bright in the middle and fading at both ends, mirrored left and right.
  function turnByTurnDepth(phone) {
    const { n, pts, rad, line } = streamGeometry(phone), R = seeded(phone ? 21 : 37);
    const strip = (a, b, s) => `${line(a, s)}L${rounded(pts(b, s).slice().reverse(), rad(b).slice().reverse()).slice(1)}Z`;
    let stripsD = '';
    for (const s of [1, -1]) for (let i = 3; i + 2 <= n; i += 4) stripsD += `${strip(i, i + 2, s)} `;
    const sp = phone ? 18 : 11;
    let flute = '', fluteBold = '';
    for (let x = sp / 2, j = 0; x < W; x += sp, j++) {
      if (j % 3 === 1) fluteBold += `M${f(x)} 0V${H}`; else flute += `M${f(x)} 0V${H}`;
    }
    const defs = `<clipPath id="t10s"><path d="${stripsD}"/></clipPath>`
      + `<radialGradient id="t10g" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${W * .5}" gradientTransform="translate(${CX} ${CY}) scale(1 .7) translate(${-CX} ${-CY})"><stop offset=".42" stop-color="#000"/><stop offset=".8" stop-color="#fff"/></radialGradient>`
      + `<mask id="t10m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#t10g)"/></mask>`;
    const under = `<g clip-path="url(#t10s)"><g mask="url(#t10m)"><path class="a" style="--i:7" d="${flute}" ${fineStroke(phone, GOLD, .1, .45)}/><path class="a" style="--i:7" d="${fluteBold}" ${fineStroke(phone, GOLD, .17, .55)}/></g></g>`;
    // the straight runs of a line's left half (corners stay plain), so each glint can be mirrored exactly
    const runs = (i, sgn) => {
      const P = pts(i, sgn), r = rad(i), cut = [0];
      for (let q = 1; q < P.length - 1; q++) {
        const [a0, b0, c0] = [P[q - 1], P[q], P[q + 1]];
        const u = [a0[0] - b0[0], a0[1] - b0[1]], v = [c0[0] - b0[0], c0[1] - b0[1]], lu = Math.hypot(...u), lv = Math.hypot(...v);
        const th = Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (lu * lv))));
        cut.push(r[q] > 0 && th < Math.PI - 1e-3 ? Math.min(r[q] / Math.tan(th / 2), lu * .5, lv * .5) : 0);
      }
      const out = [];
      for (let q = 0; q < 3; q++) {
        const A = P[q], Bq = q === 2 ? [CX, P[q][1]] : P[q + 1], L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]);
        const t0 = q === 0 ? 0 : cut[q], t1 = q === 2 ? 0 : cut[q + 1];
        if (L - t0 - t1 > 10) out.push({ A, dir: [(Bq[0] - A[0]) / L, (Bq[1] - A[1]) / L], u0: t0, u1: L - t1 });
      }
      return out;
    };
    const sgm = (A, dir, u0, u1) => `M${f(A[0] + dir[0] * u0)} ${f(A[1] + dir[1] * u0)}L${f(A[0] + dir[0] * u1)} ${f(A[1] + dir[1] * u1)}`;
    // each glint is three strokes: a faint long one, a brighter middle and a bright core (share: of the glint's length)
    const stroke = (op, sw, share) => ({ d: '', op, sw, share });
    const bold = [stroke(.3, 1.1, 1), stroke(.55, 1.7, .55), stroke(.95, 2.2, .22)], fine = [stroke(.25, .7, 1), stroke(.6, 1, .4)];
    for (let i = 3; i <= n; i += 2) {
      const isBold = i % 4 === 3, set = isBold ? bold : fine;
      for (const sgn of [1, -1]) for (const { A, dir, u0, u1 } of runs(i, sgn)) {
        for (let u = u0 + 30 + R() * 160; u < u1 - 10; u += (isBold ? 170 : 260) + R() * (isBold ? 340 : 480)) {
          const len = Math.min(isBold ? 30 + R() * 60 : 14 + R() * 26, u1 - 4 - u);
          if (len < 10) continue;
          const mid = u + len / 2;
          for (const g of set) {
            const a = mid - len * g.share / 2, e = mid + len * g.share / 2;
            g.d += sgm(A, dir, a, e) + sgm([W - A[0], A[1]], [-dir[0], dir[1]], a, e);
          }
        }
      }
    }
    const over = [...bold, ...fine].map(g => `<path class="a" style="--i:4" d="${g.d}" ${fineStroke(phone, GLINT, g.op, g.sw)} stroke-linecap="round"/>`).join('');
    return { defs, under, over };
  }

  // 5a, from the owner's walnut panels: little runs of ripples across the grain, like the shimmer when light moves over
  // the wood, and a feather of stacked V's down the joint above and below the door.
  function bookmatchedDepth(phone) {
    const R = seeded(phone ? 5 : 11);
    const inField = p => p[0] > 4 && p[0] < W - 4 && p[1] > 4 && p[1] < H - 4;
    const mirror4 = p => [[p[0], p[1]], [W - p[0], p[1]], [p[0], H - p[1]], [W - p[0], H - p[1]]];
    let rip = '', ripBold = '';
    for (let r = 0, runs = phone ? 34 : 70; r < runs; r++) {
      const d0 = 30 + R() * 620, q0 = 1 + R() * 86, cnt = 3 + Math.floor(R() * 5), L = (phone ? 16 : 11) + R() * (phone ? 22 : 16), dq = phone ? 1.6 : 1.1, strong = R() < .25;
      for (let c = 0; c < cnt; c++) {
        const q = q0 + c * dq, dd = d0 + (R() - .5) * 6, ll = L * (.7 + R() * .5);
        const a = grainPoint(dd, q), b = grainPoint(dd + ll, q);
        if (!inField(a) || !inField(b) || KNOTS.some(([kx, ky]) => Math.hypot(a[0] - kx, a[1] - ky) < 150)) continue;
        const bs = mirror4(b);
        for (const [m, p1] of mirror4(a).entries()) {
          const seg = `M${f(p1[0])} ${f(p1[1])}L${f(bs[m][0])} ${f(bs[m][1])}`;
          if (strong) ripBold += seg; else rip += seg;
        }
      }
    }
    const under = `<path class="a" style="--i:7" d="${rip}" ${fineStroke(phone, GOLD, .16, .45)}/><path class="a" style="--i:7" d="${ripBold}" ${fineStroke(phone, GOLD, .28, .55)}/>`;
    let feather = '';
    const len = CY - B0 - 16, step = phone ? 15 : 11;
    for (let u = 10; u < len; u += step) {
      const hw = 26 * (.25 + .75 * Math.sin(Math.PI * u / len)), h = step * 1.1;
      for (const [y, dy] of [[u, h], [H - u, -h]]) feather += `M${f(CX - hw)} ${f(y + dy)}L${CX} ${f(y)}L${f(CX + hw)} ${f(y + dy)}`;
    }
    const k = kit(phone);
    const over = `<path class="a" style="--i:8" d="${feather}" ${fineStroke(phone, GOLD, .3, .55)}/>`
      + k.path(`M${CX} 0L${CX} ${CY - B0}`, FINE, .45, 9) + k.path(`M${CX} ${H}L${CX} ${CY + B0}`, FINE, .45, 9);
    return { under, over };
  }

  // 8a: fine engraved hatching across the amethyst side bands, like the shading on old printed playing cards; and tiny
  // dots along the cuts and the outer edge of the petrol arcs, uneven in size and spacing, like an edge punched by hand.
  function cutAreasDepth(phone) {
    const R = seeded(phone ? 3 : 9), { t1, shL, du, chevP, nC } = cutGeometry(phone), fr = techFrame(kit(phone), true, AMETHYST);
    let bandsD = '';
    for (let j = 1; j < nC; j += 3) {
      const P = [...chevP(j), ...chevP(j + 1).slice().reverse()];
      for (const sx of [1, -1]) bandsD += `${poly(P.map(p => [sx > 0 ? p[0] : W - p[0], p[1]]))} `;
    }
    const leftField = `M${t1} ${t1}L${f(shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${t1} ${H - t1}Z`;
    const rightField = `M${W - t1} ${t1}L${f(W - shL[0])} ${f(shL[1])}V${f(H - shL[1])}L${W - t1} ${H - t1}Z`;
    const step = phone ? 7 : 5, across = [du[1], -du[0]];
    // each half runs across its own cut: the upper half across the upper cut, the lower half mirrored
    const half = (sy, id) => {
      let d = '';
      for (let c = -1400; c < 1400; c += step) {
        const p = [CX + du[0] * c, CY + du[1] * c * sy], dd = [across[0], across[1] * sy];
        d += `M${f(p[0] - dd[0] * 1200)} ${f(p[1] - dd[1] * 1200)}L${f(p[0] + dd[0] * 1200)} ${f(p[1] + dd[1] * 1200)}`;
      }
      return `<g clip-path="url(#${id})"><path class="a" style="--i:7" d="${d}" ${fineStroke(phone, GOLD, .2, .4)}/></g>`;
    };
    const defs = `<clipPath id="e11b"><path d="${bandsD}"/></clipPath><clipPath id="e11f"><path d="${leftField} ${rightField}"/></clipPath><clipPath id="e11r"><path d="${chamferRect(fr.tin, 120)}"/></clipPath>`
      + `<clipPath id="e11u"><rect width="${W}" height="${CY}"/></clipPath><clipPath id="e11l"><rect y="${CY}" width="${W}" height="${CY}"/></clipPath>`
      + `<clipPath id="e11o"><path clip-rule="evenodd" d="${WHOLE_FIELD} ${doorD(40)}"/></clipPath>`;
    const under = `<g clip-path="url(#e11o)"><g clip-path="url(#e11r)"><g clip-path="url(#e11f)"><g clip-path="url(#e11b)">${half(1, 'e11u')}${half(-1, 'e11l')}</g></g></g></g>`;
    const mirror4 = p => [[p[0], p[1]], [W - p[0], p[1]], [p[0], H - p[1]], [W - p[0], H - p[1]]];
    const dot = (p, r, op) => `<circle class="a" style="--i:4" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="${GOLD}" fill-opacity="${f(op)}"/>`;
    const cut0 = walk([t1, t1], du, fr.inside), cut1 = walk(shL, [-du[0], -du[1]], (x, y) => !inDoor(x, y, 40));
    const L = Math.hypot(cut1[0] - cut0[0], cut1[1] - cut0[1]), off = [-du[1], du[0]];
    let over = '';
    for (const side of [-1, 2.6]) for (let u = 48 + R() * 10; u < L - 30; u += (phone ? 13 : 10) + R() * (phone ? 14 : 10)) {
      const p = [cut0[0] + du[0] * u + off[0] * 7 * side, cut0[1] + du[1] * u + off[1] * 7 * side], r = (phone ? 2.2 : 1.7) * (.7 + R() * .6);
      for (const q of mirror4(p)) over += dot(q, r, .3 + R() * .35);
    }
    for (const cy of [G7.TOPY, H - G7.TOPY]) for (let a = 6 + R() * 3; a < 174; a += (phone ? 2.2 : 1.6) + R() * 2) {
      const t = a * Math.PI / 180, sg = cy < CY ? -1 : 1, p = [CX + 442 * Math.cos(t), cy + sg * 442 * Math.sin(t)];
      if (p[0] < fr.tin + 30 || p[0] > W - fr.tin - 30 || p[1] < fr.tin + 20 || p[1] > H - fr.tin - 20) continue;
      const px = CX - Math.abs(p[0] - CX), py = CY - Math.abs(p[1] - CY);   // folded into the upper-left quarter
      if ((px - t1) * du[1] - (py - t1) * du[0] < 14) continue;            // only in the top and bottom fields
      if (inDoor(p[0], p[1], 46)) continue;                                // and never on the ring round the door
      over += dot(p, phone ? 1.9 : 1.5, .3 + R() * .3);
    }
    return { defs, under, over };
  }

  // Cut areas in purple with glints (#195), the version the owner kept from round 12: the round-12 code in its own
  // scope. It recolours cut areas into one purple family and lays 2a's glints along the cuts, the bold chevrons and
  // the sunrise arcs (placed from a fixed seed, so the drawing is the same every time).
  const ROUND12 = (() => {
    const mirror4 = p => [[p[0], p[1]], [W - p[0], p[1]], [p[0], H - p[1]], [W - p[0], H - p[1]]];
    // a polyline drawn in all four quarters: 'M…L…' once per quarter
    function inQuarters(pts) {
      const parts = ['', '', '', ''];
      for (const p of pts) mirror4(p).forEach((q, m) => { parts[m] += (parts[m] ? 'L' : 'M') + `${f(q[0])} ${f(q[1])}`; });
      return parts.join('');
    }
    // the extra layer goes over the lines, under the door
    function addOver(svgText, over) {
      const door = `<path d="${doorD()}" style="fill:var(--card-bg)"/>`;
      let cut = svgText.lastIndexOf(door);
      if (cut < 0) cut = svgText.lastIndexOf('<path', svgText.lastIndexOf('style="fill:var(--card-bg)"'));
      return svgText.slice(0, cut) + over + svgText.slice(cut);
    }

    // ---- glints, exactly 2a's: three strokes (faint long, brighter middle, bright core) bold; two strokes fine ----
    const BOLD = [[.3, 1.1, 1], [.55, 1.7, .55], [.95, 2.2, .22]], FINE_SET = [[.25, .7, 1], [.6, 1, .4]];
    // a polyline's stretch from length a to length e
    function sub(P, cum, a, e) {
      const at = u => {
        let q = 1;
        while (q < P.length - 1 && cum[q] < u) q++;
        const t = (u - cum[q - 1]) / ((cum[q] - cum[q - 1]) || 1);
        return [P[q - 1][0] + (P[q][0] - P[q - 1][0]) * t, P[q - 1][1] + (P[q][1] - P[q - 1][1]) * t];
      };
      const pts = [at(a)];
      for (let q = 1; q < P.length - 1; q++) {
        if (cum[q] > a && cum[q] < e) pts.push(P[q]);
      }
      pts.push(at(e));
      return pts;
    }
    // polylines in the upper-left quarter, each { P, bold }; glints are placed once and mirrored to all four quarters
    function glints(phone, lines, R, { boldGap = [170, 340], fineGap = [260, 480], boldLen = [30, 60], fineLen = [14, 26] } = {}) {
      const sets = { bold: BOLD.map(() => ''), fine: FINE_SET.map(() => '') };
      for (const { P, bold } of lines) {
        if (P.length < 2) continue;
        const cum = [0]; for (let q = 1; q < P.length; q++) cum.push(cum[q - 1] + Math.hypot(P[q][0] - P[q - 1][0], P[q][1] - P[q - 1][1]));
        const L = cum[cum.length - 1], gap = bold ? boldGap : fineGap, ln = bold ? boldLen : fineLen, set = bold ? BOLD : FINE_SET;
        for (let u = 20 + R() * gap[0]; u < L - 10; u += gap[0] + R() * gap[1]) {
          const len = Math.min(ln[0] + R() * ln[1], L - 4 - u);
          if (len < 10) continue;
          const mid = u + len / 2;
          set.forEach(([, , share], g) => {
            const pts = sub(P, cum, mid - len * share / 2, mid + len * share / 2);
            sets[bold ? 'bold' : 'fine'][g] += inQuarters(pts);
          });
        }
      }
      return [...BOLD.map((s, g) => [s, sets.bold[g]]), ...FINE_SET.map((s, g) => [s, sets.fine[g]])]
        .filter(([, d]) => d).map(([[op, sw], d]) => `<path class="a" style="--i:4" d="${d}" ${fineStroke(phone, GLINT, op, sw)} stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    }
    // a straight or sampled line cut into the runs where ok(x, y) holds
    function runsOf(P, ok, step = 4) {
      const dense = [];
      for (let q = 0; q < P.length - 1; q++) { const [a, b] = [P[q], P[q + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let s = 0; s < n; s++) dense.push([a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n]); }
      dense.push(P[P.length - 1]);
      const out = []; let cur = [];
      for (const p of dense) {
        if (ok(p[0], p[1])) { cur.push(p); continue; }
        if (cur.length > 1) out.push(cur);
        cur = [];
      }
      if (cur.length > 1) out.push(cur);
      return out;
    }

    // ---- 8a: along the cuts, the side fields' bold chevrons and the sunrise's arcs ----
    function glint8a(phone) {
      const { t1, shL, du, chevP, nC } = cutGeometry(phone), fr = techFrame(kit(phone), true, AMETHYST);
      const sideOf = (x, y) => (x - t1) * du[1] - (y - t1) * du[0];   // upper-left quarter: >0 top field, <0 left field
      const inFr = (x, y) => fr.inside(x, y) && x > fr.tin + 14 && y > fr.tin + 14;
      const lines = [];
      const cut0 = walk([t1, t1], du, fr.inside), cut1 = walk(shL, [-du[0], -du[1]], (x, y) => !inDoor(x, y, 40));
      lines.push({ P: [cut0, cut1], bold: true });
      for (let j = 0; j < nC; j += 3) {
        const P = chevP(j);
        for (const run of runsOf([P[1], P[0]], (x, y) => inFr(x, y) && sideOf(x, y) < -10 && y < CY - 4 && !inDoor(x, y, 44))) lines.push({ P: run, bold: j % 6 === 0 });
      }
      for (const r of [380, 600]) {
        const P = []; for (let a = 90; a <= 178; a += 1) { const t = a * Math.PI / 180; P.push([CX + r * Math.cos(t), G7.TOPY - r * Math.sin(t)]); }
        for (const run of runsOf(P, (x, y) => inFr(x, y) && sideOf(x, y) > 10 && !inDoor(x, y, 50) && x < CX - 10)) lines.push({ P: run, bold: r === 380 });
      }
      return glints(phone, lines, seeded(phone ? 61 : 67), { boldGap: [130, 260], fineGap: [200, 360] });
    }

    // ---- one colour family per back: the main bands (was amethyst), the second areas (was petrol), the jewels ----
    const FAMILIES = {
      purple:   { main: '#74449c', second: '#a57bcf', jewel: '#cdaaea' },
    };
    function recolour(svgText, fam) {
      const F = FAMILIES[fam];
      return svgText
        .replace(new RegExp(`fill="(${PETROL}|${AMETHYST})" fill-opacity="\\.9(5?)"`, 'g'), (_, c, x) => `fill="${F.jewel}" fill-opacity=".9${x}"`)
        .split(AMETHYST).join(F.main).split(PETROL).join(F.second);
    }

    return { cutAreasPurple: p => addOver(recolour(BACKS.cutAreasBoth(p), 'purple'), glint8a(p)) };
  })();

  // Round 13's four (#195): threshold (1), radiant (3), four lamps (4, with glints added by the others' rule) and
  // winged door (5), drawn by their own code in their own scope, so their names never meet this file's.
  const ROUND13 = (() => {
    // Round 13: five new start card backs, drawn from the brief only.
    // Each export: phone => SVG string for the 1640 x 1000 field (phone = the lighter drawing).
    // Class "d": a line that draws in (pathLength 1, ordered by --i); class "a": an area, glint or dot that fades in.

    const W = 1640, H = 1000, CX = 820, CY = 500;
    const GOLD = '#c9a84c', GLINT = '#e8c97a';
    const FAM = {
      amethyst: { deep: '#4e276a', base: '#7a4a9e', light: '#a276c5' },
      petrol: { deep: '#004d4c', base: '#2a7a78', light: '#55a19f' },
      garnet: { deep: '#6b1d24', base: '#a03e43', light: '#c96d6e' },
    };
    const f = n => (+n).toFixed(1);
    const STRUCT = .62, MID = .34, FINE = .17;

    const svg = (b, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>${defs}</defs>${b}</svg>`;
    const fineStroke = (phone, col, op, sw) => `stroke="${col}" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${f((phone ? 1.1 : 1.5) * .7 * sw)}"`;
    const pt = p => `${f(p[0])} ${f(p[1])}`;
    const poly = (P, close = true) => 'M' + P.map(pt).join('L') + (close ? 'Z' : '');
    const seg = (a, b) => `M${pt(a)}L${pt(b)}`;
    const door = d => `<path d="${d}" style="fill:var(--card-bg)"/>`;
    // four-fold mirror of a point about the centre
    const mx = p => [W - p[0], p[1]], my = p => [p[0], H - p[1]], mxy = p => [W - p[0], H - p[1]];

    // light: an ellipse that is dark (clear) in the middle and glows towards the edges
    const glow = (id, col, stops, { cx = CX, cy = CY, r = W * .56, sy = .66 } = {}) =>
      `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" gradientTransform="translate(${cx} ${cy}) scale(1 ${sy}) translate(${-cx} ${-cy})">`
      + stops.map(([o, op]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${op}"/>`).join('') + '</radialGradient>';
    // a mask that hides what is near the door and shows it towards the edges
    const fadeMask = (id, a, b, opt = {}) => glow(id + 'g', '#fff', [[a, 0], [b, 1]], opt)
      + `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${id}g)"/></mask>`;

    // 2a's glint: a faint long stroke, a brighter middle and a bright core, all along the line's own direction
    const GL = { bold: [[.3, 1.1, 1], [.55, 1.7, .55], [.95, 2.2, .22]] };
    function glints(phone, list, i = 4) {
      const ds = GL.bold.map(() => '');
      for (const { p, dir, len } of list) {
        GL.bold.forEach(([, , share], j) => {
          const h = len * share / 2;
          ds[j] += seg([p[0] - dir[0] * h, p[1] - dir[1] * h], [p[0] + dir[0] * h, p[1] + dir[1] * h]);
        });
      }
      return GL.bold.map(([op, sw], j) => ds[j] ? `<path class="a" style="--i:${i}" d="${ds[j]}" ${fineStroke(phone, GLINT, op, sw)} stroke-linecap="round"/>` : '').join('');
    }
    const unit = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; };
    const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    // a glint at share t of segment a..b, mirrored left and right
    const glintLR = (a, b, t, len) => { const p = lerp2(a, b, t), d = unit(a, b); return [{ p, dir: d, len }, { p: mx(p), dir: [-d[0], d[1]], len }]; };
    // a small stone: a diamond in a colour, outlined in gold
    const stone = (k, c, r, col, i = 3) => `<path class="a" style="--i:${i}" d="M${f(c[0])} ${f(c[1] - r)}L${f(c[0] + r * 1.3)} ${f(c[1])}L${f(c[0])} ${f(c[1] + r)}L${f(c[0] - r * 1.3)} ${f(c[1])}Z" fill="${col}" fill-opacity=".9" ${k.st(.7, .8)}/>`;

    // the frames of the four quadrants: the drawing of the top left quarter, mirrored three times
    const QUARTERS = ['', `translate(${W} 0) scale(-1 1)`, `translate(0 ${H}) scale(1 -1)`, `translate(${W} ${H}) scale(-1 -1)`];
    const moved = tf => (tf ? ' transform="' + tf + '"' : '');
    const flip = (P, sx, sy) => P.map(([x, y]) => [sx * x, sy * y]);
    const toField = P => P.map(([x, y]) => [CX + x, CY + y]);

    /* ------------------------------------------------------------------------------------------------
       1 · Threshold. Doors within doors: stepped door frames nest from the card's edge to the window,
       closer and closer together, so the card reads as a passage going in. Four bold rails run from the
       corners to the window's corners; between alternate frames a fine coffering runs across them.
       Garnet glows in from the edges. Glints: on each bold frame's top and bottom run, straight above and
       below the window's stepped corners (the door's edge throws the light outward); on each bold rail,
       halfway between the window and the card's edge. Bottom glints are shorter: the light is above. */
    function threshold(phone, fam = FAM.garnet) {
      const k = kit(phone);
      const N = phone ? 7 : 10, q = phone ? 1.42 : 1.28;
      const L = (a, b, t) => a + (b - a) * t;
      const fr = t => ({ hw: L(470, 940, t), hh: L(300, 640, t), s: L(24, 72, t) });
      const corner = ({ hw, hh, s }) => [[-hw, -hh + 2 * s], [-hw + s, -hh + 2 * s], [-hw + s, -hh + s], [-hw + 2 * s, -hh + s], [-hw + 2 * s, -hh]];
      const outline = F => {
        const c = corner(F);
        return toField([...c, ...flip(c, -1, 1).reverse(), ...flip(c, -1, -1), ...flip(c, 1, -1).reverse()]);
      };
      const ts = []; for (let m = 0; m <= N; m++) ts.push((q ** m - 1) / (q ** N - 1));
      const isBold = m => m > 0 && m % 3 === 0;
      let defs = glow('thG', fam.deep, [[.44, 0], [.78, .24], [1, .46]]) + fadeMask('thM', .36, .72);
      let b = `<rect class="a" style="--i:0" width="${W}" height="${H}" fill="url(#thG)"/>`;
      // coffering: rails at even places along each side, only in alternate bands, running across the frames
      const nU = phone ? 7 : 11;
      let cof = '';
      for (let m = 1; m < N; m += 2) {
        const A = fr(ts[m]), B = fr(ts[m + 1]);
        for (let j = 1; j < nU; j++) {
          const u = -1 + 2 * j / nU;
          for (const sy of [-1, 1]) cof += seg([CX + u * (A.hw - 2 * A.s), CY + sy * A.hh], [CX + u * (B.hw - 2 * B.s), CY + sy * B.hh]);
          if (j < nU - 2) { const v = -1 + 2 * j / (nU - 2); for (const sx of [-1, 1]) cof += seg([CX + sx * A.hw, CY + v * (A.hh - 2 * A.s)], [CX + sx * B.hw, CY + v * (B.hh - 2 * B.s)]); }
        }
      }
      b += `<g mask="url(#thM)"><path class="a" style="--i:7" d="${cof}" ${fineStroke(phone, GOLD, .18, .5)}/></g>`;
      for (let m = N; m >= 1; m--) b += k.path(poly(outline(fr(ts[m]))), isBold(m) ? MID + .06 : FINE + .03, isBold(m) ? 2.5 : .6, N - m + 1);
      const far = fr(1.5), win = fr(0);
      const cw = corner(win), cf = corner(far);
      let rail;
      for (const v of [0, 2, 4]) {
        const a = [CX + cw[v][0], CY + cw[v][1]], z = [CX + cf[v][0], CY + cf[v][1]];
        for (const tf of [p => p, mx, my, mxy]) b += k.path(seg(tf(a), tf(z)), v === 2 ? MID + .06 : FINE + .05, v === 2 ? 2.5 : .7, 1);
        if (v === 2) rail = [a, z];
      }
      const gl = [], len = phone ? 72 : 58;
      const [ra, rz] = rail;
      const tOut = Math.min(ra[0] / (ra[0] - rz[0]), ra[1] / (ra[1] - rz[1]));
      gl.push(...glintLR(ra, rz, tOut * .5, len), ...glintLR(my(ra), my(rz), tOut * .5, len * .7));
      const xc = CX - (470 - 48);   // above the window's stepped corner
      for (let m = 1; m <= N; m++) if (isBold(m)) {
        const F = fr(ts[m]); if (F.hh > 480) continue;
        const y = CY - F.hh;
        gl.push(...glintLR([xc - 1, y], [xc + 1, y], .5, len), ...glintLR([xc - 1, H - y], [xc + 1, H - y], .5, len * .7));
      }
      b += glints(phone, gl);
      b += door(poly(outline(win))) + k.path(poly(outline(win)), STRUCT, 1.1, N + 2);
      b += k.path(poly(outline({ hw: 452, hh: 282, s: 22 })), FINE + .05, .6, N + 2);
      for (const sx of [-1, 1]) b += stone(k, [CX + sx * 470, CY], phone ? 10 : 8, FAM.petrol.base);
      return svg(b, defs);
    }

    /* ------------------------------------------------------------------------------------------------
       3 · Radiant. The door as a rising sun: rays in threes, a bold one between two fine ones, burst from
       behind an octagonal window to the frame, with a fine ray starting further out in each gap. Alternate
       wedges hold amethyst that deepens towards the edges, like a sunburst inlay. Glints: on every third
       bold ray, alternately halfway and two thirds of the way out; the lower half takes the rays in between. */
    function radiant(phone, fam = FAM.amethyst) {
      const k = kit(phone);
      const hw = 490, hh = 300, c = 118;
      const win = [[CX - hw + c, CY - hh], [CX + hw - c, CY - hh], [CX + hw, CY - hh + c], [CX + hw, CY + hh - c], [CX + hw - c, CY + hh], [CX - hw + c, CY + hh], [CX - hw, CY + hh - c], [CX - hw, CY - hh + c]];
      const D = phone ? 12 : 9, del = phone ? 1.9 : 1.4, RR = 1300;
      const rad = d => d * Math.PI / 180;
      const at = (deg, r) => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))];
      let defs = glow('raG', fam.base, [[.34, 0], [.72, .1], [1, .26]]) + glow('raE', fam.deep, [[.5, 0], [.88, .2], [1, .38]]) + fadeMask('raM', .3, .62);
      const n = Math.round(360 / D);
      let wd = '';
      for (let j = 0; j < n; j += 2) wd += `M${CX} ${CY}L${pt(at(j * D + del, RR))}L${pt(at((j + 1) * D - del, RR))}Z`;
      let b = `<rect class="a" style="--i:0" width="${W}" height="${H}" fill="url(#raE)"/><path class="a" style="--i:0" d="${wd}" fill="url(#raG)"/>`;
      let fine = '', gap = '', bold = '';
      for (let j = 0; j < n; j++) {
        const a = j * D;
        fine += seg(at(a - del, 330), at(a - del, RR)) + seg(at(a + del, 330), at(a + del, RR));
        gap += seg(at(a + D / 2, 420), at(a + D / 2, RR));
        bold += seg(at(a, 300), at(a, RR));
      }
      b += `<g mask="url(#raM)"><path class="a" style="--i:6" d="${gap}" ${fineStroke(phone, GOLD, .2, .5)}/></g>`;
      b += k.path(fine, FINE + .04, .6, 2) + k.path(bold, MID + .06, 2.5, 1);
      const exit = a => { const c0 = Math.abs(Math.cos(rad(a))), s0 = Math.abs(Math.sin(rad(a))); return Math.min(c0 > 1e-6 ? CX / c0 : 1e9, s0 > 1e-6 ? CY / s0 : 1e9); };
      const doorR = a => { const c0 = Math.abs(Math.cos(rad(a))), s0 = Math.abs(Math.sin(rad(a))); return Math.min(hw / Math.max(c0, 1e-6), hh / Math.max(s0, 1e-6), (hw + hh - c) / (c0 + s0)); };
      const gl = [], len = phone ? 64 : 52;
      const put = (a, t, l) => {
        const r0 = doorR(a), r1 = exit(a), p = at(a, r0 + (r1 - r0) * t), dir = [Math.cos(rad(a)), -Math.sin(rad(a))];
        gl.push({ p, dir, len: l }, { p: mx(p), dir: [-dir[0], dir[1]], len: l });
      };
      let alt = 0;
      for (let j = 1; j * D < 90; j++) if (j % 3 === 1) put(j * D, alt++ % 2 ? .66 : .5, len);
      alt = 0;
      for (let j = 1; j * D < 90; j++) if (j % 3 === 2) put(-j * D, alt++ % 2 ? .5 : .66, len * .8);
      b += glints(phone, gl);
      b += door(poly(win)) + k.path(poly(win), STRUCT, 1.1, 0);
      const s = 18, w2 = [[CX - hw + c, CY - hh + s], [CX + hw - c, CY - hh + s], [CX + hw - s, CY - hh + c], [CX + hw - s, CY + hh - c], [CX + hw - c, CY + hh - s], [CX - hw + c, CY + hh - s], [CX - hw + s, CY + hh - c], [CX - hw + s, CY - hh + c]];
      b += k.path(poly(w2), FINE + .05, .6, 0);
      for (const sy of [-1, 1]) b += stone(k, [CX, CY + sy * hh], phone ? 10 : 8, FAM.petrol.base);
      return svg(b, defs);
    }

    /* ------------------------------------------------------------------------------------------------
       4 · Four lamps. A fan of stepped glass in each corner, lit from behind: rays leave a small quarter
       sun and double at each of two stepped tiers, then run on until they meet the window or their mirror
       on the centre lines, where they close into chevrons that point at the door. Fine compass arcs inside
       the tiers run the other way. The colour is the lamps' light, glowing from the corners. No glints. */
    function fourLamps(phone, fam = FAM.petrol) {
      const k = kit(phone);
      const rho = 470, x0 = 350, y0 = 200;
      const bitten = (r, x, y) => { const p = Math.sqrt(r * r - y * y), q = Math.sqrt(r * r - x * x); return `M${f(p)} ${y}H${f(W - p)}A${r} ${r} 0 0 0 ${f(W - x)} ${f(q)}V${f(H - q)}A${r} ${r} 0 0 0 ${f(W - p)} ${f(H - y)}H${f(p)}A${r} ${r} 0 0 0 ${x} ${f(H - q)}V${f(q)}A${r} ${r} 0 0 0 ${f(p)} ${y}Z`; };
      const winD = bitten(rho, x0, y0);
      let defs = `<clipPath id="flQ"><rect width="${CX}" height="${CY}"/></clipPath>`;
      defs += glow('flG', fam.deep, [[0, .7], [.3, .42], [.65, .1], [1, 0]], { cx: 0, cy: 0, r: 820, sy: .8 });
      const r0 = 160, t1 = 290, t2 = 410;
      const ang = a => [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)];
      const ray = (a, ra, rb) => { const [c, s] = ang(a); return `M${f(ra * c)} ${f(ra * s)}L${f(rb * c)} ${f(rb * s)}`; };
      const arc = r => `M${f(r)} 0A${r} ${r} 0 0 1 0 ${f(r)}`;
      // 6 rays from the sun, 12 after the first tier, 24 after the second; every second outer ray bold
      const D0 = 90 / 6;
      let inner = '', mid = '', outerB = '', outerF = '', tex = '';
      for (let a = D0 / 2; a < 90; a += D0) inner += ray(a, r0, t1);
      for (let a = D0 / 4; a < 90; a += D0 / 2) mid += ray(a, t1, t2);
      let j = 0;
      for (let a = D0 / 8; a < 90; a += D0 / 4, j++) {
        if (a < 3 || a > 87) continue;
        if (j % 2 === 0) outerB += ray(a, t2, 1500); else outerF += ray(a, t2, 1500);
      }
      for (let r = t1 + (phone ? 24 : 17); r < t2 - 6; r += phone ? 24 : 17) tex += arc(r);
      let q = `<rect class="a" style="--i:0" width="${CX}" height="${CY}" fill="url(#flG)"/>`;
      q += `<path class="a" style="--i:7" d="${tex}" ${fineStroke(phone, GOLD, .16, .45)}/>`;
      q += k.path(outerF, FINE + .05, .6, 3) + k.path(outerB, MID + .04, 2.2, 2);
      q += k.path(mid, FINE + .1, .8, 2) + k.path(inner, MID, 1.2, 2);
      q += k.path(arc(t1), MID + .06, 2.2, 1) + k.path(arc(t2), MID + .06, 2.5, 1);
      q += `<path d="M0 0H${r0}A${r0} ${r0} 0 0 1 0 ${r0}Z" style="fill:var(--card-bg)"/>`;
      q += k.path(arc(r0), STRUCT, 1.1, 0) + k.path(arc(r0 * .6), MID, .7, 0);
      for (let a = 15; a < 90; a += 15) q += k.path(ray(a, r0 * .6, r0), FINE + .08, .5, 0);
      let b = '';
      for (const tf of QUARTERS) b += `<g clip-path="url(#flQ)"${moved(tf)}>${q}</g>`;
      b += door(winD) + k.path(winD, STRUCT, 1.1, 0) + k.path(bitten(rho + 18, x0 + 18, y0 + 18), FINE + .05, .6, 0);
      // Glints, by the same rule as the others: on bold lines only, along their own direction, light from above.
      // On each lamp: where its two bold rims cross the lamp's 45-degree axis, and halfway along its bold ray nearest
      // the card's long edge (9.375 degrees), from the outer rim to the centre line. The bottom lamps' glints are shorter.
      const gl = [], len = phone ? 62 : 50;
      const tl = [];
      for (const r of [t1, t2]) { const [c, s2] = ang(45); tl.push({ p: [r * c, r * s2], dir: [-s2, c] }); }
      { const a = D0 / 8 + D0 / 4 * 2, [c, s2] = ang(a), rEnd = CX / c, rm = (t2 + rEnd) / 2; tl.push({ p: [rm * c, rm * s2], dir: [c, s2] }); }
      for (const { p, dir } of tl) {
        gl.push({ p, dir, len }, { p: mx(p), dir: [-dir[0], dir[1]], len });
        gl.push({ p: my(p), dir: [dir[0], -dir[1]], len: len * .7 }, { p: mxy(p), dir: [-dir[0], -dir[1]], len: len * .7 });
      }
      b += glints(phone, gl);
      for (const sy of [-1, 1]) b += stone(k, [CX, CY + sy * 300], phone ? 10 : 8, FAM.garnet.base);
      return svg(b, defs);
    }

    /* ------------------------------------------------------------------------------------------------
       5 · Winged door (the outlier). The window as a sun disc and four great wings of feather tiers sweeping
       from it to the frame, as on an Egyptian lintel drawn in deco line. Each tier's edge leaves the disc
       square to it and bends towards the frame; fine feathers run across the tiers. Amethyst lies in
       alternate tiers, deepening to the tips. Glints: one on each bold tier edge, at the point where that
       edge bends most; the bold edges take turns between the upper and the lower wings. */
    function wingedDoor(phone, fam = FAM.amethyst) {
      const k = kit(phone);
      const rx = 470, ry = 300, K = phone ? 9 : 13;
      const frameAt = u => { const L1 = 470, L2 = 640, s = u * (L1 + L2); return s <= L1 ? [0, 470 - s] : [s - L1, 0]; };
      const curve = j => {
        const u = j / K, phi = (4 + u * 80) * Math.PI / 180;
        const S = [CX - rx * Math.cos(phi), CY - ry * Math.sin(phi)];
        const nrm = unit([0, 0], [-Math.cos(phi) / rx, -Math.sin(phi) / ry]);
        const E = frameAt(.04 + u * .96), d = Math.hypot(E[0] - S[0], E[1] - S[1]);
        return { S, C: [S[0] + nrm[0] * d * .55, S[1] + nrm[1] * d * .55], E };
      };
      const bez = ({ S, C, E }, t) => [(1 - t) ** 2 * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], (1 - t) ** 2 * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1]];
      const tan = ({ S, C, E }, t) => unit([0, 0], [2 * (1 - t) * (C[0] - S[0]) + 2 * t * (E[0] - C[0]), 2 * (1 - t) * (C[1] - S[1]) + 2 * t * (E[1] - C[1])]);
      const bend = ({ S, C, E }) => { // where a quadratic curve bends most
        const a = [C[0] - S[0], C[1] - S[1]], bb = [E[0] - 2 * C[0] + S[0], E[1] - 2 * C[1] + S[1]];
        return Math.max(.15, Math.min(.85, -(a[0] * bb[0] + a[1] * bb[1]) / (bb[0] ** 2 + bb[1] ** 2)));
      };
      const qd = cv => `M${pt(cv.S)}Q${pt(cv.C)} ${pt(cv.E)}`;
      const cvs = []; for (let j = 0; j <= K; j++) cvs.push(curve(j));
      let defs = glow('wdG', fam.deep, [[.4, 0], [.78, .2], [1, .42]]);
      let fills = '', feathers = '';
      const NS = phone ? 9 : 14;
      for (let j = 0; j < K; j++) {
        const A = cvs[j], B = cvs[j + 1];
        {
          let d = `M${pt(A.S)}`;
          for (let s = 1; s <= 24; s++) d += `L${pt(bez(A, s / 24))}`;
          if (A.E[0] === 0 && B.E[0] > 0) d += 'L0 0';
          for (let s = 24; s >= 0; s--) d += `L${pt(bez(B, s / 24))}`;
          fills += d + 'Z';
        }
        if (j % 2 === 0) for (let s = 1; s < NS; s++) { const t = (s / NS) ** .85; feathers += seg(bez(A, t), bez(B, t)); }
      }
      const isBold = j => j % 3 === 0;
      let q = `<path class="a" style="--i:0" d="${fills}" fill="url(#wdG)"/>`;
      q += `<path class="a" style="--i:7" d="${feathers}" ${fineStroke(phone, GOLD, .2, .5)}/>`;
      for (let j = 0; j <= K; j++) q += k.path(qd(cvs[j]), isBold(j) ? MID + .06 : FINE + .04, isBold(j) ? 2.5 : .6, K - j + 1);
      let b = '';
      for (const tf of QUARTERS) b += `<g${moved(tf)}>${q}</g>`;
      for (const sx of [-1, 1]) b += k.path(`M${sx < 0 ? 0 : W} ${CY}H${CX + sx * rx}`, MID, 1, 3);
      const gl = [], len = phone ? 62 : 50;
      const bolds = []; for (let j = 0; j <= K; j++) if (isBold(j)) bolds.push(j);
      bolds.forEach((j, idx) => {
        const cv = cvs[j], t = bend(cv), p0 = bez(cv, t), d0 = tan(cv, t);
        if (idx % 2 === 0) gl.push({ p: p0, dir: d0, len }, { p: mx(p0), dir: [-d0[0], d0[1]], len });
        else { const p = my(p0), d = [d0[0], -d0[1]]; gl.push({ p, dir: d, len: len * .8 }, { p: mx(p), dir: [-d[0], d[1]], len: len * .8 }); }
      });
      b += glints(phone, gl);
      const ell = (a, c) => `M${CX - a} ${CY}A${a} ${c} 0 1 0 ${CX + a} ${CY}A${a} ${c} 0 1 0 ${CX - a} ${CY}Z`;
      b += door(ell(rx, ry)) + k.path(ell(rx, ry), STRUCT, 1.1, 0) + k.path(ell(rx - 18, ry - 18), FINE + .05, .6, 0);
      for (const sx of [-1, 1]) b += stone(k, [CX + sx * rx, CY], phone ? 10 : 8, FAM.petrol.base);
      return svg(b, defs);
    }

    return { threshold, radiant, fourLamps, wingedDoor };
  })();

  const PAL8A = { side: t => [AMETHYST, t ? .14 : .32], tb: PETROL, dia: PETROL };
  const BACKS = {
    turnByTurn: p => withDepth(streamline(p, 'band'), turnByTurnDepth(p)),               // 2a
    bookmatched: p => withDepth(bookmatchedRefined(p, 'diagonal'), bookmatchedDepth(p)), // 5a
    cutAreasBoth: p => withDepth(cutAreas(p, PAL8A, { ring: true, jewels: true, frame: true }), cutAreasDepth(p)),   // 8a with its extra layer
    splitByZone: p => comboZones(p, true, true),                                        // 8d, clear order
    linesAndJewels: p => comboTechno(p, true),                                          // 8f
    cutAreasPurple: p => ROUND12.cutAreasPurple(p),                                     // round 12, 8a in purple with glints
    threshold: p => ROUND13.threshold(p),                                               // round 13, 1
    radiant: p => ROUND13.radiant(p),                                                   // round 13, 3
    fourLamps: p => ROUND13.fourLamps(p),                                               // round 13, 4
    wingedDoor: p => ROUND13.wingedDoor(p),                                             // round 13, 5
  };

  const START_POOL = ['turnByTurn', 'bookmatched', 'cutAreasPurple', 'threshold', 'radiant', 'fourLamps', 'wingedDoor'];
  const INTERMEZZO_POOL = ['eye', 'turnByTurn', 'bookmatched'];   // 'eye' is the markup already in the page, not drawn here

  const markupCache = new Map();

  // One drawing, both densities. Every id in it gets the prefix, so no id repeats in the document
  // (the start back and the Intermezzo back can be in the page together, each in two densities).
  function drawing(name, phone, prefix) {
    const tag = (phone ? 'cb-ph' : 'cb-dk');
    return BACKS[name](phone)
      .replace('<svg ', `<svg class="${tag}" aria-hidden="true" focusable="false" `)
      .replaceAll(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${tag}-${id}"`)
      .replaceAll(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${tag}-${id})`);
  }

  // The markup for one back, drawn the first time it is asked for and kept.
  function markup(name, prefix) {
    const key = `${name}/${prefix}`;
    if (!markupCache.has(key)) markupCache.set(key, drawing(name, true, prefix) + drawing(name, false, prefix));
    return markupCache.get(key);
  }

  // the pick uses the browser's own randomness, so it never shifts the Math.random sequence that the
  // deck's shuffle (and the tests' seeded runs) depend on
  const pick = pool => pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];

  /** @type {any} */ (window).Backs = { START_POOL, INTERMEZZO_POOL, markup, pick };
})();
