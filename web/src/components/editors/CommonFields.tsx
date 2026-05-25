import type { ThemeElement, LayoutAlign } from '../../types/theme'

const ALIGN_OPTIONS: LayoutAlign[] = [
  'TOP_LEFT', 'TOP_MID', 'TOP_RIGHT',
  'LEFT_MID', 'CENTER', 'RIGHT_MID',
  'BOTTOM_LEFT', 'BOTTOM_MID', 'BOTTOM_RIGHT',
]

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
        <input className="field" value={element.type} readOnly />
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
