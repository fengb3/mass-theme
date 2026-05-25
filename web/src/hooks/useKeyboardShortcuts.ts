import { useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';

export function useKeyboardShortcuts() {
  const undo = useThemeStore((s) => s.undo);
  const redo = useThemeStore((s) => s.redo);
  const deleteElement = useThemeStore((s) => s.deleteElement);
  const selectedElementName = useThemeStore((s) => s.selectedElementName);
  const activePage = useThemeStore((s) => s.activePage);
  const updateElement = useThemeStore((s) => s.updateElement);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementName) {
          e.preventDefault();
          deleteElement(activePage, selectedElementName);
        }
      } else if (e.key.startsWith('Arrow') && selectedElementName) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const changes: Record<string, number> = {};
        if (e.key === 'ArrowLeft') changes.offset_x = -delta;
        if (e.key === 'ArrowRight') changes.offset_x = delta;
        if (e.key === 'ArrowUp') changes.offset_y = -delta;
        if (e.key === 'ArrowDown') changes.offset_y = delta;
        if (Object.keys(changes).length > 0) {
          updateElement(activePage, selectedElementName, changes as any);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteElement, selectedElementName, activePage, updateElement]);
}
