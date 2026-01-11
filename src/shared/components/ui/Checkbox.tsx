import type { InputHTMLAttributes } from 'react'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={[
        'h-4 w-4 rounded border border-[color:var(--outline-border)] bg-[color:var(--card-bg)] accent-[color:var(--primary-bg)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
