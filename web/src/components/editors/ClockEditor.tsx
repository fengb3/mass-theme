import type { ClockElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: ClockElement;
  onChange: (changes: Partial<ClockElement>) => void;
}

export function ClockEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">刻度表盘属性</div>
      <ColorPicker label="marking_color" value={el.marking_color} onChange={(v) => onChange({ marking_color: v })} />
      <label className="field">
        <span className="field-label">marking_color_opa (0-100)</span>
        <input type="number" className="field-input" min={0} max={100} value={el.marking_color_opa} onChange={(e) => onChange({ marking_color_opa: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">marking_length</span>
        <input type="number" className="field-input" value={el.marking_length} onChange={(e) => onChange({ marking_length: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">marking_width</span>
        <input type="number" className="field-input" value={el.marking_width} onChange={(e) => onChange({ marking_width: parseInt(e.target.value) || 0 })} />
      </label>
    </div>
  );
}
