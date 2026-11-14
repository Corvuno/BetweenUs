// Sketch card backs, drawn in a 1640 x 1000 field that fills the frame's inner line.
const S = 'stroke="#c9a84c" fill="none" vector-effect="non-scaling-stroke"';
const strong = w => `${S} stroke-width="${w}" stroke-opacity=".95"`;
const fine = w => `${S} stroke-width="${w * 0.7}" stroke-opacity=".55"`;
const G = 'var(--card-bg)';
const line = (x1, y1, x2, y2, st) => `<path d="M${x1} ${y1}L${x2} ${y2}" ${st}/>`;
const poly = (pts, st, fill) => `<path d="M${pts.map(p => p.join(' ')).join('L')}Z" ${st} style="fill:${fill || 'none'}"/>`;
const circ = (x, y, r, st, fill) => `<circle cx="${x}" cy="${y}" r="${r}" ${st} style="fill:${fill || 'none'}"/>`;
const four = q => `<g>${q}</g><g transform="translate(1640 0) scale(-1 1)">${q}</g><g transform="translate(0 1000) scale(1 -1)">${q}</g><g transform="translate(1640 1000) scale(-1 -1)">${q}</g>`;
const two = q => `<g>${q}</g><g transform="translate(1640 0) scale(-1 1)">${q}</g>`;
const tb = q => `<g>${q}</g><g transform="translate(0 1000) scale(1 -1)">${q}</g>`;
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1640 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block">${body}</svg>`;

function bands(w) {
  let q = '';
  for (const s of [348, 372, 396, 420]) q += line(s, 0, 0, s, s === 348 || s === 420 ? strong(w) : fine(w));
  for (const c of [204, 228, 252, 276]) q += line(c, 0, (730 + c) / 2, (730 - c) / 2, c === 204 || c === 276 ? strong(w) : fine(w));
  q += circ(78, 78, 38, strong(w), G) + circ(78, 78, 22, fine(w)) + `<circle cx="78" cy="78" r="6" fill="#c9a84c"/>`;
  for (let i = 0; i < 5; i++) q += line(720 - 40 * i, 60 + 24 * i, 820, 60 + 24 * i, i === 4 ? strong(w) : fine(w));
  q += line(422, 290, 422, 500, strong(w)) + line(404, 330, 404, 500, fine(w));
  let b = four(q);
  // the chevrons and the woven diamond at each end
  let e = '';
  e += poly([[215, 315], [400, 500], [215, 685], [30, 500]], fine(w));
  e += poly([[215, 340], [375, 500], [215, 660], [55, 500]], strong(w), G);
  e += poly([[215, 362], [353, 500], [215, 638], [77, 500]], fine(w));
  const P = (u, v) => [215 + (u + v) / 2, 500 + (u - v) / 2];
  for (const k of [-115, -69, -23, 23, 69, 115]) {
    e += line(...P(k, -138), ...P(k, 138), fine(w)) + line(...P(-138, k), ...P(138, k), fine(w));
  }
  e += `<path d="M${[P(-23, -23), P(23, -23), P(23, 23), P(-23, 23)].map(p => p.join(' ')).join('L')}Z" style="fill:var(--preset-deep)" stroke="#c9a84c" vector-effect="non-scaling-stroke" stroke-width="${w}"/>`;
  b += two(e);
  // the round piece over the stepped bars, top and bottom
  b += tb(circ(820, 96, 48, strong(w), G) + circ(820, 96, 32, fine(w)) + poly([[820, 78], [838, 96], [820, 114], [802, 96]], strong(w), 'var(--preset-deep)'));
  // the window with cut corners
  b += poly([[530, 200], [1110, 200], [1200, 290], [1200, 710], [1110, 800], [530, 800], [440, 710], [440, 290]], strong(w), G);
  b += poly([[539, 222], [1101, 222], [1178, 299], [1178, 701], [1101, 778], [539, 778], [462, 701], [462, 299]], fine(w));
  return wrap(b);
}

function sunburst(w) {
  let b = '';
  for (let a = 0; a < 360; a += 5) {
    const r = a * Math.PI / 180;
    b += line(820, 500, 820 + 1100 * Math.cos(r), 500 + 1100 * Math.sin(r), a % 10 ? fine(w) : strong(w * 0.85));
  }
  b += circ(820, 500, 575, strong(w)) + circ(820, 500, 600, fine(w));
  // stepped blocks in the corners
  let q = poly([[0, 0], [150, 0], [150, 50], [100, 50], [100, 100], [50, 100], [50, 150], [0, 150]], strong(w), G);
  q += `<path d="M0 105H55V55H105V0" ${fine(w)}/><path d="M0 60H60V0" ${fine(w)}/>`;
  b += four(q);
  // the fan at each end
  let e = `<path d="M0 320A180 180 0 0 1 0 680Z" ${strong(w)} style="fill:${G}"/>`;
  e += `<path d="M0 360A140 140 0 0 1 0 640" ${fine(w)}/><path d="M0 400A100 100 0 0 1 0 600" ${fine(w)}/>`;
  for (let a = -75; a <= 75; a += 15) {
    const r = a * Math.PI / 180;
    e += line(48 * Math.cos(r), 500 + 48 * Math.sin(r), 180 * Math.cos(r), 500 + 180 * Math.sin(r), fine(w));
  }
  e += `<path d="M0 452A48 48 0 0 1 0 548Z" ${strong(w)} style="fill:var(--preset-deep)"/>`;
  b += two(e);
  // the stepped tower, top and bottom
  let t = poly([[560, 0], [1080, 0], [1080, 48], [1000, 48], [1000, 96], [920, 96], [920, 144], [720, 144], [720, 96], [640, 96], [640, 48], [560, 48]], strong(w), G);
  for (const [x, y] of [[760, 144], [790, 144], [820, 144], [850, 144], [880, 144], [680, 96], [960, 96], [600, 48], [1040, 48]]) t += line(x, 0, x, y - 14, fine(w));
  b += tb(t);
  // the window with stepped corners
  b += poly([[500, 210], [1140, 210], [1140, 260], [1190, 260], [1190, 740], [1140, 740], [1140, 790], [500, 790], [500, 740], [450, 740], [450, 260], [500, 260]], strong(w), G);
  b += poly([[522, 232], [1118, 232], [1118, 282], [1168, 282], [1168, 718], [1118, 718], [1118, 768], [522, 768], [522, 718], [472, 718], [472, 282], [522, 282]], fine(w));
  return wrap(b);
}
module.exports = { bands, sunburst };
