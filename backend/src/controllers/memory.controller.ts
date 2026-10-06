import type { Request, Response } from 'express'
import { memoryService } from '../services/memory.service'
import { ApiError, type AuthenticatedRequest } from '../types'
import type { CreateMemoryInput, UpdateMemoryInput } from '../types/memory'
import { ok } from '../utils/response'

function parsePageQuery(query: Request['query']) {
  const page = query.page ? Number(query.page) : 1
  const size = query.size ? Number(query.size) : 20

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1 || size > 100) {
    throw new ApiError(400, 'INVALID_PAGE_QUERY', 'page/size가 올바르지 않습니다.')
  }

  return { page, size }
}

function validateCreateInput(body: unknown): CreateMemoryInput {
  const input = body as Partial<CreateMemoryInput>
  if (!input.placeId || !input.visitDate || !input.memoryText || !input.visibility) {
    throw new ApiError(400, 'INVALID_MEMORY_INPUT', 'placeId/visitDate/memoryText/visibility는 필수입니다.')
  }
  if (input.visibility !== 'PRIVATE' && input.visibility !== 'PUBLIC') {
    throw new ApiError(400, 'INVALID_VISIBILITY', 'visibility는 PRIVATE 또는 PUBLIC이어야 합니다.')
  }

  return {
    placeId: input.placeId,
    visitDate: input.visitDate,
    memoryText: input.memoryText,
    shortComment: input.shortComment,
    companion: input.companion,
    visibility: input.visibility,
    revisitYn: input.revisitYn,
    menus: input.menus ?? [],
  }
}

export const memoryController = {
  async create(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const input = validateCreateInput(req.body)
    const memory = await memoryService.create(user.id, input)
    ok(res, memory, 201)
  },

  async update(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const patch = req.body as UpdateMemoryInput
    if (patch.visibility !== undefined && patch.visibility !== 'PRIVATE' && patch.visibility !== 'PUBLIC') {
      throw new ApiError(400, 'INVALID_VISIBILITY', 'visibility는 PRIVATE 또는 PUBLIC이어야 합니다.')
    }

    const memory = await memoryService.update(req.params.memoryId as string, user.id, patch)
    ok(res, memory)
  },

  async remove(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    await memoryService.remove(req.params.memoryId as string, user.id)
    ok(res, null)
  },

  async myForPlace(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const memories = await memoryService.getMyForPlace(user.id, req.params.placeId as string)
    ok(res, memories)
  },

  async publicForPlace(req: Request, res: Response) {
    const pageQuery = parsePageQuery(req.query)
    const memories = await memoryService.getPublicForPlace(req.params.placeId as string, pageQuery)
    ok(res, memories)
  },

  async myTimeline(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const pageQuery = parsePageQuery(req.query)
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined

    const memories = await memoryService.getMyTimeline(user.id, { ...pageQuery, year, month })
    ok(res, memories)
  },

  async uploadImages(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest
    const files = (req.files ?? []) as Express.Multer.File[]

    if (files.length === 0) {
      throw new ApiError(400, 'NO_IMAGES', '업로드할 이미지가 없습니다.')
    }

    const memory = await memoryService.addImages(
      req.params.memoryId as string,
      user.id,
      files.map((file) => ({ buffer: file.buffer, mimetype: file.mimetype })),
    )
    ok(res, memory)
  },
}
