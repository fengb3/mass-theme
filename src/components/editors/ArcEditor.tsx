import type { ArcProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ArcProps; onChange: (p: ArcProps) => void }

export function ArcEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="最小值"><input className="field" type="number" value={props.range_min} onChange={e => onChange({ ...props, range_min: +e.target.value })} /></Field>
        <Field label="最大值"><input className="field" type="number" value={props.range_max} onChange={e => onChange({ ...props, range_max: +e.target.value })} /></Field>
      </div>
      <Field label="当前值"><input className="field" type="number" value={props.value} onChange={e => onChange({ ...props, value: +e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="起始角度"><input className="field" type="number" value={props.bg_start_angle} onChange={e => onChange({ ...props, bg_start_angle: +e.target.value })} /></Field>
        <Field label="结束角度"><input className="field" type="number" value={props.bg_end_angle} onChange={e => onChange({ ...props, bg_end_angle: +e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="旋转偏移"><input className="field" type="number" value={props.rotation} onChange={e => onChange({ ...props, rotation: +e.target.value })} /></Field>
        <Field label="弧线宽度"><input className="field" type="number" value={props.arc_width} onChange={e => onChange({ ...props, arc_width: +e.target.value })} /></Field>
      </div>
      <Field label="指示器色"><input className="field" value={props.arc_color} onChange={e => onChange({ ...props, arc_color: e.target.value })} /></Field>
      <Field label="背景弧色"><input className="field" value={props.bg_arc_color} onChange={e => onChange({ ...props, bg_arc_color: e.target.value })} /></Field>
    </div>
  )
}
