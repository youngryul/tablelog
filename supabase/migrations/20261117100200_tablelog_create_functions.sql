-- 함수 이름은 public 스키마 전체에서 하나뿐이라 set_updated_at() 같은 흔한 이름은 다른 서비스 함수를 덮어쓸 수 있다.
-- 그래서 함수·트리거에도 tablelog_ 접두어를 붙인다.

-- ───────── updated_at 자동 갱신 ─────────
create or replace function public.tablelog_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tablelog_set_profiles_updated_at
before update on public.tablelog_profiles
for each row execute function public.tablelog_set_updated_at();

create trigger tablelog_set_places_updated_at
before update on public.tablelog_places
for each row execute function public.tablelog_set_updated_at();

create trigger tablelog_set_memories_updated_at
before update on public.tablelog_memories
for each row execute function public.tablelog_set_updated_at();

-- ───────── Memory + Menu 원자적 생성 RPC ─────────
-- p_user_id를 검증 없이 그대로 사용하므로 Backend(Service Role Key)에서만 호출할 수 있게 실행 권한을 제한한다.
create or replace function public.tablelog_create_memory_with_menus(
  p_user_id uuid,
  p_place_id uuid,
  p_visit_date date,
  p_memory_text text,
  p_short_comment text,
  p_companion text,
  p_visibility varchar,
  p_revisit_yn boolean,
  p_menu_names text[]
)
returns uuid
language plpgsql
as $$
declare
  v_memory_id uuid;
  v_menu_name text;
  v_sort_order integer := 0;
begin
  insert into public.tablelog_memories (
    user_id, place_id, visit_date, memory_text, short_comment,
    companion, visibility, revisit_yn
  )
  values (
    p_user_id, p_place_id, p_visit_date, p_memory_text, p_short_comment,
    p_companion, p_visibility, p_revisit_yn
  )
  returning id into v_memory_id;

  foreach v_menu_name in array p_menu_names
  loop
    insert into public.tablelog_memory_menus (memory_id, menu_name, sort_order)
    values (v_memory_id, v_menu_name, v_sort_order);
    v_sort_order := v_sort_order + 1;
  end loop;

  return v_memory_id;
end;
$$;

-- ───────── 내 장소 목록(+지도 Bounds) 조회 RPC ─────────
-- user_places + places + memories 통계를 한 번에 반환한다. 마찬가지로 Backend 전용.
create or replace function public.tablelog_get_my_places(
  p_user_id uuid,
  p_min_lat double precision default null,
  p_max_lat double precision default null,
  p_min_lng double precision default null,
  p_max_lng double precision default null
)
returns table (
  id uuid,
  external_place_id varchar,
  name varchar,
  address text,
  road_address text,
  latitude double precision,
  longitude double precision,
  phone varchar,
  category varchar,
  status varchar,
  my_visit_count bigint,
  last_visit_date date,
  my_memory_count bigint
)
language sql
stable
as $$
  select
    p.id,
    p.external_place_id,
    p.name,
    p.address,
    p.road_address,
    p.latitude,
    p.longitude,
    p.phone,
    p.category,
    up.status,
    count(m.id) filter (where m.deleted_at is null) as my_visit_count,
    max(m.visit_date) filter (where m.deleted_at is null) as last_visit_date,
    count(m.id) filter (where m.deleted_at is null) as my_memory_count
  from public.tablelog_user_places up
  join public.tablelog_places p on p.id = up.place_id
  left join public.tablelog_memories m on m.place_id = p.id and m.user_id = up.user_id
  where up.user_id = p_user_id
    and (p_min_lat is null or p.latitude between p_min_lat and p_max_lat)
    and (p_min_lng is null or p.longitude between p_min_lng and p_max_lng)
  group by p.id, up.status
  order by p.created_at desc;
$$;

-- 함수는 기본으로 PUBLIC에 실행 권한이 있어 Anon Key로 /rest/v1/rpc 호출이 가능하다.
-- 임의의 p_user_id로 남의 데이터를 읽고 쓰지 못하도록 Service Role만 실행할 수 있게 한다.
revoke execute on function public.tablelog_create_memory_with_menus(uuid, uuid, date, text, text, text, varchar, boolean, text[])
  from public, anon, authenticated;
grant execute on function public.tablelog_create_memory_with_menus(uuid, uuid, date, text, text, text, varchar, boolean, text[])
  to service_role;

revoke execute on function public.tablelog_get_my_places(uuid, double precision, double precision, double precision, double precision)
  from public, anon, authenticated;
grant execute on function public.tablelog_get_my_places(uuid, double precision, double precision, double precision, double precision)
  to service_role;
