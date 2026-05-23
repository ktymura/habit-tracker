import type {
  CompletionPoint,
  DashboardAnalytics,
  DashboardHabit,
  DashboardRange,
  HeatmapDay,
  WeeklyHabit,
} from '../types/dashboard'
import { delay } from './delay'

const mockHabits: DashboardHabit[] = [
  { id: 'habit-1', name: 'Drink water' },
  { id: 'habit-2', name: 'Read' },
  { id: 'habit-3', name: 'Walk' },
  { id: 'habit-4', name: 'Meditate' },
]

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function buildCompletionSeries(
  range: DashboardRange,
  habitId = 'all',
): CompletionPoint[] {
  const days = range === '7d' ? 7 : 30
  const today = new Date()
  const habitOffset =
    habitId === 'all'
      ? 0
      : Array.from(habitId).reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1)
    const value = 48 + ((index * 13 + habitOffset) % 45)

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

function buildHeatmap(): HeatmapDay[] {
  const today = new Date()

  return Array.from({ length: 365 }, (_, index) => {
    const date = addDays(today, index - 364)

    return {
      count: (index * 7 + date.getDay()) % 5,
      date: toDateKey(date),
    }
  })
}

function buildWeeklyHabits(): WeeklyHabit[] {
  const today = new Date()
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  const monday = addDays(today, mondayOffset)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return mockHabits.map((habit, habitIndex) => ({
    days: days.map((day, dayIndex) => ({
      completed: (habitIndex + dayIndex) % 3 !== 1,
      date: toDateKey(addDays(monday, dayIndex)),
      day,
    })),
    habitId: habit.id,
    habitName: habit.name,
    streak: 2 + habitIndex * 2,
  }))
}

export async function getDashboardAnalyticsMock(
  range: DashboardRange,
  habitId = 'all',
): Promise<DashboardAnalytics> {
  await delay()

  const heatmap = buildHeatmap()
  const weeklyHabits = buildWeeklyHabits()

  return {
    completionSeries: buildCompletionSeries(range, habitId),
    dataSources: [
      { label: 'Habits', source: 'mock' },
      { label: 'Streaks', source: 'mock' },
      { label: 'Completion summary', source: 'mock' },
      { label: 'Heatmap', source: 'mock' },
      { label: 'Weekly entries', source: 'mock' },
    ],
    habits: mockHabits,
    heatmap,
    stats: {
      activeHabits: mockHabits.length,
      averageCompletionRate: 76,
      bestStreak: 8,
      totalCompletions: heatmap.reduce((sum, day) => sum + day.count, 0),
    },
    weeklyHabits,
  }
}
