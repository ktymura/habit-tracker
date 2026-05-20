import { type FormEvent, useEffect, useState } from 'react'

import { Button, Card, Input, Modal } from '../../components/ui'
import {
  createHabit,
  listHabits,
  toggleHabitToday,
} from '../../services/habits/habits-service'
import type { Habit, HabitFrequency, HabitTone } from '../../types/habit'

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

const iconOptions = ['W', 'R', 'S', 'M', 'F', 'B']

function HabitSkeletonList() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:items-center sm:px-5"
        >
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-[var(--color-surface-strong)]" />
            <span className="h-4 w-36 rounded bg-[var(--color-surface-strong)]" />
          </div>
          <span className="h-4 w-20 rounded bg-[var(--color-surface-strong)]" />
          <span className="h-9 w-28 rounded-lg bg-[var(--color-surface-strong)]" />
        </div>
      ))}
    </div>
  )
}

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitName, setHabitName] = useState('')
  const [habitTone, setHabitTone] = useState<HabitTone>('sage')
  const [habitFrequency, setHabitFrequency] =
    useState<HabitFrequency>('daily')
  const [habitIcon, setHabitIcon] = useState('W')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingHabitIds, setPendingHabitIds] = useState<string[]>([])

  useEffect(() => {
    async function loadHabits() {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const response = await listHabits()
        setHabits(response)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to load habits.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadHabits()
  }, [])

  async function handleCreateHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!habitName.trim()) {
      setFormError('Habit name is required.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)
      const newHabit = await createHabit({
        frequency: habitFrequency,
        icon: habitIcon,
        name: habitName,
        tone: habitTone,
      })
      setHabits((currentHabits) => [newHabit, ...currentHabits])
      setHabitName('')
      setHabitTone('sage')
      setHabitFrequency('daily')
      setHabitIcon('W')
      setIsModalOpen(false)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to add habit.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleHabit(habit: Habit) {
    const nextCompletedState = !habit.completedToday
    const previousHabits = habits

    setPendingHabitIds((currentIds) => [...currentIds, habit.id])
    setHabits((currentHabits) =>
      currentHabits.map((currentHabit) =>
        currentHabit.id === habit.id
          ? { ...currentHabit, completedToday: nextCompletedState }
          : currentHabit,
      ),
    )

    try {
      await toggleHabitToday(habit.id, nextCompletedState)
    } catch (error) {
      setHabits(previousHabits)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update habit completion.',
      )
    } finally {
      setPendingHabitIds((currentIds) =>
        currentIds.filter((habitId) => habitId !== habit.id),
      )
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <section className="space-y-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-accent-strong)]">
                Habits
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                Today
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                Check off today&apos;s routines and add the next one when it
                belongs here.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add habit</Button>
          </header>

          {errorMessage ? (
            <Card className="border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
              {errorMessage}
            </Card>
          ) : null}

          <Card className="p-0">
            {isLoading ? (
              <HabitSkeletonList />
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  No habits yet. Add the first routine to start tracking today.
                </p>
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                  Add first habit
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {habits.map((habit) => (
                  <article
                    key={habit.id}
                    className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:items-center sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`habit-tone-${habit.tone} flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--habit-bg)] text-sm font-semibold text-[var(--habit-dot)]`}
                        aria-hidden="true"
                      >
                        {habit.icon}
                      </span>
                      <h3 className="truncate font-medium">{habit.name}</h3>
                    </div>

                    <span className="capitalize text-sm text-[var(--color-text-muted)]">
                      {habit.frequency}
                    </span>

                    <label className="flex w-fit items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                      <input
                        checked={habit.completedToday}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                        disabled={pendingHabitIds.includes(habit.id)}
                        type="checkbox"
                        onChange={() => void handleToggleHabit(habit)}
                      />
                      Done today
                    </label>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      <Modal
        description="Name it, choose an icon, color, and frequency."
        isOpen={isModalOpen}
        title="Add habit"
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleCreateHabit}>
          <Input
            error={formError ?? undefined}
            label="Name"
            placeholder="e.g. Meditation"
            value={habitName}
            onChange={(event) => {
              setHabitName(event.target.value)
              setFormError(null)
            }}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--color-text-muted)]">
              Icon
            </legend>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-pressed={icon === habitIcon}
                  className={`rounded-lg border py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                    icon === habitIcon
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                  onClick={() => setHabitIcon(icon)}
                >
                  {icon}
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
                    className={`habit-tone-${option.tone} flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                      isSelected
                        ? 'border-[var(--habit-border)] bg-[var(--habit-bg)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                    onClick={() => setHabitTone(option.tone)}
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
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                    option.value === habitFrequency
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                  onClick={() => setHabitFrequency(option.value)}
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
        </form>
      </Modal>
    </main>
  )
}
