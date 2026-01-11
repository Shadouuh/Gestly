import type { SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={[
        'h-9 w-full rounded-md border border-[color:var(--outline-border)] bg-[color:var(--card-bg)] px-2.5 text-[13px] tracking-tight text-[color:var(--text)] outline-none',
        'focus:border-[color:var(--border)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
  )
}
