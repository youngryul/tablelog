create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_places_updated_at
before update on public.places
for each row execute function public.set_updated_at();

create trigger set_memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();
