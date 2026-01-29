import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean) => void
  toggleSidebarCollapsed: () => void
  theme: 'light' | 'dark'
  setTheme: (value: 'light' | 'dark') => void
  toggleTheme: () => void
  themeId: ThemeId
  setThemeId: (value: ThemeId) => void
  isCartOpen: boolean
  setIsCartOpen: (value: boolean) => void
  toggleCartOpen: () => void
}

export type ThemeId =
  | 'default'
  | 'ocean'
  | 'mint'
  | 'sunset'
  | 'grape'
  | 'forest'
  | 'sand'
  | 'rose'
  | 'slate'
  | 'neon'
  | 'mono'

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      theme: 'light',
      setTheme: (value) => set({ theme: value }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      themeId: 'default',
      setThemeId: (value) => set({ themeId: value }),
      isCartOpen: false,
      setIsCartOpen: (value) => set({ isCartOpen: value }),
      toggleCartOpen: () => set({ isCartOpen: !get().isCartOpen }),
    }),
    { name: 'gestly-ui' },
  ),
)
