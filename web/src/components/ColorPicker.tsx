import { parseColor, cssToHex } from '../utils/color';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: Props) {
  const css = parseColor(value);
  const isTransparent = value === 'transparent';

  return (
    <label className="field color-field">
      {label && <span className="field-label">{label}</span>}
      <div className="color-row">
        <input
          type="color"
          value={isTransparent ? '#000000' : css === 'transparent' ? '#000000' : css}
          disabled={isTransparent}
          onChange={(e) => onChange(cssToHex(e.target.value))}
        />
        <input
          type="text"
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 100 }}
        />
        <label className="transparent-check">
          <input
            type="checkbox"
            checked={isTransparent}
            onChange={(e) => onChange(e.target.checked ? 'transparent' : '0xFFFFFF')}
          />
          <span>transparent</span>
        </label>
      </div>
    </label>
  );
}
