# MASS 80 Theme Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based theme editor for the MWKEYS Mass 80 keyboard (480x480 screen) with Canvas preview, property editing, IndexedDB storage, and ZIP import/export.

**Architecture:** Vite + React SPA. Canvas renders the 480x480 preview with per-element draw functions. Zustand manages editor state. Dexie wraps IndexedDB for themes/pages/elements/assets tables. ZIP import/export via JSZip.

**Tech Stack:** Vite, React 19, TypeScript, Zustand, Tailwind CSS 4, Dexie, JSZip, uuid

---

## File Map

```
web/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── index.html
├── src/
│   ├── main.tsx                        # React entry
│   ├── App.tsx                         # Root layout (Toolbar + Sidebar + Preview + PropertyPanel)
│   ├── index.css                       # Tailwind directives
│   │
│   ├── types/
│   │   └── theme.ts                    # All TS types: Theme, Page, Element, Asset, ElementType, Props unions
│   │
│   ├── db/
│   │   ├── index.ts                    # Dexie DB instance + schema
│   │   ├── themes.ts                   # Theme CRUD functions
│   │   ├── pages.ts                    # Page CRUD functions
│   │   ├── elements.ts                 # Element CRUD functions
│   │   └── assets.ts                   # Asset CRUD + blob helpers
│   │
│   ├── store/
│   │   ├── theme-store.ts              # Theme list, current theme, page switching
│   │   └── ui-store.ts                 # Selected element ID, page type, editor UI state
│   │
│   ├── canvas/
│   │   ├── renderer.ts                 # Main render loop: iterate elements, delegate to draw fns
│   │   ├── hit-test.ts                 # Reverse z-order point-in-rect hit testing
│   │   ├── layout.ts                   # layout_align resolver + flex layout calculator
│   │   └── elements/
│   │       ├── draw-img.ts
│   │       ├── draw-label.ts
│   │       ├── draw-imgbtn.ts
│   │       ├── draw-bar.ts
│   │       ├── draw-slider.ts
│   │       ├── draw-arc.ts
│   │       ├── draw-clock.ts
│   │       ├── draw-clock-strip.ts
│   │       ├── draw-mjpeg.ts
│   │       └── draw-container.ts
│   │
│   ├── utils/
│   │   ├── color.ts                    # Color parse/format (0xRRGGBB, #RRGGBB)
│   │   ├── theme-import.ts            # ZIP → IndexedDB import
│   │   └── theme-export.ts            # IndexedDB → ZIP export
│   │
│   └── components/
│       ├── CanvasPreview.tsx            # 480x480 <canvas> + click handler + redraw subscription
│       ├── Toolbar.tsx                  # Top bar: theme name, import, export, undo, redo
│       ├── Sidebar.tsx                  # Theme list + page tabs
│       ├── PropertyPanel.tsx            # Routes to type-specific editor based on selected element
│       ├── ElementTree.tsx              # Ordered element list with visibility toggle + z-order
│       ├── AssetManager.tsx             # Upload/manage image and font assets
│       └── editors/
│           ├── CommonFields.tsx         # offset_x, offset_y, width, height, layout_align, rotation
│           ├── ImgEditor.tsx
│           ├── LabelEditor.tsx
│           ├── ImgbtnEditor.tsx
│           ├── BarEditor.tsx
│           ├── SliderEditor.tsx
│           ├── ArcEditor.tsx
│           ├── ClockEditor.tsx
│           ├── ClockStripEditor.tsx
│           ├── MjpegEditor.tsx
│           └── ContainerEditor.tsx
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/tsconfig.app.json`
- Create: `web/tsconfig.node.json`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`
- Create: `web/src/index.css`

- [ ] **Step 1: Create Vite project**

Run from repo root:
```bash
cd web
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd web
npm install zustand dexie jszip uuid tailwindcss @tailwindcss/vite
npm install -D @types/uuid
```

- [ ] **Step 3: Configure Tailwind CSS**

Replace `web/src/index.css` with:
```css
@import "tailwindcss";
```

Replace `web/vite.config.ts` with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 4: Create minimal App shell**

Replace `web/src/App.tsx` with:
```tsx
export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900 text-white">
      <header className="h-12 border-b border-neutral-700 flex items-center px-4 shrink-0">
        <h1 className="text-sm font-bold">MWKEYS Theme Editor</h1>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-52 border-r border-neutral-700 p-2 shrink-0">
          Sidebar
        </aside>
        <section className="flex-1 flex items-center justify-center bg-neutral-950">
          Preview
        </section>
        <aside className="w-80 border-l border-neutral-700 p-2 shrink-0">
          Property Panel
        </aside>
      </main>
    </div>
  )
}
```

Replace `web/src/main.tsx` with:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Verify dev server starts**

Run: `cd web && npm run dev`
Expected: Vite dev server starts, browser shows "MWKEYS Theme Editor" with three-column layout.

- [ ] **Step 6: Commit**

```bash
git add web/
git commit -m "feat: scaffold Vite + React + Tailwind theme editor"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `web/src/types/theme.ts`

- [ ] **Step 1: Create type definitions**

Create `web/src/types/theme.ts`:
```ts
// ─── Theme ───
export interface Theme {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  thumbnail: Blob | null
}

// ─── Page ───
export type PageType =
  | 'home'
  | 'music'
  | 'clock'
  | 'clock_timeup'
  | 'monitor'
  | 'key'
  | 'dock'

export const PAGE_TYPES: PageType[] = [
  'home', 'music', 'clock', 'clock_timeup', 'monitor', 'key', 'dock',
]

export const PAGE_LABELS: Record<PageType, string> = {
  home: '首页',
  music: '音乐',
  clock: '计时器',
  clock_timeup: '计时结束',
  monitor: '监控',
  key: '按键',
  dock: '导航栏',
}

export const PAGE_FILENAMES: Record<PageType, string> = {
  home: 'home_page_style.json',
  music: 'music_page_style.json',
  clock: 'clock_page_style.json',
  clock_timeup: 'clock_timeup_style.json',
  monitor: 'monitor_page_style.json',
  key: 'key_page_style.json',
  dock: 'dock_style.json',
}

export interface Page {
  id: string
  themeId: string
  pageType: PageType
  comment: string | null
  main_cont: { bg_color?: string } | null
  updatedAt: number
}

// ─── Element ───
export type ElementType =
  | 'img' | 'label' | 'imgbtn' | 'bar' | 'slider' | 'arc'
  | 'clock' | 'clock_strip' | 'mjpeg' | 'container'

export type LayoutAlign =
  | 'TOP_LEFT' | 'TOP_MID' | 'TOP_RIGHT'
  | 'LEFT_MID' | 'CENTER' | 'RIGHT_MID'
  | 'BOTTOM_LEFT' | 'BOTTOM_MID' | 'BOTTOM_RIGHT'

export interface ImgProps {
  src: string
  width: number
  height: number
}

export interface LabelProps {
  font: string
  color: string
  text: string
  text_align: 'LEFT' | 'CENTER' | 'RIGHT'
  width: number
  height: number
  split_by_space: boolean
  time_format: string
}

export interface ImgbtnProps {
  states: {
    released: string
    pressed?: string
    checked?: string
  }
  runing_states?: {
    released?: string
    checked?: string
  }
  on_click?: string
  indexData?: number
  elements?: ThemeElement[]
}

export interface BarProps {
  range_min: number
  range_max: number
  value: number
  direction: 'horizontal' | 'vertical'
  main_color: string
  indic_color: string
  radius: number
  padding: number
  reversed_value: boolean
  on_change?: string
}

export interface SliderProps {
  range_min: number
  range_max: number
  value: number
  main_color: string
  indic_color: string
  radius: number
  knob_visible: boolean
  on_change?: string
}

export interface ArcProps {
  range_min: number
  range_max: number
  value: number
  bg_start_angle: number
  bg_end_angle: number
  rotation: number
  arc_width: number
  arc_color: string
  bg_arc_color: string
}

export interface ClockProps {
  width: number
  height: number
  marking_color: string
  marking_color_opa: number
  marking_length: number
  marking_width: number
}

export interface ClockStripProps {
  marking_color: string
  marking_color_opa: number
  marking_spacing: number
  big_width: number
  big_height: number
  small_width: number
  small_height: number
  big_loop: number
  step: number
}

export interface MjpegProps {
  src: string
  width: number
  height: number
}

export interface ContainerProps {
  width: number | 'content'
  height: number | 'content'
  layout: 'flex'
  flex_direction: 'row' | 'column' | 'row_wrap'
  flex_align: 'start' | 'center' | 'end' | 'space_between' | 'space_around' | 'space_evenly'
  flex_gap: number
  bg_img?: string
  bg_color?: string
  bg_opa?: number
  radius?: number
  elements: ThemeElement[]
}

export type ElementProps =
  | ImgProps | LabelProps | ImgbtnProps | BarProps | SliderProps
  | ArcProps | ClockProps | ClockStripProps | MjpegProps | ContainerProps

export interface ThemeElement {
  id: string
  pageId: string
  name: string
  type: ElementType
  order: number
  visible: boolean
  offset_x: number
  offset_y: number
  layout_align: LayoutAlign
  rotation: number
  x: number
  y: number
  props: ElementProps
  updatedAt: number
}

// ─── Asset ───
export type AssetType = 'image' | 'font' | 'video'

export interface Asset {
  id: string
  themeId: string
  name: string
  type: AssetType
  mimeType: string
  file: Blob
  updatedAt: number
}

// ─── JSON format (keyboard) ───
export interface ThemeJsonImageAsset {
  name: string
  src: string
}

export interface ThemeJsonFontAsset {
  name: string
  src: string
}

export interface ThemeJsonPage {
  comment?: string
  main_cont?: { bg_color?: string }
  image_assets: ThemeJsonImageAsset[]
  font_assets: ThemeJsonFontAsset[]
  elements: ThemeJsonElement[]
}

export interface ThemeJsonElement {
  name: string
  type: string
  width?: number
  height?: number
  offset_x?: number
  offset_y?: number
  layout_align?: string
  rotation?: number
  x?: number
  y?: number
  [key: string]: unknown
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/types/
git commit -m "feat: add TypeScript type definitions for theme data model"
```

