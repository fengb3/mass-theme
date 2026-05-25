import type { ImgProps } from '../../types/theme'

export function drawImg(
  ctx: CanvasRenderingContext2D,
  props: ImgProps,
  x: number,
  y: number,
  assetImages: Map<string, HTMLImageElement>,
) {
  const img = assetImages.get(props.src)
  if (img) {
    ctx.drawImage(img, x, y, props.width, props.height)
  } else {
    ctx.fillStyle = '#333333'
    ctx.fillRect(x, y, props.width, props.height)
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.src || '(empty)', x + props.width / 2, y + props.height / 2)
  }
}
