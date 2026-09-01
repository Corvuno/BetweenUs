// gilt.js — derives the metallic rail sweep from a category's base hex.
// The base hex is the ONLY stored value per category (config.js CATEGORIES).
// Metal appears on the accent RAIL only; chips, dots and labels stay flat.
//
// Plain script, not a module (between-us.html loads it via a bare <script
// src>, same as every other app file) — so giltStops/giltRail/labelColor
// attach to window instead of using `export`.

(function () {

  const hex2hsl = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    const d = mx - mn;
    if (!d) return [0, 0, l];
    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0))
            : mx === g ? (b - r) / d + 2
            :            (r - g) / d + 4;
    return [h * 60, s, l];
  };

  const hsl2hex = (h, s, l) => {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(v * 255).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  };

  // Absolute lightness targets rather than multipliers of the base's own
  // L: a metal edge needs its dark end to actually read as shadow and its
  // highlight to actually read as light catching metal, regardless of
  // whether the base hue itself happens to be dark or pale.
  //
  // 0.45 for the dark stop (an earlier pass here) still read as a visible
  // mid-tone film against the card face (--card-bg is ~0.09 L) — nowhere
  // near "disappearing into the card". 0.15 sits close enough to the card
  // background that the dark end genuinely blends into it, with chroma
  // cut too (a near-black shadow reads as neutral, not as a dark version
  // of the hue). The highlight keeps its own chroma cut by a third — full
  // saturation at 82% L reads as a bright version of the colour, not as
  // light catching metal.
  function giltStops(baseHex) {
    const [h, s] = hex2hsl(baseHex);
    const dark  = hsl2hex(h, s * 0.55,    0.15);
    const light = hsl2hex(h, s * (2 / 3), 0.82);
    const mid   = baseHex;
    return { dark, light, mid };
  }

  // Five-stop sweep: dark → mid → light → mid → dark, off-axis at 100deg so the
  // highlight crosses the rail diagonally the way rolled metal does.
  // Stops are deliberately tight (34/50/66 — a 32-point spread, not 46). On a
  // wide card a broad highlight stretches until it reads as a soft wash; the
  // narrow band keeps a visible gleam at any rail length. angle defaults to
  // 100deg (horizontal card rails); the chapter drawer's vertical rail passes
  // 190deg instead.
  function giltRail(baseHex, angle) {
    const { dark, light, mid } = giltStops(baseHex);
    const a = angle == null ? 100 : angle;
    return `linear-gradient(${a}deg, ${dark} 0%, ${mid} 34%, ${light} 50%, ${mid} 66%, ${dark} 100%)`;
  }

  // Label colour. Deep lacquer categories cannot carry 11px text on #1a1612,
  // so any base below this luminance lifts to a lighter tone of the SAME hue.
  // (Carnal #8d1c22 -> #c2453f.) Everything else uses its base hex flat.
  function labelColor(baseHex) {
    const [h, s, l] = hex2hsl(baseHex);
    if (l >= 0.34) return baseHex;
    return hsl2hex(h, Math.max(0.35, s * 0.72), 0.51);
  }

  window.giltStops = giltStops;
  window.giltRail = giltRail;
  window.labelColor = labelColor;
})();
