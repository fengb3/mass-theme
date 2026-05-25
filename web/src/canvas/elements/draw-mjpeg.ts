import type { MjpegProps } from '../../types/theme'

export function drawMjpeg(
  ctx: CanvasRenderingContext2D,
  props: MjpegProps,
  x: number,
  y: number,
) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x, y, props.width || 480, props.height || 480)
  ctx.fillStyle = '#444444'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MJPEG', x + (props.width || 480) / 2, y + (props.height || 480) / 2)
}
