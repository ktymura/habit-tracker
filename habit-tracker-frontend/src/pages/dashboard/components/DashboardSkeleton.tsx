import { Card, Spinner } from '../../../components/ui'

export function DashboardSkeleton() {
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
