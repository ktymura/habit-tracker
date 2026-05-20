export type HabitTone = 'sage' | 'ink' | 'clay' | 'rose'

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly'

export type Habit = {
  color?: string
  completedToday: boolean
  frequency: HabitFrequency
  icon: string
  id: string
  name: string
  tone: HabitTone
}

export type CreateHabitPayload = {
  frequency: HabitFrequency
  icon: string
  name: string
  tone: HabitTone
}

export type UpdateHabitPayload = CreateHabitPayload
