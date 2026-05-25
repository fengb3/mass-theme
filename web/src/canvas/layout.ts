import type { LayoutAlign, ThemeElement } from '../types/theme'

const CANVAS_SIZE = 480

export function resolvePosition(
  el: { offset_x: number; offset_y: number; layout_align: LayoutAlign; rotation: number; x: number; y: number },
  elWidth: number,
  elHeight: number,
  parentX: number,
  parentY: number,
  parentWidth: number,
  parentHeight: number,
): { x: number; y: number } {
  let x: number
  let y: number

  const align = el.layout_align || 'TOP_LEFT'

  if (align.includes('LEFT')) x = parentX + el.offset_x
  else if (align.includes('RIGHT')) x = parentX + parentWidth - elWidth + el.offset_x
  else x = parentX + (parentWidth - elWidth) / 2 + el.offset_x

  if (align.startsWith('TOP')) y = parentY + el.offset_y
  else if (align.startsWith('BOTTOM')) y = parentY + parentHeight - elHeight + el.offset_y
  else y = parentY + (parentHeight - elHeight) / 2 + el.offset_y

  return { x, y }
}

export function resolveDimensions(
  el: ThemeElement,
): { width: number; height: number } {
  const p = el.props as Record<string, unknown>
  return {
    width: (p.width as number) || 0,
    height: (p.height as number) || 0,
  }
}

export function computeFlexLayout(
  children: ThemeElement[],
  direction: 'row' | 'column' | 'row_wrap',
  align: string,
  gap: number,
  containerX: number,
  containerY: number,
  containerWidth: number,
  containerHeight: number,
): Map<string, { x: number; y: number; width: number; height: number }> {
  const result = new Map<string, { x: number; y: number; width: number; height: number }>()
  if (children.length === 0) return result

  const isRow = direction === 'row' || direction === 'row_wrap'
  const sizes = children.map(c => resolveDimensions(c))
  const totalSize = sizes.reduce((sum, s) => sum + (isRow ? s.width : s.height), 0)
  const totalGap = gap * (children.length - 1)

  let offset: number
  if (align === 'center') {
    offset = isRow
      ? (containerWidth - totalSize - totalGap) / 2
      : (containerHeight - totalSize - totalGap) / 2
  } else if (align === 'end') {
    offset = isRow
      ? containerWidth - totalSize - totalGap
      : containerHeight - totalSize - totalGap
  } else {
    offset = 0
  }

  let pos = offset
  const extraGap = align === 'space_between' && children.length > 1
    ? ((isRow ? containerWidth : containerHeight) - totalSize) / (children.length - 1) - gap
    : align === 'space_evenly' && children.length > 0
    ? ((isRow ? containerWidth : containerHeight) - totalSize) / (children.length + 1) - gap / (children.length)
    : 0

  for (let i = 0; i < children.length; i++) {
    const crossPos = align === 'center'
      ? (isRow ? (containerHeight - sizes[i].height) / 2 : (containerWidth - sizes[i].width) / 2)
      : 0

    result.set(children[i].id, {
      x: containerX + (isRow ? pos : crossPos),
      y: containerY + (isRow ? crossPos : pos),
      width: sizes[i].width,
      height: sizes[i].height,
    })
    pos += (isRow ? sizes[i].width : sizes[i].height) + gap + extraGap
  }

  return result
}
