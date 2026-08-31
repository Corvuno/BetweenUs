// ── GILT — turns a category's base hex into a metal-sweep rail gradient and
// a label colour. The base hex (CATEGORIES[level].color) stays the only
// stored colour value; everything else here is derived from it.
//
// Two sweep strengths: the jade/lapis/amethyst families (Your Days,
// Reflection, Vulnerability) get a softer dark/light spread and keep their
// mid stop at the base colour, because those hues read as harsh plastic at
// full metallic strength. Everything else gets the full sweep. Which hex
// belongs to which family isn't something you can derive from the hue
// alone (Kink's magenta and Raw's mauve sit at similar hues but opposite
// families), so membership is listed explicitly below, keyed by the base
// hex itself — giltRail/labelColor still take just the one hex argument.
//
// A handful of the darkest lacquer/oxblood categories (After Dark) can't
// carry 11px label text at their base colour — their *label* lifts to a
// lighter tint while their *rail* keeps the deep base colour.

(function () {

  const COOL_GENTLE = new Set([
    // Your Days — jade
    '#4f9668', '#6ba471', '#3d8a83', '#55a68f',
    // Reflection — lapis
    '#3f5e97', '#5c8798', '#476d95', '#697bab', '#786cae',
    // Vulnerability — amethyst
    '#8b779f', '#79688d', '#9b83ae', '#9d6682', '#736d8b', '#63537c',
  ]);

  // Us: Intimate, Flesh, Carnal, Kink, Abyss
  const LIFTED_LABEL = new Set([
    '#a13039', '#832f4d', '#8d1c22', '#742055', '#5c1016',
  ]);

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function hexToHsl(hex) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHsl(r, g, b);
  }

  function giltStops(baseHex) {
    const [h, s, l] = hexToHsl(baseHex);
    const gentle = COOL_GENTLE.has(baseHex.toLowerCase());

    if (gentle) {
      const dark  = hslToHex(h, s, l * 0.79);
      const mid   = baseHex;
      const light = hslToHex(h, s + 4, l + (100 - l) * 0.26);
      return { dark, mid, light };
    }

    const darkBoost = l < 35 ? 0.10 : 0;
    const dark  = hslToHex(h, s + 7, l * 0.585);
    const mid   = hslToHex(h, s + 3, l * 0.82);
    const light = hslToHex(h, Math.min(s + 22, 65), l + (100 - l) * (0.30 + darkBoost));
    return { dark, mid, light };
  }

  // The 34/50/66 stops are deliberate — a wider spread stretches the
  // highlight until it reads as a soft wash on a long rail; this narrow
  // band keeps a gleam at any card width. Don't widen it.
  function giltRail(baseHex) {
    const { dark, mid, light } = giltStops(baseHex);
    return `linear-gradient(100deg, ${dark} 0%, ${mid} 34%, ${light} 50%, ${mid} 66%, ${dark} 100%)`;
  }

  function labelColor(baseHex) {
    if (!LIFTED_LABEL.has(baseHex.toLowerCase())) return baseHex;
    const [h, s, l] = hexToHsl(baseHex);
    return hslToHex(h + 4, s * 0.775, l + (100 - l) * 0.26);
  }

  window.giltRail = giltRail;
  window.labelColor = labelColor;
})();
