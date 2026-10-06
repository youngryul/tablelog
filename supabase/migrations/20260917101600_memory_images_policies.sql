-- memory_images도 memory_menus와 동일하게 상위 memories 기준으로 위임한다.
create policy "memory_images_select_via_memory"
on public.memory_images for select
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_images.memory_id
      and (m.user_id = auth.uid() or (m.visibility = 'PUBLIC' and m.deleted_at is null))
  )
);

create policy "memory_images_insert_via_memory"
on public.memory_images for insert
to authenticated
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_images.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "memory_images_update_via_memory"
on public.memory_images for update
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_images.memory_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_images.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "memory_images_delete_via_memory"
on public.memory_images for delete
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_images.memory_id
      and m.user_id = auth.uid()
  )
);
