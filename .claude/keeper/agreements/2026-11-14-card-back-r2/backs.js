// Round 2: three balances of one sunburst back. Field 1640 x 1000 fills the frame's inner line.
// `phone` halves the number of lines, because fine lines keep their weight when the card is small.
const S = 'stroke="#c9a84c" fill="none" vector-effect="non-scaling-stroke"';
const G = 'var(--card-bg)';
const CX = 820, CY = 500;
const mk = w => ({
  strong: `${S} stroke-width="${w}" stroke-opacity=".95"`,
  fine: `${S} stroke-width="${w * 0.7}" stroke-opacity=".5"`,
});
const line = (x1, y1, x2, y2, st) => `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" ${st}/>`;
const poly = (pts, st, fill) => `<path d="M${pts.map(p => p.join(' ')).join('L')}Z" ${st} style="fill:${fill || 'none'}"/>`;
const circ = (x, y, r, st, fill) => `<circle cx="${x}" cy="${y}" r="${r}" ${st} style="fill:${fill || 'none'}"/>`;
const two = q => `<g>${q}</g><g transform="translate(1640 0) scale(-1 1)">${q}</g>`;
const tb = q => `<g>${q}</g><g transform="translate(0 1000) scale(1 -1)">${q}</g>`;
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1640 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${body}</svg>`;
const ray = (a, r0, r1, st) => { const t = a * Math.PI / 180; return line(CX + r0 * Math.cos(t), CY + r0 * Math.sin(t), CX + r1 * Math.cos(t), CY + r1 * Math.sin(t), st); };

function windowPiece(p) {
  return poly([[500, 210], [1140, 210], [1140, 260], [1190, 260], [1190, 740], [1140, 740], [1140, 790], [500, 790], [500, 740], [450, 740], [450, 260], [500, 260]], p.strong, G)
    + poly([[522, 232], [1118, 232], [1118, 282], [1168, 282], [1168, 718], [1118, 718], [1118, 768], [522, 768], [522, 718], [472, 718], [472, 282], [522, 282]], p.fine);
}
function tower(p, flutes) {
  let t = poly([[640, 0], [1000, 0], [1000, 56], [940, 56], [940, 112], [700, 112], [700, 56], [640, 56]], p.strong, G);
  for (const x of flutes) t += line(x, 0, x, 92, p.fine);
  return tb(t);
}
// the round piece at each end: a ground-coloured disc that the great ring cuts through
function endDisc(p, r, arcs, spokeStep) {
  let e = `<path d="M0 ${500 - r}A${r} ${r} 0 0 1 0 ${500 + r}Z" ${p.strong} style="fill:${G}"/>`;
  for (const a of arcs) e += `<path d="M0 ${500 - a}A${a} ${a} 0 0 1 0 ${500 + a}" ${p.fine}/>`;
  const inner = arcs.length ? Math.min(...arcs) : 60;
  if (spokeStep) for (let a = -90 + spokeStep; a < 90; a += spokeStep) {
    const t = a * Math.PI / 180;
    e += line(inner * Math.cos(t), 500 + inner * Math.sin(t), r * Math.cos(t), 500 + r * Math.sin(t), p.fine);
  }
  e += `<path d="M0 452A48 48 0 0 1 0 548Z" ${p.strong} style="fill:var(--preset-deep)"/>`;
  return two(e);
}

// 1 · Lines lead: many rays, one great ring, a small fan at each end
function linesLead(w, phone) {
  const p = mk(w), step = phone ? 10 : 5;
  let b = '';
  for (let a = 0; a < 360; a += step) b += ray(a, 0, 1100, (a / step) % 2 ? p.fine : p.strong);
  b += circ(CX, CY, 575, p.strong) + (phone ? '' : circ(CX, CY, 600, p.fine));
  b += endDisc(p, 180, phone ? [110] : [140, 100], phone ? 30 : 15);
  b += tower(p, phone ? [820] : [760, 820, 880]) + windowPiece(p);
  return wrap(b);
}

// 2 · In balance: fewer rays that thin out past the ring, large discs that lock into the ring
function inBalance(w, phone) {
  const p = mk(w), step = phone ? 15 : 7.5;
  let b = '';
  for (let i = 0; i * step < 360; i++) b += i % 2 ? ray(i * step, 0, 575, p.fine) : ray(i * step, 0, 1100, p.strong);
  b += endDisc(p, 330, phone ? [200] : [250, 170], 0);
  b += circ(CX, CY, 575, p.strong) + circ(CX, CY, phone ? 610 : 600, p.fine);
  b += tower(p, phone ? [] : [820]) + windowPiece(p);
  return wrap(b);
}

// 3 · Curves lead: rings carry it, a few rays tie them to the window
function curvesLead(w, phone) {
  const p = mk(w);
  let b = '';
  for (const r of phone ? [455, 575, 720] : [455, 515, 575, 650, 720, 800]) b += circ(CX, CY, r, r === 575 ? p.strong : p.fine);
  for (let a = 0; a < 360; a += phone ? 30 : 15) b += ray(a, 0, 1100, a % 30 ? p.fine : p.strong);
  b += endDisc(p, 330, phone ? [215] : [270, 215, 160], 0);
  b += circ(CX, CY, 575, p.strong);
  b += windowPiece(p);
  return wrap(b);
}
module.exports = { 'lines-lead': linesLead, 'in-balance': inBalance, 'curves-lead': curvesLead };
