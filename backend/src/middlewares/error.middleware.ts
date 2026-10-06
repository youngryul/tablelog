import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../types'
import { fail } from '../utils/response'

export function notFoundMiddleware(req: Request, res: Response) {
  fail(res, 404, 'NOT_FOUND', `${req.method} ${req.path} 경로를 찾을 수 없습니다.`)
}

// Express 5에서는 async 핸들러의 reject가 자동으로 이 미들웨어까지 전달된다.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return fail(res, err.statusCode, err.code, err.message)
  }

  console.error(err)
  return fail(res, 500, 'INTERNAL_SERVER_ERROR', '서버 오류가 발생했습니다.')
}
