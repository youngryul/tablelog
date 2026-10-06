import type { Request } from 'express'

export interface AuthUser {
  id: string
  email: string | null
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}
