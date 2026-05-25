import type { ArcElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: ArcElement;
  onChange: (changes: Partial<ArcElement>) => void;
}

export function ArcEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">圆弧属性</div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">range_min</span>
          <input type="number" className="field-input" value={el.range_min} onChange={(e) => onChange({ range_min: parseInt(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span className="field-label">range_max</span>
          <input type="number" className="field-input" value={el.range_max} onChange={(e) => onChange({ range_max: parseInt(e.target.value) || 100 })} />
        </label>
      </div>
      <label className="field">
        <span className="field-label">value</span>
        <input type="number" className="field-input" value={el.value} onChange={(e) => onChange({ value: parseInt(e.target.value) || 0 })} />
      </label>
      <div className="field-row">
        <label className="field">
          <span className="field-label">bg_start_angle</span>
          <input type="number" className="field-input" value={el.bg_start_angle} onChange={(e) => onChange({ bg_start_angle: parseInt(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span className="field-label">bg_end_angle</span>
          <input type="number" className="field-input" value={el.bg_end_angle} onChange={(e) => onChange({ bg_end_angle: parseInt(e.target.value) || 360 })} />
        </label>
      </div>
      <ColorPicker label="arc_color" value={el.arc_color} onChange={(v) => onChange({ arc_color: v })} />
      <ColorPicker label="bg_arc_color" value={el.bg_arc_color} onChange={(v) => onChange({ bg_arc_color: v })} />
      <label className="field">
        <span className="field-label">arc_width</span>
        <input type="number" className="field-input" value={el.arc_width} onChange={(e) => onChange({ arc_width: parseInt(e.target.value) || 0 })} />
      </label>
    </div>
  );
}
