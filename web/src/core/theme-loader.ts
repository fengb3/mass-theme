import type { Theme, ThemePage, PageName } from '../types/theme';
import { PAGE_NAMES, PAGE_FILE_MAP } from '../types/theme';
import { parseThemePage, extractThemeName } from './parser';

export async function loadThemeFromURL(basePath: string, themeName: string): Promise<Theme> {
  const pages: Partial<Record<PageName, ThemePage>> = {};

  const results = await Promise.allSettled(
    PAGE_NAMES.map(async (pageName) => {
      const fileName = PAGE_FILE_MAP[pageName];
      const resp = await fetch(`${basePath}/${themeName}/${fileName}`);
      if (resp.ok) {
        const text = await resp.text();
        return { pageName, page: parseThemePage(text) };
      }
      throw new Error(`Failed to load ${fileName}`);
    })
  );

  let detectedName = themeName;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      pages[result.value.pageName] = result.value.page;
      detectedName = extractThemeName(result.value.page);
    }
  }

  return { name: detectedName, pages };
}

export async function loadThemeFromFiles(files: File[]): Promise<Theme> {
  const pages: Partial<Record<PageName, ThemePage>> = {};
  let detectedName = 'uploaded';

  for (const file of files) {
    const match = file.name.match(/^(.+)_style\.json$/);
    if (!match) continue;
    const pageKey = match[1] + '_style' as PageName;
    if (!PAGE_NAMES.includes(pageKey as PageName)) continue;
    const text = await file.text();
    const page = parseThemePage(text);
    pages[pageKey as PageName] = page;
    detectedName = extractThemeName(page);
  }

  return { name: detectedName, pages };
}

export async function loadThemeFromDirectoryHandle(dirHandle: FileSystemDirectoryHandle): Promise<Theme> {
  const pages: Partial<Record<PageName, ThemePage>> = {};
  let detectedName = dirHandle.name;

  for (const pageName of PAGE_NAMES) {
    const fileName = PAGE_FILE_MAP[pageName];
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      pages[pageName] = parseThemePage(text);
      detectedName = extractThemeName(pages[pageName]!);
    } catch {
      // file not found, skip
    }
  }

  return { name: detectedName, pages };
}
