-- 하나의 DB를 여러 서비스가 함께 쓰므로 tablelog의 모든 DB 객체(테이블·인덱스·함수·트리거·정책·버킷)에는
-- tablelog_ 접두어를 붙여 다른 서비스의 객체와 이름이 겹치거나 덮어써지지 않게 한다.

-- ───────── tablelog_profiles ─────────
create table public.tablelog_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname varchar(30) not null,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tablelog_profiles is
  'Supabase Auth 사용자와 1:1로 연결되는 tablelog 프로필. id는 auth.users.id와 동일하다. auth.users를 다른 서비스와 공유하므로 가입 트리거를 쓰지 않고 Backend가 첫 인증 요청 때 생성한다.';

-- ───────── tablelog_places ─────────
create table public.tablelog_places (
  id uuid primary key default gen_random_uuid(),
  external_place_id varchar(100) unique,
  name varchar(200) not null,
  address text,
  road_address text,
  latitude double precision not null,
  longitude double precision not null,
  phone varchar(30),
  category varchar(100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 지도 Bounds 조회(latitude/longitude BETWEEN)를 위한 복합 인덱스
create index tablelog_places_lat_lng_idx on public.tablelog_places (latitude, longitude);

comment on table public.tablelog_places is '장소 정보. external_place_id 기준으로 지도 Provider의 동일 장소 중복 생성을 방지한다.';

-- ───────── tablelog_user_places ─────────
create table public.tablelog_user_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.tablelog_profiles (id) on delete cascade,
  place_id uuid not null references public.tablelog_places (id) on delete cascade,
  status varchar(20) not null check (status in ('WANT', 'VISITED', 'FAVORITE')),
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index tablelog_user_places_user_id_idx on public.tablelog_user_places (user_id);
create index tablelog_user_places_place_id_idx on public.tablelog_user_places (place_id);

comment on table public.tablelog_user_places is '사용자가 저장한 장소. user_id + place_id는 UNIQUE로 중복 저장을 방지한다.';

-- ───────── tablelog_memories ─────────
create table public.tablelog_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.tablelog_profiles (id) on delete cascade,
  place_id uuid not null references public.tablelog_places (id) on delete restrict,
  visit_date date not null,
  memory_text text not null,
  short_comment text,
  companion text,
  visibility varchar(10) not null default 'PRIVATE' check (visibility in ('PRIVATE', 'PUBLIC')),
  revisit_yn boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 내 타임라인 조회 (visit_date DESC)
create index tablelog_memories_user_id_visit_date_idx on public.tablelog_memories (user_id, visit_date desc);
-- 장소 상세 > 사람들의 추억 조회 (visibility='PUBLIC' AND deleted_at IS NULL)
create index tablelog_memories_place_visibility_idx on public.tablelog_memories (place_id, visibility, deleted_at);
-- 장소 상세 > 내 추억 조회
create index tablelog_memories_user_place_idx on public.tablelog_memories (user_id, place_id);

comment on table public.tablelog_memories is
  '방문 기록. deleted_at이 NULL이 아니면 Soft Delete 처리된 것으로 간주한다. place_id는 기록이 있는 장소가 실수로 삭제되지 않도록 ON DELETE RESTRICT.';

-- ───────── tablelog_memory_menus ─────────
create table public.tablelog_memory_menus (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.tablelog_memories (id) on delete cascade,
  menu_name varchar(100) not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index tablelog_memory_menus_memory_id_idx on public.tablelog_memory_menus (memory_id);

-- ───────── tablelog_memory_images ─────────
create table public.tablelog_memory_images (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.tablelog_memories (id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index tablelog_memory_images_memory_id_idx on public.tablelog_memory_images (memory_id);

comment on column public.tablelog_memory_images.storage_path is
  'Supabase Storage(tablelog-memory-images 버킷) 내부 경로. 형식: {userId}/{memoryId}/{uuid}.jpg';
