// gilt.js — derives the metallic rail sweep from a category's base hex.
// The base hex is the ONLY stored value per category (config.js CATEGORIES).
// Metal appears on the accent RAIL only; chips, dots and labels stay flat.
//
// Plain script, not a module (between-us.html loads it via a bare <script
// src>, same as every other app file) — so giltStops/giltRail/labelColor
// attach to window instead of using `export`.

(function () {

  // Kept for labelColor() only — the rail derivation below moved to OKLCH
  // (hex2oklch/ok), but labelColor's job (lift a very dark base like Carnal
  // to a readable tone) is a small, harmless lift where HSL is fine; not
  // worth porting until it actually needs to change.
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

  // sRGB hex -> OKLCH [L, C, h]. Perceptual lightness and real chroma —
  // holding C while moving L is what stops a lifted highlight going grey,
  // which plain HSL's L multiplier couldn't avoid (raising HSL lightness
  // drags saturation down with it for most hues).
  const hex2oklch = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const r = lin((n >> 16) / 255), g = lin(((n >> 8) & 255) / 255), b = lin((n & 255) / 255);
    const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    let h = Math.atan2(bb, a) * 180 / Math.PI;
    if (h < 0) h += 360;
    return [L, Math.sqrt(a * a + bb * bb), h];
  };

  const ok = (L, C, h) =>
    `oklch(${(Math.max(0, Math.min(1, L)) * 100).toFixed(1)}% ${C.toFixed(4)} ${h.toFixed(1)})`;

  // Cold hues get a gentler sweep — full strength on lapis or amethyst
  // reads as plastic. Hue is OKLCH hue now, not HSL hue, so the cold band
  // shifts: blue sits around 240-280 here, not 190-300.
  const isCold = (h) => h >= 225 && h <= 320;

  function giltStopsSoft(baseHex) {
    const [L, C, h] = hex2oklch(baseHex);
    const cold = isCold(h);
    return {
      dark:  ok(L * (cold ? 0.78 : 0.66), C, h),
      light: ok(Math.min(cold ? 0.78 : 0.82, L * (cold ? 1.42 : 1.62)),
                C * (cold ? 0.90 : 1.00), h),
      mid:   baseHex,
    };
  }

  // Absolute lightness targets, not multipliers of the base's own L — at
  // 1024px+ (desktop) the card and its rail are wide enough to carry a real
  // hard-edged metal sweep: dark end at 45% L with chroma held, highlight
  // at 82% L with chroma cut by a third (full chroma at that lightness
  // reads as a bright version of the hue, not as light catching metal).
  function giltStopsIntense(baseHex) {
    const [, C, h] = hex2oklch(baseHex);
    return { dark: ok(0.45, C, h), light: ok(0.82, C * (2 / 3), h), mid: baseHex };
  }

  function giltStops(baseHex, intense) {
    return intense ? giltStopsIntense(baseHex) : giltStopsSoft(baseHex);
  }

  // Five-stop sweep: dark → mid → light → mid → dark, off-axis at 100deg so the
  // highlight crosses the rail diagonally the way rolled metal does.
  // Stops are deliberately tight (34/50/66 — a 32-point spread, not 46). On a
  // wide card a broad highlight stretches until it reads as a soft wash; the
  // narrow band keeps a visible gleam at any rail length. angle defaults to
  // 100deg (horizontal card rails); the chapter drawer's vertical rail passes
  // 190deg instead.
  //
  // Same colour, different confidence: soft below 1024px, hard-edged
  // intense above it, decided here rather than by each caller so every
  // rail in the app — the main card, the chapter drawer, fullscreen's
  // party accent — switches together the moment the window crosses the
  // breakpoint, matching the corresponding CSS breakpoint on .c-accent.
  // Interpolating "in oklab" (not the gradient's default sRGB space) keeps
  // the sweep perceptually even instead of dipping through a muddy mid-mix.
  function giltRail(baseHex, angle) {
    const intense = typeof matchMedia === 'function' && matchMedia('(min-width: 1024px)').matches;
    const { dark, light, mid } = giltStops(baseHex, intense);
    const a = angle == null ? 100 : angle;
    return `linear-gradient(in oklab ${a}deg, ${dark} 0%, ${mid} 34%, ${light} 50%, ${mid} 66%, ${dark} 100%)`;
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
