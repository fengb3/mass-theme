import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'

export function Toolbar() {
  const currentThemeId = useThemeStore(s => s.currentThemeId)
  const themes = useThemeStore(s => s.themes)
  const currentTheme = themes.find(t => t.id === currentThemeId)
  const openDialog = useUIStore(s => s.openDialog)

  const handleAddElement = () => {
    if (!currentThemeId) return
    openDialog('add-element')
  }

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

  return (
    <div className="h-12 border-b border-neutral-700 flex items-center gap-3 px-4 shrink-0">
      <h1 className="text-sm font-bold text-blue-400 mr-4">MWKEYS 主题编辑器</h1>
      {currentTheme && (
        <span className="text-sm text-neutral-300">{currentTheme.name}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={handleImport}
        className="text-xs bg-purple-700 px-3 py-1 rounded hover:bg-purple-600"
      >导入ZIP</button>
      <button
        onClick={handleExport}
        className="text-xs bg-orange-700 px-3 py-1 rounded hover:bg-orange-600"
        disabled={!currentThemeId}
      >导出ZIP</button>
      <button
        onClick={handleAddElement}
        className="text-xs bg-green-700 px-3 py-1 rounded hover:bg-green-600"
        disabled={!currentThemeId}
      >添加元素</button>
    </div>
  )
}
