import type { ImageElement } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: ImageElement;
  onChange: (changes: Partial<ImageElement>) => void;
}

export function ImageEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">图片属性</div>
      <label className="field">
        <span className="field-label">src (资源名)</span>
        <input
          type="text"
          className="field-input"
          value={el.src}
          onChange={(e) => onChange({ src: e.target.value })}
          placeholder="留空表示占位"
        />
      </label>
    </div>
  );
}
