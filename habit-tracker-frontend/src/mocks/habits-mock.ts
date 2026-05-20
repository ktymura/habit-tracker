import type { CreateHabitPayload, Habit, UpdateHabitPayload } from '../types/habit'
import { delay } from './delay'

let habits: Habit[] = [
  {
    completedToday: true,
    frequency: 'daily',
    id: 'habit-1',
    icon: 'W',
    name: 'Drink water',
    tone: 'ink',
  },
  {
    completedToday: false,
    frequency: 'daily',
    id: 'habit-2',
    icon: 'R',
    name: 'Read',
    tone: 'clay',
  },
  {
    completedToday: false,
    frequency: 'weekdays',
    id: 'habit-3',
    icon: 'S',
    name: 'Walk',
    tone: 'sage',
  },
]

export async function listHabitsMock(): Promise<Habit[]> {
  await delay()
  return habits
}

export async function createHabitMock(
  payload: CreateHabitPayload,
): Promise<Habit> {
  await delay()

  if (!payload.name.trim()) {
    throw new Error('Habit name is required.')
  }

  const newHabit: Habit = {
    completedToday: false,
    frequency: payload.frequency,
    id: `habit-${habits.length + 1}`,
    icon: payload.icon,
    name: payload.name.trim(),
    tone: payload.tone,
  }

  habits = [newHabit, ...habits]
  return newHabit
}

export async function updateHabitMock(
  habitId: string,
  payload: UpdateHabitPayload,
): Promise<Habit> {
  await delay()

  if (!payload.name.trim()) {
    throw new Error('Habit name is required.')
  }

  const habit = habits.find((currentHabit) => currentHabit.id === habitId)

  if (!habit) {
    throw new Error('Habit was not found.')
  }

  const updatedHabit: Habit = {
    ...habit,
    frequency: payload.frequency,
    icon: payload.icon,
    name: payload.name.trim(),
    tone: payload.tone,
  }

  habits = habits.map((currentHabit) =>
    currentHabit.id === habitId ? updatedHabit : currentHabit,
  )

  return updatedHabit
}

export async function toggleHabitTodayMock(
  habitId: string,
  completed: boolean,
): Promise<Habit> {
  await delay(250)

  const habit = habits.find((currentHabit) => currentHabit.id === habitId)

  if (!habit) {
    throw new Error('Habit was not found.')
  }

  habits = habits.map((currentHabit) =>
    currentHabit.id === habitId
      ? { ...currentHabit, completedToday: completed }
      : currentHabit,
  )

  return { ...habit, completedToday: completed }
}
