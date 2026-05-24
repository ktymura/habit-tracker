import { Card } from '../../../components/ui'
import type {
  CorrelationPair,
  PredictionItem,
  SummaryHabit,
} from '../../../types/dashboard'

type AnalyticsPanelsProps = {
  correlations: CorrelationPair[]
  predictions: PredictionItem[]
  summary: SummaryHabit[]
}

export function AnalyticsPanels({
  correlations,
  predictions,
  summary,
}: AnalyticsPanelsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card>
        <div className="mb-4">
          <h3 className="font-semibold">Completion summary</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Weekly and monthly rates by habit.
          </p>
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {summary.map((habit) => (
            <div
              key={habit.habitId}
              className="rounded-lg border border-[var(--color-border)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">
                  {habit.habitName}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {habit.totalEntries} entries
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <span>{habit.weeklyCompletionRate}% week</span>
                <span>{habit.monthlyCompletionRate}% month</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold">Correlations</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Habit pairs that move together.
          </p>
        </div>
        {correlations.length > 0 ? (
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {correlations.map((item) => (
              <div
                key={`${item.habitAName}-${item.habitBName}`}
                className="rounded-lg border border-[var(--color-border)] p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {item.habitAName} + {item.habitBName}
                  </span>
                  <strong>{Math.round(item.correlation * 100)}%</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            Add at least two habits with history to see correlations.
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold">Prediction</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Estimated chance of completing each habit today.
          </p>
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {predictions.map((item) => (
            <div key={item.habitId} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{item.habitName}</span>
                <strong>{item.probability}%</strong>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-2 rounded-full bg-[var(--color-accent)]"
                  style={{ width: `${item.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
