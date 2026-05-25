import type { ClockProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawClock(
  ctx: CanvasRenderingContext2D,
  props: ClockProps,
  x: number,
  y: number,
) {
  const cx = x + (props.width || 480) / 2
  const cy = y + (props.height || 480) / 2
  const r = Math.min(props.width || 480, props.height || 480) / 2 - (props.marking_length || 100)
  const markCount = 24
  const markLen = props.marking_length || 100
  const markW = props.marking_width || 6
  const opa = (props.marking_color_opa ?? 50) / 100

  ctx.save()
  ctx.strokeStyle = toCSSColor(props.marking_color || '0xFFFFFF', opa)
  ctx.lineWidth = markW

  for (let i = 0; i < markCount; i++) {
    const angle = (i / markCount) * Math.PI * 2 - Math.PI / 2
    const innerR = r
    const outerR = r + markLen
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
    ctx.stroke()
  }
  ctx.restore()
}
