import { Card } from '../../../components/ui'
import type { WeeklyHabit } from '../../../types/dashboard'

type WeeklyViewProps = {
  habits: WeeklyHabit[]
}

export function WeeklyView({ habits }: WeeklyViewProps) {
  return (
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
              {habits[0]?.days.map((day) => (
                <th key={day.day} className="px-3 py-3 font-medium">
                  {day.day}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">Streak</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr
                key={habit.habitId}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-5 py-3 font-medium">{habit.habitName}</td>
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
  )
}
