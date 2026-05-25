import { useThemeStore } from '../store/theme-store';
import { useFileIO } from '../hooks/useFileIO';
import { exportThemeAsZip } from '../core/theme-exporter';
import { useState, useRef } from 'react';
import type { PageName } from '../types/theme';
import { PAGE_NAMES, PAGE_LABELS } from '../types/theme';

export function Toolbar() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const setActivePage = useThemeStore((s) => s.setActivePage);
  const undo = useThemeStore((s) => s.undo);
  const redo = useThemeStore((s) => s.redo);
  const zoom = useThemeStore((s) => s.zoom);
  const setZoom = useThemeStore((s) => s.setZoom);
  const { openDirectory, loadSampleTheme, handleDrop } = useFileIO();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!theme) return;
    setExporting(true);
    try {
      const blob = await exportThemeAsZip(theme);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${theme.name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="toolbar"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h1 className="toolbar-title">MWKEYS Theme Editor</h1>

      <div className="toolbar-group">
        <button onClick={openDirectory} title="打开主题文件夹">
          打开文件夹
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="拖放 JSON 文件或点击选择"
        >
          导入文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            const { loadThemeFromFiles } = await import('../core/theme-loader');
            const t = await loadThemeFromFiles(files);
            useThemeStore.getState().loadTheme(t);
          }}
        />
      </div>

      <div className="toolbar-group">
        <button onClick={undo} disabled={!theme} title="撤销 (Ctrl+Z)">
          ↩ 撤销
        </button>
        <button onClick={redo} disabled={!theme} title="重做 (Ctrl+Shift+Z)">
          ↪ 重做
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={handleExport} disabled={!theme || exporting}>
          {exporting ? '导出中...' : '导出 ZIP'}
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => setZoom(zoom - 0.2)}>-</button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.2)}>+</button>
      </div>

      {theme && (
        <div className="toolbar-group">
          <span className="theme-name">{theme.name}</span>
        </div>
      )}
    </div>
  );
}
