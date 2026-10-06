import { create } from 'zustand'
import type { MapBoundsQuery } from '../types/place'

interface MapCenter {
  lat: number
  lng: number
}

interface MapState {
  center: MapCenter
  bounds: MapBoundsQuery | null
  selectedPlaceId: string | null
  isBottomSheetOpen: boolean
  setCenter: (center: MapCenter) => void
  setBounds: (bounds: MapBoundsQuery) => void
  selectPlace: (placeId: string | null) => void
}

const DEFAULT_CENTER: MapCenter = { lat: 37.5665, lng: 126.978 } // 서울시청 기준 초기 좌표

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  bounds: null,
  selectedPlaceId: null,
  isBottomSheetOpen: false,
  setCenter: (center) => set({ center }),
  setBounds: (bounds) => set({ bounds }),
  selectPlace: (placeId) =>
    set({ selectedPlaceId: placeId, isBottomSheetOpen: placeId !== null }),
}))
