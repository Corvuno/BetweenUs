// Round 3: one back, built the way the reference is built.
// Every line is one thin weight and comes in a bundle of parallel lines with narrow, even channels.
// The bundles run along the card's edges and cross at the ends; the empty middle is the shape they leave.
// Field 1640 x 1000 fills the frame's inner line.
const W = 1640, H = 1000;
function build(w, phone) {
  const n = phone ? 3 : 4, gap = phone ? 30 : 20;
  const st = op => `stroke="#c9a84c" stroke-opacity="${op}" fill="none" vector-effect="non-scaling-stroke" stroke-width="${w}"`;
  const L = (x1, y1, x2, y2, op) => `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" ${st(op)}/>`;
  const op = i => (i === 0 ? 0.62 : 0.34);
  const top = 150, tipX = 170, s2 = Math.SQRT2;
  let b = '';
  // the window's edge and its bundle, offset outward by i * gap
  for (let i = 0; i < n; i++) {
    const d = i * gap, y0 = top - d, y1 = H - top + d;
    const k = 670 - d * s2;           // upper-left diagonal: x + y = k (moved outward)
    const m = 330 + d * s2;           // lower-left diagonal: y - x = m
    // horizontals meet the diagonals of the same offset
    const xa = k - y0, xb = W - xa;
    b += L(xa, y0, xb, y0, op(i)) + L(xa, y1, xb, y1, op(i));
    // diagonals run straight from frame to frame, so they cross at the vertices and at the ends
    const segs = [[0, k, k, 0], [0, m, H - m, H]];
    for (const [x1, y1_, x2, y2] of segs) {
      b += L(x1, y1_, x2, y2, op(i)) + L(W - x1, y1_, W - x2, y2, op(i));
    }
  }
  // the fan: hangs from the frame at top and bottom centre, its rays end on the outer line of the bundle
  const outer = top - (n - 1) * gap;
  const fan = flip => {
    let f = '';
    const cy = flip ? H : 0, dir = flip ? -1 : 1;
    for (const r of phone ? [outer * 0.55] : [outer * 0.42, outer * 0.7]) {
      f += `<path d="M${820 - r} ${cy}A${r} ${r} 0 0 ${flip ? 1 : 0} ${820 + r} ${cy}" ${st(0.34)}/>`;
    }
    const step = phone ? 30 : 18;
    for (let a = step; a < 180; a += step) {
      const t = a * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      const len = outer / sn;          // stops on the outer bundle line
      f += L(820, cy, 820 + len * c, cy + dir * outer, 0.34);
    }
    return f;
  };
  b += fan(false) + fan(true);
  // a ringed point where the bundles cross at each end
  const ring = x => `<circle cx="${x}" cy="500" r="${phone ? 34 : 26}" ${st(0.5)} style="fill:var(--card-bg)"/><circle cx="${x}" cy="500" r="${phone ? 8 : 6}" fill="#c9a84c" fill-opacity=".6"/>`;
  b += ring(tipX - (n - 1) * gap * s2 / 2) + ring(W - tipX + (n - 1) * gap * s2 / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${b}</svg>`;
}
module.exports = { 'bundles': build };