---

### Task 3: Dexie Database Layer

**Files:**
- Create: `web/src/db/index.ts`
- Create: `web/src/db/themes.ts`
- Create: `web/src/db/pages.ts`
- Create: `web/src/db/elements.ts`
- Create: `web/src/db/assets.ts`

- [ ] **Step 1: Create Dexie schema**

Create `web/src/db/index.ts`:
```ts
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
```

- [ ] **Step 2: Create themes CRUD**

Create `web/src/db/themes.ts`:
```ts
import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { Theme, PageType, PAGE_TYPES } from '../types/theme'

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
```

- [ ] **Step 3: Create pages CRUD**

Create `web/src/db/pages.ts`:
```ts
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
```

- [ ] **Step 4: Create elements CRUD**

Create `web/src/db/elements.ts`:
```ts
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
```

- [ ] **Step 5: Create assets CRUD**

Create `web/src/db/assets.ts`:
```ts
import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { Asset, AssetType } from '../types/theme'

function guessMimeType(file: File): string {
  return file.type || 'application/octet-stream'
}

function guessAssetType(mimeType: string): AssetType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('font/') || mimeType.includes('ttf') || mimeType.includes('otf') || mimeType.includes('woff')) return 'font'
  if (mimeType.startsWith('video/') || mimeType.includes('avi')) return 'video'
  return 'image'
}

export async function addAsset(themeId: string, name: string, file: File): Promise<Asset> {
  const mimeType = guessMimeType(file)
  const now = Date.now()
  const asset: Asset = {
    id: uuid(),
    themeId,
    name,
    type: guessAssetType(mimeType),
    mimeType,
    file: file,
    updatedAt: now,
  }
  // Upsert by name within theme
  const existing = await db.assets.where({ themeId, name }).first()
  if (existing) {
    await db.assets.update(existing.id, { file: asset.file, type: asset.type, mimeType: asset.mimeType, updatedAt: now })
    return { ...existing, ...asset, id: existing.id }
  }
  await db.assets.add(asset)
  return asset
}

export async function getAssetsForTheme(themeId: string): Promise<Asset[]> {
  return db.assets.where('themeId').equals(themeId).toArray()
}

export async function getAsset(themeId: string, name: string): Promise<Asset | undefined> {
  return db.assets.where({ themeId, name }).first()
}

export async function deleteAsset(id: string): Promise<void> {
  await db.assets.delete(id)
}

export async function getAssetBlobUrl(themeId: string, name: string): Promise<string | null> {
  const asset = await getAsset(themeId, name)
  if (!asset) return null
  return URL.createObjectURL(asset.file)
}
```

- [ ] **Step 6: Commit**

```bash
git add web/src/db/
git commit -m "feat: add Dexie database layer with CRUD for themes, pages, elements, assets"
```

---

### Task 4: Zustand Stores

**Files:**
- Create: `web/src/store/theme-store.ts`
- Create: `web/src/store/ui-store.ts`

- [ ] **Step 1: Create theme store**

Create `web/src/store/theme-store.ts`:
```ts
import { create } from 'zustand'
import type { Theme, Page, ThemeElement, Asset } from '../types/theme'
import type { PageType } from '../types/theme'
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
```

- [ ] **Step 2: Create UI store**

Create `web/src/store/ui-store.ts`:
```ts
import { create } from 'zustand'

interface UIState {
  selectedElementId: string | null
  sidebarTab: 'pages' | 'assets'
  selectElement: (id: string | null) => void
  setSidebarTab: (tab: 'pages' | 'assets') => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedElementId: null,
  sidebarTab: 'pages',
  selectElement: (id) => set({ selectedElementId: id }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
```

- [ ] **Step 3: Commit**

```bash
git add web/src/store/
git commit -m "feat: add Zustand stores for theme data and UI state"
```

---

### Task 5: Color Utilities

**Files:**
- Create: `web/src/utils/color.ts`

- [ ] **Step 1: Create color helpers**

Create `web/src/utils/color.ts`:
```ts
/** Parse "0xRRGGBB" or "#RRGGBB" to {r, g, b} (0-255) */
export function parseColor(color: string): { r: number; g: number; b: number } | null {
  if (!color || color === 'transparent') return null
  const hex = color.startsWith('0x') ? color.slice(2) : color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return null
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

/** Convert to CSS rgb() string for Canvas */
export function toCSSColor(color: string, alpha = 1): string {
  const parsed = parseColor(color)
  if (!parsed) return 'transparent'
  return alpha < 1
    ? `rgba(${parsed.r},${parsed.g},${parsed.b},${alpha})`
    : `rgb(${parsed.r},${parsed.g},${parsed.b})`
}

/** Convert to CSS hex string (#RRGGBB) */
export function toHexColor(color: string): string {
  const parsed = parseColor(color)
  if (!parsed) return '#000000'
  return `#${parsed.r.toString(16).padStart(2, '0')}${parsed.g.toString(16).padStart(2, '0')}${parsed.b.toString(16).padStart(2, '0')}`
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/utils/color.ts
git commit -m "feat: add color parsing utilities"
```

---

### Task 6: Canvas Layout Utilities

**Files:**
- Create: `web/src/canvas/layout.ts`

- [ ] **Step 1: Create layout resolver**

Create `web/src/canvas/layout.ts`:
```ts
import type { LayoutAlign, ThemeElement } from '../types/theme'

const CANVAS_SIZE = 480

/** Calculate top-left x, y for an element given its layout_align, dimensions, and parent bounds */
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

  // Horizontal
  if (align.includes('LEFT')) x = parentX + el.offset_x
  else if (align.includes('RIGHT')) x = parentX + parentWidth - elWidth + el.offset_x
  else x = parentX + (parentWidth - elWidth) / 2 + el.offset_x

  // Vertical
  if (align.startsWith('TOP')) y = parentY + el.offset_y
  else if (align.startsWith('BOTTOM')) y = parentY + parentHeight - elHeight + el.offset_y
  else y = parentY + (parentHeight - elHeight) / 2 + el.offset_y

  return { x, y }
}

/** Resolve width/height from element props, falling back to defaults */
export function resolveDimensions(
  el: ThemeElement,
): { width: number; height: number } {
  const p = el.props as Record<string, unknown>
  return {
    width: (p.width as number) || 0,
    height: (p.height as number) || 0,
  }
}

