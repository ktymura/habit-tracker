import { Button, Card } from '../../../components/ui'
import type { Habit } from '../../../types/habit'

type HabitListProps = {
  habits: Habit[]
  isLoading: boolean
  pendingHabitIds: string[]
  onAdd: () => void
  onEdit: (habit: Habit) => void
  onToggle: (habit: Habit) => void
}

function HabitSkeletonList() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:items-center sm:px-5"
        >
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-[var(--color-surface-strong)]" />
            <span className="h-4 w-36 rounded bg-[var(--color-surface-strong)]" />
          </div>
          <span className="h-4 w-20 rounded bg-[var(--color-surface-strong)]" />
          <span className="h-9 w-28 rounded-lg bg-[var(--color-surface-strong)]" />
        </div>
      ))}
    </div>
  )
}

export function HabitList({
  habits,
  isLoading,
  pendingHabitIds,
  onAdd,
  onEdit,
  onToggle,
}: HabitListProps) {
  return (
    <Card className="p-0">
      {isLoading ? (
        <HabitSkeletonList />
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            No habits yet. Add the first routine to start tracking today.
          </p>
          <Button variant="secondary" onClick={onAdd}>
            Add first habit
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {habits.map((habit) => (
            <article
              key={habit.id}
              className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 px-4 py-4 transition-colors hover:bg-[var(--color-surface-muted)] sm:grid-cols-[minmax(0,1fr)_120px_132px_96px] sm:items-center sm:gap-x-3 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`habit-tone-${habit.tone} flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--habit-bg)] text-sm font-semibold text-[var(--habit-dot)]`}
                  aria-hidden="true"
                >
                  {habit.icon}
                </span>
                <h3 className="truncate font-medium">{habit.name}</h3>
              </div>

              <span className="col-span-2 capitalize text-sm text-[var(--color-text-muted)] sm:col-auto">
                {habit.frequency}
              </span>

              <label
                className={`inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium leading-none transition-colors sm:w-32 ${
                  habit.completedToday
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-surface)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <input
                  checked={habit.completedToday}
                  className="sr-only"
                  disabled={pendingHabitIds.includes(habit.id)}
                  type="checkbox"
                  onChange={() => onToggle(habit)}
                />
                <span
                  aria-hidden="true"
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${
                    habit.completedToday
                      ? 'border-[var(--color-surface)] bg-[var(--color-surface)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border-strong)] bg-transparent'
                  }`}
                >
                  {habit.completedToday ? '✓' : ''}
                </span>
                <span className="leading-none">
                  {habit.completedToday ? 'Done' : 'Mark done'}
                </span>
              </label>

              <Button
                className="h-10 w-full px-3 text-sm font-medium leading-none sm:w-24"
                variant="secondary"
                onClick={() => onEdit(habit)}
              >
                Edit
              </Button>
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}
