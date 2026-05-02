import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../../types/auth'
import { loginMock, registerMock } from '../../mocks/auth-mock'
import { apiClient } from '../api/client'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  void apiClient
  return loginMock(payload)
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  void apiClient
  return registerMock(payload)
}
