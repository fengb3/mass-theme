import type { ThemeElement } from '../types/theme'
import { resolvePosition, resolveDimensions } from './layout'

const CANVAS_SIZE = 480

export function hitTest(
  clickX: number,
  clickY: number,
  elements: ThemeElement[],
): string | null {
  const sorted = [...elements].filter(e => e.visible !== false).sort((a, b) => a.order - b.order)

  for (let i = sorted.length - 1; i >= 0; i--) {
    const el = sorted[i]
    const dims = resolveDimensions(el)
    const pos = resolvePosition(el, dims.width, dims.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

    if (
      clickX >= pos.x &&
      clickX <= pos.x + dims.width &&
      clickY >= pos.y &&
      clickY <= pos.y + dims.height
    ) {
      return el.id
    }
  }
  return null
}
