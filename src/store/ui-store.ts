import { create } from 'zustand'

interface UIState {
  selectedElementId: string | null
  sidebarTab: 'pages' | 'assets'
  selectElement: (id: string | null) => void
  setSidebarTab: (tab: 'pages' | 'assets') => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedElementId: null,
  sidebarTab: 'pages',
  selectElement: (id) => set({ selectedElementId: id }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
