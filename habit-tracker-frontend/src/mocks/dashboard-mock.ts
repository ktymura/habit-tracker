import type { DashboardSummary } from '../types/dashboard'
import { delay } from './delay'

export async function getDashboardSummaryMock(): Promise<DashboardSummary> {
  await delay()

  return {
    activityBars: [40, 70, 55, 82, 60, 94, 75].map((height, index) => ({
      height,
      id: `bar-${index + 1}`,
    })),
    statsLabel:
      'Sekcja statystyk bedzie uzupelniona po integracji z backendem.',
    weeklyCells: ['Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'So', 'Nd'].map(
      (day, index) => ({
        active: index > 1,
        day,
      }),
    ),
  }
}
