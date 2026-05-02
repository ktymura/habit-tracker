import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, Spinner } from '../../components/ui'
import { getDashboardSummary } from '../../services/dashboard/dashboard-service'
import type { DashboardSummary } from '../../types/dashboard'

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const response = await getDashboardSummary()
        setSummary(response)
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
  }, [])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-accent-strong)]">
            Dashboard
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">
            Weekly overview
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            A simple activity snapshot for the current sprint foundation.
          </p>
        </header>

        {errorMessage ? (
          <Card className="border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
            {errorMessage}
          </Card>
        ) : null}

        {isLoading || !summary ? (
          <Card>
            <Spinner label="Loading dashboard..." />
          </Card>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <Card>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">Activity</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Completed habits over the last seven days.
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
                    7 days
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={summary.activity}>
                      <CartesianGrid
                        stroke="var(--color-border)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        axisLine={false}
                        dataKey="day"
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                        width={28}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--color-accent-soft)' }}
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 10,
                          color: 'var(--color-text)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="var(--color-accent)"
                        name="Habits"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <div className="mb-5">
                  <h3 className="font-semibold">Week</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Days with activity.
                  </p>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {summary.weeklyCells.map((cell) => (
                    <div
                      key={cell.day}
                      className="space-y-2 text-center text-xs"
                    >
                      <div className="text-[var(--color-text-muted)]">
                        {cell.day}
                      </div>
                      <div
                        className={`mx-auto h-8 w-8 rounded-lg border ${
                          cell.active
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">
                {summary.statsLabel}
              </p>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
