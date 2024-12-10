import type { User } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  username: string
  passwordConfirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface JWTPayload {
  userId: string
  email: string
  username: string
  iat?: number
  exp?: number
  jti?: string
}
