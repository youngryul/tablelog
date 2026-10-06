import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { MemoryForm } from '../components/memory/MemoryForm'
import { usePlaceDetail } from '../hooks/usePlaces'
import { useCreateMemory } from '../hooks/useMemories'
import { memoryApi } from '../api/memoryApi'
import type { CreateMemoryRequest } from '../types/memory'

export function MemoryWritePage() {
  const { placeId } = useParams<{ placeId: string }>()
  const navigate = useNavigate()
  const { data: place } = usePlaceDetail(placeId ?? null)
  const createMemory = useCreateMemory()

  if (!placeId || !place) {
    return <p className="p-4 text-sm text-[var(--color-text-muted)]">불러오는 중...</p>
  }

  const handleSubmit = async (payload: CreateMemoryRequest, images: File[]) => {
    const memory = await createMemory.mutateAsync(payload)

    if (images.length > 0) {
      await memoryApi.uploadImages(memory.id, images)
    }

    navigate(`/places/${placeId}`)
  }

  return (
    <div>
      <Header title="추억 작성" />
      <MemoryForm
        placeId={placeId}
        placeName={place.name}
        onSubmit={handleSubmit}
        isSubmitting={createMemory.isPending}
      />
    </div>
  )
}
