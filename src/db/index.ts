import Dexie, { type Table } from 'dexie'
import type { Theme, Page, ThemeElement, Asset } from '../types/theme'

export class ThemeDatabase extends Dexie {
  themes!: Table<Theme>
  pages!: Table<Page>
  elements!: Table<ThemeElement>
  assets!: Table<Asset>

  constructor() {
    super('mwkeys-themes')
    this.version(1).stores({
      themes: 'id, name, updatedAt',
      pages: 'id, themeId, pageType, updatedAt',
      elements: 'id, pageId, name, type, order',
      assets: 'id, themeId, name, type, updatedAt',
    })
  }
}

export const db = new ThemeDatabase()
