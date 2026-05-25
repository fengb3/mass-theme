import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';
import { serializeThemePage, parseThemePage } from '../core/parser';

export function JsonEditor() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const updatePageJson = useThemeStore((s) => s.updatePageJson);

  const page = theme?.pages[activePage];
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (page) {
      setText(serializeThemePage(page));
      setError('');
    }
  }, [page, activePage]);

  if (!page) return null;

  const apply = () => {
    try {
      const data = parseThemePage(text);
      updatePageJson(activePage, data);
      setError('');
    } catch (e: any) {
      setError('JSON 解析错误: ' + e.message);
    }
  };

  return (
    <div className="json-editor">
      <div className="json-editor-header">
        <span>JSON 编辑 (Ctrl+S 应用)</span>
        <button onClick={apply}>应用更改</button>
      </div>
      <textarea
        className="json-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            apply();
          }
        }}
      />
      {error && <div className="error-bar">{error}</div>}
    </div>
  );
}
