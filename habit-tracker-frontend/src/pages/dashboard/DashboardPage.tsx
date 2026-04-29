import { useEffect, useState } from 'react'

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
            : 'Nie udalo sie pobrac danych dashboardu.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            /dashboard
          </p>
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            Chroniony widok pod analityke i przyszle wykresy.
          </p>
        </header>

        {errorMessage ? (
          <Card className="bg-rose-50 text-rose-700">{errorMessage}</Card>
        ) : null}

        {isLoading || !summary ? (
          <Card className="bg-white">
            <Spinner label="Ladowanie danych dashboardu..." />
          </Card>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="bg-white">
                <div className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Wykres aktywnosci
                </div>
                <div className="flex h-48 items-end gap-2">
                  {summary.activityBars.map((bar) => (
                    <div
                      key={bar.id}
                      className="flex-1 rounded-t-2xl bg-[var(--color-accent)]/70"
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
              </Card>

              <Card className="bg-white">
                <div className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Tydzien
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
                        className={`mx-auto h-8 w-8 rounded-xl ${
                          cell.active
                            ? 'bg-[var(--color-accent)]/75'
                            : 'bg-[var(--color-surface-strong)]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <Card className="bg-white">
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
