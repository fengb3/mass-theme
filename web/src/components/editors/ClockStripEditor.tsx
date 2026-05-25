import type { ClockStripProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ClockStripProps; onChange: (p: ClockStripProps) => void }

export function ClockStripEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="刻度颜色"><input className="field" value={props.marking_color} onChange={e => onChange({ ...props, marking_color: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="透明度"><input className="field" type="number" value={props.marking_color_opa} onChange={e => onChange({ ...props, marking_color_opa: +e.target.value })} /></Field>
        <Field label="间距"><input className="field" type="number" value={props.marking_spacing} onChange={e => onChange({ ...props, marking_spacing: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="大刻度宽"><input className="field" type="number" value={props.big_width} onChange={e => onChange({ ...props, big_width: +e.target.value })} /></Field>
        <Field label="大刻度高"><input className="field" type="number" value={props.big_height} onChange={e => onChange({ ...props, big_height: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="小刻度宽"><input className="field" type="number" value={props.small_width} onChange={e => onChange({ ...props, small_width: +e.target.value })} /></Field>
        <Field label="小刻度高"><input className="field" type="number" value={props.small_height} onChange={e => onChange({ ...props, small_height: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="大刻度间隔"><input className="field" type="number" value={props.big_loop} onChange={e => onChange({ ...props, big_loop: +e.target.value })} /></Field>
        <Field label="步进"><input className="field" type="number" value={props.step} onChange={e => onChange({ ...props, step: +e.target.value })} /></Field>
      </div>
    </div>
  )
}
