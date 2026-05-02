export type ActivityPoint = {
  day: string
  value: number
}

export type WeeklyCell = {
  active: boolean
  day: string
}

export type DashboardSummary = {
  activity: ActivityPoint[]
  statsLabel: string
  weeklyCells: WeeklyCell[]
}
