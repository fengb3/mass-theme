import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Theme, ThemePage, ThemeElement, PageName } from '../types/theme';

interface ThemeState {
  theme: Theme | null;
  activePage: PageName;
  selectedElementName: string | null;
  zoom: number;
  overlayState: {
    volume: boolean;
    light: boolean;
    muted_icon: boolean;
    muted_msg: boolean;
  };
  history: Array<{ page: PageName; data: ThemePage }>;
  historyIndex: number;

  loadTheme: (theme: Theme) => void;
  setActivePage: (page: PageName) => void;
  selectElement: (name: string | null) => void;
  updateElement: (pageName: PageName, elementName: string, changes: Partial<ThemeElement>) => void;
  deleteElement: (pageName: PageName, elementName: string) => void;
  addElement: (pageName: PageName, element: ThemeElement, index?: number) => void;
  updatePageJson: (pageName: PageName, data: ThemePage) => void;
  toggleOverlay: (key: keyof ThemeState['overlayState']) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
}

export const useThemeStore = create<ThemeState>()(
  immer((set, get) => ({
    theme: null,
    activePage: 'home_page_style',
    selectedElementName: null,
    zoom: 1,
    overlayState: { volume: false, light: false, muted_icon: false, muted_msg: false },
    history: [],
    historyIndex: -1,

    loadTheme: (theme) =>
      set((state) => {
        state.theme = theme;
        state.selectedElementName = null;
        state.history = [];
        state.historyIndex = -1;
        state.overlayState = { volume: false, light: false, muted_icon: false, muted_msg: false };
        // Activate first available page
        for (const p of ['home_page_style', 'music_page_style', 'clock_page_style', 'clock_timeup_style', 'monitor_page_style', 'key_page_style', 'dock_style'] as PageName[]) {
          if (theme.pages[p]) {
            state.activePage = p;
            break;
          }
        }
      }),

    setActivePage: (page) =>
      set((state) => {
        state.activePage = page;
        state.selectedElementName = null;
        state.overlayState = { volume: false, light: false, muted_icon: false, muted_msg: false };
      }),

    selectElement: (name) => set({ selectedElementName: name }),

    updateElement: (pageName, elementName, changes) =>
      set((state) => {
        const page = state.theme?.pages[pageName];
        if (!page) return;
        const idx = page.elements.findIndex((el) => el.name === elementName);
        if (idx === -1) return;

        // Push to history
        const snapshot = JSON.parse(JSON.stringify(page)) as ThemePage;
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ page: pageName, data: snapshot });
        state.historyIndex = state.history.length - 1;

        // Apply changes
        Object.assign(page.elements[idx], changes);
      }),

    deleteElement: (pageName, elementName) =>
      set((state) => {
        const page = state.theme?.pages[pageName];
        if (!page) return;
        const idx = page.elements.findIndex((el) => el.name === elementName);
        if (idx === -1) return;

        const snapshot = JSON.parse(JSON.stringify(page)) as ThemePage;
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ page: pageName, data: snapshot });
        state.historyIndex = state.history.length - 1;

        page.elements.splice(idx, 1);
        if (state.selectedElementName === elementName) state.selectedElementName = null;
      }),

    addElement: (pageName, element, index) =>
      set((state) => {
        const page = state.theme?.pages[pageName];
        if (!page) return;

        const snapshot = JSON.parse(JSON.stringify(page)) as ThemePage;
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ page: pageName, data: snapshot });
        state.historyIndex = state.history.length - 1;

        if (index !== undefined) {
          page.elements.splice(index, 0, element);
        } else {
          page.elements.push(element);
        }
      }),

    updatePageJson: (pageName, data) =>
      set((state) => {
        if (!state.theme) return;
        const oldData = state.theme.pages[pageName];
        if (oldData) {
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push({ page: pageName, data: JSON.parse(JSON.stringify(oldData)) });
          state.historyIndex = state.history.length - 1;
        }
        state.theme.pages[pageName] = data;
      }),

    toggleOverlay: (key) =>
      set((state) => {
        state.overlayState[key] = !state.overlayState[key];
      }),

    setZoom: (zoom) => set({ zoom: Math.max(0.3, Math.min(3, zoom)) }),

    undo: () =>
      set((state) => {
        if (state.historyIndex < 0) return;
        const entry = state.history[state.historyIndex];
        if (!entry || !state.theme) return;
        state.theme.pages[entry.page] = JSON.parse(JSON.stringify(entry.data));
        state.historyIndex--;
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return;
        const entry = state.history[state.historyIndex + 1];
        if (!entry || !state.theme) return;
        state.theme.pages[entry.page] = JSON.parse(JSON.stringify(entry.data));
        state.historyIndex++;
      }),
  }))
);
