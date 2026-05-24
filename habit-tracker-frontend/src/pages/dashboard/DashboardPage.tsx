import { useEffect, useMemo, useState } from 'react'

import { ActivityHeatmap } from './components/ActivityHeatmap'
import { AnalyticsPanels } from './components/AnalyticsPanels'
import { CompletionChart } from './components/CompletionChart'
import { DashboardFilters } from './components/DashboardFilters'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { DashboardStats } from './components/DashboardStats'
import { ReminderSettings } from './components/ReminderSettings'
import { WeeklyView } from './components/WeeklyView'
import { Card } from '../../components/ui'
import { getDashboardAnalytics } from '../../services/dashboard/dashboard-service'
import type { DashboardAnalytics, DashboardRange } from '../../types/dashboard'

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

          <DashboardFilters
            habits={analytics?.habits ?? []}
            range={range}
            selectedHabitId={selectedHabitId}
            onHabitChange={setSelectedHabitId}
            onRangeChange={setRange}
          />
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
            <DashboardStats stats={analytics.stats} />
            <CompletionChart
              data={analytics.completionSeries}
              range={range}
              selectedHabitName={selectedHabitName}
            />
            <ActivityHeatmap days={analytics.heatmap} />
            <AnalyticsPanels
              correlations={analytics.correlations}
              predictions={analytics.predictions}
              summary={analytics.summary}
            />
            <ReminderSettings />
            <WeeklyView habits={analytics.weeklyHabits} />
          </>
        )}
      </div>
    </main>
  )
}
