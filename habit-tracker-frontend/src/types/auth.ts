export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  confirmPassword: string
}

export type AuthResponse = {
  token: string
  userEmail: string
}
