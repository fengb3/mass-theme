import { useState } from 'react';
import { ElementTree } from './ElementTree';
import { PropertyEditor } from './PropertyEditor';
import { JsonEditor } from './JsonEditor';
import { useThemeStore } from '../store/theme-store';

export function Sidebar() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const [panel, setPanel] = useState<'tree' | 'json'>('tree');

  const page = theme?.pages[activePage];
  const elementCount = page?.elements?.length || 0;
  const imageCount = page?.image_assets?.length || 0;
  const fontCount = page?.font_assets?.length || 0;

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${panel === 'tree' ? 'active' : ''}`}
          onClick={() => setPanel('tree')}
        >
          元素 ({elementCount})
        </button>
        <button
          className={`sidebar-tab ${panel === 'json' ? 'active' : ''}`}
          onClick={() => setPanel('json')}
        >
          JSON
        </button>
      </div>

      <div className="sidebar-content">
        {panel === 'tree' && (
          <>
            <ElementTree />
            <div className="sidebar-info">
              图片: {imageCount} | 字体: {fontCount}
            </div>
            <PropertyEditor />
          </>
        )}
        {panel === 'json' && <JsonEditor />}
      </div>
    </div>
  );
}
