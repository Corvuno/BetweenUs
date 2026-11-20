// backs.js — the start card's five backs and the Intermezzo's two extra ornaments (#195), as drawn in the round pages:
// 2a turn by turn (round 3), 5a bookmatched (round 4), 8a cut areas (round 8), 8d split by zone in its
// clear order and 8f lines and shapes with jewellery, both in two colours (round 9). Each function returns
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
    b += `<g clip-path="url(#d7tb)">${area(bandTB, pal.tb, pal.tb === AMETHYST ? .3 : .2, 6, 'fill-rule="evenodd"')}${sun}${arcD}</g>`;
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
      + `<clipPath id="e11u"><rect width="${W}" height="${CY}"/></clipPath><clipPath id="e11l"><rect y="${CY}" width="${W}" height="${CY}"/></clipPath>`;
    const under = `<g clip-path="url(#e11r)"><g clip-path="url(#e11f)"><g clip-path="url(#e11b)">${half(1, 'e11u')}${half(-1, 'e11l')}</g></g></g>`;
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
      over += dot(p, phone ? 1.9 : 1.5, .3 + R() * .3);
    }
    return { defs, under, over };
  }

  const PAL8A = { side: t => [AMETHYST, t ? .14 : .32], tb: PETROL, dia: PETROL };
  const BACKS = {
    turnByTurn: p => withDepth(streamline(p, 'band'), turnByTurnDepth(p)),               // 2a
    bookmatched: p => withDepth(bookmatchedRefined(p, 'diagonal'), bookmatchedDepth(p)), // 5a
    cutAreasBoth: p => withDepth(cutAreas(p, PAL8A, { ring: true, jewels: true, frame: true }), cutAreasDepth(p)),   // 8a with its extra layer
    splitByZone: p => comboZones(p, true, true),                                        // 8d, clear order
    linesAndJewels: p => comboTechno(p, true),                                          // 8f
  };

  const START_POOL = ['turnByTurn', 'bookmatched', 'cutAreasBoth', 'splitByZone', 'linesAndJewels'];
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
