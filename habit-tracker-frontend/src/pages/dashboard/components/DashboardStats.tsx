import { Card } from '../../../components/ui'
import type { DashboardStats as DashboardStatsData } from '../../../types/dashboard'

type DashboardStatsProps = {
  stats: DashboardStatsData
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">Active habits</p>
        <strong className="mt-2 block text-2xl">{stats.activeHabits}</strong>
      </Card>
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">
          Average completion
        </p>
        <strong className="mt-2 block text-2xl">
          {Math.round(stats.averageCompletionRate)}%
        </strong>
      </Card>
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">Best streak</p>
        <strong className="mt-2 block text-2xl">{stats.bestStreak} days</strong>
      </Card>
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">Heatmap total</p>
        <strong className="mt-2 block text-2xl">{stats.totalCompletions}</strong>
      </Card>
    </section>
  )
}
