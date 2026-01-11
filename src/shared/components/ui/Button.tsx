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
    'inline-flex items-center justify-center rounded-md border text-[13px] font-medium tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--border)]'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover-bg)]',
    outline:
      'border-[color:var(--outline-border)] bg-[color:var(--outline-bg)] text-[color:var(--outline-fg)] hover:bg-[color:var(--outline-hover-bg)]',
    ghost: 'border-transparent bg-transparent text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]',
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
