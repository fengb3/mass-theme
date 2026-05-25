import JSZip from 'jszip'
import { v4 as uuid } from 'uuid'
import { db } from '../db/index'
import type { PageType, ThemeJsonPage } from '../types/theme'
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
    await db.themes.add({ id: themeId, name: themeName, createdAt: now, updatedAt: now, thumbnail: null })

    const assetNameToId = new Map<string, string>()

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

      if (json.elements) {
        for (let i = 0; i < json.elements.length; i++) {
          const el = json.elements[i]
          const elId = uuid()
          const { name, type, width, height, offset_x, offset_y, layout_align, rotation, x, y, ...rest } = el

          await db.elements.add({
            id: elId,
            pageId,
            name: name || `element_${i}`,
            type: type as any,
            order: i,
            visible: true,
            offset_x: (offset_x as number) || 0,
            offset_y: (offset_y as number) || 0,
            layout_align: (layout_align as any) || 'TOP_LEFT',
            rotation: (rotation as number) || 0,
            x: (x as number) || 0,
            y: (y as number) || 0,
            props: rest as any,
            updatedAt: now,
          })
        }
      }

      if (json.image_assets) {
        for (const ia of json.image_assets) {
          if (assetNameToId.has(ia.name)) continue
          const assetFile = await findAssetFile(zip, ia.name)
          if (assetFile) {
            const assetId = uuid()
            await db.assets.add({
              id: assetId, themeId, name: ia.name, type: 'image',
              mimeType: guessMime(assetFile.name), file: assetFile.blob, updatedAt: now,
            })
            assetNameToId.set(ia.name, assetId)
          }
        }
      }

      if (json.font_assets) {
        for (const fa of json.font_assets) {
          if (assetNameToId.has(fa.name)) continue
          const assetFile = await findAssetFile(zip, fa.name)
          if (assetFile) {
            const assetId = uuid()
            await db.assets.add({
              id: assetId, themeId, name: fa.name, type: 'font',
              mimeType: guessMime(assetFile.name), file: assetFile.blob, updatedAt: now,
            })
            assetNameToId.set(fa.name, assetId)
          }
        }
      }
    }

    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      if (path.startsWith('assets/')) {
        const filename = path.replace('assets/', '')
        const name = filename.replace(/\.[^.]+$/, '')
        if (assetNameToId.has(name)) continue
        const blob = await entry.async('blob')
        const assetId = uuid()
        await db.assets.add({
          id: assetId, themeId, name, type: guessAssetTypeFromExt(filename),
          mimeType: guessMime(filename), file: blob, updatedAt: now,
        })
        assetNameToId.set(name, assetId)
      }
    }
  })

  return themeId
}

async function findAssetFile(zip: JSZip, name: string): Promise<{ name: string; blob: Blob } | null> {
  const extensions = ['.png', '.gif', '.jpg', '.jpeg', '.bmp', '.ttf', '.avi', '.bin']
  for (const ext of extensions) {
    const path = `assets/${name}${ext}`
    const entry = zip.file(path)
    if (entry) {
      const blob = await entry.async('blob')
      return { name: `${name}${ext}`, blob }
    }
  }
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
    ttf: 'font/ttf',
    avi: 'video/avi', bin: 'application/octet-stream',
  }
  return map[ext || ''] || 'application/octet-stream'
}

function guessAssetTypeFromExt(filename: string): 'image' | 'font' | 'video' {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['png', 'gif', 'jpg', 'jpeg', 'bmp'].includes(ext)) return 'image'
  if (['ttf'].includes(ext)) return 'font'
  if (['avi'].includes(ext)) return 'video'
  return 'image'
}
