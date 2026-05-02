export type HabitTone = 'sage' | 'ink' | 'clay' | 'rose'

export type Habit = {
  frequency: string
  id: string
  name: string
  tone: HabitTone
}

export type CreateHabitPayload = {
  name: string
  tone: HabitTone
}
