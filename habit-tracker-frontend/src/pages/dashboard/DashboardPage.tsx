import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, Spinner } from '../../components/ui'
import { getDashboardAnalytics } from '../../services/dashboard/dashboard-service'
import type {
  DashboardAnalytics,
  DashboardRange,
  HeatmapDay,
} from '../../types/dashboard'

const ranges: Array<{ label: string; value: DashboardRange }> = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
]

function getHeatmapColor(day: HeatmapDay, maxCount: number) {
  if (day.count === 0) {
    return 'bg-[var(--color-surface-muted)]'
  }

  const level = Math.ceil((day.count / Math.max(maxCount, 1)) * 4)

  if (level >= 4) {
    return 'bg-[var(--color-accent)]'
  }

  if (level === 3) {
    return 'bg-[oklch(62%_0.11_160)]'
  }

  if (level === 2) {
    return 'bg-[oklch(75%_0.07_160)]'
  }

  return 'bg-[var(--color-accent-soft)]'
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <Card>
        <Spinner label="Loading dashboard..." />
      </Card>

      <Card>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 rounded-lg bg-[var(--color-surface-strong)]"
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all')
  const [range, setRange] = useState<DashboardRange>('7d')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const response = await getDashboardAnalytics(range, selectedHabitId)
        setAnalytics(response)

        if (
          selectedHabitId !== 'all' &&
          !response.habits.some((habit) => habit.id === selectedHabitId)
        ) {
          setSelectedHabitId('all')
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load dashboard data.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [range, selectedHabitId])

  const selectedHabitName = useMemo(() => {
    if (!analytics || selectedHabitId === 'all') {
      return 'All habits'
    }

    return (
      analytics.habits.find((habit) => habit.id === selectedHabitId)?.name ??
      'Selected habit'
    )
  }, [analytics, selectedHabitId])

  const maxHeatmapCount = useMemo(() => {
    if (!analytics) {
      return 0
    }

    return analytics.heatmap.reduce((max, day) => Math.max(max, day.count), 0)
  }, [analytics])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-accent-strong)]">
              Dashboard
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.03em]">
              Analytics
            </h2>

            <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Completion trends, activity heatmap, and the weekly habit grid.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-panel)] sm:flex-row sm:items-center">
            <div className="inline-grid h-11 grid-cols-2 gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
              {ranges.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`inline-flex h-full min-w-[78px] items-center justify-center rounded-md px-4 pt-px text-sm font-medium leading-none transition-colors ${
                    option.value === range
                      ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                  }`}
                  onClick={() => setRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="sr-only" htmlFor="habit-filter">
              Habit
            </label>

            <div className="relative w-full sm:w-auto">
              <select
                id="habit-filter"
                className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-3 pr-12 text-sm font-medium leading-none text-[var(--color-text)] outline-none transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] sm:min-w-44"
                value={selectedHabitId}
                onChange={(event) => setSelectedHabitId(event.target.value)}
              >
                <option value="all">All habits</option>

                {analytics?.habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>

              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="m6 9 6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <Card className="border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
            {errorMessage}
          </Card>
        ) : null}

        {isLoading || !analytics ? (
          <DashboardSkeleton />
        ) : analytics.habits.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">
              No habits yet. Add habits before opening analytics.
            </p>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Active habits
                </p>
                <strong className="mt-2 block text-2xl">
                  {analytics.stats.activeHabits}
                </strong>
              </Card>

              <Card>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Average completion
                </p>
                <strong className="mt-2 block text-2xl">
                  {Math.round(analytics.stats.averageCompletionRate)}%
                </strong>
              </Card>

              <Card>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Best streak
                </p>
                <strong className="mt-2 block text-2xl">
                  {analytics.stats.bestStreak} days
                </strong>
              </Card>

              <Card>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Heatmap total
                </p>
                <strong className="mt-2 block text-2xl">
                  {analytics.stats.totalCompletions}
                </strong>
              </Card>
            </section>

            <section>
              <Card>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Completion rate</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {selectedHabitName} across the selected range.
                    </p>
                  </div>

                  <span className="inline-flex h-7 w-fit items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 text-xs font-medium leading-none text-[var(--color-accent-strong)]">
                    {range === '7d' ? '7 days' : '30 days'}
                  </span>
                </div>

                <div className="h-72">
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={analytics.completionSeries}>
                      <CartesianGrid
                        stroke="var(--color-border)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        axisLine={false}
                        dataKey="label"
                        tickLine={false}
                        tick={{
                          fill: 'var(--color-text-muted)',
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        tickLine={false}
                        tick={{
                          fill: 'var(--color-text-muted)',
                          fontSize: 12,
                        }}
                        width={42}
                      />

                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion']}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.date ?? ''
                        }
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 10,
                          color: 'var(--color-text)',
                        }}
                      />

                      <Line
                        activeDot={{ r: 5 }}
                        dataKey="value"
                        dot={false}
                        name="Completion"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            <Card>
              <div className="mb-5">
                <h3 className="font-semibold">Activity heatmap</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  365 days of activity.
                </p>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
                  {analytics.heatmap.map((day) => (
                    <div
                      key={day.date}
                      className={`h-3 w-3 rounded-sm ${getHeatmapColor(
                        day,
                        maxHeatmapCount,
                      )}`}
                      title={`${day.date}: ${day.count} completions`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="border-b border-[var(--color-border)] p-5">
                <h3 className="font-semibold">Weekly view</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Habit completion by day with current streaks.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                      <th className="px-5 py-3 font-medium">Habit</th>

                      {analytics.weeklyHabits[0]?.days.map((day) => (
                        <th key={day.day} className="px-3 py-3 font-medium">
                          {day.day}
                        </th>
                      ))}

                      <th className="px-5 py-3 text-right font-medium">
                        Streak
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.weeklyHabits.map((habit) => (
                      <tr
                        key={habit.habitId}
                        className="border-b border-[var(--color-border)] last:border-b-0"
                      >
                        <td className="px-5 py-3 font-medium">
                          {habit.habitName}
                        </td>

                        {habit.days.map((day) => (
                          <td key={day.date} className="px-3 py-3">
                            <input
                              checked={day.completed}
                              className="h-4 w-4 accent-[var(--color-accent)]"
                              readOnly
                              type="checkbox"
                              title={day.date}
                            />
                          </td>
                        ))}

                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex h-7 items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 text-xs font-medium leading-none text-[var(--color-accent-strong)]">
                            {habit.streak} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
