create table public.memory_menus (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  menu_name varchar(100) not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index memory_menus_memory_id_idx on public.memory_menus (memory_id);
