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

  // Cold hues (blue → violet) get a gentler sweep — a full-strength sweep on
  // lapis or amethyst reads as harsh plastic, not metal. Warm hues (brass,
  // amber, coral, rose gold, lacquer) take the full sweep.
  const isCold = (h) => h >= 190 && h <= 300;

  function giltStops(baseHex) {
    const [h, s, l] = hex2hsl(baseHex);
    const cold  = isCold(h);
    const down  = cold ? 0.78 : 0.66;   // dark stop  — L multiplier
    const up    = cold ? 1.42 : 1.62;   // light stop — L multiplier
    const chrom = cold ? 0.90 : 1.00;   // light stop desaturates slightly on cold

    const dark  = hsl2hex(h, Math.min(1, s * 1.05), Math.max(0.06, l * down));
    const light = hsl2hex(h, s * chrom,             Math.min(0.86, l * up));
    const mid   = baseHex;
    return { dark, light, mid };
  }

  // Five-stop sweep: dark → mid → light → mid → dark, off-axis at 100deg so the
  // highlight crosses the rail diagonally the way rolled metal does.
  // Stops are deliberately tight (34/50/66 — a 32-point spread, not 46). On a
  // wide card a broad highlight stretches until it reads as a soft wash; the
  // narrow band keeps a visible gleam at any rail length.
  function giltRail(baseHex) {
    const { dark, light, mid } = giltStops(baseHex);
    return `linear-gradient(100deg, ${dark} 0%, ${mid} 34%, ${light} 50%, ${mid} 66%, ${dark} 100%)`;
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
