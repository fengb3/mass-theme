import type { ContainerProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawContainer(
  ctx: CanvasRenderingContext2D,
  props: ContainerProps,
  x: number,
  y: number,
  width: number,
  height: number,
  assetImages: Map<string, HTMLImageElement>,
) {
  if (props.bg_img) {
    const img = assetImages.get(props.bg_img)
    if (img) {
      const pat = ctx.createPattern(img, 'repeat')
      if (pat) {
        ctx.fillStyle = pat
        ctx.fillRect(x, y, width, height)
      }
    }
  } else if (props.bg_color) {
    const opa = props.bg_opa ?? 255
    ctx.fillStyle = toCSSColor(props.bg_color, opa / 255)
    if (props.radius) {
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, props.radius)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, width, height)
    }
  }
}
