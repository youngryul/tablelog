create policy "user_places_select_own"
on public.user_places for select
to authenticated
using (auth.uid() = user_id);

create policy "user_places_insert_own"
on public.user_places for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_places_update_own"
on public.user_places for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_places_delete_own"
on public.user_places for delete
to authenticated
using (auth.uid() = user_id);
