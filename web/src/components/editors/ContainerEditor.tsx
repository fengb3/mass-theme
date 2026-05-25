import type { ContainerElement, Asset } from '../../types/theme';
import { ColorPicker } from '../ColorPicker';

interface Props {
  el: ContainerElement;
  onChange: (changes: Partial<ContainerElement>) => void;
  assets?: Asset[];
}

export function ContainerEditor({ el, onChange, assets }: Props) {
  const assetNames = (assets || []).map((a) => a.name);

  return (
    <div className="property-section">
      <div className="property-section-title">容器属性</div>
      <label className="field">
        <span className="field-label">layout</span>
        <select className="field-select" value={el.layout || 'flex'} onChange={(e) => onChange({ layout: e.target.value as any })}>
          <option value="flex">flex</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">flex_direction</span>
        <select className="field-select" value={el.flex_direction || 'row'} onChange={(e) => onChange({ flex_direction: e.target.value as any })}>
          <option value="row">row</option>
          <option value="column">column</option>
          <option value="row_wrap">row_wrap</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">flex_align</span>
        <select className="field-select" value={el.flex_align || 'start'} onChange={(e) => onChange({ flex_align: e.target.value as any })}>
          <option value="start">start</option>
          <option value="center">center</option>
          <option value="end">end</option>
          <option value="space_between">space_between</option>
          <option value="space_around">space_around</option>
          <option value="space_evenly">space_evenly</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">flex_gap</span>
        <input type="number" className="field-input" value={el.flex_gap || 0} onChange={(e) => onChange({ flex_gap: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">bg_img</span>
        <input type="text" className="field-input" value={el.bg_img || ''} onChange={(e) => onChange({ bg_img: e.target.value || undefined })} placeholder="背景图片资源名" />
      </label>
      <ColorPicker label="bg_color" value={el.bg_color || 'transparent'} onChange={(v) => onChange({ bg_color: v })} />
      <label className="field">
        <span className="field-label">bg_opa (0-255)</span>
        <input type="number" className="field-input" min={0} max={255} value={el.bg_opa ?? 255} onChange={(e) => onChange({ bg_opa: parseInt(e.target.value) || 0 })} />
      </label>
      <label className="field">
        <span className="field-label">radius</span>
        <input type="number" className="field-input" value={el.radius || 0} onChange={(e) => onChange({ radius: parseInt(e.target.value) || 0 })} />
      </label>
    </div>
  );
}
