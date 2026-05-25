import type { ImageButtonElement, Asset } from '../../types/theme';

interface Props {
  el: ImageButtonElement;
  onChange: (changes: Partial<ImageButtonElement>) => void;
  assets?: Asset[];
}

export function ImageButtonEditor({ el, onChange, assets }: Props) {
  const assetNames = (assets || []).map((a) => a.name);

  return (
    <div className="property-section">
      <div className="property-section-title">图片按钮属性</div>
      <label className="field">
        <span className="field-label">released</span>
        <input
          type="text"
          className="field-input"
          value={el.states?.released || ''}
          onChange={(e) =>
            onChange({ states: { ...el.states, released: e.target.value } })
          }
        />
      </label>
      <label className="field">
        <span className="field-label">pressed</span>
        <input
          type="text"
          className="field-input"
          value={el.states?.pressed || ''}
          onChange={(e) =>
            onChange({ states: { ...el.states, pressed: e.target.value } })
          }
        />
      </label>
      <label className="field">
        <span className="field-label">checked</span>
        <input
          type="text"
          className="field-input"
          value={el.states?.checked || ''}
          onChange={(e) =>
            onChange({ states: { ...el.states, checked: e.target.value || undefined } })
          }
        />
      </label>
      <label className="field">
        <span className="field-label">on_click</span>
        <input
          type="text"
          className="field-input"
          value={el.on_click || ''}
          onChange={(e) => onChange({ on_click: e.target.value || undefined })}
        />
      </label>
      <label className="field">
        <span className="field-label">indexData</span>
        <input
          type="number"
          className="field-input"
          value={el.indexData ?? ''}
          onChange={(e) => onChange({ indexData: parseInt(e.target.value) || undefined })}
        />
      </label>
    </div>
  );
}
