import type { Request, Response } from 'express'
import { placeService } from '../services/place.service'
import { ApiError, type AuthenticatedRequest } from '../types'
import type { MapBoundsQuery, SavePlaceInput } from '../types/place'
import { ok } from '../utils/response'

function parseBounds(query: Request['query']): MapBoundsQuery | undefined {
  const { minLat, maxLat, minLng, maxLng } = query
  if (minLat === undefined && maxLat === undefined && minLng === undefined && maxLng === undefined) {
    return undefined
  }

  const bounds = {
    minLat: Number(minLat),
    maxLat: Number(maxLat),
    minLng: Number(minLng),
    maxLng: Number(maxLng),
  }

  if (Object.values(bounds).some((value) => Number.isNaN(value))) {
    throw new ApiError(400, 'INVALID_BOUNDS', 'minLat/maxLat/minLng/maxLng는 숫자여야 합니다.')
  }

  return bounds
}

export const placeController = {
  async search(req: Request, res: Response) {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : ''
    if (!keyword) {
      throw new ApiError(400, 'INVALID_KEYWORD', 'keyword 쿼리 파라미터가 필요합니다.')
    }

    const results = await placeService.searchPlaces(keyword)
    ok(res, results)
  },

  async save(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const input = req.body as SavePlaceInput

    if (!input.externalPlaceId || !input.name || input.latitude == null || input.longitude == null) {
      throw new ApiError(400, 'INVALID_PLACE_INPUT', '장소 정보가 올바르지 않습니다.')
    }

    const place = await placeService.savePlace(user.id, input)
    ok(res, place, 201)
  },

  async myPlaces(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const places = await placeService.getMyPlaces(user.id)
    ok(res, places)
  },

  async myPlacesInBounds(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const bounds = parseBounds(req.query)
    if (!bounds) {
      throw new ApiError(400, 'MISSING_BOUNDS', 'minLat/maxLat/minLng/maxLng 쿼리 파라미터가 필요합니다.')
    }

    const places = await placeService.getMyPlaces(user.id, bounds)
    ok(res, places)
  },

  async detail(req: Request, res: Response) {
    const place = await placeService.getPlaceById(req.params.placeId as string)
    ok(res, place)
  },
}
