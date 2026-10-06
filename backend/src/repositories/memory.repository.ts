import { supabaseAdminClient } from '../lib/supabase'
import type {
  CreateMemoryInput,
  Memory,
  MemoryVisibility,
  PageQuery,
  PublicMemory,
  TimelineQuery,
  UpdateMemoryInput,
} from '../types/memory'

const MEMORY_RELATIONS = 'memory_menus(menu_name, sort_order), memory_images(id, image_url, sort_order)'
const MEMORY_SELECT_WITH_RELATIONS = `*, ${MEMORY_RELATIONS}`
const PUBLIC_MEMORY_SELECT = `*, profiles(nickname, profile_image_url), ${MEMORY_RELATIONS}`

interface MemoryRow {
  id: string
  place_id: string
  visit_date: string
  memory_text: string
  short_comment: string | null
  companion: string | null
  visibility: MemoryVisibility
  revisit_yn: boolean | null
  created_at: string
  updated_at: string
  memory_menus: { menu_name: string; sort_order: number }[] | null
  memory_images: { id: string; image_url: string; sort_order: number }[] | null
}

interface PublicMemoryRow extends MemoryRow {
  profiles: { nickname: string; profile_image_url: string | null } | null
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    placeId: row.place_id,
    visitDate: row.visit_date,
    memoryText: row.memory_text,
    shortComment: row.short_comment,
    companion: row.companion,
    visibility: row.visibility,
    revisitYn: row.revisit_yn,
    menus: (row.memory_menus ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => m.menu_name),
    images: (row.memory_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, imageUrl: img.image_url, sortOrder: img.sort_order })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPublicMemory(row: PublicMemoryRow): PublicMemory {
  return {
    ...toMemory(row),
    authorNickname: row.profiles?.nickname ?? '알 수 없음',
    authorProfileImageUrl: row.profiles?.profile_image_url ?? null,
  }
}

export const memoryRepository = {
  async createWithMenus(userId: string, input: CreateMemoryInput): Promise<string> {
    const { data, error } = await supabaseAdminClient.rpc('create_memory_with_menus', {
      p_user_id: userId,
      p_place_id: input.placeId,
      p_visit_date: input.visitDate,
      p_memory_text: input.memoryText,
      p_short_comment: input.shortComment ?? null,
      p_companion: input.companion ?? null,
      p_visibility: input.visibility,
      p_revisit_yn: input.revisitYn ?? null,
      p_menu_names: input.menus,
    })

    if (error) throw error
    return data as string
  },

  async findById(memoryId: string): Promise<Memory | null> {
    const { data, error } = await supabaseAdminClient
      .from('memories')
      .select(MEMORY_SELECT_WITH_RELATIONS)
      .eq('id', memoryId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data ? toMemory(data as unknown as MemoryRow) : null
  },

  /** userId 소유의 memory만 수정. 영향받은 row가 없으면 null (본인 소유가 아니거나 존재하지 않음). */
  async update(memoryId: string, userId: string, patch: UpdateMemoryInput): Promise<Memory | null> {
    const updateFields: Record<string, unknown> = {}
    if (patch.visitDate !== undefined) updateFields.visit_date = patch.visitDate
    if (patch.memoryText !== undefined) updateFields.memory_text = patch.memoryText
    if (patch.shortComment !== undefined) updateFields.short_comment = patch.shortComment
    if (patch.companion !== undefined) updateFields.companion = patch.companion
    if (patch.visibility !== undefined) updateFields.visibility = patch.visibility
    if (patch.revisitYn !== undefined) updateFields.revisit_yn = patch.revisitYn

    if (Object.keys(updateFields).length > 0) {
      const { data, error } = await supabaseAdminClient
        .from('memories')
        .update(updateFields)
        .eq('id', memoryId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) return null
    }

    if (patch.menus !== undefined) {
      const { error: deleteError } = await supabaseAdminClient
        .from('memory_menus')
        .delete()
        .eq('memory_id', memoryId)
      if (deleteError) throw deleteError

      if (patch.menus.length > 0) {
        const { error: insertError } = await supabaseAdminClient.from('memory_menus').insert(
          patch.menus.map((menuName, index) => ({
            memory_id: memoryId,
            menu_name: menuName,
            sort_order: index,
          })),
        )
        if (insertError) throw insertError
      }
    }

    return this.findById(memoryId)
  },

  /** userId 소유의 memory만 Soft Delete. 성공 여부를 반환한다. */
  async softDelete(memoryId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdminClient
      .from('memories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', memoryId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle()

    if (error) throw error
    return data !== null
  },

  async findMyForPlace(userId: string, placeId: string): Promise<Memory[]> {
    const { data, error } = await supabaseAdminClient
      .from('memories')
      .select(MEMORY_SELECT_WITH_RELATIONS)
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })

    if (error) throw error
    return (data as unknown as MemoryRow[]).map(toMemory)
  },

  async findPublicForPlace(placeId: string, { page, size }: PageQuery): Promise<PublicMemory[]> {
    const from = (page - 1) * size
    const { data, error } = await supabaseAdminClient
      .from('memories')
      .select(PUBLIC_MEMORY_SELECT)
      .eq('place_id', placeId)
      .eq('visibility', 'PUBLIC')
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })
      .range(from, from + size - 1)

    if (error) throw error
    return (data as unknown as PublicMemoryRow[]).map(toPublicMemory)
  },

  async findMyTimeline(userId: string, query: TimelineQuery): Promise<Memory[]> {
    const from = (query.page - 1) * query.size
    let builder = supabaseAdminClient
      .from('memories')
      .select(MEMORY_SELECT_WITH_RELATIONS)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (query.year !== undefined) {
      // month가 없으면 연도 전체, 있으면 해당 월만 필터링한다.
      // 타임존에 의한 날짜 오차를 피하기 위해 Date 객체 대신 문자열 계산만 사용한다.
      const year = query.year
      let start: string
      let end: string
      if (query.month !== undefined) {
        const nextMonth = query.month === 12 ? 1 : query.month + 1
        const nextYear = query.month === 12 ? year + 1 : year
        start = `${year}-${String(query.month).padStart(2, '0')}-01`
        end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
      } else {
        start = `${year}-01-01`
        end = `${year + 1}-01-01`
      }
      builder = builder.gte('visit_date', start).lt('visit_date', end)
    }

    const { data, error } = await builder
      .order('visit_date', { ascending: false })
      .range(from, from + query.size - 1)

    if (error) throw error
    return (data as unknown as MemoryRow[]).map(toMemory)
  },

  async isOwnedByUser(memoryId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdminClient
      .from('memories')
      .select('id')
      .eq('id', memoryId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data !== null
  },

  async addImages(memoryId: string, images: { storagePath: string; imageUrl: string }[]): Promise<void> {
    if (images.length === 0) return

    const { count, error: countError } = await supabaseAdminClient
      .from('memory_images')
      .select('id', { count: 'exact', head: true })
      .eq('memory_id', memoryId)
    if (countError) throw countError

    const startSortOrder = count ?? 0
    const { error } = await supabaseAdminClient.from('memory_images').insert(
      images.map((image, index) => ({
        memory_id: memoryId,
        storage_path: image.storagePath,
        image_url: image.imageUrl,
        sort_order: startSortOrder + index,
      })),
    )
    if (error) throw error
  },
}
