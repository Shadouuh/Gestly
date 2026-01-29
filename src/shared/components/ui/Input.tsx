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
        'h-9 w-full rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] px-3 text-[13px] tracking-tight text-[color:var(--text)] outline-none transition-all duration-200',
        'placeholder:text-[color:var(--muted)] focus:border-[color:var(--text)] focus:ring-1 focus:ring-[color:var(--text)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
})
