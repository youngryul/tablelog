import { apiClient } from './client'
import type {
  MapBoundsQuery,
  Place,
  PlaceSearchResult,
  PlaceSummary,
  SavePlaceRequest,
} from '../types/place'

export const placeApi = {
  search: async (keyword: string) => {
    const { data } = await apiClient.get<PlaceSearchResult[]>('/places/search', {
      params: { keyword },
    })
    return data
  },

  save: async (payload: SavePlaceRequest) => {
    const { data } = await apiClient.post<Place>('/places', payload)
    return data
  },

  getMyPlaces: async () => {
    const { data } = await apiClient.get<PlaceSummary[]>('/me/places')
    return data
  },

  getMyPlacesInBounds: async (bounds: MapBoundsQuery) => {
    const { data } = await apiClient.get<PlaceSummary[]>('/me/places/map', {
      params: bounds,
    })
    return data
  },

  getDetail: async (placeId: string) => {
    const { data } = await apiClient.get<Place>(`/places/${placeId}`)
    return data
  },
}
