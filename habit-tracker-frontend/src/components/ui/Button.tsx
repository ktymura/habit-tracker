import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/20 hover:bg-[var(--color-accent-strong)]',
  secondary:
    'bg-[var(--color-surface-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-stronger)]',
  ghost: 'bg-transparent text-[var(--color-accent)] hover:bg-white/70',
}

export function Button({
  children,
  className,
  fullWidth = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
        fullWidth && 'w-full',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
