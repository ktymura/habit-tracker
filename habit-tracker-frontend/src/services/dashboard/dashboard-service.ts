import { getDashboardAnalyticsMock } from '../../mocks/dashboard-mock'
import type {
  CompletionPoint,
  DashboardAnalytics,
  DashboardHabit,
  DashboardRange,
  HeatmapDay,
  WeeklyHabit,
} from '../../types/dashboard'
import type { Habit } from '../../types/habit'
import { apiClient } from '../api/client'
import { listHabits } from '../habits/habits-service'

const shouldUseMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

type ApiStreak = {
  current_streak: number
  habit_id: number
  habit_name: string
  longest_streak: number
}

type ApiStreaksResponse = {
  habits: ApiStreak[]
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function normalizeHabits(habits: Habit[]): DashboardHabit[] {
  return habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
  }))
}

function buildMockCompletionSeries(
  range: DashboardRange,
  habits: DashboardHabit[],
  streaks: ApiStreak[],
  habitId = 'all',
): CompletionPoint[] {
  const days = range === '7d' ? 7 : 30
  const today = new Date()
  const activeHabits = Math.max(habits.length, 1)
  const streakSignal = streaks.reduce(
    (sum, streak) => sum + streak.current_streak + streak.longest_streak,
    0,
  )
  const habitSignal =
    habitId === 'all'
      ? 0
      : Array.from(habitId).reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1)
    const value = Math.min(
      100,
      Math.round(
        42 + ((index * 11 + streakSignal + habitSignal) % 48) / activeHabits,
      ),
    )

    return {
      date: toDateKey(date),
      label:
        range === '7d'
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      value,
    }
  })
}

function buildMockHeatmap(habits: DashboardHabit[], streaks: ApiStreak[]): HeatmapDay[] {
  const today = new Date()
  const maxCount = Math.max(habits.length, 1)
  const streakSignal = streaks.reduce(
    (sum, streak) => sum + streak.current_streak,
    0,
  )

  return Array.from({ length: 365 }, (_, index) => {
    const date = addDays(today, index - 364)

    return {
      count: (index + streakSignal + date.getDay()) % (maxCount + 1),
      date: toDateKey(date),
    }
  })
}

function buildMockWeeklyHabits(
  habits: DashboardHabit[],
  streaks: ApiStreak[],
): WeeklyHabit[] {
  const today = new Date()
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  const monday = addDays(today, mondayOffset)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return habits.map((habit, habitIndex) => {
    const streak = streaks.find(
      (currentStreak) => String(currentStreak.habit_id) === habit.id,
    )

    return {
      days: days.map((day, dayIndex) => ({
        completed:
          ((habitIndex + 1) * (dayIndex + 2) + (streak?.current_streak ?? 0)) %
            4 !==
          0,
        date: toDateKey(addDays(monday, dayIndex)),
        day,
      })),
      habitId: habit.id,
      habitName: habit.name,
      streak: streak?.current_streak ?? 0,
    }
  })
}

export async function getDashboardAnalytics(
  range: DashboardRange,
  habitId = 'all',
): Promise<DashboardAnalytics> {
  if (shouldUseMocks) {
    return getDashboardAnalyticsMock(range, habitId)
  }

  const [habits, streaksResponse] = await Promise.all([
    listHabits(),
    apiClient.get<ApiStreaksResponse>('/analytics/streaks'),
  ])
  const normalizedHabits = normalizeHabits(habits)
  const streaks = streaksResponse.data.habits
  const heatmap = buildMockHeatmap(normalizedHabits, streaks)
  const completionSeries = buildMockCompletionSeries(
    range,
    normalizedHabits,
    streaks,
    habitId,
  )

  return {
    completionSeries,
    dataSources: [
      { label: 'Habits', source: 'backend' },
      { label: 'Streaks', source: 'backend' },
      { label: 'Completion summary', source: 'mock' },
      { label: 'Heatmap', source: 'mock' },
      { label: 'Weekly entries', source: 'mock' },
    ],
    habits: normalizedHabits,
    heatmap,
    stats: {
      activeHabits: normalizedHabits.length,
      averageCompletionRate:
        completionSeries.reduce((sum, point) => sum + point.value, 0) /
        Math.max(completionSeries.length, 1),
      bestStreak: streaks.reduce(
        (max, streak) => Math.max(max, streak.longest_streak),
        0,
      ),
      totalCompletions: heatmap.reduce((sum, day) => sum + day.count, 0),
    },
    weeklyHabits: buildMockWeeklyHabits(normalizedHabits, streaks),
  }
}
