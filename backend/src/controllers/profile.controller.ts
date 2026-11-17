import type { Request, Response } from 'express'
import { profileService } from '../services/profile.service'
import type { AuthenticatedRequest } from '../types'
import type { UpdateProfileInput } from '../types/profile'
import { ok } from '../utils/response'

export const profileController = {
  async me(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const profile = await profileService.getMyProfile(user.id)
    ok(res, profile)
  },

  async updateMe(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const { nickname, profileImageUrl } = (req.body ?? {}) as UpdateProfileInput
    const profile = await profileService.updateMyProfile(user.id, { nickname, profileImageUrl })
    ok(res, profile)
  },
}
