import type { LabelElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: LabelElement;
  onChange: (changes: Partial<LabelElement>) => void;
}

export function LabelEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">文本属性</div>
      <label className="field">
        <span className="field-label">font</span>
        <input
          type="text"
          className="field-input"
          value={el.font || ''}
          onChange={(e) => onChange({ font: e.target.value })}
        />
      </label>
      <ColorPicker label="color" value={el.color || '0xFFFFFF'} onChange={(v) => onChange({ color: v })} />
      <label className="field">
        <span className="field-label">text</span>
        <input
          type="text"
          className="field-input"
          value={el.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="系统动态填充时留空"
        />
      </label>
      <label className="field">
        <span className="field-label">text_align</span>
        <select
          className="field-select"
          value={el.text_align || 'LEFT'}
          onChange={(e) => onChange({ text_align: e.target.value as any })}
        >
          <option value="LEFT">LEFT</option>
          <option value="CENTER">CENTER</option>
          <option value="RIGHT">RIGHT</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">split_by_space</span>
        <input
          type="checkbox"
          checked={!!el.split_by_space}
          onChange={(e) => onChange({ split_by_space: e.target.checked })}
        />
      </label>
      {el.name === 'time_label' && (
        <label className="field">
          <span className="field-label">time_format</span>
          <input
            type="text"
            className="field-input"
            value={el.time_format || ''}
            onChange={(e) => onChange({ time_format: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}
