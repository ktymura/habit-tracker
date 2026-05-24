import { type FormEvent, useEffect, useState } from 'react'

import { HabitFormModal } from './components/HabitFormModal'
import { HabitList } from './components/HabitList'
import { Button, Card, Toast } from '../../components/ui'
import {
  createHabit,
  deleteHabit,
  listHabits,
  toggleHabitToday,
  updateHabit,
} from '../../services/habits/habits-service'
import type { Habit, HabitFrequency, HabitTone } from '../../types/habit'

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitName, setHabitName] = useState('')
  const [habitTone, setHabitTone] = useState<HabitTone>('sage')
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily')
  const [habitIcon, setHabitIcon] = useState('W')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingHabitIds, setPendingHabitIds] = useState<string[]>([])
  const [toast, setToast] = useState<{
    message: string
    tone?: 'danger' | 'success'
  } | null>(null)

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

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2600)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  function resetHabitForm() {
    setEditingHabit(null)
    setHabitName('')
    setHabitTone('sage')
    setHabitFrequency('daily')
    setHabitIcon('W')
    setFormError(null)
  }

  function openCreateModal() {
    resetHabitForm()
    setIsModalOpen(true)
  }

  function openEditModal(habit: Habit) {
    setEditingHabit(habit)
    setHabitName(habit.name)
    setHabitTone(habit.tone)
    setHabitFrequency(habit.frequency)
    setHabitIcon(habit.icon)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleCreateHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!habitName.trim()) {
      setFormError('Habit name is required.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)
      const payload = {
        frequency: habitFrequency,
        icon: habitIcon,
        name: habitName,
        tone: habitTone,
      }

      if (editingHabit) {
        const updatedHabit = await updateHabit(editingHabit.id, payload)
        setHabits((currentHabits) =>
          currentHabits.map((currentHabit) =>
            currentHabit.id === updatedHabit.id ? updatedHabit : currentHabit,
          ),
        )
        setToast({ message: 'Habit updated.' })
      } else {
        const newHabit = await createHabit(payload)
        setHabits((currentHabits) => [newHabit, ...currentHabits])
        setToast({ message: 'Habit added.' })
      }

      resetHabitForm()
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
      setToast({
        message: nextCompletedState
          ? `${habit.name} marked done.`
          : `${habit.name} reopened for today.`,
      })
    } catch (error) {
      setHabits(previousHabits)
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to update habit completion.',
        tone: 'danger',
      })
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

  async function handleDeleteHabit() {
    if (!editingHabit) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${editingHabit.name}" and its completion history?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setFormError(null)
      await deleteHabit(editingHabit.id)
      setHabits((currentHabits) =>
        currentHabits.filter((habit) => habit.id !== editingHabit.id),
      )
      setToast({ message: 'Habit deleted.' })
      resetHabitForm()
      setIsModalOpen(false)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to delete habit.',
      )
    } finally {
      setIsDeleting(false)
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
            <Button onClick={openCreateModal}>Add habit</Button>
          </header>

          {errorMessage ? (
            <Card className="border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
              {errorMessage}
            </Card>
          ) : null}

          <HabitList
            habits={habits}
            isLoading={isLoading}
            pendingHabitIds={pendingHabitIds}
            onAdd={openCreateModal}
            onEdit={openEditModal}
            onToggle={(habit) => void handleToggleHabit(habit)}
          />
        </section>
      </div>

      <HabitFormModal
        editingHabit={editingHabit}
        formError={formError}
        habitFrequency={habitFrequency}
        habitIcon={habitIcon}
        habitName={habitName}
        habitTone={habitTone}
        isDeleting={isDeleting}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={() => {
          resetHabitForm()
          setIsModalOpen(false)
        }}
        onDelete={() => void handleDeleteHabit()}
        onFrequencyChange={setHabitFrequency}
        onIconChange={setHabitIcon}
        onNameChange={(name) => {
          setHabitName(name)
          setFormError(null)
        }}
        onSubmit={handleCreateHabit}
        onToneChange={setHabitTone}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
    </main>
  )
}
