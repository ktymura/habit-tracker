type ToastTone = 'danger' | 'success'

type ToastProps = {
  message: string
  tone?: ToastTone
}

export function Toast({ message, tone = 'success' }: ToastProps) {
  return (
    <div
      className={`toast-enter fixed bottom-4 left-4 right-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-[var(--shadow-panel)] sm:left-auto sm:right-6 sm:w-80 ${
        tone === 'success'
          ? 'border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)]'
          : 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
      }`}
      role="status"
    >
      {message}
    </div>
  )
}
