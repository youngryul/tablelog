import { supabaseAdminClient } from '../lib/supabase'
import type { Profile, UpdateProfileInput } from '../types/profile'

interface ProfileRow {
  id: string
  nickname: string
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    nickname: row.nickname,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const profileRepository = {
  /**
   * tablelog 프로필이 없으면 만든다. 이미 있으면 아무것도 바꾸지 않는다(닉네임 수정분 보존).
   * auth.users를 다른 서비스와 공유하므로 가입 트리거 대신 Backend가 첫 인증 요청 때 호출한다.
   */
  async ensureExists(userId: string, nickname: string): Promise<void> {
    const { error } = await supabaseAdminClient
      .from('tablelog_profiles')
      .upsert({ id: userId, nickname }, { onConflict: 'id', ignoreDuplicates: true })

    if (error) throw error
  },

  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdminClient
      .from('tablelog_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<ProfileRow>()

    if (error) throw error
    return data ? toProfile(data) : null
  },

  async update(userId: string, input: UpdateProfileInput): Promise<Profile | null> {
    const patch: Partial<Pick<ProfileRow, 'nickname' | 'profile_image_url'>> = {}
    if (input.nickname !== undefined) patch.nickname = input.nickname
    if (input.profileImageUrl !== undefined) patch.profile_image_url = input.profileImageUrl

    const { data, error } = await supabaseAdminClient
      .from('tablelog_profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .maybeSingle<ProfileRow>()

    if (error) throw error
    return data ? toProfile(data) : null
  },
}
