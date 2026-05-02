const AUTH_TOKEN_KEY = 'habit-tracker-auth-token'

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}
