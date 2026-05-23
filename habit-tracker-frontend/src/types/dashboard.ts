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

export type SummaryHabit = {
  habitId: string
  habitName: string
  monthlyCompletionRate: number
  totalEntries: number
  weeklyCompletionRate: number
}

export type CorrelationPair = {
  correlation: number
  habitAName: string
  habitBName: string
}

export type PredictionItem = {
  habitId: string
  habitName: string
  probability: number
}

export type DashboardAnalytics = {
  completionSeries: CompletionPoint[]
  correlations: CorrelationPair[]
  habits: DashboardHabit[]
  heatmap: HeatmapDay[]
  predictions: PredictionItem[]
  stats: DashboardStats
  summary: SummaryHabit[]
  weeklyHabits: WeeklyHabit[]
}
