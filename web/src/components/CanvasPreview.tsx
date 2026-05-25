import { useRef, useEffect, useCallback } from 'react'
import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { render, type RenderContext } from '../canvas/renderer'
import { hitTest } from '../canvas/hit-test'

const CANVAS_SIZE = 480

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const assetImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const loadedFontsRef = useRef<Set<string>>(new Set())

  const elements = useThemeStore(s => s.elements)
  const assets = useThemeStore(s => s.assets)
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const selectElement = useUIStore(s => s.selectElement)

  useEffect(() => {
    const imgMap = new Map<string, HTMLImageElement>()
    let cancelled = false

    async function loadAll() {
      const promises = assets
        .filter(a => a.type === 'image')
        .map(a => new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            if (!cancelled) imgMap.set(a.name, img)
            resolve()
          }
          img.onerror = () => resolve()
          img.src = URL.createObjectURL(a.file)
        }))

      const fontPromises = assets
        .filter(a => a.type === 'font')
        .map(async (a) => {
          try {
            const fontFace = new FontFace(a.name, `url(${URL.createObjectURL(a.file)})`)
            const loaded = await fontFace.load()
            document.fonts.add(loaded)
            if (!cancelled) loadedFontsRef.current.add(a.name)
          } catch { /* ignore */ }
        })

      await Promise.all([...promises, ...fontPromises])
      if (!cancelled) {
        assetImagesRef.current = imgMap
        redraw()
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [assets])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderCtx: RenderContext = {
      assetImages: assetImagesRef.current,
      loadedFonts: loadedFontsRef.current,
    }
    render(ctx, elements, renderCtx, selectedElementId)
  }, [elements, selectedElementId])

  useEffect(() => { redraw() }, [redraw])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_SIZE / rect.width
    const scaleY = CANVAS_SIZE / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const hitId = hitTest(x, y, elements)
    selectElement(hitId)
  }, [elements, selectElement])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onClick={handleClick}
      className="border border-neutral-700 cursor-crosshair"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  )
}
