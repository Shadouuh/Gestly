import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={[
        'h-9 w-full rounded-md border border-[color:var(--outline-border)] bg-[color:var(--card-bg)] px-2.5 text-[13px] tracking-tight text-[color:var(--text)] outline-none',
        'placeholder:text-[color:var(--muted)] focus:border-[color:var(--border)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
})
