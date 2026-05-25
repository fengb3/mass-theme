import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { PAGE_TYPES, PAGE_LABELS } from '../types/theme'

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

      {sidebarTab === 'assets' && <AssetList />}
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
