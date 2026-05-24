import type { FormEvent } from 'react'

import { Button, Input, Modal } from '../../../components/ui'
import type { Habit, HabitFrequency, HabitTone } from '../../../types/habit'

const toneOptions: Array<{ label: string; tone: HabitTone }> = [
  { label: 'Sage', tone: 'sage' },
  { label: 'Ink', tone: 'ink' },
  { label: 'Clay', tone: 'clay' },
  { label: 'Rose', tone: 'rose' },
]

const frequencyOptions: Array<{ label: string; value: HabitFrequency }> = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekly', value: 'weekly' },
]

const iconOptions = [
  '🧘',
  '🏃',
  '📖',
  '💧',
  '💪',
  '💊',
  '☕',
  '📝',
  '🌱',
  '🎯',
  '🛌',
  '🍎',
]

type HabitFormModalProps = {
  editingHabit: Habit | null
  formError: string | null
  habitFrequency: HabitFrequency
  habitIcon: string
  habitName: string
  habitTone: HabitTone
  isDeleting: boolean
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onDelete: () => void
  onFrequencyChange: (frequency: HabitFrequency) => void
  onIconChange: (icon: string) => void
  onNameChange: (name: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onToneChange: (tone: HabitTone) => void
}

export function HabitFormModal({
  editingHabit,
  formError,
  habitFrequency,
  habitIcon,
  habitName,
  habitTone,
  isDeleting,
  isOpen,
  isSaving,
  onClose,
  onDelete,
  onFrequencyChange,
  onIconChange,
  onNameChange,
  onSubmit,
  onToneChange,
}: HabitFormModalProps) {
  return (
    <Modal
      description="Name it, choose an icon, color, and frequency."
      isOpen={isOpen}
      title={editingHabit ? 'Edit habit' : 'Add habit'}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          error={formError ?? undefined}
          label="Name"
          placeholder="e.g. Meditation"
          value={habitName}
          onChange={(event) => onNameChange(event.target.value)}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--color-text-muted)]">
            Icon
          </legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                aria-pressed={icon === habitIcon}
                className={`flex aspect-square min-h-14 cursor-pointer items-center justify-center rounded-lg border text-4xl leading-none font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                  icon === habitIcon
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
                }`}
                onClick={() => onIconChange(icon)}
              >
                <span className="text-4xl leading-none">{icon}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--color-text-muted)]">
            Color
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {toneOptions.map((option) => {
              const isSelected = option.tone === habitTone

              return (
                <button
                  key={option.tone}
                  type="button"
                  aria-pressed={isSelected}
                  className={`habit-tone-${option.tone} flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                    isSelected
                      ? 'border-[var(--habit-border)] bg-[var(--habit-bg)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                  onClick={() => onToneChange(option.tone)}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-[var(--habit-dot)]"
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--color-text-muted)]">
            Frequency
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === habitFrequency}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                  option.value === habitFrequency
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
                }`}
                onClick={() => onFrequencyChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <Button
          fullWidth
          isLoading={isSaving}
          loadingLabel="Saving..."
          type="submit"
        >
          Save habit
        </Button>

        {editingHabit ? (
          <button
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-3.5 py-2 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isSaving || isDeleting}
            type="button"
            onClick={onDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete habit'}
          </button>
        ) : null}
      </form>
    </Modal>
  )
}
