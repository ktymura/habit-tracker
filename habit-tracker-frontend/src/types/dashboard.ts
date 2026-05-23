export type DashboardRange = '7d' | '30d'

export type DashboardHabit = {
  id: string
  name: string
}

export type CompletionPoint = {
  date: string
  label: string
  value: number
}

export type HeatmapDay = {
  count: number
  date: string
}

export type WeeklyHabitDay = {
  completed: boolean
  date: string
  day: string
}

export type WeeklyHabit = {
  days: WeeklyHabitDay[]
  habitId: string
  habitName: string
  streak: number
}

export type DashboardStats = {
  activeHabits: number
  averageCompletionRate: number
  bestStreak: number
  totalCompletions: number
}

export type DashboardDataSource = {
  label: string
  source: 'backend'
}

export type DashboardAnalytics = {
  completionSeries: CompletionPoint[]
  dataSources: DashboardDataSource[]
  habits: DashboardHabit[]
  heatmap: HeatmapDay[]
  stats: DashboardStats
  weeklyHabits: WeeklyHabit[]
}
