import { useThemeStore } from '../store/theme-store';
import type { PageName } from '../types/theme';
import { PAGE_NAMES, PAGE_LABELS } from '../types/theme';
import { OverlayToggles } from './OverlayToggles';

export function PageTabs() {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const setActivePage = useThemeStore((s) => s.setActivePage);

  return (
    <div className="page-tabs">
      {PAGE_NAMES.map((pageName) => {
        const hasPage = !!theme?.pages[pageName];
        return (
          <button
            key={pageName}
            className={`page-tab ${activePage === pageName ? 'active' : ''}`}
            disabled={!hasPage}
            onClick={() => setActivePage(pageName)}
            style={{ opacity: hasPage ? 1 : 0.35 }}
          >
            {PAGE_LABELS[pageName]}
          </button>
        );
      })}
      {activePage === 'home_page_style' && <OverlayToggles />}
    </div>
  );
}
