import { useThemeStore } from '../store/theme-store';

export function ElementTree() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const selectedElementName = useThemeStore((s) => s.selectedElementName);
  const selectElement = useThemeStore((s) => s.selectElement);

  const page = theme?.pages[activePage];
  if (!page) return <div className="element-tree">无页面数据</div>;

  const elements = page.elements || [];
  if (elements.length === 0) return <div className="element-tree">无元素</div>;

  return (
    <div className="element-tree">
      {elements.map((el, idx) => (
        <div
          key={el.name || idx}
          className={`element-tree-item ${selectedElementName === el.name ? 'selected' : ''}`}
          onClick={() => selectElement(el.name)}
        >
          <span className="el-type">{el.type}</span>
          <span className="el-name">{el.name}</span>
          {el.width && el.height && typeof el.width === 'number' && (
            <span className="el-size">{el.width}x{el.height}</span>
          )}
        </div>
      ))}
    </div>
  );
}
