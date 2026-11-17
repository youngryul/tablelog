import { profileRepository } from '../repositories/profile.repository'
import { ApiError } from '../types'
import type { Profile, UpdateProfileInput } from '../types/profile'

const NICKNAME_MAX_LENGTH = 30 // profiles.nickname varchar(30)

export const profileService = {
  async getMyProfile(userId: string): Promise<Profile> {
    const profile = await profileRepository.findById(userId)
    if (!profile) {
      throw new ApiError(404, 'PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.')
    }
    return profile
  },

  async updateMyProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
    const nickname = input.nickname?.trim()
    if (nickname !== undefined && (nickname.length === 0 || nickname.length > NICKNAME_MAX_LENGTH)) {
      throw new ApiError(400, 'INVALID_NICKNAME', `닉네임은 1~${NICKNAME_MAX_LENGTH}자여야 합니다.`)
    }
    if (nickname === undefined && input.profileImageUrl === undefined) {
      throw new ApiError(400, 'EMPTY_PROFILE_UPDATE', '수정할 항목이 없습니다.')
    }

    const profile = await profileRepository.update(userId, { nickname, profileImageUrl: input.profileImageUrl })
    if (!profile) {
      throw new ApiError(404, 'PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.')
    }
    return profile
  },
}
