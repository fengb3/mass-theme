import { useRef } from 'react';
import { useThemeRenderer } from '../hooks/useThemeRenderer';
import { useThemeStore } from '../store/theme-store';

export function PreviewFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const zoom = useThemeStore((s) => s.zoom);
  const theme = useThemeStore((s) => s.theme);

  useThemeRenderer(frameRef);

  const handleFrameClick = () => {
    useThemeStore.getState().selectElement(null);
  };

  if (!theme) {
    return (
      <div className="preview-area">
        <div className="preview-empty">
          <p>打开一个主题文件夹或拖放 JSON 文件开始编辑</p>
          <p className="hint">支持打开包含 *_page_style.json 的文件夹</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-area">
      <div className="preview-wrapper" style={{ transform: `scale(${zoom})` }}>
        <div
          className="preview-frame"
          ref={frameRef}
          onClick={handleFrameClick}
        />
        <div className="scale-info">480 x 480</div>
      </div>
    </div>
  );
}