/** Simple flex layout calculator for container children */
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
  const maxCross = isRow
    ? Math.max(...sizes.map(s => s.height))
    : Math.max(...sizes.map(s => s.width))

  // Calculate start offset based on alignment
  let offset: number
  if (align === 'center') {
    offset = isRow
      ? (containerWidth - totalSize - totalGap) / 2
      : (containerHeight - totalSize - totalGap) / 2
  } else if (align === 'end') {
    offset = isRow
      ? containerWidth - totalSize - totalGap
      : containerHeight - totalSize - totalGap
  } else if (align === 'space_between') {
    offset = 0
  } else if (align === 'space_evenly') {
    offset = 0
  } else {
    offset = 0 // start
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
```

- [ ] **Step 2: Commit**

```bash
git add web/src/canvas/layout.ts
git commit -m "feat: add canvas layout resolver and flex calculator"
```

---

### Task 7: Canvas Element Draw Functions

**Files:**
- Create: `web/src/canvas/elements/draw-img.ts`
- Create: `web/src/canvas/elements/draw-label.ts`
- Create: `web/src/canvas/elements/draw-imgbtn.ts`
- Create: `web/src/canvas/elements/draw-bar.ts`
- Create: `web/src/canvas/elements/draw-slider.ts`
- Create: `web/src/canvas/elements/draw-arc.ts`
- Create: `web/src/canvas/elements/draw-clock.ts`
- Create: `web/src/canvas/elements/draw-clock-strip.ts`
- Create: `web/src/canvas/elements/draw-mjpeg.ts`
- Create: `web/src/canvas/elements/draw-container.ts`

- [ ] **Step 1: Create draw-img**

Create `web/src/canvas/elements/draw-img.ts`:
```ts
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
```

- [ ] **Step 2: Create draw-label**

Create `web/src/canvas/elements/draw-label.ts`:
```ts
import type { LabelProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  props: LabelProps,
  x: number,
  y: number,
  loadedFonts: Set<string>,
) {
  ctx.save()
  const fontName = loadedFonts.has(props.font) ? `"${props.font}"` : 'sans-serif'
  // Estimate font size from height
  const fontSize = props.height || 16
  ctx.font = `${fontSize}px ${fontName}`
  ctx.fillStyle = toCSSColor(props.color) || '#ffffff'
  ctx.textBaseline = 'top'

  const textAlign = props.text_align?.toLowerCase() || 'left'
  if (textAlign === 'center') {
    ctx.textAlign = 'center'
    ctx.fillText(props.text || '', x + (props.width || 200) / 2, y)
  } else if (textAlign === 'right') {
    ctx.textAlign = 'right'
    ctx.fillText(props.text || '', x + (props.width || 200), y)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(props.text || '', x, y)
  }
  ctx.restore()
}
```

- [ ] **Step 3: Create draw-imgbtn**

Create `web/src/canvas/elements/draw-imgbtn.ts`:
```ts
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
```

- [ ] **Step 4: Create draw-bar**

Create `web/src/canvas/elements/draw-bar.ts`:
```ts
import type { BarProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawBar(
  ctx: CanvasRenderingContext2D,
  props: BarProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = props.radius || 0
  const padding = props.padding || 0

  // Background
  ctx.fillStyle = toCSSColor(props.main_color)
  drawRoundRect(ctx, x, y, width, height, radius)
  ctx.fill()

  // Indicator
  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0

  ctx.fillStyle = toCSSColor(props.indic_color)
  if (props.direction === 'vertical') {
    const indicH = (height - padding * 2) * ratio
    const indicY = y + height - padding - indicH
    drawRoundRect(ctx, x + padding, indicY, width - padding * 2, indicH, Math.max(0, radius - padding))
    ctx.fill()
  } else {
    const indicW = (width - padding * 2) * ratio
    drawRoundRect(ctx, x + padding, y + padding, indicW, height - padding * 2, Math.max(0, radius - padding))
    ctx.fill()
  }
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  if (r > 0) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
}
```

- [ ] **Step 5: Create draw-slider**

Create `web/src/canvas/elements/draw-slider.ts`:
```ts
import type { SliderProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawSlider(
  ctx: CanvasRenderingContext2D,
  props: SliderProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = props.radius || 0

  // Track
  ctx.fillStyle = toCSSColor(props.main_color)
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fill()

  // Indicator
  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0
  const indicW = width * ratio

  ctx.fillStyle = toCSSColor(props.indic_color)
  ctx.beginPath()
  ctx.roundRect(x, y, indicW, height, radius)
  ctx.fill()

  // Knob
  if (props.knob_visible !== false) {
    const knobR = height / 2 + 4
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x + indicW, y + height / 2, knobR, 0, Math.PI * 2)
    ctx.fill()
  }
}
```

- [ ] **Step 6: Create draw-arc**

Create `web/src/canvas/elements/draw-arc.ts`:
```ts
import type { ArcProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawArc(
  ctx: CanvasRenderingContext2D,
  props: ArcProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const cx = x + width / 2
  const cy = y + height / 2
  const r = Math.min(width, height) / 2 - (props.arc_width || 10) / 2
  const rotationDeg = (props.rotation || 0) / 10 // 0.1° units to degrees
  const rotationRad = (rotationDeg - 90) * Math.PI / 180 // -90 so 0° is top

  // Background arc
  const bgStart = (props.bg_start_angle || 0) * Math.PI / 180 + rotationRad
  const bgEnd = (props.bg_end_angle || 360) * Math.PI / 180 + rotationRad

  ctx.strokeStyle = toCSSColor(props.bg_arc_color)
  ctx.lineWidth = props.arc_width || 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, bgStart, bgEnd)
  ctx.stroke()

  // Indicator arc
  const range = props.range_max - props.range_min
  const ratio = range > 0 ? (props.value - props.range_min) / range : 0
  const indicEnd = bgStart + (bgEnd - bgStart) * ratio

  ctx.strokeStyle = toCSSColor(props.arc_color)
  ctx.beginPath()
  ctx.arc(cx, cy, r, bgStart, indicEnd)
  ctx.stroke()
}
```

- [ ] **Step 7: Create draw-clock**

Create `web/src/canvas/elements/draw-clock.ts`:
```ts
import type { ClockProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawClock(
  ctx: CanvasRenderingContext2D,
  props: ClockProps,
  x: number,
  y: number,
) {
  const cx = x + (props.width || 480) / 2
  const cy = y + (props.height || 480) / 2
  const r = Math.min(props.width || 480, props.height || 480) / 2 - (props.marking_length || 100)
  const markCount = 24
  const markLen = props.marking_length || 100
  const markW = props.marking_width || 6
  const opa = (props.marking_color_opa ?? 50) / 100

  ctx.save()
  ctx.strokeStyle = toCSSColor(props.marking_color || '0xFFFFFF', opa)
  ctx.lineWidth = markW

  for (let i = 0; i < markCount; i++) {
    const angle = (i / markCount) * Math.PI * 2 - Math.PI / 2
    const innerR = r
    const outerR = r + markLen
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
    ctx.stroke()
  }
  ctx.restore()
}
```

- [ ] **Step 8: Create draw-clock-strip**

Create `web/src/canvas/elements/draw-clock-strip.ts`:
```ts
import type { ClockStripProps } from '../../types/theme'
import { toCSSColor } from '../../utils/color'

export function drawClockStrip(
  ctx: CanvasRenderingContext2D,
  props: ClockStripProps,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const opa = (props.marking_color_opa ?? 50) / 100
  const color = toCSSColor(props.marking_color || '0xFFFFFF', opa)
  const spacing = props.marking_spacing || 22
  const bigW = props.big_width || 59
  const bigH = props.big_height || 2
  const smallW = props.small_width || 30
  const smallH = props.small_height || 2
  const bigLoop = props.big_loop || 6

  const cy = y + height / 2
  const totalTicks = Math.ceil(width / spacing) + 1

  ctx.fillStyle = color
  for (let i = 0; i < totalTicks; i++) {
    const isBig = i % bigLoop === 0
    const w = isBig ? bigW : smallW
    const h = isBig ? bigH : smallH
    const tx = x + i * spacing
    ctx.fillRect(tx, cy - h / 2, w, h)
  }
}
```

- [ ] **Step 9: Create draw-mjpeg (placeholder)**

Create `web/src/canvas/elements/draw-mjpeg.ts`:
```ts
import type { MjpegProps } from '../../types/theme'

export function drawMjpeg(
  ctx: CanvasRenderingContext2D,
  props: MjpegProps,
  x: number,
  y: number,
) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x, y, props.width || 480, props.height || 480)
  ctx.fillStyle = '#444444'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MJPEG', x + (props.width || 480) / 2, y + (props.height || 480) / 2)
}
```

- [ ] **Step 10: Create draw-container**

Create `web/src/canvas/elements/draw-container.ts`:
```ts
import type { ContainerProps, ThemeElement } from '../../types/theme'
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
```

- [ ] **Step 11: Commit**

```bash
git add web/src/canvas/elements/
git commit -m "feat: add Canvas draw functions for all 10 element types"
```

---

### Task 8: Canvas Renderer + Hit Testing

**Files:**
- Create: `web/src/canvas/renderer.ts`
- Create: `web/src/canvas/hit-test.ts`

- [ ] **Step 1: Create main renderer**

Create `web/src/canvas/renderer.ts`:
```ts
import type { ThemeElement, Asset } from '../types/theme'
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

  // Draw selection border
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
      // Recursively render children with flex layout
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
```

- [ ] **Step 2: Create hit testing**

Create `web/src/canvas/hit-test.ts`:
```ts
import type { ThemeElement } from '../types/theme'
import { resolvePosition, resolveDimensions } from './layout'

const CANVAS_SIZE = 480

export function hitTest(
  clickX: number,
  clickY: number,
  elements: ThemeElement[],
): string | null {
  const sorted = [...elements].filter(e => e.visible !== false).sort((a, b) => a.order - b.order)

  // Reverse iterate (topmost first)
  for (let i = sorted.length - 1; i >= 0; i--) {
    const el = sorted[i]
    const dims = resolveDimensions(el)
    const pos = resolvePosition(el, dims.width, dims.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

    if (
      clickX >= pos.x &&
      clickX <= pos.x + dims.width &&
      clickY >= pos.y &&
      clickY <= pos.y + dims.height
    ) {
      return el.id
    }
  }
  return null
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/canvas/renderer.ts web/src/canvas/hit-test.ts
git commit -m "feat: add Canvas renderer and hit testing"
```

---

### Task 9: CanvasPreview Component

**Files:**
- Create: `web/src/components/CanvasPreview.tsx`

- [ ] **Step 1: Create CanvasPreview component**

Create `web/src/components/CanvasPreview.tsx`:
```tsx
import { useRef, useEffect, useCallback } from 'react'
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { render, type RenderContext } from '../canvas/renderer'
import { hitTest } from '../canvas/hit-test'

const CANVAS_SIZE = 480

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const assetImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const loadedFontsRef = useRef<Set<string>>(new Set())

  const elements = useThemeStore(s => s.elements)
  const assets = useThemeStore(s => s.assets)
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const selectElement = useUIStore(s => s.selectElement)

  // Load asset images
  useEffect(() => {
    const imgMap = new Map<string, HTMLImageElement>()
    let cancelled = false

    async function loadAll() {
      const promises = assets
        .filter(a => a.type === 'image')
        .map(a => new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            if (!cancelled) imgMap.set(a.name, img)
            resolve()
          }
          img.onerror = () => resolve()
          img.src = URL.createObjectURL(a.file)
        }))

      // Load fonts
      const fontPromises = assets
        .filter(a => a.type === 'font')
        .map(async (a) => {
          try {
            const fontFace = new FontFace(a.name, `url(${URL.createObjectURL(a.file)})`)
            const loaded = await fontFace.load()
            document.fonts.add(loaded)
            if (!cancelled) loadedFontsRef.current.add(a.name)
          } catch { /* ignore font load failures */ }
        })

      await Promise.all([...promises, ...fontPromises])
      if (!cancelled) {
        assetImagesRef.current = imgMap
        redraw()
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [assets])

  // Redraw on state changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderCtx: RenderContext = {
      assetImages: assetImagesRef.current,
      loadedFonts: loadedFontsRef.current,
    }
    render(ctx, elements, renderCtx, selectedElementId)
  }, [elements, selectedElementId])

  useEffect(() => { redraw() }, [redraw])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_SIZE / rect.width
    const scaleY = CANVAS_SIZE / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const hitId = hitTest(x, y, elements)
    selectElement(hitId)
  }, [elements, selectElement])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onClick={handleClick}
      className="border border-neutral-700 cursor-crosshair"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/CanvasPreview.tsx
