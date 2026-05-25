import { create } from 'zustand'
import type { ElementType } from '../types/theme'

export type DialogType = 'create-theme' | 'delete-theme' | 'add-element' | null

interface DialogState {
  type: DialogType
  data?: Record<string, unknown>
}

interface UIState {
  selectedElementId: string | null
  sidebarTab: 'pages' | 'assets'
  dialog: DialogState
  selectElement: (id: string | null) => void
  setSidebarTab: (tab: 'pages' | 'assets') => void
  openDialog: (type: DialogType, data?: Record<string, unknown>) => void
  closeDialog: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedElementId: null,
  sidebarTab: 'pages',
  dialog: { type: null },
  selectElement: (id) => set({ selectedElementId: id }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  openDialog: (type, data) => set({ dialog: { type, data } }),
  closeDialog: () => set({ dialog: { type: null } }),
}))
