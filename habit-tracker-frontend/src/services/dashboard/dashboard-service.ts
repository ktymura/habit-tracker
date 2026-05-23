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

type ApiStreak = {
  current_streak: number
  habit_id: number
  habit_name: string
  longest_streak: number
}

type ApiStreaksResponse = {
  habits: ApiStreak[]
}

type ApiHeatmapDay = {
  count: number
  date: string
}

type ApiDailyCompletion = {
  completion_rate: number
  date: string
}

type ApiEntry = {
  entry_date: string
  habit_id: number
  id: number
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

function getRangeDays(range: DashboardRange) {
  return range === '7d' ? 7 : 30
}

function getRangeStart(range: DashboardRange) {
  return toDateKey(addDays(new Date(), 1 - getRangeDays(range)))
}

function getRangeEnd() {
  return toDateKey(new Date())
}

function formatPointLabel(dateKey: string, range: DashboardRange) {
  const date = new Date(`${dateKey}T00:00:00`)

  return range === '7d'
    ? date.toLocaleDateString('en-US', { weekday: 'short' })
    : date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

function normalizeCompletionSeries(
  points: ApiDailyCompletion[],
  range: DashboardRange,
): CompletionPoint[] {
  return points.map((point) => ({
    date: point.date,
    label: formatPointLabel(point.date, range),
    value: Math.round(point.completion_rate * 100),
  }))
}

function buildHabitCompletionSeries(
  entries: ApiEntry[],
  range: DashboardRange,
): CompletionPoint[] {
  const days = getRangeDays(range)
  const today = new Date()
  const completedDates = new Set(entries.map((entry) => entry.entry_date))

  return Array.from({ length: days }, (_, index) => {
    const dateKey = toDateKey(addDays(today, index - days + 1))

    return {
      date: dateKey,
      label: formatPointLabel(dateKey, range),
      value: completedDates.has(dateKey) ? 100 : 0,
    }
  })
}

async function getCompletionSeries(
  range: DashboardRange,
  habitId: string,
): Promise<CompletionPoint[]> {
  if (habitId !== 'all') {
    const response = await apiClient.get<ApiEntry[]>(`/habits/${habitId}/entries`, {
      params: {
        from: getRangeStart(range),
        to: getRangeEnd(),
      },
    })

    return buildHabitCompletionSeries(response.data, range)
  }

  const response = await apiClient.get<ApiDailyCompletion[]>(
    '/analytics/daily-completion',
    {
      params: {
        days: getRangeDays(range),
      },
    },
  )

  return normalizeCompletionSeries(response.data, range)
}

function normalizeHeatmap(days: ApiHeatmapDay[]): HeatmapDay[] {
  return days.map((day) => ({
    count: day.count,
    date: day.date,
  }))
}

function getCurrentWeek() {
  const today = new Date()
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  const monday = addDays(today, mondayOffset)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return days.map((day, index) => ({
    date: toDateKey(addDays(monday, index)),
    day,
  }))
}

async function getWeeklyHabits(
  habits: DashboardHabit[],
  streaks: ApiStreak[],
): Promise<WeeklyHabit[]> {
  const week = getCurrentWeek()
  const from = week[0]?.date
  const to = week.at(-1)?.date

  const entriesByHabit = await Promise.all(
    habits.map(async (habit) => {
      const response = await apiClient.get<ApiEntry[]>(
        `/habits/${habit.id}/entries`,
        {
          params: {
            from,
            to,
          },
        },
      )

      return {
        entries: response.data,
        habit,
      }
    }),
  )

  return entriesByHabit.map(({ entries, habit }) => {
    const completedDates = new Set(entries.map((entry) => entry.entry_date))
    const streak = streaks.find(
      (currentStreak) => String(currentStreak.habit_id) === habit.id,
    )

    return {
      days: week.map((day) => ({
        completed: completedDates.has(day.date),
        date: day.date,
        day: day.day,
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
  const [habits, streaksResponse, heatmapResponse, completionSeries] =
    await Promise.all([
      listHabits(),
      apiClient.get<ApiStreaksResponse>('/analytics/streaks'),
      apiClient.get<ApiHeatmapDay[]>('/analytics/heatmap'),
      getCompletionSeries(range, habitId),
    ])
  const normalizedHabits = normalizeHabits(habits)
  const streaks = streaksResponse.data.habits
  const heatmap = normalizeHeatmap(heatmapResponse.data)
  const weeklyHabits = await getWeeklyHabits(normalizedHabits, streaks)

  return {
    completionSeries,
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
    weeklyHabits,
  }
}
