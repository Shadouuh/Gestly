"use client"

import { CheckCircle2, X } from "lucide-react"
import { useEffect, useState } from "react"

export type ToastType = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

type ToastNotificationProps = {
  toast: ToastType
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(toast.id), 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div
      className={`flex items-center gap-3 bg-card border border-border/50 rounded-2xl shadow-lg p-4 min-w-[300px] max-w-md ${
        isExiting ? "animate-slide-in-right opacity-0" : "animate-bounce-in"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={2} />
      </div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose(toast.id), 300)
        }}
        className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center shrink-0"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}
