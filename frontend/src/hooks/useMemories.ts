import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { memoryApi } from '../api/memoryApi'
import type { CreateMemoryRequest, UpdateMemoryRequest } from '../types/memory'

export const useMyMemoriesForPlace = (placeId: string | null) =>
  useQuery({
    queryKey: ['memories', 'place', placeId, 'me'],
    queryFn: () => memoryApi.getMyMemoriesForPlace(placeId as string),
    enabled: placeId !== null,
  })

export const usePublicMemoriesForPlace = (placeId: string | null) =>
  useQuery({
    queryKey: ['memories', 'place', placeId, 'public'],
    queryFn: () => memoryApi.getPublicMemoriesForPlace(placeId as string),
    enabled: placeId !== null,
  })

export const useMyTimeline = (year?: number, month?: number) =>
  useQuery({
    queryKey: ['memories', 'timeline', year, month],
    queryFn: () => memoryApi.getMyTimeline({ year, month }),
  })

export const useCreateMemory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMemoryRequest) => memoryApi.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memories', 'place', variables.placeId] })
      queryClient.invalidateQueries({ queryKey: ['memories', 'timeline'] })
    },
  })
}

export const useUpdateMemory = (memoryId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateMemoryRequest) => memoryApi.update(memoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export const useDeleteMemory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memoryId: string) => memoryApi.remove(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}
