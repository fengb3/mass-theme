import { useThemeStore } from '../../store/theme-store'
import type { ElementProps, ElementType, LayoutAlign, ThemeElement } from '../../types/theme'
import { toHexColor } from '../../utils/color'

const ALIGN_OPTIONS: LayoutAlign[] = [
  'TOP_LEFT', 'TOP_MID', 'TOP_RIGHT',
  'LEFT_MID', 'CENTER', 'RIGHT_MID',
  'BOTTOM_LEFT', 'BOTTOM_MID', 'BOTTOM_RIGHT',
]

const TYPE_OPTIONS: { value: ElementType; label: string }[] = [
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

const DEFAULT_PROPS: Record<ElementType, ElementProps> = {
  img: { src: '', width: 100, height: 100 },
  label: { font: '', color: '0xFFFFFF', text: '', text_align: 'CENTER', width: 100, height: 30, split_by_space: false, time_format: '' },
  imgbtn: { states: { released: '' } },
  bar: { range_min: 0, range_max: 100, value: 50, direction: 'horizontal', main_color: '0xCCCCCC', indic_color: '0x666666', radius: 4, padding: 2, reversed_value: false },
  slider: { range_min: 0, range_max: 100, value: 50, main_color: '0xCCCCCC', indic_color: '0x666666', radius: 6, knob_visible: true },
  arc: { range_min: 0, range_max: 100, value: 50, bg_start_angle: 0, bg_end_angle: 360, rotation: 0, arc_width: 10, arc_color: '0xFFFFFF', bg_arc_color: '0x333333' },
  clock: { width: 480, height: 480, marking_color: '0xFFFFFF', marking_color_opa: 50, marking_length: 100, marking_width: 6 },
  clock_strip: { marking_color: '0xFFFFFF', marking_color_opa: 50, marking_spacing: 22, big_width: 59, big_height: 2, small_width: 30, small_height: 2, big_loop: 6, step: 6 },
  mjpeg: { src: '', width: 480, height: 480 },
  container: { width: 'content', height: 'content', layout: 'flex', flex_direction: 'row', flex_align: 'start', flex_gap: 0, elements: [] },
}

interface Props {
  element: ThemeElement
  onChange: (changes: Partial<ThemeElement>) => void
}

export function CommonFields({ element, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="名称">
        <input className="field" value={element.name} readOnly />
      </Field>
      <Field label="类型">
        <select
          className="field"
          value={element.type}
          onChange={e => {
            const newType = e.target.value as ElementType
            if (newType !== element.type) {
              onChange({ type: newType, props: DEFAULT_PROPS[newType] })
            }
          }}
        >
          {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="X偏移">
          <input className="field" type="number" value={element.offset_x}
            onChange={e => onChange({ offset_x: +e.target.value })} />
        </Field>
        <Field label="Y偏移">
          <input className="field" type="number" value={element.offset_y}
            onChange={e => onChange({ offset_y: +e.target.value })} />
        </Field>
      </div>
      <Field label="对齐">
        <select className="field" value={element.layout_align}
          onChange={e => onChange({ layout_align: e.target.value as LayoutAlign })}>
          {ALIGN_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="旋转(0.1°)">
        <input className="field" type="number" value={element.rotation}
          onChange={e => onChange({ rotation: +e.target.value })} />
      </Field>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-400">{label}</span>
      {children}
    </label>
  )
}

// ─── Color picker field ───

export function ColorField({ label, value, onChange, allowTransparent }: {
  label: string
  value: string
  onChange: (value: string) => void
  allowTransparent?: boolean
}) {
  const isTransparent = value === 'transparent'
  const hexForPicker = isTransparent ? '#000000' : toHexColor(value)

  const handlePickerChange = (hex: string) => {
    onChange(`0x${hex.slice(1).toUpperCase()}`)
  }

  return (
    <label className="block">
      <span className="text-xs text-neutral-400">{label}</span>
      <div className="flex items-center gap-1.5">
        {allowTransparent && (
          <input
            type="checkbox"
            title="透明"
            checked={isTransparent}
            onChange={e => onChange(e.target.checked ? 'transparent' : '0x000000')}
            className="shrink-0"
          />
        )}
        <input
          type="color"
          value={hexForPicker}
          onChange={e => handlePickerChange(e.target.value)}
          disabled={isTransparent}
          className="w-8 h-7 rounded cursor-pointer border border-neutral-600 bg-transparent shrink-0 disabled:opacity-30"
        />
        <input
          className="field flex-1 min-w-0"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </label>
  )
}

// ─── Font dropdown field ───

export function FontField({ value, onChange }: {
  value: string
  onChange: (value: string) => void
}) {
  const assets = useThemeStore(s => s.assets)
  const fonts = assets.filter(a => a.type === 'font')

  return (
    <div className="flex items-center gap-1.5">
      <select
        className="field flex-1"
        value={fonts.some(f => f.name === value) ? value : '__custom__'}
        onChange={e => {
          if (e.target.value !== '__custom__') onChange(e.target.value)
        }}
      >
        {fonts.map(f => (
          <option key={f.id} value={f.name}>{f.name}</option>
        ))}
        {!fonts.some(f => f.name === value) && value && (
          <option value="__custom__">自定义: {value}</option>
        )}
      </select>
      <input
        className="field w-24"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="字体名"
      />
    </div>
  )
}