git commit -m "feat: add CanvasPreview component with click selection"
```

---

### Task 10: Sidebar Component

**Files:**
- Create: `web/src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar**

Create `web/src/components/Sidebar.tsx`:
```tsx
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { PAGE_TYPES, PAGE_LABELS, type PageType } from '../types/theme'

export function Sidebar() {
  const themes = useThemeStore(s => s.themes)
  const currentThemeId = useThemeStore(s => s.currentThemeId)
  const selectTheme = useThemeStore(s => s.selectTheme)
  const createTheme = useThemeStore(s => s.createTheme)
  const deleteTheme = useThemeStore(s => s.deleteTheme)
  const currentPageType = useThemeStore(s => s.currentPageType)
  const selectPage = useThemeStore(s => s.selectPage)
  const sidebarTab = useUIStore(s => s.sidebarTab)
  const setSidebarTab = useUIStore(s => s.setSidebarTab)

  const handleCreate = () => {
    const name = prompt('主题名称')
    if (name) createTheme(name)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除此主题？')) deleteTheme(id)
  }

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Theme list */}
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-400 font-bold">主题列表</span>
          <button onClick={handleCreate} className="text-xs bg-blue-600 px-2 py-0.5 rounded hover:bg-blue-500">新建</button>
        </div>
        <div className="space-y-0.5">
          {themes.map(t => (
            <div
              key={t.id}
              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${t.id === currentThemeId ? 'bg-neutral-700' : 'hover:bg-neutral-800'}`}
              onClick={() => selectTheme(t.id)}
            >
              <span className="truncate">{t.name}</span>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(t.id) }}
                className="text-neutral-500 hover:text-red-400 text-xs ml-1"
              >x</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tab: Pages / Assets */}
      <div className="flex border-b border-neutral-700">
        <button
          className={`flex-1 py-1.5 text-xs ${sidebarTab === 'pages' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-neutral-400'}`}
          onClick={() => setSidebarTab('pages')}
        >页面</button>
        <button
          className={`flex-1 py-1.5 text-xs ${sidebarTab === 'assets' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-neutral-400'}`}
          onClick={() => setSidebarTab('assets')}
        >资源</button>
      </div>

      {/* Page tabs */}
      {sidebarTab === 'pages' && (
        <div className="p-2 space-y-0.5">
          {PAGE_TYPES.map(pt => (
            <div
              key={pt}
              className={`px-2 py-1 rounded cursor-pointer ${pt === currentPageType ? 'bg-neutral-700 text-blue-400' : 'hover:bg-neutral-800 text-neutral-300'}`}
              onClick={() => selectPage(pt)}
            >{PAGE_LABELS[pt]}</div>
          ))}
        </div>
      )}

      {/* Asset list placeholder */}
      {sidebarTab === 'assets' && (
        <AssetList />
      )}
    </div>
  )
}

