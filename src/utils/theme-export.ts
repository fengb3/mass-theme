import JSZip from 'jszip'
import { db } from '../db/index'
import type { ThemeElement, ThemeJsonPage, ThemeJsonElement } from '../types/theme'
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
    const { json } = buildPageJson(elements, theme.name, assetExtMap)
    zip.file(PAGE_FILENAMES[page.pageType as PageType], JSON.stringify(json, null, 2))
  }

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
): { json: ThemeJsonPage } {
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
      ...serializeProps(el.type, el.props as any, assetExtMap, themeName, imageAssetNames, fontAssetNames),
    }
    const dims = el.props as any
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

  return { json: { image_assets, font_assets, elements: jsonElements } }
}

function serializeProps(
  type: string,
  props: Record<string, unknown>,
  _assetExtMap: Map<string, string>,
  _themeName: string,
  imageAssets: Set<string>,
  fontAssets: Set<string>,
): Record<string, unknown> {
  const p = props
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
      const states = p.states as Record<string, string>
      if (states) {
        for (const v of Object.values(states)) { if (v) imageAssets.add(v) }
      }
      break
    case 'bar':
    case 'slider':
    case 'arc':
    case 'clock':
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
