import type { LabelHTMLAttributes } from 'react'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className = '', ...props }: LabelProps) {
  return (
    <label className={['text-[13px] font-medium tracking-tight text-[color:var(--text)]', className].join(' ')} {...props} />
  )
}
