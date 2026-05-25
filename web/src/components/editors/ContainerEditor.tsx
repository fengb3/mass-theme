import type { ContainerProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ContainerProps; onChange: (p: ContainerProps) => void }

export function ContainerEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" value={props.width} onChange={e => onChange({ ...props, width: e.target.value as ContainerProps['width'] })} /></Field>
        <Field label="高度"><input className="field" value={props.height} onChange={e => onChange({ ...props, height: e.target.value as ContainerProps['height'] })} /></Field>
      </div>
      <Field label="Flex方向">
        <select className="field" value={props.flex_direction} onChange={e => onChange({ ...props, flex_direction: e.target.value as ContainerProps['flex_direction'] })}>
          <option value="row">row</option>
          <option value="column">column</option>
          <option value="row_wrap">row_wrap</option>
        </select>
      </Field>
      <Field label="Flex对齐">
        <select className="field" value={props.flex_align} onChange={e => onChange({ ...props, flex_align: e.target.value as ContainerProps['flex_align'] })}>
          <option value="start">start</option>
          <option value="center">center</option>
          <option value="end">end</option>
          <option value="space_between">space_between</option>
          <option value="space_around">space_around</option>
          <option value="space_evenly">space_evenly</option>
        </select>
      </Field>
      <Field label="间距"><input className="field" type="number" value={props.flex_gap} onChange={e => onChange({ ...props, flex_gap: +e.target.value })} /></Field>
      <Field label="背景色"><input className="field" value={props.bg_color || ''} onChange={e => onChange({ ...props, bg_color: e.target.value })} /></Field>
      <Field label="背景透明度"><input className="field" type="number" value={props.bg_opa ?? 255} onChange={e => onChange({ ...props, bg_opa: +e.target.value })} /></Field>
      <Field label="圆角"><input className="field" type="number" value={props.radius ?? 0} onChange={e => onChange({ ...props, radius: +e.target.value })} /></Field>
    </div>
  )
}
