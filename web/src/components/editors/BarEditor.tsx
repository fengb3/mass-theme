import type { BarElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: BarElement;
  onChange: (changes: Partial<BarElement>) => void;
}

export function BarEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">进度条属性</div>
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
      <label className="field">
        <span className="field-label">direction</span>
        <select className="field-select" value={el.direction} onChange={(e) => onChange({ direction: e.target.value as any })}>
          <option value="horizontal">horizontal</option>
          <option value="vertical">vertical</option>
        </select>
      </label>
      <ColorPicker label="main_color" value={el.main_color} onChange={(v) => onChange({ main_color: v })} />
      <ColorPicker label="indic_color" value={el.indic_color} onChange={(v) => onChange({ indic_color: v })} />
      <label className="field">
        <span className="field-label">radius</span>
        <input type="number" className="field-input" value={el.radius} onChange={(e) => onChange({ radius: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">padding</span>
        <input type="number" className="field-input" value={el.padding} onChange={(e) => onChange({ padding: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">on_change</span>
        <input type="text" className="field-input" value={el.on_change || ''} onChange={(e) => onChange({ on_change: e.target.value || undefined })} />
      </label>
    </div>
  );
}
