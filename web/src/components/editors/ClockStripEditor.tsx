import type { ClockStripElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: ClockStripElement;
  onChange: (changes: Partial<ClockStripElement>) => void;
}

export function ClockStripEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">横向刻度属性</div>
      <ColorPicker label="marking_color" value={el.marking_color} onChange={(v) => onChange({ marking_color: v })} />
      <label className="field">
        <span className="field-label">marking_color_opa (0-100)</span>
        <input type="number" className="field-input" min={0} max={100} value={el.marking_color_opa} onChange={(e) => onChange({ marking_color_opa: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">marking_spacing</span>
        <input type="number" className="field-input" value={el.marking_spacing} onChange={(e) => onChange({ marking_spacing: parseInt(e.target.value) || 0 })} />
      </label>
      <div className="field-row">
        <label className="field">
          <span className="field-label">big_width</span>
          <input type="number" className="field-input" value={el.big_width} onChange={(e) => onChange({ big_width: parseInt(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span className="field-label">big_height</span>
          <input type="number" className="field-input" value={el.big_height} onChange={(e) => onChange({ big_height: parseInt(e.target.value) || 0 })} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">small_width</span>
          <input type="number" className="field-input" value={el.small_width} onChange={(e) => onChange({ small_width: parseInt(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span className="field-label">small_height</span>
          <input type="number" className="field-input" value={el.small_height} onChange={(e) => onChange({ small_height: parseInt(e.target.value) || 0 })} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">big_loop</span>
          <input type="number" className="field-input" value={el.big_loop} onChange={(e) => onChange({ big_loop: parseInt(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span className="field-label">step</span>
          <input type="number" className="field-input" value={el.step} onChange={(e) => onChange({ step: parseInt(e.target.value) || 0 })} />
        </label>
      </div>
    </div>
  );
}
