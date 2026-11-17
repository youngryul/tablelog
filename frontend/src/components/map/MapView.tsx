import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '../../lib/kakaoMapLoader'
import type { MapBoundsQuery, PlaceSearchResult, PlaceSummary } from '../../types/place'
import { getMarkerVariant } from './PlaceMarker'

interface MapViewProps {
  center: { lat: number; lng: number }
  markers: PlaceSummary[]
  onBoundsChange: (bounds: MapBoundsQuery) => void
  onMarkerClick: (placeId: string) => void
  searchResults?: PlaceSearchResult[]
  activeSearchResultId?: string | null
  onSearchResultClick?: (result: PlaceSearchResult) => void
}

const MARKER_COLORS: Record<ReturnType<typeof getMarkerVariant>, string> = {
  saved: '#8a8178',
  visited: '#4a7c8c',
  favorite: '#d97757',
}

const SEARCH_PIN_COLOR = '#d97757'

function createMarkerImage(kakao: any, variant: keyof typeof MARKER_COLORS) {
  const color = MARKER_COLORS[variant]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`
  const url = `data:image/svg+xml;base64,${btoa(svg)}`
  return new kakao.maps.MarkerImage(url, new kakao.maps.Size(28, 36), { offset: new kakao.maps.Point(14, 36) })
}

// 검색 결과 핀: 내 장소 마커(가운데 흰 원)와 구분되도록 번호가 들어간 테두리 핀으로 그린다.
function createSearchMarkerImage(kakao: any, label: number, isActive: boolean) {
  const width = isActive ? 38 : 32
  const height = isActive ? 50 : 42
  const fill = isActive ? SEARCH_PIN_COLOR : 'white'
  const textColor = isActive ? 'white' : SEARCH_PIN_COLOR
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 32 42">
    <path d="M16 1.5C8 1.5 1.5 8 1.5 16c0 11.5 14.5 24.5 14.5 24.5S30.5 27.5 30.5 16C30.5 8 24 1.5 16 1.5z" fill="${fill}" stroke="${SEARCH_PIN_COLOR}" stroke-width="3"/>
    <text x="16" y="21" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="${textColor}">${label}</text>
  </svg>`
  const url = `data:image/svg+xml;base64,${btoa(svg)}`
  return new kakao.maps.MarkerImage(url, new kakao.maps.Size(width, height), {
    offset: new kakao.maps.Point(width / 2, height),
  })
}

function boundsToQuery(bounds: any): MapBoundsQuery {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return { minLat: sw.getLat(), maxLat: ne.getLat(), minLng: sw.getLng(), maxLng: ne.getLng() }
}

export function MapView({
  center,
  markers,
  onBoundsChange,
  onMarkerClick,
  searchResults = [],
  activeSearchResultId = null,
  onSearchResultClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)
  const kakaoMarkersRef = useRef<any[]>([])
  const searchMarkersRef = useRef<any[]>([])
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onSearchResultClickRef = useRef(onSearchResultClick)
  // SDK 로딩이 끝나기 전에 들어온 props도 지도 생성 직후 반영되도록 준비 상태를 state로 둔다.
  const [isMapReady, setIsMapReady] = useState(false)

  onBoundsChangeRef.current = onBoundsChange
  onMarkerClickRef.current = onMarkerClick
  onSearchResultClickRef.current = onSearchResultClick

  useEffect(() => {
    let cancelled = false

    loadKakaoMaps().then(() => {
      if (cancelled || !containerRef.current) return
      const kakao = window.kakao

      const map = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 4,
      })
      mapRef.current = map
      clustererRef.current = new kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 7 })

      kakao.maps.event.addListener(map, 'idle', () => {
        onBoundsChangeRef.current(boundsToQuery(map.getBounds()))
      })

      onBoundsChangeRef.current(boundsToQuery(map.getBounds()))
      setIsMapReady(true)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isMapReady) return
    const kakao = window.kakao
    mapRef.current.panTo(new kakao.maps.LatLng(center.lat, center.lng))
  }, [isMapReady, center.lat, center.lng])

  useEffect(() => {
    if (!isMapReady) return
    const kakao = window.kakao

    clustererRef.current?.clear()
    kakaoMarkersRef.current.forEach((marker) => marker.setMap(null))

    kakaoMarkersRef.current = markers.map((place) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.latitude, place.longitude),
        image: createMarkerImage(kakao, getMarkerVariant(place)),
        title: place.name,
      })
      kakao.maps.event.addListener(marker, 'click', () => onMarkerClickRef.current(place.id))
      return marker
    })

    clustererRef.current?.addMarkers(kakaoMarkersRef.current)
  }, [isMapReady, markers])

  // 새 검색 결과가 오면 모든 핀이 화면에 들어오도록 지도 범위를 맞춘다.
  useEffect(() => {
    if (!isMapReady || searchResults.length === 0) return
    const kakao = window.kakao
    const bounds = new kakao.maps.LatLngBounds()
    searchResults.forEach((result) => bounds.extend(new kakao.maps.LatLng(result.latitude, result.longitude)))
    mapRef.current.setBounds(bounds)
  }, [isMapReady, searchResults])

  // 검색 결과 핀은 clusterer에 넣지 않고 지도에 직접 올려 항상 개별 핀으로 보이게 한다.
  useEffect(() => {
    if (!isMapReady) return
    const kakao = window.kakao
    const map = mapRef.current

    searchMarkersRef.current = searchResults.map((result, index) => {
      const isActive = result.externalPlaceId === activeSearchResultId
      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(result.latitude, result.longitude),
        image: createSearchMarkerImage(kakao, index + 1, isActive),
        title: result.name,
        zIndex: isActive ? 20 : 10,
      })
      kakao.maps.event.addListener(marker, 'click', () => onSearchResultClickRef.current?.(result))
      return marker
    })

    return () => {
      searchMarkersRef.current.forEach((marker) => marker.setMap(null))
      searchMarkersRef.current = []
    }
  }, [isMapReady, searchResults, activeSearchResultId])

  return <div ref={containerRef} className="h-full w-full" />
}
