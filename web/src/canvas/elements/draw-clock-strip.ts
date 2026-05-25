import type { ClockStripProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawClockStrip(
  ctx: CanvasRenderingContext2D,
  props: ClockStripProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const opa = (props.marking_color_opa ?? 50) / 100
  const color = toCSSColor(props.marking_color || '0xFFFFFF', opa)
  const spacing = props.marking_spacing || 22
  const bigW = props.big_width || 59
  const bigH = props.big_height || 2
  const smallW = props.small_width || 30
  const smallH = props.small_height || 2
  const bigLoop = props.big_loop || 6

  const cy = y + height / 2
  const totalTicks = Math.ceil(width / spacing) + 1

  ctx.fillStyle = color
  for (let i = 0; i < totalTicks; i++) {
    const isBig = i % bigLoop === 0
    const w = isBig ? bigW : smallW
    const h = isBig ? bigH : smallH
    const tx = x + i * spacing
    ctx.fillRect(tx, cy - h / 2, w, h)
  }
}
