import type { MjpegElement } from '../../types/theme';

interface Props {
  el: MjpegElement;
  onChange: (changes: Partial<MjpegElement>) => void;
}

export function MjpegEditor({ el, onChange }: Props) {
  return (
    <div className="property-section">
      <div className="property-section-title">MJPEG 属性</div>
      <label className="field">
        <span className="field-label">src (资源名)</span>
        <input
          type="text"
          className="field-input"
          value={el.src || ''}
          onChange={(e) => onChange({ src: e.target.value || undefined })}
          placeholder="引用 image_assets 中的 AVI 资源"
        />
      </label>
    </div>
  );
}
