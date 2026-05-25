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
        <aside className="w-52 border-r border-neutral-700 shrink-0 flex flex-col overflow-hidden">
          <Sidebar />
        </aside>
        <section className="flex-1 flex flex-col items-center bg-neutral-950 overflow-auto py-4">
          <CanvasPreview />
          <div className="w-[480px] mt-2">
            <ElementTree />
          </div>
        </section>
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
