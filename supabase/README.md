# Supabase Migrations

`migrations/` 폴더는 Supabase CLI의 마이그레이션 파일명 규칙(`<timestamp>_<name>.sql`)을 따른다.

## 이름 규칙 — `tablelog_` 접두어

하나의 Supabase DB를 여러 서비스가 함께 쓰므로, tablelog가 만드는 DB 객체에는 모두 접두어를 붙인다.
테이블·인덱스·함수·트리거·RLS 정책 이름은 스키마(또는 프로젝트) 전체에서 겹치면 생성이 실패하거나 다른 서비스 것을 덮어쓰기 때문이다.

| 종류 | 규칙 | 예 |
|---|---|---|
| 테이블 | `tablelog_<이름>` | `tablelog_profiles`, `tablelog_memories` |
| 인덱스 | `tablelog_<테이블>_<컬럼>_idx` | `tablelog_places_lat_lng_idx` |
| 함수 / RPC | `tablelog_<이름>` | `tablelog_get_my_places` |
| 트리거 | `tablelog_<이름>` | `tablelog_set_places_updated_at` |
| RLS 정책 | `tablelog_<테이블>_<동작>` | `tablelog_memories_select_own_or_public` |
| Storage 버킷 | `tablelog-<이름>` | `tablelog-memory-images` |

`auth.users`는 다른 서비스와 공유하므로 **가입 트리거를 걸지 않는다.** 가입 트리거는 모든 서비스의 가입마다 실행되고,
실패하면 다른 서비스의 회원가입까지 막는다. 대신 Backend `authMiddleware`가 첫 인증 요청 때 `tablelog_profiles` row를 만든다.

## 적용 방법

### 방법 1 — Supabase CLI 사용

```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref <프로젝트-ref>
npx supabase db push
```

공유 DB의 `supabase_migrations.schema_migrations`에는 다른 서비스의 마이그레이션 버전도 기록되어 있어서,
`db push`가 "Remote migration versions not found in local migrations directory"로 멈출 수 있다.
그때는 다른 서비스의 이력을 건드리지 않도록 방법 2를 쓴다.

### 방법 2 — SQL Editor에 직접 붙여넣기

Supabase 대시보드 > SQL Editor에서 `migrations/` 폴더의 파일을 **파일명 순서대로** 하나씩 실행한다.

## 파일 구성

| 파일 | 내용 |
|---|---|
| `..._tablelog_create_extensions.sql` | `pgcrypto` 확장 (UUID 생성) |
| `..._tablelog_create_tables.sql` | 6개 테이블 + 인덱스 (`tablelog_profiles`, `tablelog_places`, `tablelog_user_places`, `tablelog_memories`, `tablelog_memory_menus`, `tablelog_memory_images`) |
| `..._tablelog_create_functions.sql` | `updated_at` 자동 갱신 트리거, Memory + Menu 원자적 생성 RPC, 내 장소 조회 RPC (RPC는 Service Role만 실행 가능) |
| `..._tablelog_enable_rls_and_policies.sql` | 6개 테이블 RLS 활성화 + 테이블별 Policy |
| `..._tablelog_storage_bucket_and_policies.sql` | `tablelog-memory-images` Storage 버킷 생성 + 폴더 소유권 기반 Policy |

## RLS 검증 방법

이 프로젝트의 RLS Policy는 Docker Postgres 15 컨테이너에 `auth`/`storage` 스키마와 `authenticated` 역할을 stub으로 구성한 뒤
`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '<user-uuid>', false);` 로 로그인 사용자를 시뮬레이션하여
다음을 확인했다. (접두어 적용 전 스키마 기준)

- 타인의 PRIVATE 기록은 SELECT 자체가 보이지 않는다 (목록에서 사라짐, 403이 아님)
- 타인의 PUBLIC 기록은 SELECT는 가능하지만 UPDATE/DELETE는 0 rows로 무시된다
- 타인 명의(`user_id`)로 INSERT 시도 시 `new row violates row-level security policy` 에러로 거부된다
- `tablelog_memory_menus`/`tablelog_memory_images`는 상위 `tablelog_memories` 소유권을 그대로 상속한다
- Storage 업로드는 경로의 첫 segment(`userId`)가 본인 UID와 다르면 거부된다

전체 설계 배경은 [`../docs/01-architecture-erd-rls.md`](../docs/01-architecture-erd-rls.md) 참고.
