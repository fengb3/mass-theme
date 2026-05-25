import type { LabelProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  props: LabelProps,
  x: number,
  y: number,
  loadedFonts: Set<string>,
) {
  ctx.save()
  const fontName = loadedFonts.has(props.font) ? `"${props.font}"` : 'sans-serif'
  const fontSize = props.height || 16
  ctx.font = `${fontSize}px ${fontName}`
  ctx.fillStyle = toCSSColor(props.color) || '#ffffff'
  ctx.textBaseline = 'top'

  const textAlign = props.text_align?.toLowerCase() || 'left'
  if (textAlign === 'center') {
    ctx.textAlign = 'center'
    ctx.fillText(props.text || '', x + (props.width || 200) / 2, y)
  } else if (textAlign === 'right') {
    ctx.textAlign = 'right'
    ctx.fillText(props.text || '', x + (props.width || 200), y)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(props.text || '', x, y)
  }
  ctx.restore()
}
