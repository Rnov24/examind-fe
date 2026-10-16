import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  isInitialized: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  initSidebar: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: true,
  isInitialized: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  initSidebar: () => {
    if (typeof window !== 'undefined' && !get().isInitialized) {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches
      set({ sidebarOpen: isDesktop, isInitialized: true })
    }
  },
}))

