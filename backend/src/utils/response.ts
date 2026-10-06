import type { Response } from 'express'

export function ok<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data })
}

export function fail(res: Response, statusCode: number, code: string, message: string) {
  return res.status(statusCode).json({ success: false, error: { code, message } })
}
