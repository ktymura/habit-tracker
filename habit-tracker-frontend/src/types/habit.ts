export type Habit = {
  id: string
  colorClassName: string
  frequency: string
  name: string
}

export type CreateHabitPayload = {
  color: string
  name: string
}
