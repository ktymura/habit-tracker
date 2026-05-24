import { Card } from '../../../components/ui'
import type { HeatmapDay } from '../../../types/dashboard'

type ActivityHeatmapProps = {
  days: HeatmapDay[]
}

function getHeatmapColor(day: HeatmapDay, maxCount: number) {
  if (day.count === 0) {
    return 'bg-[var(--color-surface-muted)]'
  }

  const level = Math.ceil((day.count / Math.max(maxCount, 1)) * 4)

  if (level >= 4) {
    return 'bg-[var(--color-accent)]'
  }

  if (level === 3) {
    return 'bg-[var(--color-accent-medium)]'
  }

  if (level === 2) {
    return 'bg-[var(--color-accent-light)]'
  }

  return 'bg-[var(--color-accent-soft)]'
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const maxCount = days.reduce((max, day) => Math.max(max, day.count), 0)

  return (
    <Card>
      <div className="mb-5">
        <h3 className="font-semibold">Activity heatmap</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          365 days of activity.
        </p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              className={`h-3 w-3 rounded-sm ${getHeatmapColor(day, maxCount)}`}
              title={`${day.date}: ${day.count} completions`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
