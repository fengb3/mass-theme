import type { BarProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawBar(
  ctx: CanvasRenderingContext2D,
  props: BarProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = props.radius || 0
  const padding = props.padding || 0

  ctx.fillStyle = toCSSColor(props.main_color)
  drawRoundRect(ctx, x, y, width, height, radius)
  ctx.fill()

  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0

  ctx.fillStyle = toCSSColor(props.indic_color)
  if (props.direction === 'vertical') {
    const indicH = (height - padding * 2) * ratio
    const indicY = y + height - padding - indicH
    drawRoundRect(ctx, x + padding, indicY, width - padding * 2, indicH, Math.max(0, radius - padding))
    ctx.fill()
  } else {
    const indicW = (width - padding * 2) * ratio
    drawRoundRect(ctx, x + padding, y + padding, indicW, height - padding * 2, Math.max(0, radius - padding))
    ctx.fill()
  }
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  if (r > 0) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
}
