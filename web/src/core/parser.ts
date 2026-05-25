import type { ThemePage, Theme, PageName, PAGE_FILE_MAP } from '../types/theme';
import { PAGE_NAMES, PAGE_FILE_MAP as _PFM } from '../types/theme';

export function parseThemePage(json: string): ThemePage {
  const data = JSON.parse(json);
  return data as ThemePage;
}

export function serializeThemePage(page: ThemePage): string {
  return JSON.stringify(page, null, 4);
}

export function extractThemeName(page: ThemePage): string {
  for (const asset of page.image_assets || []) {
    const m = asset.src.match(/\/themes\/([^/]+)\//);
    if (m) return m[1];
  }
  for (const asset of page.font_assets || []) {
    const m = asset.src.match(/\/themes\/([^/]+)\//);
    if (m) return m[1];
  }
  return 'unknown';
}
