import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg shadow-slate-900/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
