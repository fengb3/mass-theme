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
