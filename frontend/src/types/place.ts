export type UserPlaceStatus = 'WANT' | 'VISITED' | 'FAVORITE'

export interface Place {
  id: string
  externalPlaceId: string | null
  name: string
  address: string | null
  roadAddress: string | null
  latitude: number
  longitude: number
  phone: string | null
  category: string | null
}

export interface PlaceSearchResult {
  externalPlaceId: string
  name: string
  address: string
  roadAddress: string
  latitude: number
  longitude: number
  phone: string | null
  category: string | null
}

export interface PlaceSummary extends Place {
  myVisitCount: number
  lastVisitDate: string | null
  myMemoryCount: number
  status: UserPlaceStatus | null
}

export interface SavePlaceRequest {
  externalPlaceId: string
  name: string
  address: string
  roadAddress: string
  latitude: number
  longitude: number
  phone: string | null
  category: string | null
  status: UserPlaceStatus
}

export interface MapBoundsQuery {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}
