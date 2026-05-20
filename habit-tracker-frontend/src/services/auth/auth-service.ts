import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../../types/auth'
import { loginMock, registerMock } from '../../mocks/auth-mock'
import { apiClient } from '../api/client'

const shouldUseMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

type ApiAuthResponse = {
  access_token?: string
  email?: string
  token?: string
  user?: {
    email?: string
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response
  ) {
    const status = error.response.status

    if (status === 401) {
      return 'Invalid email or password.'
    }

    if (status === 409) {
      return 'This email is already registered.'
    }
  }

  return fallback
}

function normalizeAuthResponse(
  response: ApiAuthResponse,
  fallbackEmail: string,
): AuthResponse {
  const token = response.access_token ?? response.token

  if (!token) {
    throw new Error('Auth response did not include a token.')
  }

  return {
    token,
    userEmail: response.user?.email ?? response.email ?? fallbackEmail,
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (shouldUseMocks) {
    return loginMock(payload)
  }

  try {
    const response = await apiClient.post<ApiAuthResponse>('/auth/login', payload)
    return normalizeAuthResponse(response.data, payload.email)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to sign in.'), {
      cause: error,
    })
  }
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  if (shouldUseMocks) {
    return registerMock(payload)
  }

  try {
    const response = await apiClient.post<ApiAuthResponse>('/auth/register', {
      email: payload.email,
      password: payload.password,
    })
    return normalizeAuthResponse(response.data, payload.email)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to create account.'), {
      cause: error,
    })
  }
}
