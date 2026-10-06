import { randomUUID } from 'node:crypto'
import { supabaseAdminClient } from '../lib/supabase'
import { ApiError } from '../types'

const MEMORY_IMAGES_BUCKET = 'memory-images'
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const storageService = {
  isAllowedMimeType(mimeType: string): boolean {
    return mimeType in ALLOWED_MIME_TYPES
  },

  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,

  async uploadMemoryImage(
    userId: string,
    memoryId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ storagePath: string; imageUrl: string }> {
    const extension = ALLOWED_MIME_TYPES[file.mimetype]
    if (!extension) {
      throw new ApiError(400, 'INVALID_IMAGE_TYPE', `허용되지 않는 이미지 형식입니다: ${file.mimetype}`)
    }

    const storagePath = `${userId}/${memoryId}/${randomUUID()}.${extension}`

    const { error } = await supabaseAdminClient.storage
      .from(MEMORY_IMAGES_BUCKET)
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false })

    if (error) {
      throw new ApiError(502, 'IMAGE_UPLOAD_FAILED', `이미지 업로드에 실패했습니다: ${error.message}`)
    }

    const { data: publicUrlData } = supabaseAdminClient.storage
      .from(MEMORY_IMAGES_BUCKET)
      .getPublicUrl(storagePath)

    return { storagePath, imageUrl: publicUrlData.publicUrl }
  },
}
