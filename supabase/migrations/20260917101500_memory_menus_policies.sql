-- memory_menus는 자체 소유자 컬럼이 없으므로 상위 memories 기준으로 위임한다.
create policy "memory_menus_select_via_memory"
on public.memory_menus for select
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_menus.memory_id
      and (m.user_id = auth.uid() or (m.visibility = 'PUBLIC' and m.deleted_at is null))
  )
);

create policy "memory_menus_insert_via_memory"
on public.memory_menus for insert
to authenticated
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "memory_menus_update_via_memory"
on public.memory_menus for update
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_menus.memory_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "memory_menus_delete_via_memory"
on public.memory_menus for delete
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);
