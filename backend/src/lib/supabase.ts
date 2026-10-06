import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase 환경변수(SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.',
  )
}

/** 요청 헤더의 Access Token 검증 전용. RLS가 적용된 상태로 동작한다. */
export const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 비즈니스 로직에서 사용하는 관리자 클라이언트. RLS를 우회하므로
 * 모든 Repository는 조회/수정 조건에 반드시 user_id 등을 명시적으로 포함해야 한다.
 */
export const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
