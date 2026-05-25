import type { ArcProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawArc(
  ctx: CanvasRenderingContext2D,
  props: ArcProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const cx = x + width / 2
  const cy = y + height / 2
  const r = Math.max(0, Math.min(width, height) / 2 - (props.arc_width || 10) / 2)
  const rotationDeg = (props.rotation || 0) / 10
  const rotationRad = (rotationDeg - 90) * Math.PI / 180

  const bgStart = (props.bg_start_angle || 0) * Math.PI / 180 + rotationRad
  const bgEnd = (props.bg_end_angle || 360) * Math.PI / 180 + rotationRad

  ctx.strokeStyle = toCSSColor(props.bg_arc_color)
  ctx.lineWidth = props.arc_width || 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, bgStart, bgEnd)
  ctx.stroke()

  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0
  const indicEnd = bgStart + (bgEnd - bgStart) * ratio

  ctx.strokeStyle = toCSSColor(props.arc_color)
  ctx.beginPath()
  ctx.arc(cx, cy, r, bgStart, indicEnd)
  ctx.stroke()
}
