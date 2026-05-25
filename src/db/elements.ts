import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { ThemeElement, ElementProps, ElementType, LayoutAlign } from '../types/theme'

export async function getElementsForPage(pageId: string): Promise<ThemeElement[]> {
  return db.elements.where('pageId').equals(pageId).sortBy('order')
}

export async function addElement(
  pageId: string,
  name: string,
  type: ElementType,
  props: ElementProps,
  opts?: { offset_x?: number; offset_y?: number; layout_align?: LayoutAlign },
): Promise<ThemeElement> {
  const existing = await db.elements.where('pageId').equals(pageId).toArray()
  const maxOrder = existing.reduce((max, el) => Math.max(max, el.order), -1)
  const now = Date.now()
  const el: ThemeElement = {
    id: uuid(),
    pageId,
    name,
    type,
    order: maxOrder + 1,
    visible: true,
    offset_x: opts?.offset_x ?? 0,
    offset_y: opts?.offset_y ?? 0,
    layout_align: opts?.layout_align ?? 'TOP_LEFT',
    rotation: 0,
    x: 0,
    y: 0,
    props,
    updatedAt: now,
  }
  await db.elements.add(el)
  return el
}

export async function updateElement(id: string, changes: Partial<Omit<ThemeElement, 'id' | 'pageId'>>): Promise<void> {
  await db.elements.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteElement(id: string): Promise<void> {
  await db.elements.delete(id)
}

export async function reorderElement(id: string, direction: 'up' | 'down'): Promise<void> {
  const el = await db.elements.get(id)
  if (!el) return
  const siblings = await db.elements.where('pageId').equals(el.pageId).sortBy('order')
  const idx = siblings.findIndex(s => s.id === id)
  if (direction === 'up' && idx < siblings.length - 1) {
    const swap = siblings[idx + 1]
    await db.transaction('rw', db.elements, async () => {
      await db.elements.update(id, { order: swap.order, updatedAt: Date.now() })
      await db.elements.update(swap.id, { order: el.order, updatedAt: Date.now() })
    })
  } else if (direction === 'down' && idx > 0) {
    const swap = siblings[idx - 1]
    await db.transaction('rw', db.elements, async () => {
      await db.elements.update(id, { order: swap.order, updatedAt: Date.now() })
      await db.elements.update(swap.id, { order: el.order, updatedAt: Date.now() })
    })
  }
}
