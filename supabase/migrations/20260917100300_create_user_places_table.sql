create table public.user_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  status varchar(20) not null check (status in ('WANT', 'VISITED', 'FAVORITE')),
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index user_places_user_id_idx on public.user_places (user_id);
create index user_places_place_id_idx on public.user_places (place_id);

comment on table public.user_places is '사용자가 저장한 장소. user_id + place_id는 UNIQUE로 중복 저장을 방지한다.';
