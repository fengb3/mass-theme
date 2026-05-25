import { useState } from 'react'
import { useUIStore } from '../store/ui-store'
import { useThemeStore } from '../store/theme-store'
import type { ElementType } from '../types/theme'

const ELEMENT_TYPES: { value: ElementType; label: string }[] = [
  { value: 'img', label: '图片 (img)' },
  { value: 'label', label: '文本 (label)' },
  { value: 'imgbtn', label: '图片按钮 (imgbtn)' },
  { value: 'bar', label: '进度条 (bar)' },
  { value: 'slider', label: '滑块 (slider)' },
  { value: 'arc', label: '圆弧 (arc)' },
  { value: 'clock', label: '时钟 (clock)' },
  { value: 'clock_strip', label: '刻度条 (clock_strip)' },
  { value: 'mjpeg', label: '视频流 (mjpeg)' },
  { value: 'container', label: '容器 (container)' },
]

export function Dialog() {
  const dialog = useUIStore(s => s.dialog)
  const closeDialog = useUIStore(s => s.closeDialog)
  const createTheme = useThemeStore(s => s.createTheme)
  const deleteTheme = useThemeStore(s => s.deleteTheme)
  const addElement = useThemeStore(s => s.addElement)

  const [themeName, setThemeName] = useState('')
  const [elementName, setElementName] = useState('')
  const [elementType, setElementType] = useState<ElementType>('img')
  const [creating, setCreating] = useState(false)

  if (!dialog.type) return null

  const handleCreateTheme = async () => {
    if (themeName.trim() && !creating) {
      setCreating(true)
      try {
        await createTheme(themeName.trim())
        setThemeName('')
        closeDialog()
      } finally {
        setCreating(false)
      }
    }
  }

  const handleDeleteTheme = () => {
    const themeId = dialog.data?.themeId as string | undefined
    if (themeId) {
      deleteTheme(themeId)
      closeDialog()
    }
  }

  const handleAddElement = async () => {
    if (elementName.trim()) {
      await addElement(elementName.trim(), elementType, {} as any)
      setElementName('')
      setElementType('img')
      closeDialog()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
    if (e.key === 'Escape') { closeDialog(); resetState() }
  }

  const resetState = () => {
    setThemeName('')
    setElementName('')
    setElementType('img')
  }

  const handleClose = () => {
    closeDialog()
    resetState()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleClose}>
      <div
        className="bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl w-80 p-4"
        onClick={e => e.stopPropagation()}
      >
        {dialog.type === 'create-theme' && (
          <>
            <h3 className="text-sm font-bold mb-3">新建主题</h3>
            <input
              type="text"
              value={themeName}
              onChange={e => setThemeName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleCreateTheme)}
              placeholder="主题名称"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-1.5 text-sm mb-3 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleClose} disabled={creating} className="text-xs px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50">取消</button>
              <button onClick={handleCreateTheme} disabled={creating} className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </>
        )}

        {dialog.type === 'delete-theme' && (
          <>
            <h3 className="text-sm font-bold mb-3">删除主题</h3>
            <p className="text-xs text-neutral-300 mb-4">确定删除此主题？此操作不可撤销。</p>
            <div className="flex justify-end gap-2">
              <button onClick={handleClose} className="text-xs px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600">取消</button>
              <button onClick={handleDeleteTheme} className="text-xs px-3 py-1.5 rounded bg-red-600 hover:bg-red-500">删除</button>
            </div>
          </>
        )}

        {dialog.type === 'add-element' && (
          <>
            <h3 className="text-sm font-bold mb-3">添加元素</h3>
            <input
              type="text"
              value={elementName}
              onChange={e => setElementName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleAddElement)}
              placeholder="元素名称"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-1.5 text-sm mb-2 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <select
              value={elementType}
              onChange={e => setElementType(e.target.value as ElementType)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-1.5 text-sm mb-3 focus:outline-none focus:border-blue-500"
            >
              {ELEMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={handleClose} className="text-xs px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600">取消</button>
              <button onClick={handleAddElement} className="text-xs px-3 py-1.5 rounded bg-green-600 hover:bg-green-500">添加</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
