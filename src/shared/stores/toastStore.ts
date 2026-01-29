import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  message: string
  type: ToastType
  duration?: number
}

type ToastState = {
  toast: ToastItem | null
  showToast: (message: string, type?: ToastType, duration?: number) => void
  dismissToast: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toast: null,
  showToast: (message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    // Dismiss existing first to trigger exit animation if needed, 
    // but for "one only", replacing it immediately is snappier.
    set({ toast: { id, message, type, duration } })

    if (duration > 0) {
      setTimeout(() => {
        const current = get().toast
        if (current?.id === id) {
          set({ toast: null })
        }
      }, duration)
    }
  },
  dismissToast: () => set({ toast: null }),
}))

