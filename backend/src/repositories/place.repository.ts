import { supabaseAdminClient } from '../lib/supabase'
import type { MapBoundsQuery, Place, PlaceSummary, SavePlaceInput, UserPlaceStatus } from '../types/place'

interface GetMyPlacesRow {
  id: string
  external_place_id: string | null
  name: string
  address: string | null
  road_address: string | null
  latitude: number
  longitude: number
  phone: string | null
  category: string | null
  status: string
  my_visit_count: number
  last_visit_date: string | null
  my_memory_count: number
}

function toPlace(row: {
  id: string
  external_place_id: string | null
  name: string
  address: string | null
  road_address: string | null
  latitude: number
  longitude: number
  phone: string | null
  category: string | null
}): Place {
  return {
    id: row.id,
    externalPlaceId: row.external_place_id,
    name: row.name,
    address: row.address,
    roadAddress: row.road_address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    category: row.category,
  }
}

export const placeRepository = {
  async upsertPlace(input: SavePlaceInput): Promise<Place> {
    const { data, error } = await supabaseAdminClient
      .from('places')
      .upsert(
        {
          external_place_id: input.externalPlaceId,
          name: input.name,
          address: input.address,
          road_address: input.roadAddress,
          latitude: input.latitude,
          longitude: input.longitude,
          phone: input.phone,
          category: input.category,
        },
        { onConflict: 'external_place_id' },
      )
      .select()
      .single()

    if (error) throw error
    return toPlace(data)
  },

  async linkUserPlace(userId: string, placeId: string, status: UserPlaceStatus): Promise<void> {
    const { error } = await supabaseAdminClient
      .from('user_places')
      .upsert(
        { user_id: userId, place_id: placeId, status },
        { onConflict: 'user_id,place_id' },
      )

    if (error) throw error
  },

  async findById(placeId: string): Promise<Place | null> {
    const { data, error } = await supabaseAdminClient
      .from('places')
      .select()
      .eq('id', placeId)
      .maybeSingle()

    if (error) throw error
    return data ? toPlace(data) : null
  },

  async findMyPlaces(userId: string, bounds?: MapBoundsQuery): Promise<PlaceSummary[]> {
    const { data, error } = await supabaseAdminClient.rpc('get_my_places', {
      p_user_id: userId,
      p_min_lat: bounds?.minLat ?? null,
      p_max_lat: bounds?.maxLat ?? null,
      p_min_lng: bounds?.minLng ?? null,
      p_max_lng: bounds?.maxLng ?? null,
    })

    if (error) throw error

    const rows = (data ?? []) as GetMyPlacesRow[]

    return rows.map((row) => ({
      ...toPlace(row),
      status: row.status as UserPlaceStatus,
      myVisitCount: Number(row.my_visit_count),
      lastVisitDate: row.last_visit_date,
      myMemoryCount: Number(row.my_memory_count),
    }))
  },
}
