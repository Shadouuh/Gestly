import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  const base =
    'inline-flex items-center justify-center rounded-[var(--radius)] border text-[13px] font-semibold tracking-tight outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--border)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 shadow-sm'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover-bg)] hover:shadow-md',
    outline:
      'border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)] hover:border-[color:var(--text)]',
    ghost: 'border-transparent bg-transparent text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)] shadow-none',
  }

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-2.5 text-[12px]',
    md: 'h-9 px-3 text-[13px]',
    lg: 'h-10 px-4 text-[14px]',
  }

  return (
    <button
      ref={ref}
      type={type}
      className={[base, variants[variant], sizes[size], className].join(' ')}
      {...props}
    />
  )
})
