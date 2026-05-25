import type { ClockProps } from '../../types/theme'
import { Field, ColorField } from './CommonFields'

interface Props { props: ClockProps; onChange: (p: ClockProps) => void }

export function ClockEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
      <ColorField label="刻度颜色" value={props.marking_color} onChange={v => onChange({ ...props, marking_color: v })} />
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="透明度"><input className="field" type="number" value={props.marking_color_opa} onChange={e => onChange({ ...props, marking_color_opa: +e.target.value })} /></Field>
        <Field label="刻度长度"><input className="field" type="number" value={props.marking_length} onChange={e => onChange({ ...props, marking_length: +e.target.value })} /></Field>
      </div>
      <Field label="刻度宽度"><input className="field" type="number" value={props.marking_width} onChange={e => onChange({ ...props, marking_width: +e.target.value })} /></Field>
    </div>
  )
}
