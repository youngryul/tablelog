import { apiClient } from './client'
import type { Profile, UpdateProfileRequest } from '../types/user'

export const userApi = {
  getMyProfile: async () => {
    const { data } = await apiClient.get<Profile>('/me/profile')
    return data
  },

  updateMyProfile: async (payload: UpdateProfileRequest) => {
    const { data } = await apiClient.put<Profile>('/me/profile', payload)
    return data
  },
}
