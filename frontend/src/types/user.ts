export interface Profile {
  id: string
  nickname: string
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  nickname?: string
  profileImageUrl?: string
}
