import { useEffect, useState } from 'react'

import { Button, Card, Input, Modal, Spinner } from '../../components/ui'
import { createHabit, listHabits } from '../../services/habits/habits-service'
import type { Habit } from '../../types/habit'

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [habitColor, setHabitColor] = useState('')
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
          error instanceof Error
            ? error.message
            : 'Nie udalo sie pobrac nawykow.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadHabits()
  }, [])

  async function handleCreateHabit() {
    try {
      setIsSaving(true)
      setErrorMessage(null)
      const newHabit = await createHabit({
        color: habitColor,
        name: habitName,
      })
      setHabits((currentHabits) => [newHabit, ...currentHabits])
      setHabitName('')
      setHabitColor('')
      setIsModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nie udalo sie dodac nawyku.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              /habits
            </p>
            <h2 className="text-3xl font-semibold">Lista nawykow</h2>
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              Chroniony widok z miejscem na karty nawykow i modal dodawania.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Dodaj nawyk</Button>
        </header>

        {errorMessage ? (
          <Card className="bg-rose-50 text-rose-700">{errorMessage}</Card>
        ) : null}

        {isLoading ? (
          <Card className="bg-white">
            <Spinner label="Ladowanie listy nawykow..." />
          </Card>
        ) : habits.length === 0 ? (
          <Card className="bg-white">
            <p className="text-sm text-[var(--color-text-muted)]">
              Nie masz jeszcze zadnych nawykow.
            </p>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-3">
            {habits.map((habit) => (
              <Card key={habit.id} className="bg-white">
                <div
                  className={`mb-3 h-2 rounded-full ${habit.colorClassName}`}
                  aria-hidden="true"
                />
                <div className="font-medium">{habit.name}</div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {habit.frequency}
                </p>
              </Card>
            ))}
          </section>
        )}
      </div>

      <Modal
        title="Nowy nawyk"
        description="Makieta modala przygotowana pod kolejne issue."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-3">
          <Input
            label="Nazwa"
            placeholder="Np. Medytacja"
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
          />
          <Input
            label="Kolor"
            placeholder="Np. zielony"
            value={habitColor}
            onChange={(event) => setHabitColor(event.target.value)}
          />
          <Button fullWidth disabled={isSaving} onClick={handleCreateHabit}>
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </Modal>
    </main>
  )
}
