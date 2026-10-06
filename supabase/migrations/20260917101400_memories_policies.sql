-- 본인 기록은 항상 조회 가능하고, 타인의 기록은 PUBLIC이면서 삭제되지 않은 경우에만 조회 가능하다.
create policy "memories_select_own_or_public"
on public.memories for select
to authenticated
using (
  auth.uid() = user_id
  or (visibility = 'PUBLIC' and deleted_at is null)
);

create policy "memories_insert_own"
on public.memories for insert
to authenticated
with check (auth.uid() = user_id);

create policy "memories_update_own"
on public.memories for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "memories_delete_own"
on public.memories for delete
to authenticated
using (auth.uid() = user_id);
