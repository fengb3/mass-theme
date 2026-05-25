import { useThemeStore } from '../store/theme-store';
import type { ThemeElement } from '../types/theme';
import { LabelEditor } from './editors/LabelEditor';
import { BarEditor } from './editors/BarEditor';
import { SliderEditor } from './editors/SliderEditor';
import { ArcEditor } from './editors/ArcEditor';
import { ImageButtonEditor } from './editors/ImageButtonEditor';
import { ContainerEditor } from './editors/ContainerEditor';
import { ClockEditor } from './editors/ClockEditor';
import { ImageEditor } from './editors/ImageEditor';
import { MjpegEditor } from './editors/MjpegEditor';
import { ClockStripEditor } from './editors/ClockStripEditor';

export function PropertyEditor() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const selectedElementName = useThemeStore((s) => s.selectedElementName);
  const updateElement = useThemeStore((s) => s.updateElement);

  const page = theme?.pages[activePage];
  if (!page || !selectedElementName) {
    return (
      <div className="property-editor">
        <div className="property-empty">选择一个元素以编辑属性</div>
      </div>
    );
  }

  const el = page.elements.find((e) => e.name === selectedElementName);
  if (!el) {
    return (
      <div className="property-editor">
        <div className="property-empty">元素未找到</div>
      </div>
    );
  }

  const handleChange = (changes: Partial<ThemeElement>) => {
    updateElement(activePage, selectedElementName, changes);
  };

  return (
    <div className="property-editor">
      <div className="property-header">
        <span className="el-type-badge">{el.type}</span>
        <span className="el-name-badge">{el.name}</span>
      </div>

      <div className="property-section">
        <div className="property-section-title">通用属性</div>
        <label className="field">
          <span className="field-label">name</span>
          <input
            type="text"
            className="field-input"
            value={el.name}
            onChange={(e) => handleChange({ name: e.target.value } as any)}
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">x</span>
            <input
              type="number"
              className="field-input"
              value={el.offset_x ?? 0}
              onChange={(e) => handleChange({ offset_x: parseInt(e.target.value) || 0 })}
            />
          </label>
          <label className="field">
            <span className="field-label">y</span>
            <input
              type="number"
              className="field-input"
              value={el.offset_y ?? 0}
              onChange={(e) => handleChange({ offset_y: parseInt(e.target.value) || 0 })}
            />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span className="field-label">width</span>
            <input
              type="number"
              className="field-input"
              value={typeof el.width === 'number' ? el.width : ''}
              placeholder={typeof el.width === 'string' ? el.width : 'auto'}
              onChange={(e) => handleChange({ width: parseInt(e.target.value) || undefined })}
            />
          </label>
          <label className="field">
            <span className="field-label">height</span>
            <input
              type="number"
              className="field-input"
              value={typeof el.height === 'number' ? el.height : ''}
              placeholder={typeof el.height === 'string' ? el.height : 'auto'}
              onChange={(e) => handleChange({ height: parseInt(e.target.value) || undefined })}
            />
          </label>
        </div>
        <label className="field">
          <span className="field-label">layout_align</span>
          <select
            className="field-select"
            value={el.layout_align || 'TOP_LEFT'}
            onChange={(e) => handleChange({ layout_align: e.target.value as any })}
          >
            {['TOP_LEFT', 'TOP_MID', 'TOP_RIGHT', 'LEFT_MID', 'CENTER', 'RIGHT_MID', 'BOTTOM_LEFT', 'BOTTOM_MID', 'BOTTOM_RIGHT'].map(
              (v) => (
                <option key={v} value={v}>{v}</option>
              )
            )}
          </select>
        </label>
        {el.rotation !== undefined && (
          <label className="field">
            <span className="field-label">rotation (0.1deg)</span>
            <input
              type="number"
              className="field-input"
              value={el.rotation}
              onChange={(e) => handleChange({ rotation: parseInt(e.target.value) || 0 })}
            />
          </label>
        )}
      </div>

      {el.type === 'img' && <ImageEditor el={el} onChange={handleChange} />}
      {el.type === 'label' && <LabelEditor el={el} onChange={handleChange} />}
      {el.type === 'imgbtn' && <ImageButtonEditor el={el} onChange={handleChange} assets={page.image_assets} />}
      {el.type === 'bar' && <BarEditor el={el} onChange={handleChange} />}
      {el.type === 'slider' && <SliderEditor el={el} onChange={handleChange} />}
      {el.type === 'arc' && <ArcEditor el={el} onChange={handleChange} />}
      {el.type === 'clock' && <ClockEditor el={el} onChange={handleChange} />}
      {el.type === 'clock_strip' && <ClockStripEditor el={el} onChange={handleChange} />}
      {el.type === 'mjpeg' && <MjpegEditor el={el} onChange={handleChange} />}
      {el.type === 'container' && <ContainerEditor el={el} onChange={handleChange} assets={page.image_assets} />}
    </div>
  );
}
