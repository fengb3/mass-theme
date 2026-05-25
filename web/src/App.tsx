import { Toolbar } from './components/Toolbar';
import { PageTabs } from './components/PageTabs';
import { PreviewFrame } from './components/PreviewFrame';
import { Sidebar } from './components/Sidebar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileIO } from './hooks/useFileIO';
import { useThemeStore } from './store/theme-store';
import { useEffect } from 'react';

export default function App() {
  useKeyboardShortcuts();
  const { loadSampleTheme } = useFileIO();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (!theme) {
      loadSampleTheme('dark').catch(() => {});
    }
  }, []);

  return (
    <div className="app">
      <Toolbar />
      <PageTabs />
      <div className="main">
        <Sidebar />
        <PreviewFrame />
      </div>
    </div>
  );
}
