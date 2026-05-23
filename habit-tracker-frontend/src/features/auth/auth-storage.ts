const AUTH_TOKEN_KEY = 'habit-tracker-auth-token'
const REFRESH_TOKEN_KEY = 'habit-tracker-refresh-token'

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function setRefreshToken(token: string) {
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function setAuthTokens(accessToken: string, refreshToken?: string) {
  setAuthToken(accessToken)

  if (refreshToken) {
    setRefreshToken(refreshToken)
  }
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}
