import JSZip from 'jszip';
import type { Theme, PageName } from '../types/theme';
import { PAGE_NAMES, PAGE_FILE_MAP } from '../types/theme';
import { serializeThemePage } from './parser';

export async function exportThemeAsZip(theme: Theme): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(theme.name)!;

  for (const pageName of PAGE_NAMES) {
    const page = theme.pages[pageName];
    if (!page) continue;
    const json = serializeThemePage(page);
    folder.file(PAGE_FILE_MAP[pageName], json);
  }

  for (const dir of ['home', 'music', 'clock', 'monitor', 'dock', 'fonts']) {
    folder.folder(dir);
  }

  return zip.generateAsync({ type: 'blob' });
}
