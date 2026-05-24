import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '../../../components/ui'
import type { CompletionPoint, DashboardRange } from '../../../types/dashboard'

type CompletionChartProps = {
  data: CompletionPoint[]
  range: DashboardRange
  selectedHabitName: string
}

export function CompletionChart({
  data,
  range,
  selectedHabitName,
}: CompletionChartProps) {
  return (
    <Card>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold">Completion rate</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {selectedHabitName} across the selected range.
          </p>
        </div>
        <span className="inline-flex h-7 w-fit items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 text-xs font-medium leading-none text-[var(--color-accent-strong)]">
          {range === '7d' ? '7 days' : '30 days'}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              width={42}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Completion']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                color: 'var(--color-text)',
              }}
            />
            <Line
              activeDot={{ r: 5 }}
              dataKey="value"
              dot={false}
              name="Completion"
              stroke="var(--color-accent)"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
