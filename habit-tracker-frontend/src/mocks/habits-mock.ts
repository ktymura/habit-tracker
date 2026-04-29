import type { CreateHabitPayload, Habit } from '../types/habit'
import { delay } from './delay'

const palette = {
  bursztynowy: 'bg-amber-200',
  niebieski: 'bg-sky-200',
  zielony: 'bg-emerald-200',
  rozowy: 'bg-rose-200',
} as const

let habits: Habit[] = [
  {
    id: 'habit-1',
    colorClassName: palette.niebieski,
    frequency: 'Codziennie',
    name: 'Picie wody',
  },
  {
    id: 'habit-2',
    colorClassName: palette.bursztynowy,
    frequency: 'Codziennie',
    name: 'Czytanie',
  },
  {
    id: 'habit-3',
    colorClassName: palette.zielony,
    frequency: 'Codziennie',
    name: 'Spacer',
  },
]

function normalizeColor(color: string) {
  const key = color.trim().toLowerCase() as keyof typeof palette
  return palette[key] ?? palette.rozowy
}

export async function listHabitsMock(): Promise<Habit[]> {
  await delay()
  return habits
}

export async function createHabitMock(
  payload: CreateHabitPayload,
): Promise<Habit> {
  await delay()

  if (!payload.name.trim()) {
    throw new Error('Nazwa nawyku jest wymagana.')
  }

  const newHabit: Habit = {
    id: `habit-${habits.length + 1}`,
    colorClassName: normalizeColor(payload.color),
    frequency: 'Codziennie',
    name: payload.name.trim(),
  }

  habits = [newHabit, ...habits]
  return newHabit
}
