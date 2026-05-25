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
