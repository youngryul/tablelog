import { useQuery } from '@tanstack/react-query'
import { placeApi } from '../api/placeApi'
import type { MapBoundsQuery } from '../types/place'

export const useMyPlaces = () =>
  useQuery({
    queryKey: ['places', 'me'],
    queryFn: placeApi.getMyPlaces,
  })

export const useMyPlacesInBounds = (bounds: MapBoundsQuery | null) =>
  useQuery({
    queryKey: ['places', 'me', 'map', bounds],
    queryFn: () => placeApi.getMyPlacesInBounds(bounds as MapBoundsQuery),
    enabled: bounds !== null,
  })

export const usePlaceDetail = (placeId: string | null) =>
  useQuery({
    queryKey: ['places', placeId],
    queryFn: () => placeApi.getDetail(placeId as string),
    enabled: placeId !== null,
  })
