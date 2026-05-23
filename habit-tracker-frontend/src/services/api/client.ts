import axios from 'axios'

import {
  clearAuthToken,
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
} from '../../features/auth/auth-storage'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = getRefreshToken()

    if (
      error.response?.status !== 401 ||
      !refreshToken ||
      originalRequest?._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const response = await axios.post<{
        access_token: string
        refresh_token: string
      }>(`${apiBaseUrl}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      setAuthTokens(response.data.access_token, response.data.refresh_token)
      originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`

      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAuthToken()
      return Promise.reject(refreshError)
    }
  },
)
