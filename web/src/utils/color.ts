/** "0xRRGGBB" or "#RRGGBB" or "transparent" -> CSS color string */
export function parseColor(c: string | undefined): string {
  if (!c || c === 'transparent') return 'transparent';
  if (c.startsWith('#')) return c;
  if (c.startsWith('0x') || c.startsWith('0X')) return '#' + c.slice(2);
  return c;
}

/** CSS "#RRGGBB" -> "0xRRGGBB" for theme JSON */
export function cssToHex(css: string): string {
  if (!css || css === 'transparent') return 'transparent';
  if (css.startsWith('0x') || css.startsWith('0X')) return css;
  if (css.startsWith('#')) return '0x' + css.slice(1).toUpperCase();
  return css;
}

/** "0xRRGGBB" -> { r, g, b } */
export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^0x/i, '#');
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}
