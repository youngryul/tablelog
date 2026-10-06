create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname varchar(30) not null,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Supabase Auth 사용자와 1:1로 연결되는 프로필. id는 auth.users.id와 동일하다.';
