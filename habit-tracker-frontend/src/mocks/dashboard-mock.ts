import type { DashboardSummary } from '../types/dashboard'
import { delay } from './delay'

export async function getDashboardSummaryMock(): Promise<DashboardSummary> {
  await delay()

  return {
    activity: [
      ['Mon', 2],
      ['Tue', 3],
      ['Wed', 2],
      ['Thu', 4],
      ['Fri', 3],
      ['Sat', 5],
      ['Sun', 4],
    ].map(([day, value]) => ({
      day: String(day),
      value: Number(value),
    })),
    statsLabel: 'Longest streak: 5 days. Completed today: 3 of 4.',
    weeklyCells: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
      (day, index) => ({
        active: index > 1,
        day,
      }),
    ),
  }
}
