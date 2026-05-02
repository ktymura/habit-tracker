import { createHabitMock, listHabitsMock } from '../../mocks/habits-mock'
import type { CreateHabitPayload, Habit } from '../../types/habit'
import { apiClient } from '../api/client'

export async function listHabits(): Promise<Habit[]> {
  void apiClient
  return listHabitsMock()
}

export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  void apiClient
  return createHabitMock(payload)
}
