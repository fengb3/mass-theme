import type { SliderElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: SliderElement;
  onChange: (changes: Partial<SliderElement>) => void;
}

export function SliderEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">滑块属性</div>
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
      <ColorPicker label="main_color" value={el.main_color} onChange={(v) => onChange({ main_color: v })} />
      <ColorPicker label="indic_color" value={el.indic_color} onChange={(v) => onChange({ indic_color: v })} />
      <label className="field">
        <span className="field-label">radius</span>
        <input type="number" className="field-input" value={el.radius} onChange={(e) => onChange({ radius: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">knob_visible</span>
        <input type="checkbox" checked={el.knob_visible !== false} onChange={(e) => onChange({ knob_visible: e.target.checked })} />
      </label>
    </div>
  );
}
