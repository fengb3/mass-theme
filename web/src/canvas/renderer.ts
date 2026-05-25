import type { ThemeElement } from '../types/theme'
import { resolvePosition, resolveDimensions, computeFlexLayout } from './layout'
import { drawImg } from './elements/draw-img'
import { drawLabel } from './elements/draw-label'
import { drawImgbtn } from './elements/draw-imgbtn'
import { drawBar } from './elements/draw-bar'
import { drawSlider } from './elements/draw-slider'
import { drawArc } from './elements/draw-arc'
import { drawClock } from './elements/draw-clock'
import { drawClockStrip } from './elements/draw-clock-strip'
import { drawMjpeg } from './elements/draw-mjpeg'
import { drawContainer } from './elements/draw-container'

const CANVAS_SIZE = 480

export interface RenderContext {
  assetImages: Map<string, HTMLImageElement>
  loadedFonts: Set<string>
}

export function render(
  ctx: CanvasRenderingContext2D,
  elements: ThemeElement[],
  renderCtx: RenderContext,
  selectedId: string | null,
) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const sorted = [...elements].filter(e => e.visible !== false).sort((a, b) => a.order - b.order)

  for (const el of sorted) {
    const dims = resolveDimensions(el)
    const pos = resolvePosition(el, dims.width, dims.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
    renderElement(ctx, el, pos.x, pos.y, dims.width, dims.height, renderCtx)
  }

  if (selectedId) {
    const sel = sorted.find(e => e.id === selectedId)
    if (sel) {
      const dims = resolveDimensions(sel)
      const pos = resolvePosition(sel, dims.width, dims.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      ctx.save()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.strokeRect(pos.x - 1, pos.y - 1, dims.width + 2, dims.height + 2)
      ctx.setLineDash([])
      ctx.restore()
    }
  }
}

function renderElement(
  ctx: CanvasRenderingContext2D,
  el: ThemeElement,
  x: number,
  y: number,
  width: number,
  height: number,
  renderCtx: RenderContext,
) {
  ctx.save()
  if (el.rotation) {
    const deg = el.rotation / 10
    const cx = x + width / 2
    const cy = y + height / 2
    ctx.translate(cx, cy)
    ctx.rotate(deg * Math.PI / 180)
    ctx.translate(-cx, -cy)
  }

  switch (el.type) {
    case 'img':
      drawImg(ctx, el.props as Parameters<typeof drawImg>[1], x, y, renderCtx.assetImages)
      break
    case 'label':
      drawLabel(ctx, el.props as Parameters<typeof drawLabel>[1], x, y, renderCtx.loadedFonts)
      break
    case 'imgbtn':
      drawImgbtn(ctx, el.props as Parameters<typeof drawImgbtn>[1], x, y, renderCtx.assetImages)
      break
    case 'bar':
      drawBar(ctx, el.props as Parameters<typeof drawBar>[1], x, y, width, height)
      break
    case 'slider':
      drawSlider(ctx, el.props as Parameters<typeof drawSlider>[1], x, y, width, height)
      break
    case 'arc':
      drawArc(ctx, el.props as Parameters<typeof drawArc>[1], x, y, width, height)
      break
    case 'clock':
      drawClock(ctx, el.props as Parameters<typeof drawClock>[1], x, y)
      break
    case 'clock_strip':
      drawClockStrip(ctx, el.props as Parameters<typeof drawClockStrip>[1], x, y, width, height)
      break
    case 'mjpeg':
      drawMjpeg(ctx, el.props as Parameters<typeof drawMjpeg>[1], x, y)
      break
    case 'container': {
      const cprops = el.props as Parameters<typeof drawContainer>[1]
      drawContainer(ctx, cprops, x, y, width, height, renderCtx.assetImages)
      if (cprops.elements?.length) {
        const children = [...cprops.elements].sort((a, b) => a.order - b.order)
        const childPositions = computeFlexLayout(
          children,
          cprops.flex_direction || 'row',
          cprops.flex_align || 'start',
          cprops.flex_gap || 0,
          x, y, width, height,
        )
        for (const child of children) {
          const cp = childPositions.get(child.id)
          if (cp) {
            renderElement(ctx, child, cp.x, cp.y, cp.width, cp.height, renderCtx)
          }
        }
      }
      break
    }
  }
  ctx.restore()
}
