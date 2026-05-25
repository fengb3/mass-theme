import type { SliderProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawSlider(
  ctx: CanvasRenderingContext2D,
  props: SliderProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = props.radius || 0

  ctx.fillStyle = toCSSColor(props.main_color)
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fill()

  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0
  const indicW = width * ratio

  ctx.fillStyle = toCSSColor(props.indic_color)
  ctx.beginPath()
  ctx.roundRect(x, y, indicW, height, radius)
  ctx.fill()

  if (props.knob_visible !== false) {
    const knobR = height / 2 + 4
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x + indicW, y + height / 2, knobR, 0, Math.PI * 2)
    ctx.fill()
  }
}
