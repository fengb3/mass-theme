import { useThemeStore } from '../store/theme-store';

export function OverlayToggles() {
  const overlayState = useThemeStore((s) => s.overlayState);
  const toggleOverlay = useThemeStore((s) => s.toggleOverlay);

  const toggles: Array<{ key: keyof typeof overlayState; label: string }> = [
    { key: 'volume', label: 'VOL' },
    { key: 'light', label: 'LGT' },
    { key: 'muted_icon', label: 'MUTED' },
    { key: 'muted_msg', label: 'MUTED MSG' },
  ];

  return (
    <>
      {toggles.map(({ key, label }) => (
        <button
          key={key}
          className={`overlay-toggle ${overlayState[key] ? 'active' : ''}`}
          onClick={() => toggleOverlay(key)}
          title={`显示/隐藏 ${label} 元素`}
        >
          {label}
        </button>
      ))}
    </>
  );
}
