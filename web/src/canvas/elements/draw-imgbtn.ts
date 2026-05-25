import type { ImgbtnProps } from '../../types/theme'

export function drawImgbtn(
  ctx: CanvasRenderingContext2D,
  props: ImgbtnProps,
  x: number,
  y: number,
  assetImages: Map<string, HTMLImageElement>,
) {
  const srcName = props.states?.released || ''
  const img = assetImages.get(srcName)
  if (img) {
    ctx.drawImage(img, x, y)
  } else {
    ctx.fillStyle = '#444444'
    ctx.fillRect(x, y, 84, 84)
    ctx.fillStyle = '#888888'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(srcName || 'btn', x + 42, y + 42)
  }
}
