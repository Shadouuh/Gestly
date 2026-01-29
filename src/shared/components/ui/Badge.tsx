import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-bg)]/80",
    secondary: "border-transparent bg-[color:var(--secondary-bg)] text-[color:var(--secondary-fg)] hover:bg-[color:var(--secondary-bg)]/80",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
    outline: "text-[color:var(--text)] border-[color:var(--border)]",
    success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
    warning: "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
  }

  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ""}`} 
      {...props} 
    />
  )
}
