import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  helperText?: string
  label?: string
}

export function Input({
  className,
  error,
  helperText,
  label,
  ...props
}: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
        </span>
      ) : null}
      <input
        className={cn(
          'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]',
          error &&
            'border-[var(--color-danger)] focus:border-[var(--color-danger)]',
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">
          {error}
        </span>
      ) : helperText ? (
        <span className="block text-xs text-[var(--color-text-soft)]">
          {helperText}
        </span>
      ) : null}
    </label>
  )
}
