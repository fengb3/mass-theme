import type { ImgbtnProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ImgbtnProps; onChange: (props: ImgbtnProps) => void }

export function ImgbtnEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="Released图片"><input className="field" value={props.states?.released || ''} onChange={e => onChange({ ...props, states: { ...props.states, released: e.target.value } })} /></Field>
      <Field label="Pressed图片"><input className="field" value={props.states?.pressed || ''} onChange={e => onChange({ ...props, states: { ...props.states, pressed: e.target.value } })} /></Field>
      <Field label="Checked图片"><input className="field" value={props.states?.checked || ''} onChange={e => onChange({ ...props, states: { ...props.states, checked: e.target.value } })} /></Field>
      <Field label="点击事件"><input className="field" value={props.on_click || ''} onChange={e => onChange({ ...props, on_click: e.target.value })} /></Field>
      <Field label="indexData"><input className="field" type="number" value={props.indexData ?? 0} onChange={e => onChange({ ...props, indexData: +e.target.value })} /></Field>
    </div>
  )
}
