import { useCallback } from 'react';
import { useThemeStore } from '../store/theme-store';
import { loadThemeFromDirectoryHandle, loadThemeFromURL } from '../core/theme-loader';

export function useFileIO() {
  const loadTheme = useThemeStore((s) => s.loadTheme);

  const openDirectory = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Try Chrome or Edge.');
      return;
    }
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const theme = await loadThemeFromDirectoryHandle(dirHandle);
      loadTheme(theme);
      return theme;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Failed to open directory:', e);
      }
    }
  }, [loadTheme]);

  const loadSampleTheme = useCallback(
    async (name: string) => {
      const theme = await loadThemeFromURL('/sample-themes', name);
      loadTheme(theme);
    },
    [loadTheme]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files: File[] = [];
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            files.push(e.dataTransfer.items[i].getAsFile()!);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          files.push(e.dataTransfer.files[i]);
        }
      }
      if (files.length === 0) return;
      const { loadThemeFromFiles } = await import('../core/theme-loader');
      const theme = await loadThemeFromFiles(files);
      loadTheme(theme);
    },
    [loadTheme]
  );

  return { openDirectory, loadSampleTheme, handleDrop };
}
