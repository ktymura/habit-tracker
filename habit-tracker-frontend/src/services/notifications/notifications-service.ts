import { apiClient } from '../api/client'

export type NotificationSettingsPayload = {
  enabled: boolean
  reminderTime: string
}

export async function saveNotificationSettings(
  payload: NotificationSettingsPayload,
) {
  const response = await apiClient.post('/notifications/settings', {
    enabled: payload.enabled,
    reminder_time: payload.enabled ? payload.reminderTime : null,
  })

  return response.data
}
