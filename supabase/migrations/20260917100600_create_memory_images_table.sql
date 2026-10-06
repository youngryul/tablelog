create table public.memory_images (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index memory_images_memory_id_idx on public.memory_images (memory_id);

comment on column public.memory_images.storage_path is 'Supabase Storage 내부 경로. 형식: /{userId}/{memoryId}/{uuid}.jpg';
