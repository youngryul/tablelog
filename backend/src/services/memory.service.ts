import { memoryRepository } from '../repositories/memory.repository'
import { storageService } from './storage.service'
import { ApiError } from '../types'
import type {
  CreateMemoryInput,
  Memory,
  PageQuery,
  PublicMemory,
  TimelineQuery,
  UpdateMemoryInput,
} from '../types/memory'

export const memoryService = {
  async create(userId: string, input: CreateMemoryInput): Promise<Memory> {
    const memoryId = await memoryRepository.createWithMenus(userId, input)
    const memory = await memoryRepository.findById(memoryId)
    if (!memory) {
      throw new ApiError(500, 'MEMORY_CREATE_FAILED', '추억 생성에 실패했습니다.')
    }
    return memory
  },

  async update(memoryId: string, userId: string, patch: UpdateMemoryInput): Promise<Memory> {
    const memory = await memoryRepository.update(memoryId, userId, patch)
    if (!memory) {
      throw new ApiError(404, 'MEMORY_NOT_FOUND', '수정할 추억을 찾을 수 없습니다.')
    }
    return memory
  },

  async remove(memoryId: string, userId: string): Promise<void> {
    const deleted = await memoryRepository.softDelete(memoryId, userId)
    if (!deleted) {
      throw new ApiError(404, 'MEMORY_NOT_FOUND', '삭제할 추억을 찾을 수 없습니다.')
    }
  },

  async getMyForPlace(userId: string, placeId: string): Promise<Memory[]> {
    return memoryRepository.findMyForPlace(userId, placeId)
  },

  async getPublicForPlace(placeId: string, query: PageQuery): Promise<PublicMemory[]> {
    return memoryRepository.findPublicForPlace(placeId, query)
  },

  async getMyTimeline(userId: string, query: TimelineQuery): Promise<Memory[]> {
    return memoryRepository.findMyTimeline(userId, query)
  },

  async addImages(
    memoryId: string,
    userId: string,
    files: { buffer: Buffer; mimetype: string }[],
  ): Promise<Memory> {
    const owned = await memoryRepository.isOwnedByUser(memoryId, userId)
    if (!owned) {
      throw new ApiError(404, 'MEMORY_NOT_FOUND', '이미지를 추가할 추억을 찾을 수 없습니다.')
    }

    const uploaded = await Promise.all(
      files.map((file) => storageService.uploadMemoryImage(userId, memoryId, file)),
    )
    await memoryRepository.addImages(memoryId, uploaded)

    const memory = await memoryRepository.findById(memoryId)
    if (!memory) {
      throw new ApiError(500, 'MEMORY_NOT_FOUND_AFTER_UPLOAD', '이미지 업로드 후 추억을 다시 조회하지 못했습니다.')
    }
    return memory
  },
}
