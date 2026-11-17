import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MapView } from '../components/map/MapView'
import { PlaceSearch } from '../components/map/PlaceSearch'
import { PlaceBottomSheet } from '../components/map/PlaceBottomSheet'
import { SearchResultSheet } from '../components/map/SearchResultSheet'
import { useMapStore } from '../store/mapStore'
import { useMyPlacesInBounds } from '../hooks/usePlaces'
import { placeApi } from '../api/placeApi'
import { debounce } from '../lib/debounce'
import type { MapBoundsQuery, PlaceSearchResult } from '../types/place'

export function MapPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { center, bounds, selectedPlaceId, setCenter, setBounds, selectPlace } = useMapStore()
  const { data: places = [] } = useMyPlacesInBounds(bounds)
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([])
  const [activeResult, setActiveResult] = useState<PlaceSearchResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const debouncedSetBounds = useMemo(() => debounce((next: MapBoundsQuery) => setBounds(next), 400), [setBounds])

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null
  const activeSavedPlace = activeResult
    ? (places.find((place) => place.externalPlaceId === activeResult.externalPlaceId) ?? null)
    : null

  const handleResultsChange = (results: PlaceSearchResult[]) => {
    setSearchResults(results)
    setActiveResult(null)
    setSaveError(null)
    if (results.length > 0) selectPlace(null)
  }

  // 목록 항목이나 지도 핀을 누르면 바로 저장하지 않고, 정보와 저장 버튼이 있는 시트를 연다.
  const handleSearchSelect = (result: PlaceSearchResult) => {
    selectPlace(null)
    setSaveError(null)
    setActiveResult(result)
    setCenter({ lat: result.latitude, lng: result.longitude })
  }

  const saveResult = async (result: PlaceSearchResult) => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const saved = await placeApi.save({ ...result, status: 'WANT' })
      // 지도 마커 목록을 다시 받아 저장한 장소가 일반 마커로 바로 보이게 한다.
      await queryClient.invalidateQueries({ queryKey: ['places', 'me'] })
      setSearchResults([])
      setActiveResult(null)
      return saved
    } catch {
      setSaveError('저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async (result: PlaceSearchResult) => {
    const saved = await saveResult(result)
    if (saved) selectPlace(saved.id)
  }

  const handleSaveAndWrite = async (result: PlaceSearchResult) => {
    const saved = await saveResult(result)
    if (saved) navigate(`/places/${saved.id}/memories/new`)
  }

  const handleViewSaved = (placeId: string) => {
    setActiveResult(null)
    selectPlace(placeId)
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full md:h-screen">
      <PlaceSearch results={searchResults} onResultsChange={handleResultsChange} onSelect={handleSearchSelect} />

      <MapView
        center={center}
        markers={places}
        onBoundsChange={debouncedSetBounds}
        onMarkerClick={(placeId) => {
          setActiveResult(null)
          selectPlace(placeId)
        }}
        searchResults={searchResults}
        activeSearchResultId={activeResult?.externalPlaceId ?? null}
        onSearchResultClick={handleSearchSelect}
      />

      <SearchResultSheet
        result={activeResult}
        savedPlace={activeSavedPlace}
        isSaving={isSaving}
        errorMessage={saveError}
        onClose={() => setActiveResult(null)}
        onSave={handleSave}
        onSaveAndWrite={handleSaveAndWrite}
        onViewSaved={handleViewSaved}
      />

      {!activeResult && (
        <PlaceBottomSheet
          place={selectedPlace}
          onClose={() => selectPlace(null)}
          onViewDetail={(placeId) => navigate(`/places/${placeId}`)}
        />
      )}
    </div>
  )
}
