import type { ImgProps } from '../../types/theme'
import { Field } from './CommonFields'

interface Props { props: ImgProps; onChange: (props: ImgProps) => void }

export function ImgEditor({ props, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Field label="资源名">
        <input className="field" value={props.src} onChange={e => onChange({ ...props, src: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="宽度"><input className="field" type="number" value={props.width} onChange={e => onChange({ ...props, width: +e.target.value })} /></Field>
        <Field label="高度"><input className="field" type="number" value={props.height} onChange={e => onChange({ ...props, height: +e.target.value })} /></Field>
      </div>
    </div>
  )
}
