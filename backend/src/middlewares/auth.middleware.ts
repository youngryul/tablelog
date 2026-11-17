import type { NextFunction, Request, Response } from 'express'
import type { User } from '@supabase/supabase-js'
import { supabaseAuthClient } from '../lib/supabase'
import { profileRepository } from '../repositories/profile.repository'
import type { AuthenticatedRequest } from '../types'
import { fail } from '../utils/response'

const NICKNAME_MAX_LENGTH = 30 // tablelog_profiles.nickname varchar(30)

// 프로필 존재를 확인한 사용자 id. 요청마다 DB에 upsert하지 않도록 서버 프로세스 동안 캐시한다.
const ensuredProfileUserIds = new Set<string>()

function defaultNickname(user: User): string {
  const fromMetadata = typeof user.user_metadata?.nickname === 'string' ? user.user_metadata.nickname.trim() : ''
  const fromEmail = user.email?.split('@')[0] ?? ''
  return (fromMetadata || fromEmail || '사용자').slice(0, NICKNAME_MAX_LENGTH)
}

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

  // tablelog_user_places 등이 tablelog_profiles를 FK로 참조하므로, 저장 전에 프로필이 반드시 있어야 한다.
  if (!ensuredProfileUserIds.has(data.user.id)) {
    try {
      await profileRepository.ensureExists(data.user.id, defaultNickname(data.user))
      ensuredProfileUserIds.add(data.user.id)
    } catch (profileError) {
      return next(profileError)
    }
  }

  ;(req as AuthenticatedRequest).user = { id: data.user.id, email: data.user.email ?? null }
  next()
}
