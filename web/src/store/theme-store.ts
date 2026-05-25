import { create } from 'zustand'
import type { Theme, Page, ThemeElement, Asset, PageType } from '../types/theme'
import * as dbThemes from '../db/themes'
import * as dbPages from '../db/pages'
import * as dbElements from '../db/elements'
import * as dbAssets from '../db/assets'

interface ThemeState {
  themes: Theme[]
  currentThemeId: string | null
  pages: Page[]
  currentPageType: PageType
  elements: ThemeElement[]
  assets: Asset[]

  loadThemes: () => Promise<void>
  createTheme: (name: string) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
  selectTheme: (id: string) => Promise<void>
  selectPage: (pageType: PageType) => Promise<void>
  refreshElements: () => Promise<void>
  addElement: (name: string, type: ThemeElement['type'], props: ThemeElement['props']) => Promise<void>
  updateElement: (id: string, changes: Partial<ThemeElement>) => Promise<void>
  deleteElement: (id: string) => Promise<void>
  reorderElement: (id: string, direction: 'up' | 'down') => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: [],
  currentThemeId: null,
  pages: [],
  currentPageType: 'home',
  elements: [],
  assets: [],

  loadThemes: async () => {
    const themes = await dbThemes.listThemes()
    set({ themes })
  },

  createTheme: async (name) => {
    const theme = await dbThemes.createTheme(name)
    await dbPages.initPagesForTheme(theme.id)
    await get().loadThemes()
    await get().selectTheme(theme.id)
    return theme
  },

  deleteTheme: async (id) => {
    await dbThemes.deleteTheme(id)
    const { currentThemeId } = get()
    if (currentThemeId === id) {
      set({ currentThemeId: null, pages: [], elements: [], assets: [] })
    }
    await get().loadThemes()
  },

  selectTheme: async (id) => {
    const [pages, assets] = await Promise.all([
      dbPages.getPagesForTheme(id),
      dbAssets.getAssetsForTheme(id),
    ])
    set({ currentThemeId: id, pages, assets })
    await get().selectPage(get().currentPageType)
  },

  selectPage: async (pageType) => {
    const { currentThemeId, pages } = get()
    if (!currentThemeId) return
    const page = pages.find(p => p.pageType === pageType)
    if (!page) return
    const elements = await dbElements.getElementsForPage(page.id)
    set({ currentPageType: pageType, elements })
  },

  refreshElements: async () => {
    const { currentThemeId, pages, currentPageType } = get()
    const page = pages.find(p => p.pageType === currentPageType)
    if (!page) return
    const elements = await dbElements.getElementsForPage(page.id)
    set({ elements })
  },

  addElement: async (name, type, props) => {
    const { pages, currentPageType } = get()
    const page = pages.find(p => p.pageType === currentPageType)
    if (!page) return
    await dbElements.addElement(page.id, name, type, props)
    await get().refreshElements()
  },

  updateElement: async (id, changes) => {
    await dbElements.updateElement(id, changes)
    await get().refreshElements()
  },

  deleteElement: async (id) => {
    await dbElements.deleteElement(id)
    await get().refreshElements()
  },

  reorderElement: async (id, direction) => {
    await dbElements.reorderElement(id, direction)
    await get().refreshElements()
  },
}))
