import { useEffect, useRef } from 'react'
import { loadKakaoMaps } from '../../lib/kakaoMapLoader'
import type { MapBoundsQuery, PlaceSummary } from '../../types/place'
import { getMarkerVariant } from './PlaceMarker'

interface MapViewProps {
  center: { lat: number; lng: number }
  markers: PlaceSummary[]
  onBoundsChange: (bounds: MapBoundsQuery) => void
  onMarkerClick: (placeId: string) => void
}

const MARKER_COLORS: Record<ReturnType<typeof getMarkerVariant>, string> = {
  saved: '#8a8178',
  visited: '#4a7c8c',
  favorite: '#d97757',
}

function createMarkerImage(kakao: any, variant: keyof typeof MARKER_COLORS) {
  const color = MARKER_COLORS[variant]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`
  const url = `data:image/svg+xml;base64,${btoa(svg)}`
  return new kakao.maps.MarkerImage(url, new kakao.maps.Size(28, 36), { offset: new kakao.maps.Point(14, 36) })
}

function boundsToQuery(bounds: any): MapBoundsQuery {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return { minLat: sw.getLat(), maxLat: ne.getLat(), minLng: sw.getLng(), maxLng: ne.getLng() }
}

export function MapView({ center, markers, onBoundsChange, onMarkerClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)
  const kakaoMarkersRef = useRef<any[]>([])
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onMarkerClickRef = useRef(onMarkerClick)

  onBoundsChangeRef.current = onBoundsChange
  onMarkerClickRef.current = onMarkerClick

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
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const kakao = window.kakao
    mapRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng))
  }, [center.lat, center.lng])

  useEffect(() => {
    if (!mapRef.current) return
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
  }, [markers])

  return <div ref={containerRef} className="h-full w-full" />
}
