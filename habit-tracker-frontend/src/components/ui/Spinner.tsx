import { cn } from '../../lib/cn'

type SpinnerProps = {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2 text-sm', className)}
      role="status"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      <span className="text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}