function AssetList() {
  const assets = useThemeStore(s => s.assets)
  const images = assets.filter(a => a.type === 'image')
  const fonts = assets.filter(a => a.type === 'font')

  return (
    <div className="p-2 space-y-2 text-xs">
      <div>
        <div className="text-neutral-400 font-bold mb-1">图片资源 ({images.length})</div>
        {images.map(a => (
          <div key={a.id} className="px-2 py-0.5 text-neutral-300 truncate">{a.name}</div>
        ))}
        {images.length === 0 && <div className="text-neutral-500 px-2">暂无</div>}
      </div>
      <div>
        <div className="text-neutral-400 font-bold mb-1">字体资源 ({fonts.length})</div>
        {fonts.map(a => (
          <div key={a.id} className="px-2 py-0.5 text-neutral-300 truncate">{a.name}</div>
        ))}
        {fonts.length === 0 && <div className="text-neutral-500 px-2">暂无</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/Sidebar.tsx
git commit -m "feat: add Sidebar with theme list, page tabs, and asset list"
```

---

### Task 11: Element Tree Component

**Files:**
- Create: `web/src/components/ElementTree.tsx`

- [ ] **Step 1: Create ElementTree**

Create `web/src/components/ElementTree.tsx`:
```tsx
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'

export function ElementTree() {
  const elements = useThemeStore(s => s.elements)
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const selectElement = useUIStore(s => s.selectElement)
  const updateElement = useThemeStore(s => s.updateElement)
  const reorderElement = useThemeStore(s => s.reorderElement)
  const deleteElement = useThemeStore(s => s.deleteElement)

  const sorted = [...elements].sort((a, b) => b.order - a.order)

  return (
    <div className="border-t border-neutral-700 max-h-64 overflow-y-auto">
      <div className="text-xs text-neutral-400 font-bold p-2">元素列表</div>
      {sorted.map(el => (
        <div
          key={el.id}
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-xs ${el.id === selectedElementId ? 'bg-blue-900/40 text-blue-300' : 'hover:bg-neutral-800 text-neutral-300'}`}
          onClick={() => selectElement(el.id)}
        >
          <button
            onClick={e => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }) }}
            className={`w-4 text-center ${el.visible ? 'text-green-400' : 'text-neutral-600'}`}
          >{el.visible ? 'v' : '-'}</button>
          <span className="flex-1 truncate">{el.name}</span>
          <span className="text-neutral-500">{el.type}</span>
          <button onClick={e => { e.stopPropagation(); reorderElement(el.id, 'up') }} className="text-neutral-500 hover:text-white">u</button>
          <button onClick={e => { e.stopPropagation(); reorderElement(el.id, 'down') }} className="text-neutral-500 hover:text-white">d</button>
          <button onClick={e => { e.stopPropagation(); deleteElement(el.id) }} className="text-neutral-500 hover:text-red-400">x</button>
        </div>
      ))}
      {sorted.length === 0 && <div className="text-xs text-neutral-500 p-2">无元素</div>}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/ElementTree.tsx
git commit -m "feat: add ElementTree with visibility, reorder, and delete"
```

---

### Task 12: Property Editors

**Files:**
- Create: `web/src/components/editors/CommonFields.tsx`
- Create: `web/src/components/editors/ImgEditor.tsx`
- Create: `web/src/components/editors/LabelEditor.tsx`
- Create: `web/src/components/editors/ImgbtnEditor.tsx`
- Create: `web/src/components/editors/BarEditor.tsx`
- Create: `web/src/components/editors/SliderEditor.tsx`
- Create: `web/src/components/editors/ArcEditor.tsx`
- Create: `web/src/components/editors/ClockEditor.tsx`
- Create: `web/src/components/editors/ClockStripEditor.tsx`
- Create: `web/src/components/editors/MjpegEditor.tsx`
- Create: `web/src/components/editors/ContainerEditor.tsx`
- Create: `web/src/components/PropertyPanel.tsx`

- [ ] **Step 1: Create CommonFields**

Create `web/src/components/editors/CommonFields.tsx`:
```tsx
import type { ThemeElement, LayoutAlign } from '../../types/theme'

const ALIGN_OPTIONS: LayoutAlign[] = [
  'TOP_LEFT', 'TOP_MID', 'TOP_RIGHT',
  'LEFT_MID', 'CENTER', 'RIGHT_MID',
  'BOTTOM_LEFT', 'BOTTOM_MID', 'BOTTOM_RIGHT',
]

interface Props {
  element: ThemeElement
  onChange: (changes: Partial<ThemeElement>) => void
}

export function CommonFields({ element, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="名称">
        <input className="field" value={element.name} readOnly />
      </Field>
      <Field label="类型">
        <input className="field" value={element.type} readOnly />
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="X偏移">
          <input className="field" type="number" value={element.offset_x}
            onChange={e => onChange({ offset_x: +e.target.value })} />
        </Field>
        <Field label="Y偏移">
          <input className="field" type="number" value={element.offset_y}
            onChange={e => onChange({ offset_y: +e.target.value })} />
        </Field>
      </div>
      <Field label="对齐">
        <select className="field" value={element.layout_align}
          onChange={e => onChange({ layout_align: e.target.value as LayoutAlign })}>
          {ALIGN_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="旋转(0.1°)">
        <input className="field" type="number" value={element.rotation}
          onChange={e => onChange({ rotation: +e.target.value })} />
      </Field>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-400">{label}</span>
      {children}
    </label>
  )
}
```

- [ ] **Step 2: Create ImgEditor**

Create `web/src/components/editors/ImgEditor.tsx`:
```tsx
import type { ImgProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props {
  props: ImgProps
  onChange: (props: ImgProps) => void
}

export function ImgEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="资源名">
        <input className="field" value={props.src} onChange={e => onChange({ ...props, src: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度">
          <input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} />
        </Field>
        <Field label="高度">
          <input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} />
        </Field>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create LabelEditor**

Create `web/src/components/editors/LabelEditor.tsx`:
```tsx
import type { LabelProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props {
  props: LabelProps
  onChange: (props: LabelProps) => void
}

export function LabelEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="字体">
        <input className="field" value={props.font} onChange={e => onChange({ ...props, font: e.target.value })} />
      </Field>
      <Field label="颜色">
        <input className="field" value={props.color} onChange={e => onChange({ ...props, color: e.target.value })} />
      </Field>
      <Field label="文本">
        <input className="field" value={props.text} onChange={e => onChange({ ...props, text: e.target.value })} />
      </Field>
      <Field label="对齐">
        <select className="field" value={props.text_align} onChange={e => onChange({ ...props, text_align: e.target.value as LabelProps['text_align'] })}>
          <option value="LEFT">LEFT</option>
          <option value="CENTER">CENTER</option>
          <option value="RIGHT">RIGHT</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
      <Field label="空格拆分">
        <input type="checkbox" checked={props.split_by_space} onChange={e => onChange({ ...props, split_by_space: e.target.checked })} />
      </Field>
      <Field label="时间格式">
        <input className="field" value={props.time_format} onChange={e => onChange({ ...props, time_format: e.target.value })} />
      </Field>
    </div>
  )
}
```

- [ ] **Step 4: Create ImgbtnEditor**

Create `web/src/components/editors/ImgbtnEditor.tsx`:
```tsx
import type { ImgbtnProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props {
  props: ImgbtnProps
  onChange: (props: ImgbtnProps) => void
}

export function ImgbtnEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="Released图片">
        <input className="field" value={props.states?.released || ''} onChange={e => onChange({ ...props, states: { ...props.states, released: e.target.value } })} />
      </Field>
      <Field label="Pressed图片">
        <input className="field" value={props.states?.pressed || ''} onChange={e => onChange({ ...props, states: { ...props.states, pressed: e.target.value } })} />
      </Field>
      <Field label="Checked图片">
        <input className="field" value={props.states?.checked || ''} onChange={e => onChange({ ...props, states: { ...props.states, checked: e.target.value } })} />
      </Field>
      <Field label="点击事件">
        <input className="field" value={props.on_click || ''} onChange={e => onChange({ ...props, on_click: e.target.value })} />
      </Field>
      <Field label="indexData">
        <input className="field" type="number" value={props.indexData ?? 0} onChange={e => onChange({ ...props, indexData: +e.target.value })} />
      </Field>
    </div>
  )
}
```

- [ ] **Step 5: Create BarEditor**

Create `web/src/components/editors/BarEditor.tsx`:
```tsx
import type { BarProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props {
  props: BarProps
  onChange: (props: BarProps) => void
}

export function BarEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <Field label="方向">
        <select className="field" value={props.direction} onChange={e => onChange({ ...props, direction: e.target.value as BarProps['direction'] })}>
          <option value="horizontal">水平</option>
          <option value="vertical">垂直</option>
        </select>
      </Field>
      <Field label="背景色"><input className="field" value={props.main_color} onChange={e => onChange({ ...props, main_color: e.target.value })} /></Field>
      <Field label="指示器色"><input className="field" value={props.indic_color} onChange={e => onChange({ ...props, indic_color: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="圆角"><input className="field" type="number" value={props.radius} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
        <Field label="内边距"><input className="field" type="number" value={props.padding} onChange={e => onChange({ ...props, padding: +e.target.value })} /></Field>
      </div>
      <Field label="反向值"><input type="checkbox" checked={props.reversed_value} onChange={e => onChange({ ...props, reversed_value: e.target.checked })} /></Field>
    </div>
  )
}
```

- [ ] **Step 6: Create SliderEditor, ArcEditor, ClockEditor, ClockStripEditor, MjpegEditor, ContainerEditor**

Create `web/src/components/editors/SliderEditor.tsx`:
```tsx
import type { SliderProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: SliderProps; onChange: (p: SliderProps) => void }

export function SliderEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <Field label="轨道色"><input className="field" value={props.main_color} onChange={e => onChange({ ...props, main_color: e.target.value })} /></Field>
      <Field label="指示器色"><input className="field" value={props.indic_color} onChange={e => onChange({ ...props, indic_color: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="圆角"><input className="field" type="number" value={props.radius} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
        <Field label="显示旋钮"><input type="checkbox" checked={props.knob_visible} onChange={e => onChange({ ...props, knob_visible: e.target.checked })} /></Field>
      </div>
    </div>
  )
}
```

Create `web/src/components/editors/ArcEditor.tsx`:
```tsx
import type { ArcProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ArcProps; onChange: (p: ArcProps) => void }

export function ArcEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="起始角度"><input className="field" type="number" value={props.bg_start_angle} onChange={e => onChange({ ...props, bg_start_angle: +e.target.value })} /></Field>
        <Field label="结束角度"><input className="field" type="number" value={props.bg_end_angle} onChange={e => onChange({ ...props, bg_end_angle: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="旋转偏移"><input className="field" type="number" value={props.rotation} onChange={e => onChange({ ...props, rotation: +e.target.value })} /></Field>
        <Field label="弧线宽度"><input className="field" type="number" value={props.arc_width} onChange={e => onChange({ ...props, arc_width: +e.target.value })} /></Field>
      </div>
      <Field label="指示器色"><input className="field" value={props.arc_color} onChange={e => onChange({ ...props, arc_color: e.target.value })} /></Field>
      <Field label="背景弧色"><input className="field" value={props.bg_arc_color} onChange={e => onChange({ ...props, bg_arc_color: e.target.value })} /></Field>
    </div>
  )
}
```

Create `web/src/components/editors/ClockEditor.tsx`:
```tsx
import type { ClockProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ClockProps; onChange: (p: ClockProps) => void }

export function ClockEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
      <Field label="刻度颜色"><input className="field" value={props.marking_color} onChange={e => onChange({ ...props, marking_color: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="透明度"><input className="field" type="number" value={props.marking_color_opa} onChange={e => onChange({ ...props, marking_color_opa: +e.target.value })} /></Field>
        <Field label="刻度长度"><input className="field" type="number" value={props.marking_length} onChange={e => onChange({ ...props, marking_length: +e.target.value })} /></Field>
      </div>
      <Field label="刻度宽度"><input className="field" type="number" value={props.marking_width} onChange={e => onChange({ ...props, marking_width: +e.target.value })} /></Field>
    </div>
  )
}
```

Create `web/src/components/editors/ClockStripEditor.tsx`:
```tsx
import type { ClockStripProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ClockStripProps; onChange: (p: ClockStripProps) => void }

export function ClockStripEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="刻度颜色"><input className="field" value={props.marking_color} onChange={e => onChange({ ...props, marking_color: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="透明度"><input className="field" type="number" value={props.marking_color_opa} onChange={e => onChange({ ...props, marking_color_opa: +e.target.value })} /></Field>
        <Field label="间距"><input className="field" type="number" value={props.marking_spacing} onChange={e => onChange({ ...props, marking_spacing: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="大刻度宽"><input className="field" type="number" value={props.big_width} onChange={e => onChange({ ...props, big_width: +e.target.value })} /></Field>
        <Field label="大刻度高"><input className="field" type="number" value={props.big_height} onChange={e => onChange({ ...props, big_height: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="小刻度宽"><input className="field" type="number" value={props.small_width} onChange={e => onChange({ ...props, small_width: +e.target.value })} /></Field>
        <Field label="小刻度高"><input className="field" type="number" value={props.small_height} onChange={e => onChange({ ...props, small_height: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="大刻度间隔"><input className="field" type="number" value={props.big_loop} onChange={e => onChange({ ...props, big_loop: +e.target.value })} /></Field>
        <Field label="步进"><input className="field" type="number" value={props.step} onChange={e => onChange({ ...props, step: +e.target.value })} /></Field>
      </div>
    </div>
  )
}
```

Create `web/src/components/editors/MjpegEditor.tsx`:
```tsx
import type { MjpegProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: MjpegProps; onChange: (p: MjpegProps) => void }

export function MjpegEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="资源名"><input className="field" value={props.src} onChange={e => onChange({ ...props, src: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
    </div>
  )
}
```

Create `web/src/components/editors/ContainerEditor.tsx`:
```tsx
import type { ContainerProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ContainerProps; onChange: (p: ContainerProps) => void }

export function ContainerEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" value={props.width} onChange={e => onChange({ ...props, width: e.target.value as ContainerProps['width'] })} /></Field>
        <Field label="高度"><input className="field" value={props.height} onChange={e => onChange({ ...props, height: e.target.value as ContainerProps['height'] })} /></Field>
      </div>
      <Field label="Flex方向">
        <select className="field" value={props.flex_direction} onChange={e => onChange({ ...props, flex_direction: e.target.value as ContainerProps['flex_direction'] })}>
          <option value="row">row</option>
          <option value="column">column</option>
          <option value="row_wrap">row_wrap</option>
        </select>
      </Field>
      <Field label="Flex对齐">
        <select className="field" value={props.flex_align} onChange={e => onChange({ ...props, flex_align: e.target.value as ContainerProps['flex_align'] })}>
          <option value="start">start</option>
          <option value="center">center</option>
          <option value="end">end</option>
          <option value="space_between">space_between</option>
          <option value="space_around">space_around</option>
          <option value="space_evenly">space_evenly</option>
        </select>
      </Field>
      <Field label="间距"><input className="field" type="number" value={props.flex_gap} onChange={e => onChange({ ...props, flex_gap: +e.target.value })} /></Field>
      <Field label="背景色"><input className="field" value={props.bg_color || ''} onChange={e => onChange({ ...props, bg_color: e.target.value })} /></Field>
      <Field label="背景透明度"><input className="field" type="number" value={props.bg_opa ?? 255} onChange={e => onChange({ ...props, bg_opa: +e.target.value })} /></Field>
      <Field label="圆角"><input className="field" type="number" value={props.radius ?? 0} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
    </div>
  )
}
```

- [ ] **Step 7: Create PropertyPanel (router)**

Create `web/src/components/PropertyPanel.tsx`:
```tsx
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { CommonFields } from './editors/CommonFields'
import { ImgEditor } from './editors/ImgEditor'
import { LabelEditor } from './editors/LabelEditor'
import { ImgbtnEditor } from './editors/ImgbtnEditor'
import { BarEditor } from './editors/BarEditor'
import { SliderEditor } from './editors/SliderEditor'
import { ArcEditor } from './editors/ArcEditor'
import { ClockEditor } from './editors/ClockEditor'
import { ClockStripEditor } from './editors/ClockStripEditor'
import { MjpegEditor } from './editors/MjpegEditor'
import { ContainerEditor } from './editors/ContainerEditor'
import type { ElementProps, ThemeElement } from '../types/theme'

export function PropertyPanel() {
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const elements = useThemeStore(s => s.elements)
  const updateElement = useThemeStore(s => s.updateElement)

  const element = elements.find(e => e.id === selectedElementId)

  if (!element) {
    return (
      <div className="p-3 text-sm text-neutral-500">
        点击预览区域或元素列表选择一个元素
      </div>
    )
  }

  const handlePropsChange = (newProps: ElementProps) => {
    updateElement(element.id, { props: newProps })
  }

  return (
    <div className="p-3 space-y-3 overflow-y-auto">
      <CommonFields element={element} onChange={changes => updateElement(element.id, changes)} />
      <div className="border-t border-neutral-700 pt-2">
        <TypeEditor type={element.type} props={element.props} onChange={handlePropsChange} />
      </div>
    </div>
  )
}

function TypeEditor({ type, props, onChange }: { type: string; props: ThemeElement['props']; onChange: (p: ElementProps) => void }) {
  switch (type) {
    case 'img': return <ImgEditor props={props as import('../types/theme').ImgProps} onChange={onChange} />
    case 'label': return <LabelEditor props={props as import('../types/theme').LabelProps} onChange={onChange} />
    case 'imgbtn': return <ImgbtnEditor props={props as import('../types/theme').ImgbtnProps} onChange={onChange} />
    case 'bar': return <BarEditor props={props as import('../types/theme').BarProps} onChange={onChange} />
    case 'slider': return <SliderEditor props={props as import('../types/theme').SliderProps} onChange={onChange} />
    case 'arc': return <ArcEditor props={props as import('../types/theme').ArcProps} onChange={onChange} />
    case 'clock': return <ClockEditor props={props as import('../types/theme').ClockProps} onChange={onChange} />
    case 'clock_strip': return <ClockStripEditor props={props as import('../types/theme').ClockStripProps} onChange={onChange} />
    case 'mjpeg': return <MjpegEditor props={props as import('../types/theme').MjpegProps} onChange={onChange} />
    case 'container': return <ContainerEditor props={props as import('../types/theme').ContainerProps} onChange={onChange} />
    default: return <div className="text-xs text-neutral-500">未知类型: {type}</div>
  }
}
```

- [ ] **Step 8: Add global input styles to index.css**

Append to `web/src/index.css`:
```css
@import "tailwindcss";

.field {
  @apply w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white;
}
```

- [ ] **Step 9: Commit**

```bash
git add web/src/components/editors/ web/src/components/PropertyPanel.tsx web/src/index.css
git commit -m "feat: add property editors for all 10 element types"
```

---

### Task 13: AssetManager Component

**Files:**
- Create: `web/src/components/AssetManager.tsx`

- [ ] **Step 1: Create AssetManager**

Create `web/src/components/AssetManager.tsx`:
```tsx
import { useRef } from 'react'
import { useThemeStore } from '../store/theme-store'
import * as dbAssets from '../db/assets'

export function AssetManager() {
  const currentThemeId = useThemeStore(s => s.currentThemeId)
  const assets = useThemeStore(s => s.assets)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentThemeId || !e.target.files) return
    for (const file of Array.from(e.target.files)) {
      const name = file.name.replace(/\.[^.]+$/, '')
      await dbAssets.addAsset(currentThemeId, name, file)
    }
    // Refresh assets
    const store = useThemeStore.getState()
    if (store.currentThemeId) {
      const updatedAssets = await dbAssets.getAssetsForTheme(store.currentThemeId)
      useThemeStore.setState({ assets: updatedAssets })
    }
    e.target.value = ''
  }

  const handleDelete = async (id: string) => {
    await dbAssets.deleteAsset(id)
    if (currentThemeId) {
      const updatedAssets = await dbAssets.getAssetsForTheme(currentThemeId)
      useThemeStore.setState({ assets: updatedAssets })
    }
  }

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 font-bold">资源管理</span>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs bg-blue-600 px-2 py-0.5 rounded hover:bg-blue-500"
        >上传</button>
        <input ref={fileRef} type="file" multiple accept="image/*,.ttf,.otf,.woff,.woff2,.avi" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-1 text-xs">
        {assets.map(a => (
          <div key={a.id} className="flex items-center justify-between px-2 py-1 rounded bg-neutral-800">
            <span className="truncate text-neutral-300">{a.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">{a.type}</span>
              <button onClick={() => handleDelete(a.id)} className="text-neutral-500 hover:text-red-400">x</button>
            </div>
          </div>
        ))}
        {assets.length === 0 && <div className="text-neutral-500">暂无资源</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/AssetManager.tsx
git commit -m "feat: add AssetManager for uploading and managing theme assets"
```

---

### Task 14: Toolbar Component

**Files:**
- Create: `web/src/components/Toolbar.tsx`

- [ ] **Step 1: Create Toolbar**

Create `web/src/components/Toolbar.tsx`:
```tsx
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'

export function Toolbar() {
  const currentThemeId = useThemeStore(s => s.currentThemeId)
  const themes = useThemeStore(s => s.themes)
  const currentTheme = themes.find(t => t.id === currentThemeId)
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const elements = useThemeStore(s => s.elements)
  const deleteElement = useThemeStore(s => s.deleteElement)
  const selectElement = useUIStore(s => s.selectElement)

  const handleAddElement = async () => {
    if (!currentThemeId) return
    const name = prompt('元素名称')
    if (!name) return
    const type = prompt('元素类型 (img, label, imgbtn, bar, slider, arc, clock, clock_strip, mjpeg, container)')
    if (!type) return
    const store = useThemeStore.getState()
    await store.addElement(name, type as any, {} as any)
  }

  return (
    <div className="h-12 border-b border-neutral-700 flex items-center gap-3 px-4 shrink-0">
      <h1 className="text-sm font-bold text-blue-400 mr-4">MWKEYS 主题编辑器</h1>
      {currentTheme && (
        <span className="text-sm text-neutral-300">{currentTheme.name}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={handleAddElement}
        className="text-xs bg-green-700 px-3 py-1 rounded hover:bg-green-600"
        disabled={!currentThemeId}
      >添加元素</button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/Toolbar.tsx
git commit -m "feat: add Toolbar component"
```

---

### Task 15: Wire Up App Layout

**Files:**
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Update App.tsx to compose all components**

Replace `web/src/App.tsx`:
```tsx
import { useEffect } from 'react'
import { useThemeStore } from './store/theme-store'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { CanvasPreview } from './components/CanvasPreview'
import { ElementTree } from './components/ElementTree'
import { PropertyPanel } from './components/PropertyPanel'
import { AssetManager } from './components/AssetManager'
import { useUIStore } from './store/ui-store'

export default function App() {
  const loadThemes = useThemeStore(s => s.loadThemes)
  const sidebarTab = useUIStore(s => s.sidebarTab)

  useEffect(() => { loadThemes() }, [loadThemes])

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900 text-white">
      <Toolbar />
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 border-r border-neutral-700 shrink-0 flex flex-col overflow-hidden">
          <Sidebar />
        </aside>

        {/* Preview + Element Tree */}
        <section className="flex-1 flex flex-col items-center bg-neutral-950 overflow-auto py-4">
          <CanvasPreview />
          <div className="w-[480px] mt-2">
            <ElementTree />
          </div>
        </section>

        {/* Right panel */}
        <aside className="w-80 border-l border-neutral-700 shrink-0 flex flex-col overflow-hidden">
          {sidebarTab === 'assets' ? (
            <AssetManager />
          ) : (
            <PropertyPanel />
          )}
        </aside>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify full app compiles and runs**

Run: `cd web && npm run dev`
Expected: App loads with three-column layout, sidebar, empty canvas, and property panel. No console errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/App.tsx
git commit -m "feat: wire up main App layout with all components"
```

---

### Task 16: Theme Import (ZIP → IndexedDB)

**Files:**
- Create: `web/src/utils/theme-import.ts`

- [ ] **Step 1: Create import utility**

Create `web/src/utils/theme-import.ts`:
```ts
import JSZip from 'jszip'
import { v4 as uuid } from 'uuid'
import { db } from '../db/index'
import type { PageType, ThemeJsonPage, ThemeJsonElement } from '../types/theme'
import { PAGE_FILENAMES } from '../types/theme'

const PAGE_TYPE_MAP: Record<string, PageType> = {}
for (const [pt, fn] of Object.entries(PAGE_FILENAMES)) {
  PAGE_TYPE_MAP[fn] = pt as PageType
}

export async function importThemeFromZip(zipFile: File): Promise<string> {
  const zip = await JSZip.loadAsync(zipFile)
  const themeName = zipFile.name.replace(/\.zip$/i, '')
  const themeId = uuid()
  const now = Date.now()

  await db.transaction('rw', [db.themes, db.pages, db.elements, db.assets], async () => {
    // Create theme
    await db.themes.add({ id: themeId, name: themeName, createdAt: now, updatedAt: now, thumbnail: null })

    // Collect all asset name → file mappings
    const assetNameToId = new Map<string, string>()

    // Process each page JSON
    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue

      const pageType = PAGE_TYPE_MAP[filename]
      if (!pageType) continue

      const content = await zipEntry.async('string')
      const json: ThemeJsonPage = JSON.parse(content)
      const pageId = uuid()

      await db.pages.add({
        id: pageId,
        themeId,
        pageType,
        comment: json.comment || null,
        main_cont: json.main_cont || null,
        updatedAt: now,
      })

      // Flatten elements from JSON
      if (json.elements) {
        for (let i = 0; i < json.elements.length; i++) {
          const el = json.elements[i]
          const elId = uuid()

          // Extract common fields
          const { name, type, width, height, offset_x, offset_y, layout_align, rotation, x, y, ...rest } = el

          await db.elements.add({
            id: elId,
            pageId,
            name: name || `element_${i}`,
            type: type as ThemeJsonElement['type'],
            order: i,
            visible: true,
            offset_x: (offset_x as number) || 0,
            offset_y: (offset_y as number) || 0,
            layout_align: (layout_align as string) || 'TOP_LEFT',
            rotation: (rotation as number) || 0,
            x: (x as number) || 0,
            y: (y as number) || 0,
            props: rest as any,
            updatedAt: now,
          })
        }
      }

      // Import image_assets
      if (json.image_assets) {
        for (const ia of json.image_assets) {
          if (assetNameToId.has(ia.name)) continue
          const assetFile = await findAssetFile(zip, ia.name)
          if (assetFile) {
            const assetId = uuid()
            await db.assets.add({
              id: assetId,
              themeId,
              name: ia.name,
              type: 'image',
              mimeType: guessMime(assetFile.name),
              file: assetFile.blob,
              updatedAt: now,
            })
            assetNameToId.set(ia.name, assetId)
          }
        }
      }

      // Import font_assets
      if (json.font_assets) {
        for (const fa of json.font_assets) {
          if (assetNameToId.has(fa.name)) continue
          const assetFile = await findAssetFile(zip, fa.name)
          if (assetFile) {
            const assetId = uuid()
            await db.assets.add({
              id: assetId,
              themeId,
              name: fa.name,
              type: 'font',
              mimeType: guessMime(assetFile.name),
              file: assetFile.blob,
              updatedAt: now,
            })
            assetNameToId.set(fa.name, assetId)
          }
        }
      }
    }

    // Also scan assets/ directory for any files not referenced in JSON
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      if (path.startsWith('assets/')) {
        const filename = path.replace('assets/', '')
        const name = filename.replace(/\.[^.]+$/, '')
        if (assetNameToId.has(name)) continue
        const blob = await entry.async('blob')
        const assetId = uuid()
        await db.assets.add({
          id: assetId,
          themeId,
          name,
          type: guessAssetTypeFromExt(filename),
          mimeType: guessMime(filename),
          file: blob,
          updatedAt: now,
        })
        assetNameToId.set(name, assetId)
      }
    }
  })

  return themeId
}

async function findAssetFile(
  zip: JSZip,
  name: string,
): Promise<{ name: string; blob: Blob } | null> {
  // Try assets/<name>.*
  const extensions = ['.png', '.gif', '.jpg', '.jpeg', '.bmp', '.ttf', '.otf', '.woff', '.woff2', '.avi', '.bin']
  for (const ext of extensions) {
    const path = `assets/${name}${ext}`
    const entry = zip.file(path)
    if (entry) {
      const blob = await entry.async('blob')
      return { name: `${name}${ext}`, blob }
    }
  }

  // Try root-level or page subdirectories
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue
    const filename = path.split('/').pop() || ''
    const baseName = filename.replace(/\.[^.]+$/, '')
    if (baseName === name && !path.endsWith('.json')) {
      const blob = await entry.async('blob')
      return { name: filename, blob }
    }
  }

  return null
}

function guessMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    png: 'image/png', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg', bmp: 'image/bmp',
    ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2',
    avi: 'video/avi', bin: 'application/octet-stream',
  }
  return map[ext || ''] || 'application/octet-stream'
}

function guessAssetTypeFromExt(filename: string): 'image' | 'font' | 'video' {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['png', 'gif', 'jpg', 'jpeg', 'bmp'].includes(ext)) return 'image'
  if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return 'font'
  if (['avi'].includes(ext)) return 'video'
  return 'image'
}
```

- [ ] **Step 2: Add import button to Toolbar**

In `web/src/components/Toolbar.tsx`, add before the closing `</div>`:
```tsx
// Add import handler inside component
const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.zip'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const { importThemeFromZip } = await import('../utils/theme-import')
    const themeId = await importThemeFromZip(file)
    await useThemeStore.getState().loadThemes()
    await useThemeStore.getState().selectTheme(themeId)
  }
  input.click()
}

// Add button in JSX (after the add element button):
<button
  onClick={handleImport}
  className="text-xs bg-purple-700 px-3 py-1 rounded hover:bg-purple-600"
>导入ZIP</button>
```

- [ ] **Step 3: Commit**

```bash
git add web/src/utils/theme-import.ts web/src/components/Toolbar.tsx
git commit -m "feat: add ZIP theme import"
```

---

### Task 17: Theme Export (IndexedDB → ZIP)

**Files:**
- Create: `web/src/utils/theme-export.ts`

- [ ] **Step 1: Create export utility**

Create `web/src/utils/theme-export.ts`:
```ts
import JSZip from 'jszip'
import { db } from '../db/index'
import type { ThemeElement, ElementProps, ThemeJsonPage, ThemeJsonElement, ContainerProps, ImgbtnProps } from '../types/theme'
import { PAGE_FILENAMES, type PageType } from '../types/theme'

export async function exportThemeToZip(themeId: string): Promise<Blob> {
  const theme = await db.themes.get(themeId)
  if (!theme) throw new Error('Theme not found')

  const pages = await db.pages.where('themeId').equals(themeId).toArray()
  const assets = await db.assets.where('themeId').equals(themeId).toArray()
  const assetExtMap = new Map<string, string>()
  for (const a of assets) {
    const ext = mimeTypeToExt(a.mimeType)
    assetExtMap.set(a.name, ext)
  }

  const zip = new JSZip()

  for (const page of pages) {
    const elements = await db.elements.where('pageId').equals(page.id).sortBy('order')
    const { json, imageAssetNames, fontAssetNames } = buildPageJson(elements, theme.name, assetExtMap)

    // Add page JSON
    zip.file(PAGE_FILENAMES[page.pageType as PageType], JSON.stringify(json, null, 2))
  }

  // Add all assets to assets/ directory
  for (const asset of assets) {
    const ext = assetExtMap.get(asset.name) || 'bin'
    zip.file(`assets/${asset.name}.${ext}`, asset.file)
  }

  return zip.generateAsync({ type: 'blob' })
}

function buildPageJson(
  elements: ThemeElement[],
  themeName: string,
  assetExtMap: Map<string, string>,
): { json: ThemeJsonPage; imageAssetNames: Set<string>; fontAssetNames: Set<string> } {
  const imageAssetNames = new Set<string>()
  const fontAssetNames = new Set<string>()

  const jsonElements: ThemeJsonElement[] = elements.map(el => {
    const jsonEl: ThemeJsonElement = {
      name: el.name,
      type: el.type,
      offset_x: el.offset_x,
      offset_y: el.offset_y,
      layout_align: el.layout_align,
      rotation: el.rotation || undefined,
      x: el.x || undefined,
      y: el.y || undefined,
      ...serializeProps(el.type, el.props, assetExtMap, themeName, imageAssetNames, fontAssetNames),
    }

    const dims = el.props as Record<string, unknown>
    if (dims.width) jsonEl.width = dims.width as number
    if (dims.height) jsonEl.height = dims.height as number

    return jsonEl
  })

  const image_assets = [...imageAssetNames].map(name => ({
    name,
    src: `/sdcard/themes/${themeName}/assets/${name}.${assetExtMap.get(name) || 'bin'}`,
  }))

  const font_assets = [...fontAssetNames].map(name => ({
    name,
    src: `/sdcard/themes/${themeName}/assets/${name}.${assetExtMap.get(name) || 'bin'}`,
  }))

  return {
    json: { image_assets, font_assets, elements: jsonElements },
    imageAssetNames,
    fontAssetNames,
  }
}

function serializeProps(
  type: string,
  props: ElementProps,
  assetExtMap: Map<string, string>,
  themeName: string,
  imageAssets: Set<string>,
  fontAssets: Set<string>,
): Record<string, unknown> {
  const p = props as Record<string, unknown>
  const result: Record<string, unknown> = {}

  switch (type) {
    case 'img':
    case 'mjpeg':
      if (p.src) { result.src = p.src; imageAssets.add(p.src as string) }
      if (p.width) result.width = p.width
      if (p.height) result.height = p.height
      break
    case 'label':
      if (p.font) { result.font = p.font; fontAssets.add(p.font as string) }
      if (p.color) result.color = p.color
      if (p.text) result.text = p.text
      if (p.text_align) result.text_align = p.text_align
      if (p.width) result.width = p.width
      if (p.height) result.height = p.height
      if (p.split_by_space) result.split_by_space = p.split_by_space
      if (p.time_format) result.time_format = p.time_format
      break
    case 'imgbtn':
      if (p.states) result.states = p.states
      if (p.runing_states) result.runing_states = p.runing_states
      if (p.on_click) result.on_click = p.on_click
      if (p.indexData != null) result.indexData = p.indexData
      // Track image assets from states
      const states = p.states as Record<string, string>
      if (states) {
        for (const v of Object.values(states)) { if (v) imageAssets.add(v) }
      }
      break
    case 'bar':
      Object.assign(result, p)
      break
    case 'slider':
      Object.assign(result, p)
      break
    case 'arc':
      Object.assign(result, p)
      break
    case 'clock':
      Object.assign(result, p)
      break
    case 'clock_strip':
      Object.assign(result, p)
      break
    case 'container':
      if (p.width) result.width = p.width
      if (p.height) result.height = p.height
      if (p.layout) result.layout = p.layout
      if (p.flex_direction) result.flex_direction = p.flex_direction
      if (p.flex_align) result.flex_align = p.flex_align
      if (p.flex_gap != null) result.flex_gap = p.flex_gap
      if (p.bg_img) { result.bg_img = p.bg_img; imageAssets.add(p.bg_img as string) }
      if (p.bg_color) result.bg_color = p.bg_color
      if (p.bg_opa != null) result.bg_opa = p.bg_opa
      if (p.radius != null) result.radius = p.radius
      if (p.elements) result.elements = p.elements
      break
  }

  return result
}

function mimeTypeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png', 'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/bmp': 'bmp',
    'font/ttf': 'ttf', 'font/otf': 'otf', 'font/woff': 'woff', 'font/woff2': 'woff2',
    'video/avi': 'avi',
  }
  return map[mime] || 'bin'
}
```

- [ ] **Step 2: Add export button to Toolbar**

In `web/src/components/Toolbar.tsx`, add after the import handler:
```tsx
const handleExport = async () => {
  if (!currentThemeId) return
  const { exportThemeToZip } = await import('../utils/theme-export')
  const blob = await exportThemeToZip(currentThemeId)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentTheme?.name || 'theme'}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

// Add button in JSX (after import button):
<button
  onClick={handleExport}
  className="text-xs bg-orange-700 px-3 py-1 rounded hover:bg-orange-600"
  disabled={!currentThemeId}
>导出ZIP</button>
```

- [ ] **Step 3: Commit**

```bash
git add web/src/utils/theme-export.ts web/src/components/Toolbar.tsx
git commit -m "feat: add ZIP theme export"
```

---

### Task 18: Smoke Test + Cleanup

**Files:**
- Modify: `web/src/App.tsx` (if needed)

- [ ] **Step 1: Run full build check**

Run: `cd web && npm run build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run dev server and manually verify**

Run: `cd web && npm run dev`

Verify:
1. Three-column layout renders correctly
2. "新建" creates a theme with 7 pages
3. Clicking page tabs shows empty element list
4. "添加元素" adds an element to the current page
5. Canvas renders the element (placeholder)
6. Clicking element on canvas selects it
7. Property panel shows type-specific editor
8. Changing values updates canvas
9. "导入ZIP" imports a theme
10. "导出ZIP" downloads a zip

- [ ] **Step 3: Final commit**

```bash
git add web/
git commit -m "feat: complete MASS 80 theme editor v1"
```

---

## Self-Review

**Spec coverage:**
- Types (Task 2): Theme, Page, Element, Asset, all props types, JSON types
- DB (Task 3): themes, pages, elements, assets tables with full CRUD
- Stores (Task 4): theme-store with all operations, ui-store
- Canvas renderer (Tasks 6-8): all 10 element types, hit test, layout
- Components (Tasks 9-15): CanvasPreview, Sidebar, ElementTree, PropertyPanel, editors, AssetManager, Toolbar
- Import (Task 16): ZIP → IndexedDB
- Export (Task 17): IndexedDB → ZIP
- Layout (Task 15): three-column with sidebar/preview/property panel

**Placeholder scan:** No TBDs or TODOs. All steps have complete code.

**Type consistency:** All types defined in Task 2 are consistently referenced across all subsequent tasks. ElementProps union type used throughout. Asset name references via `props.src` and `props.font` consistent with spec.
