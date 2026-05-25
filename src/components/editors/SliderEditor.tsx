import type { SliderProps } from '../../types/theme'
import { Field, ColorField } from './CommonFields'

interface Props { props: SliderProps; onChange: (p: SliderProps) => void }

export function SliderEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <ColorField label="轨道色" value={props.main_color} onChange={v => onChange({ ...props, main_color: v })} />
      <ColorField label="指示器色" value={props.indic_color} onChange={v => onChange({ ...props, indic_color: v })} />
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="圆角"><input className="field" type="number" value={props.radius} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
        <Field label="显示旋钮"><input type="checkbox" checked={props.knob_visible} onChange={e => onChange({ ...props, knob_visible: e.target.checked })} /></Field>
      </div>
    </div>
  )
}
