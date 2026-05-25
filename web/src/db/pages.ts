import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { Page, PageType } from '../types/theme'
import { PAGE_TYPES } from '../types/theme'

export async function initPagesForTheme(themeId: string): Promise<Page[]> {
  const now = Date.now()
  const pages: Page[] = PAGE_TYPES.map(pageType => ({
    id: uuid(),
    themeId,
    pageType,
    comment: null,
    main_cont: null,
    updatedAt: now,
  }))
  await db.pages.bulkAdd(pages)
  return pages
}

export async function getPagesForTheme(themeId: string): Promise<Page[]> {
  return db.pages.where('themeId').equals(themeId).toArray()
}

export async function getPage(themeId: string, pageType: PageType): Promise<Page | undefined> {
  return db.pages.where({ themeId, pageType }).first()
}

export async function updatePage(id: string, data: Partial<Pick<Page, 'comment' | 'main_cont'>>): Promise<void> {
  await db.pages.update(id, { ...data, updatedAt: Date.now() })
}
