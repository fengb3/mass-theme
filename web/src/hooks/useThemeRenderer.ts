import { useEffect, useRef, useCallback } from 'react';
import { renderPage } from '../core/renderer';
import { formatCurrentTime, formatCurrentWeek } from '../utils/font';
import { useThemeStore } from '../store/theme-store';
import type { ThemeElement } from '../types/theme';

export function useThemeRenderer(frameRef: React.RefObject<HTMLDivElement | null>) {
  const theme = useThemeStore((s) => s.theme);
  const activePage = useThemeStore((s) => s.activePage);
  const selectedElementName = useThemeStore((s) => s.selectedElementName);
  const selectElement = useThemeStore((s) => s.selectElement);
  const overlayState = useThemeStore((s) => s.overlayState);
  const timerRef = useRef<number | null>(null);

  const onElementClick = useCallback(
    (el: ThemeElement) => {
      selectElement(el.name);
    },
    [selectElement]
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !theme) return;
    const page = theme.pages[activePage];
    if (!page) return;

    renderPage(frame, page, {
      selectedElement: selectedElementName,
      onElementClick,
    });

    // Update overlay visibility
    frame.querySelectorAll('.theme-element').forEach((el) => {
      const name = (el.dataset.name || '').toLowerCase();
      if (name.startsWith('volume') || (name === 'homebg_blur' && overlayState.volume && !overlayState.light)) {
        (el as HTMLElement).style.display = overlayState.volume ? '' : 'none';
      }
      if (name.startsWith('light')) {
        (el as HTMLElement).style.display = overlayState.light ? '' : 'none';
      }
      if (name === 'homebg_blur') {
        (el as HTMLElement).style.display = overlayState.volume || overlayState.light ? '' : 'none';
      }
      if (name === 'muted_icon') {
        (el as HTMLElement).style.display = overlayState.muted_icon ? '' : 'none';
      }
      if (name === 'muted_msg') {
        (el as HTMLElement).style.display = overlayState.muted_msg ? '' : 'none';
      }
    });

    // Live clock updater
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      if (!frameRef.current) return;
      frameRef.current.querySelectorAll('.live-time').forEach((el) => {
        el.textContent = formatCurrentTime();
      });
      frameRef.current.querySelectorAll('.live-week').forEach((el) => {
        el.textContent = formatCurrentWeek();
      });
    };
    tick();
    timerRef.current = window.setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [theme, activePage, selectedElementName, overlayState, onElementClick, frameRef]);
}
