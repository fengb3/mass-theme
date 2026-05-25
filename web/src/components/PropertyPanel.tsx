import { useThemeStore } from '../store/theme-store'
import { useUIStore } from '../store/ui-store'
import { CommonFields } from './editors/CommonFields'
import { ImgEditor } from './editors/ImgEditor'
import { LabelEditor } from './editors/LabelEditor'
import { ImgbtnEditor } from './editors/ImgbtnEditor'
import { BarEditor } from './editors/BarEditor'
import { SliderEditor } from './editors/SliderEditor'
import { ArcEditor } from './editors/ArcEditor'
import { ClockEditor } from './editors/ClockEditor'
import { ClockStripEditor } from './editors/ClockStripEditor'
import { MjpegEditor } from './editors/MjpegEditor'
import { ContainerEditor } from './editors/ContainerEditor'
import type { ElementProps, ThemeElement } from '../types/theme'

export function PropertyPanel() {
  const selectedElementId = useUIStore(s => s.selectedElementId)
  const elements = useThemeStore(s => s.elements)
  const updateElement = useThemeStore(s => s.updateElement)

  const element = elements.find(e => e.id === selectedElementId)

  if (!element) {
    return (
      <div className="p-3 text-sm text-neutral-500">
        点击预览区域或元素列表选择一个元素
      </div>
    )
  }

  const handlePropsChange = (newProps: ElementProps) => {
    updateElement(element.id, { props: newProps })
  }

  return (
    <div className="p-3 space-y-3 overflow-y-auto">
      <CommonFields element={element} onChange={changes => updateElement(element.id, changes)} />
      <div className="border-t border-neutral-700 pt-2">
        <TypeEditor type={element.type} props={element.props} onChange={handlePropsChange} />
      </div>
    </div>
  )
}

function TypeEditor({ type, props, onChange }: { type: string; props: ThemeElement['props']; onChange: (p: ElementProps) => void }) {
  switch (type) {
    case 'img': return <ImgEditor props={props as import('../types/theme').ImgProps} onChange={onChange} />
    case 'label': return <LabelEditor props={props as import('../types/theme').LabelProps} onChange={onChange} />
    case 'imgbtn': return <ImgbtnEditor props={props as import('../types/theme').ImgbtnProps} onChange={onChange} />
    case 'bar': return <BarEditor props={props as import('../types/theme').BarProps} onChange={onChange} />
    case 'slider': return <SliderEditor props={props as import('../types/theme').SliderProps} onChange={onChange} />
    case 'arc': return <ArcEditor props={props as import('../types/theme').ArcProps} onChange={onChange} />
    case 'clock': return <ClockEditor props={props as import('../types/theme').ClockProps} onChange={onChange} />
    case 'clock_strip': return <ClockStripEditor props={props as import('../types/theme').ClockStripProps} onChange={onChange} />
    case 'mjpeg': return <MjpegEditor props={props as import('../types/theme').MjpegProps} onChange={onChange} />
    case 'container': return <ContainerEditor props={props as import('../types/theme').ContainerProps} onChange={onChange} />
    default: return <div className="text-xs text-neutral-500">未知类型: {type}</div>
  }
}
