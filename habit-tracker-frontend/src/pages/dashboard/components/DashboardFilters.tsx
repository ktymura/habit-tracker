import type { DashboardHabit, DashboardRange } from '../../../types/dashboard'

const ranges: Array<{ label: string; value: DashboardRange }> = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
]

type DashboardFiltersProps = {
  habits: DashboardHabit[]
  range: DashboardRange
  selectedHabitId: string
  onHabitChange: (habitId: string) => void
  onRangeChange: (range: DashboardRange) => void
}

export function DashboardFilters({
  habits,
  range,
  selectedHabitId,
  onHabitChange,
  onRangeChange,
}: DashboardFiltersProps) {
  return (
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
            onClick={() => onRangeChange(option.value)}
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
          onChange={(event) => onHabitChange(event.target.value)}
        >
          <option value="all">All habits</option>
          {habits.map((habit) => (
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
  )
}
