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
        <input ref={fileRef} type="file" multiple accept="image/*,.ttf,.avi" className="hidden" onChange={handleUpload} />
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
