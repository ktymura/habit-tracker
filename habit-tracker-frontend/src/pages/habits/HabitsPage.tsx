import { type FormEvent, useEffect, useState } from 'react'

import { Button, Card, Input, Spinner } from '../../components/ui'
import { createHabit, listHabits } from '../../services/habits/habits-service'
import type { Habit, HabitTone } from '../../types/habit'

const toneOptions: Array<{ label: string; tone: HabitTone }> = [
  { label: 'Sage', tone: 'sage' },
  { label: 'Ink', tone: 'ink' },
  { label: 'Clay', tone: 'clay' },
  { label: 'Rose', tone: 'rose' },
]

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitName, setHabitName] = useState('')
  const [habitTone, setHabitTone] = useState<HabitTone>('sage')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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

    try {
      setIsSaving(true)
      setErrorMessage(null)
      const newHabit = await createHabit({
        name: habitName,
        tone: habitTone,
      })
      setHabits((currentHabits) => [newHabit, ...currentHabits])
      setHabitName('')
      setHabitTone('sage')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to add habit.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          <header className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-accent-strong)]">
              Habits
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Today</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              A short list of routines you want to keep visible.
            </p>
          </header>

          {errorMessage ? (
            <Card className="border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
              {errorMessage}
            </Card>
          ) : null}

          <Card className="p-0">
            {isLoading ? (
              <div className="p-5">
                <Spinner label="Loading habits..." />
              </div>
            ) : habits.length === 0 ? (
              <div className="p-5">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No habits yet. Add the first one in the form.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {habits.map((habit) => (
                  <article
                    key={habit.id}
                    className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_140px_90px] sm:items-center sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`habit-tone-${habit.tone} h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--habit-dot)]`}
                        aria-hidden="true"
                      />
                      <h3 className="truncate font-medium">{habit.name}</h3>
                    </div>

                    <span className="text-sm text-[var(--color-text-muted)]">
                      {habit.frequency}
                    </span>

                    <span className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <span
                        className={`habit-tone-${habit.tone} h-2 w-2 rounded-full bg-[var(--habit-dot)]`}
                        aria-hidden="true"
                      />
                      Active
                    </span>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>

        <aside className="lg:pt-[7.5rem]">
          <Card>
            <div className="mb-5 space-y-1">
              <h3 className="text-lg font-semibold">Add habit</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Name it, choose a tone, keep the rest simple.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateHabit}>
              <Input
                label="Name"
                placeholder="e.g. Meditation"
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
              />

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

              <Button
                fullWidth
                isLoading={isSaving}
                loadingLabel="Saving..."
                type="submit"
              >
                Save habit
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </main>
  )
}
