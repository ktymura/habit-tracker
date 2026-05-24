import { type FormEvent, useState } from 'react'

import { Card } from '../../../components/ui'
import { saveNotificationSettings } from '../../../services/notifications/notifications-service'

export function ReminderSettings() {
  const [enabled, setEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSaving(true)
      setMessage(null)
      await saveNotificationSettings({ enabled, reminderTime })
      setMessage('Reminder settings saved.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save reminder settings.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-semibold">Reminder settings</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Configure the backend email reminder setting for this account.
        </p>
      </div>
      <form
        className="grid gap-3 sm:grid-cols-[1fr_160px_120px] sm:items-end"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
          <input
            checked={enabled}
            className="h-4 w-4 accent-[var(--color-accent)]"
            type="checkbox"
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Email reminders
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Time</span>
          <input
            className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
          />
        </label>
        <button
          className="h-10 cursor-pointer rounded-lg border border-transparent bg-[var(--color-accent)] px-3 text-sm font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">{message}</p>
      ) : null}
    </Card>
  )
}
