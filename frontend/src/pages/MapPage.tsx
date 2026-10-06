import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/map/MapView'
import { PlaceSearch } from '../components/map/PlaceSearch'
import { PlaceBottomSheet } from '../components/map/PlaceBottomSheet'
import { useMapStore } from '../store/mapStore'
import { useMyPlacesInBounds } from '../hooks/usePlaces'
import { placeApi } from '../api/placeApi'
import { debounce } from '../lib/debounce'
import type { MapBoundsQuery, PlaceSearchResult } from '../types/place'

export function MapPage() {
  const navigate = useNavigate()
  const { center, bounds, selectedPlaceId, setCenter, setBounds, selectPlace } = useMapStore()
  const { data: places = [] } = useMyPlacesInBounds(bounds)
  const [isSaving, setIsSaving] = useState(false)

  const debouncedSetBounds = useMemo(() => debounce((next: MapBoundsQuery) => setBounds(next), 400), [setBounds])

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null

  const handleSearchSelect = async (result: PlaceSearchResult) => {
    setCenter({ lat: result.latitude, lng: result.longitude })
    setIsSaving(true)
    try {
      const saved = await placeApi.save({ ...result, status: 'WANT' })
      selectPlace(saved.id)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full md:h-screen">
      <PlaceSearch onSelect={handleSearchSelect} />

      <MapView
        center={center}
        markers={places}
        onBoundsChange={debouncedSetBounds}
        onMarkerClick={selectPlace}
      />

      {isSaving && (
        <p className="absolute inset-x-0 top-20 text-center text-xs text-[var(--color-text-muted)]">
          장소를 저장하는 중...
        </p>
      )}

      <PlaceBottomSheet
        place={selectedPlace}
        onClose={() => selectPlace(null)}
        onViewDetail={(placeId) => navigate(`/places/${placeId}`)}
      />
    </div>
  )
}
