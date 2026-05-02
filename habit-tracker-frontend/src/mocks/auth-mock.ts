import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'
import { delay } from './delay'

export async function loginMock(payload: LoginPayload): Promise<AuthResponse> {
  await delay()

  if (!payload.email || !payload.password) {
    throw new Error('Enter your email and password.')
  }

  if (payload.password.length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  return {
    token: 'demo-token',
    userEmail: payload.email,
  }
}

export async function registerMock(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  await delay()

  if (!payload.email || !payload.password || !payload.confirmPassword) {
    throw new Error('Fill in every field.')
  }

  if (payload.password.length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error('Passwords must match.')
  }

  return {
    token: 'demo-token',
    userEmail: payload.email,
  }
}
