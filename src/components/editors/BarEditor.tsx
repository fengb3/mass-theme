import type { BarProps } from '../../types/theme'
import { Field, ColorField } from './CommonFields'

interface Props { props: BarProps; onChange: (props: BarProps) => void }

export function BarEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <Field label="方向">
        <select className="field" value={props.direction} onChange={e => onChange({ ...props, direction: e.target.value as BarProps['direction'] })}>
          <option value="horizontal">水平</option>
          <option value="vertical">垂直</option>
        </select>
      </Field>
      <ColorField label="背景色" value={props.main_color} onChange={v => onChange({ ...props, main_color: v })} allowTransparent />
      <ColorField label="指示器色" value={props.indic_color} onChange={v => onChange({ ...props, indic_color: v })} allowTransparent />
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="圆角"><input className="field" type="number" value={props.radius} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
        <Field label="内边距"><input className="field" type="number" value={props.padding} onChange={e => onChange({ ...props, padding: +e.target.value })} /></Field>
      </div>
      <Field label="反向值"><input type="checkbox" checked={props.reversed_value} onChange={e => onChange({ ...props, reversed_value: e.target.checked })} /></Field>
    </div>
  )
}
