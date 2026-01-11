import { useToastStore } from '@shared/stores/toastStore'

const typeStyles: Record<string, string> = {
  success: 'border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--text)]',
  error: 'border-[color:var(--border)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]',
  info: 'border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--text)]',
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 flex w-[min(340px,calc(100vw-1.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={[
            'pointer-events-auto w-full rounded-md border px-3 py-2 text-left text-[13px] tracking-tight shadow-sm',
            typeStyles[t.type] ?? typeStyles.info,
          ].join(' ')}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
