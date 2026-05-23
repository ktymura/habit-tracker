import type {
  CreateHabitPayload,
  Habit,
  UpdateHabitPayload,
} from '../../types/habit'
import { apiClient } from '../api/client'

type ApiHabit = {
  color?: string | null
  completed_today?: boolean
  frequency?: string
  icon?: string | null
  id: number | string
  name: string
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeHabit(habit: ApiHabit): Habit {
  return {
    color: habit.color ?? undefined,
    completedToday: Boolean(habit.completed_today),
    frequency:
      habit.frequency === 'weekdays' || habit.frequency === 'weekly'
        ? habit.frequency
        : 'daily',
    icon: habit.icon ?? 'H',
    id: String(habit.id),
    name: habit.name,
    tone:
      habit.color === 'ink' || habit.color === 'clay' || habit.color === 'rose'
        ? habit.color
        : 'sage',
  }
}

export async function listHabits(): Promise<Habit[]> {
  const response = await apiClient.get<ApiHabit[]>('/habits')
  return response.data.map(normalizeHabit)
}

export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  const response = await apiClient.post<ApiHabit>('/habits', {
    color: payload.tone,
    frequency: payload.frequency,
    icon: payload.icon,
    name: payload.name,
  })
  return normalizeHabit(response.data)
}

export async function updateHabit(
  habitId: string,
  payload: UpdateHabitPayload,
): Promise<Habit> {
  const response = await apiClient.put<ApiHabit>(`/habits/${habitId}`, {
    color: payload.tone,
    frequency: payload.frequency,
    icon: payload.icon,
    name: payload.name,
  })
  return normalizeHabit(response.data)
}

export async function deleteHabit(habitId: string): Promise<void> {
  await apiClient.delete(`/habits/${habitId}`)
}

export async function toggleHabitToday(
  habitId: string,
  completed: boolean,
): Promise<Habit> {
  const today = getTodayDate()

  if (completed) {
    const response = await apiClient.post<ApiHabit>(`/habits/${habitId}/entries`, {
      entry_date: today,
    })

    return normalizeHabit({
      ...response.data,
      completed_today: true,
      id: habitId,
    })
  }

  await apiClient.delete(`/habits/${habitId}/entries`, {
    params: {
      entry_date: today,
    },
  })

  return {
    completedToday: false,
    frequency: 'daily',
    icon: 'H',
    id: habitId,
    name: '',
    tone: 'sage',
  }
}
