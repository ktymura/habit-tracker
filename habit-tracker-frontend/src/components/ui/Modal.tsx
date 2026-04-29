import type { ReactNode } from 'react'

import { Button } from './Button'
import { Card } from './Card'

type ModalProps = {
  children: ReactNode
  description?: string
  isOpen: boolean
  onClose: () => void
  title: string
}

export function Modal({
  children,
  description,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              {title}
            </h3>
            {description ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <Button aria-label="Zamknij modal" variant="ghost" onClick={onClose}>
            Zamknij
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </Card>
    </div>
  )
}
