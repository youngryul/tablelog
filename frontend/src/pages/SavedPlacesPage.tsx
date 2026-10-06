import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { PlaceCard } from '../components/place/PlaceCard'
import { useMyPlaces } from '../hooks/usePlaces'

export function SavedPlacesPage() {
  const navigate = useNavigate()
  const { data: places = [], isLoading } = useMyPlaces()

  return (
    <div className="pb-20">
      <Header title="저장한 장소" />

      {isLoading && <p className="p-4 text-sm text-[var(--color-text-muted)]">불러오는 중...</p>}

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} onClick={(placeId) => navigate(`/places/${placeId}`)} />
        ))}
        {!isLoading && places.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[var(--color-text-muted)]">
            저장한 장소가 없어요.
          </p>
        )}
      </div>
    </div>
  )
}
