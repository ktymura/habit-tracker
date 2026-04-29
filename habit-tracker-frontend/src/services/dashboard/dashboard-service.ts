import { getDashboardSummaryMock } from '../../mocks/dashboard-mock'
import type { DashboardSummary } from '../../types/dashboard'
import { apiClient } from '../api/client'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  void apiClient
  return getDashboardSummaryMock()
}
