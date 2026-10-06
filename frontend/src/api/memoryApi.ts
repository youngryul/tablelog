import { apiClient } from './client'
import type {
  CreateMemoryRequest,
  Memory,
  PublicMemory,
  UpdateMemoryRequest,
} from '../types/memory'

interface PagedQuery {
  page?: number
  size?: number
}

interface TimelineQuery extends PagedQuery {
  year?: number
  month?: number
}

export const memoryApi = {
  create: async (payload: CreateMemoryRequest) => {
    const { data } = await apiClient.post<Memory>('/memories', payload)
    return data
  },

  update: async (memoryId: string, payload: UpdateMemoryRequest) => {
    const { data } = await apiClient.put<Memory>(`/memories/${memoryId}`, payload)
    return data
  },

  remove: async (memoryId: string) => {
    await apiClient.delete(`/memories/${memoryId}`)
  },

  uploadImages: async (memoryId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    const { data } = await apiClient.post<Memory>(
      `/memories/${memoryId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  getMyMemoriesForPlace: async (placeId: string) => {
    const { data } = await apiClient.get<Memory[]>(`/places/${placeId}/memories/me`)
    return data
  },

  getPublicMemoriesForPlace: async (placeId: string, query: PagedQuery = {}) => {
    const { data } = await apiClient.get<PublicMemory[]>(
      `/places/${placeId}/memories/public`,
      { params: query },
    )
    return data
  },

  getMyTimeline: async (query: TimelineQuery = {}) => {
    const { data } = await apiClient.get<Memory[]>('/me/memories', { params: query })
    return data
  },
}
