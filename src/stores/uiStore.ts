import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  isInitialized: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  initSidebar: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  isInitialized: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  initSidebar: () => {
    if (typeof window !== 'undefined' && !get().isInitialized) {
      set({ sidebarOpen: false, isInitialized: true })
    }
  },
}))

