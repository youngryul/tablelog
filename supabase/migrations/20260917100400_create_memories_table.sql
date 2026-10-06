create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete restrict,
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
create index memories_user_id_visit_date_idx on public.memories (user_id, visit_date desc);
-- 장소 상세 > 사람들의 추억 조회 (visibility='PUBLIC' AND deleted_at IS NULL)
create index memories_place_visibility_idx on public.memories (place_id, visibility, deleted_at);
-- 장소 상세 > 내 추억 조회
create index memories_user_place_idx on public.memories (user_id, place_id);

comment on table public.memories is '방문 기록. deleted_at이 NULL이 아니면 Soft Delete 처리된 것으로 간주한다. place_id는 기록이 있는 장소가 실수로 삭제되지 않도록 ON DELETE RESTRICT.';
