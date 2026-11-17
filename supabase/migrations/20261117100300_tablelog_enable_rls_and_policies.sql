alter table public.tablelog_profiles enable row level security;
alter table public.tablelog_places enable row level security;
alter table public.tablelog_user_places enable row level security;
alter table public.tablelog_memories enable row level security;
alter table public.tablelog_memory_menus enable row level security;
alter table public.tablelog_memory_images enable row level security;

-- ───────── tablelog_profiles ─────────
-- 다른 사용자의 PUBLIC 추억에 닉네임/프로필 이미지를 표시해야 하므로 SELECT는 전체 공개한다.
create policy "tablelog_profiles_select_all"
on public.tablelog_profiles for select
to authenticated
using (true);

create policy "tablelog_profiles_insert_self"
on public.tablelog_profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "tablelog_profiles_update_self"
on public.tablelog_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- DELETE 정책 없음: 회원 탈퇴는 Auth 사용자 삭제(및 CASCADE)로만 처리한다.

-- ───────── tablelog_places ─────────
-- 장소 정보 자체는 개인정보가 아니므로 조회는 전체 공개한다.
create policy "tablelog_places_select_all"
on public.tablelog_places for select
to authenticated
using (true);

-- 신규 장소는 로그인한 사용자 누구나 등록할 수 있다 (지도 검색 결과 저장 시).
create policy "tablelog_places_insert_authenticated"
on public.tablelog_places for insert
to authenticated
with check (true);

-- UPDATE/DELETE 정책 없음: 장소 정보 수정(UPSERT)과 삭제는 Backend가 Service Role Key로만 수행한다.

-- ───────── tablelog_user_places ─────────
create policy "tablelog_user_places_select_own"
on public.tablelog_user_places for select
to authenticated
using (auth.uid() = user_id);

create policy "tablelog_user_places_insert_own"
on public.tablelog_user_places for insert
to authenticated
with check (auth.uid() = user_id);

create policy "tablelog_user_places_update_own"
on public.tablelog_user_places for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tablelog_user_places_delete_own"
on public.tablelog_user_places for delete
to authenticated
using (auth.uid() = user_id);

-- ───────── tablelog_memories ─────────
-- 본인 기록은 항상 조회 가능하고, 타인의 기록은 PUBLIC이면서 삭제되지 않은 경우에만 조회 가능하다.
create policy "tablelog_memories_select_own_or_public"
on public.tablelog_memories for select
to authenticated
using (
  auth.uid() = user_id
  or (visibility = 'PUBLIC' and deleted_at is null)
);

create policy "tablelog_memories_insert_own"
on public.tablelog_memories for insert
to authenticated
with check (auth.uid() = user_id);

create policy "tablelog_memories_update_own"
on public.tablelog_memories for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tablelog_memories_delete_own"
on public.tablelog_memories for delete
to authenticated
using (auth.uid() = user_id);

-- ───────── tablelog_memory_menus ─────────
-- 자체 소유자 컬럼이 없으므로 상위 tablelog_memories 기준으로 위임한다.
create policy "tablelog_memory_menus_select_via_memory"
on public.tablelog_memory_menus for select
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_menus.memory_id
      and (m.user_id = auth.uid() or (m.visibility = 'PUBLIC' and m.deleted_at is null))
  )
);

create policy "tablelog_memory_menus_insert_via_memory"
on public.tablelog_memory_menus for insert
to authenticated
with check (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "tablelog_memory_menus_update_via_memory"
on public.tablelog_memory_menus for update
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_menus.memory_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "tablelog_memory_menus_delete_via_memory"
on public.tablelog_memory_menus for delete
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_menus.memory_id
      and m.user_id = auth.uid()
  )
);

-- ───────── tablelog_memory_images ─────────
-- tablelog_memory_menus와 동일하게 상위 tablelog_memories 기준으로 위임한다.
create policy "tablelog_memory_images_select_via_memory"
on public.tablelog_memory_images for select
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_images.memory_id
      and (m.user_id = auth.uid() or (m.visibility = 'PUBLIC' and m.deleted_at is null))
  )
);

create policy "tablelog_memory_images_insert_via_memory"
on public.tablelog_memory_images for insert
to authenticated
with check (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_images.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "tablelog_memory_images_update_via_memory"
on public.tablelog_memory_images for update
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_images.memory_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_images.memory_id
      and m.user_id = auth.uid()
  )
);

create policy "tablelog_memory_images_delete_via_memory"
on public.tablelog_memory_images for delete
to authenticated
using (
  exists (
    select 1 from public.tablelog_memories m
    where m.id = tablelog_memory_images.memory_id
      and m.user_id = auth.uid()
  )
);
