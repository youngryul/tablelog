import { placeRepository } from '../repositories/place.repository'
import { ApiError } from '../types'
import type {
  KakaoKeywordSearchResponse,
  MapBoundsQuery,
  Place,
  PlaceSearchResult,
  PlaceSummary,
  SavePlaceInput,
} from '../types/place'

const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json'

export const placeService = {
  async searchPlaces(keyword: string): Promise<PlaceSearchResult[]> {
    const kakaoApiKey = process.env.MAP_API_KEY
    if (!kakaoApiKey) {
      throw new ApiError(500, 'MAP_API_KEY_MISSING', 'MAP_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    const url = new URL(KAKAO_KEYWORD_SEARCH_URL)
    url.searchParams.set('query', keyword)
    url.searchParams.set('size', '15')

    const response = await fetch(url, {
      headers: { Authorization: `KakaoAK ${kakaoApiKey}` },
    })

    if (!response.ok) {
      throw new ApiError(502, 'KAKAO_API_ERROR', `카카오 장소 검색 API 호출에 실패했습니다. (${response.status})`)
    }

    const data = (await response.json()) as KakaoKeywordSearchResponse

    return data.documents.map((doc) => ({
      externalPlaceId: doc.id,
      name: doc.place_name,
      address: doc.address_name,
      roadAddress: doc.road_address_name || doc.address_name,
      latitude: Number(doc.y),
      longitude: Number(doc.x),
      phone: doc.phone || null,
      category: doc.category_name || null,
    }))
  },

  async savePlace(userId: string, input: SavePlaceInput): Promise<Place> {
    const place = await placeRepository.upsertPlace(input)
    await placeRepository.linkUserPlace(userId, place.id, input.status)
    return place
  },

  async getMyPlaces(userId: string, bounds?: MapBoundsQuery): Promise<PlaceSummary[]> {
    return placeRepository.findMyPlaces(userId, bounds)
  },

  async getPlaceById(placeId: string): Promise<Place> {
    const place = await placeRepository.findById(placeId)
    if (!place) {
      throw new ApiError(404, 'PLACE_NOT_FOUND', '장소를 찾을 수 없습니다.')
    }
    return place
  },
}
