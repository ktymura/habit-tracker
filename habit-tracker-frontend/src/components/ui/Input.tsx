import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function Input({ className, label, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
      ) : null}
      <input
        className={cn(
          'w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]',
          className,
        )}
        {...props}
      />
    </label>
  )
}
