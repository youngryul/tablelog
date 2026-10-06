export type UserPlaceStatus = 'WANT' | 'VISITED' | 'FAVORITE'

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

export interface PlaceSummary extends Place {
  status: UserPlaceStatus
  myVisitCount: number
  lastVisitDate: string | null
  myMemoryCount: number
}

export interface SavePlaceInput {
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

// 카카오 로컬 API(키워드 장소검색) 응답 document 타입
export interface KakaoPlaceDocument {
  id: string
  place_name: string
  category_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string // longitude
  y: string // latitude
}

export interface KakaoKeywordSearchResponse {
  documents: KakaoPlaceDocument[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}
