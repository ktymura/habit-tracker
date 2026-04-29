export type ActivityBar = {
  height: number
  id: string
}

export type WeeklyCell = {
  active: boolean
  day: string
}

export type DashboardSummary = {
  activityBars: ActivityBar[]
  statsLabel: string
  weeklyCells: WeeklyCell[]
}
