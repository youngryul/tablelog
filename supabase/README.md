# Supabase Migrations

`migrations/` 폴더는 Supabase CLI의 마이그레이션 파일명 규칙(`<timestamp>_<name>.sql`)을 따른다.

## 적용 방법

### 방법 1 — Supabase CLI 사용 (권장)

```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref <프로젝트-ref>
npx supabase db push
```

### 방법 2 — SQL Editor에 직접 붙여넣기

Supabase 대시보드 > SQL Editor에서 `migrations/` 폴더의 파일을 **파일명 순서대로** 하나씩 실행한다.

## 파일 구성

| 파일 | 내용 |
|---|---|
| `..._create_extensions.sql` | `pgcrypto` 확장 (UUID 생성) |
| `..._create_profiles_table.sql` | `profiles` 테이블 |
| `..._create_places_table.sql` | `places` 테이블 + 위경도 인덱스 |
| `..._create_user_places_table.sql` | `user_places` 테이블 |
| `..._create_memories_table.sql` | `memories` 테이블 (Soft Delete) |
| `..._create_memory_menus_table.sql` | `memory_menus` 테이블 |
| `..._create_memory_images_table.sql` | `memory_images` 테이블 |
| `..._create_updated_at_trigger.sql` | `updated_at` 자동 갱신 트리거 |
| `..._create_profile_signup_trigger.sql` | 회원가입 시 `profiles` 자동 생성 트리거 |
| `..._create_memory_with_menus_rpc.sql` | Memory + Menu 원자적 생성 RPC (Backend 전용) |
| `..._enable_rls.sql` | 6개 테이블 Row Level Security 활성화 |
| `..._profiles_policies.sql` | `profiles` RLS Policy |
| `..._places_policies.sql` | `places` RLS Policy |
| `..._user_places_policies.sql` | `user_places` RLS Policy |
| `..._memories_policies.sql` | `memories` RLS Policy (PRIVATE/PUBLIC 조회 분기) |
| `..._memory_menus_policies.sql` | `memory_menus` RLS Policy (상위 memories 위임) |
| `..._memory_images_policies.sql` | `memory_images` RLS Policy (상위 memories 위임) |
| `..._storage_bucket_and_policies.sql` | `memory-images` Storage 버킷 생성 + 폴더 소유권 기반 Policy |

## RLS 검증 방법

이 프로젝트의 RLS Policy는 Docker Postgres 15 컨테이너에 `auth`/`storage` 스키마와 `authenticated` 역할을 stub으로 구성한 뒤
`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '<user-uuid>', false);` 로 로그인 사용자를 시뮬레이션하여
다음을 확인했다.

- 타인의 PRIVATE 기록은 SELECT 자체가 보이지 않는다 (목록에서 사라짐, 403이 아님)
- 타인의 PUBLIC 기록은 SELECT는 가능하지만 UPDATE/DELETE는 0 rows로 무시된다
- 타인 명의(`user_id`)로 INSERT 시도 시 `new row violates row-level security policy` 에러로 거부된다
- `memory_menus`/`memory_images`는 상위 `memories` 소유권을 그대로 상속한다
- Storage 업로드는 경로의 첫 segment(`userId`)가 본인 UID와 다르면 거부된다

전체 설계 배경은 [`../docs/01-architecture-erd-rls.md`](../docs/01-architecture-erd-rls.md) 참고.
