import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { PlaceDetail } from '../components/place/PlaceDetail'
import { usePlaceDetail } from '../hooks/usePlaces'

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>()
  const navigate = useNavigate()
  const { data: place, isLoading } = usePlaceDetail(placeId ?? null)

  return (
    <div>
      <Header
        title="장소 상세"
        action={
          place && (
            <button
              type="button"
              onClick={() => navigate(`/places/${place.id}/memories/new`)}
              className="text-sm text-[var(--color-accent)]"
            >
              추억 남기기
            </button>
          )
        }
      />

      {isLoading && <p className="p-4 text-sm text-[var(--color-text-muted)]">불러오는 중...</p>}
      {place && <PlaceDetail place={place} />}
    </div>
  )
}
