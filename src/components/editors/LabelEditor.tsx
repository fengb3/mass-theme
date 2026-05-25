import type { LabelProps } from '../../types/theme'
import { Field, ColorField, FontField } from './CommonFields'

interface Props { props: LabelProps; onChange: (props: LabelProps) => void }

export function LabelEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="字体">
        <FontField value={props.font} onChange={v => onChange({ ...props, font: v })} />
      </Field>
      <ColorField label="颜色" value={props.color} onChange={v => onChange({ ...props, color: v })} />
      <Field label="文本"><input className="field" value={props.text} onChange={e => onChange({ ...props, text: e.target.value })} /></Field>
      <Field label="对齐">
        <select className="field" value={props.text_align} onChange={e => onChange({ ...props, text_align: e.target.value as LabelProps['text_align'] })}>
          <option value="LEFT">LEFT</option>
          <option value="CENTER">CENTER</option>
          <option value="RIGHT">RIGHT</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
      <Field label="空格拆分"><input type="checkbox" checked={props.split_by_space} onChange={e => onChange({ ...props, split_by_space: e.target.checked })} /></Field>
      <Field label="时间格式"><input className="field" value={props.time_format} onChange={e => onChange({ ...props, time_format: e.target.value })} /></Field>
    </div>
  )
}
