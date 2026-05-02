import type { CreateHabitPayload, Habit } from '../types/habit'
import { delay } from './delay'

let habits: Habit[] = [
  {
    frequency: 'Daily',
    id: 'habit-1',
    name: 'Drink water',
    tone: 'ink',
  },
  {
    frequency: 'Daily',
    id: 'habit-2',
    name: 'Read',
    tone: 'clay',
  },
  {
    frequency: 'Daily',
    id: 'habit-3',
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
    frequency: 'Daily',
    id: `habit-${habits.length + 1}`,
    name: payload.name.trim(),
    tone: payload.tone,
  }

  habits = [newHabit, ...habits]
  return newHabit
}
