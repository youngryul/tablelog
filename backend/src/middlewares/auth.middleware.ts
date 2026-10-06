import type { NextFunction, Request, Response } from 'express'
import { supabaseAuthClient } from '../lib/supabase'
import type { AuthenticatedRequest } from '../types'
import { fail } from '../utils/response'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return fail(res, 401, 'UNAUTHORIZED', 'Authorization 헤더가 필요합니다.')
  }

  const accessToken = authHeader.slice('Bearer '.length)
  const { data, error } = await supabaseAuthClient.auth.getUser(accessToken)

  if (error || !data.user) {
    return fail(res, 401, 'UNAUTHORIZED', '유효하지 않은 토큰입니다.')
  }

  ;(req as AuthenticatedRequest).user = { id: data.user.id, email: data.user.email ?? null }
  next()
}
