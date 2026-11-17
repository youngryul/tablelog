export interface Profile {
  id: string
  nickname: string
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileInput {
  nickname?: string
  profileImageUrl?: string | null
}
