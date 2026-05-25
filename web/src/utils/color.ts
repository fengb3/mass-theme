export function parseColor(color: string): { r: number; g: number; b: number } | null {
  if (!color || color === 'transparent') return null
  const hex = color.startsWith('0x') ? color.slice(2) : color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return null
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

export function toCSSColor(color: string, alpha = 1): string {
  const parsed = parseColor(color)
  if (!parsed) return 'transparent'
  return alpha < 1
    ? `rgba(${parsed.r},${parsed.g},${parsed.b},${alpha})`
    : `rgb(${parsed.r},${parsed.g},${parsed.b})`
}

export function toHexColor(color: string): string {
  const parsed = parseColor(color)
  if (!parsed) return '#000000'
  return `#${parsed.r.toString(16).padStart(2, '0')}${parsed.g.toString(16).padStart(2, '0')}${parsed.b.toString(16).padStart(2, '0')}`
}
