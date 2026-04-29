import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'
import { delay } from './delay'

export async function loginMock(payload: LoginPayload): Promise<AuthResponse> {
  await delay()

  if (!payload.email || !payload.password) {
    throw new Error('Uzupelnij email i haslo.')
  }

  if (payload.password.length < 8) {
    throw new Error('Haslo musi miec minimum 8 znakow.')
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
    throw new Error('Wypelnij wszystkie pola formularza.')
  }

  if (payload.password.length < 8) {
    throw new Error('Haslo musi miec minimum 8 znakow.')
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error('Hasla musza byc identyczne.')
  }

  return {
    token: 'demo-token',
    userEmail: payload.email,
  }
}
