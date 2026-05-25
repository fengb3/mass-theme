import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { Theme } from '../types/theme'

export async function createTheme(name: string): Promise<Theme> {
  const now = Date.now()
  const id = uuid()
  const theme: Theme = { id, name, createdAt: now, updatedAt: now, thumbnail: null }
  await db.themes.add(theme)
  return theme
}

export async function getTheme(id: string): Promise<Theme | undefined> {
  return db.themes.get(id)
}

export async function listThemes(): Promise<Theme[]> {
  return db.themes.orderBy('updatedAt').reverse().toArray()
}

export async function updateThemeName(id: string, name: string): Promise<void> {
  await db.themes.update(id, { name, updatedAt: Date.now() })
}

export async function deleteTheme(id: string): Promise<void> {
  await db.transaction('rw', [db.themes, db.pages, db.elements, db.assets], async () => {
    const pageIds = (await db.pages.where('themeId').equals(id).toArray()).map(p => p.id)
    await db.elements.where('pageId').anyOf(pageIds).delete()
    await db.pages.where('themeId').equals(id).delete()
    await db.assets.where('themeId').equals(id).delete()
    await db.themes.delete(id)
  })
}
