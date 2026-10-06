export type MemoryVisibility = 'PRIVATE' | 'PUBLIC'

export interface MemoryImage {
  id: string
  imageUrl: string
  sortOrder: number
}

export interface Memory {
  id: string
  placeId: string
  visitDate: string
  memoryText: string
  shortComment: string | null
  companion: string | null
  visibility: MemoryVisibility
  revisitYn: boolean | null
  menus: string[]
  images: MemoryImage[]
  createdAt: string
  updatedAt: string
}

export interface PublicMemory extends Memory {
  authorNickname: string
  authorProfileImageUrl: string | null
}

export interface CreateMemoryInput {
  placeId: string
  visitDate: string
  memoryText: string
  shortComment?: string
  companion?: string
  visibility: MemoryVisibility
  revisitYn?: boolean
  menus: string[]
}

export type UpdateMemoryInput = Partial<CreateMemoryInput>

export interface PageQuery {
  page: number
  size: number
}

export interface TimelineQuery extends PageQuery {
  year?: number
  month?: number
}
