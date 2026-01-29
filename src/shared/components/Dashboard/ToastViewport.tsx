import { useEffect, useState } from 'react'
import { Check, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { useToastStore, type ToastItem } from '@shared/stores/toastStore'

const typeStyles = {
  success: {
    icon: Check,
    bg: 'bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-600/20',
    shadow: 'shadow-emerald-500/20'
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-600/20',
    shadow: 'shadow-red-500/20'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-600/20',
    shadow: 'shadow-amber-500/20'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600/20',
    shadow: 'shadow-blue-500/20'
  },
}

export function ToastViewport() {
  const storeToast = useToastStore((s) => s.toast)
  const dismissToast = useToastStore((s) => s.dismissToast)
  
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (storeToast) {
      setActiveToast(storeToast)
      setIsExiting(false)
    } else {
      setIsExiting(true)
      const timer = setTimeout(() => setActiveToast(null), 500)
      return () => clearTimeout(timer)
    }
  }, [storeToast])

  if (!activeToast) return null

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-end pointer-events-none perspective-[1000px]">
      <ToastContent 
        key={activeToast.id} 
        toast={activeToast} 
        dismiss={dismissToast}
        isExiting={isExiting} 
      />
    </div>
  )
}

function ToastContent({ toast, dismiss, isExiting }: { toast: ToastItem, dismiss: () => void, isExiting: boolean }) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    // Trigger animation in
    const raf = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const style = typeStyles[toast.type || 'info']
  const Icon = style.icon
  
  // Logic: visible if mounted AND not exiting
  const isVisible = isMounted && !isExiting

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 pl-2 pr-4 py-2 rounded-full backdrop-blur-xl 
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isVisible 
          ? 'translate-y-0 opacity-100 scale-100 rotate-x-0' 
          : 'translate-y-24 opacity-0 scale-50 rotate-x-90'}
        bg-[color:var(--card-bg)] border border-[color:var(--border)]
        shadow-2xl ${style.shadow} ring-1 ring-black/5
      `}
    >
      <div className={`
        p-2 rounded-full ${style.bg} ${style.text} shadow-sm 
        transition-transform duration-700 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isVisible ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}
      `}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      
      <div className="flex flex-col">
        <p className="text-[13px] font-bold text-[color:var(--text)] leading-none">
          {toast.type === 'success' ? '¡Listo!' : toast.type === 'error' ? 'Error' : 'Info'}
        </p>
        <p className="text-[12px] font-medium text-[color:var(--muted)] leading-tight mt-0.5">
          {toast.message}
        </p>
      </div>

      <button 
        onClick={() => dismiss()}
        className="ml-2 p-1.5 rounded-full hover:bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
