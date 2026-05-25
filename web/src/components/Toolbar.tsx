import { useThemeStore } from '../store/theme-store'

export function Toolbar() {
  const currentThemeId = useThemeStore(s => s.currentThemeId)
  const themes = useThemeStore(s => s.themes)
  const currentTheme = themes.find(t => t.id === currentThemeId)

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
