-- 내 장소 목록(+선택적 지도 Bounds 필터) 조회. user_places + places + memories 통계를 한 번에 반환한다.
-- p_user_id를 검증 없이 그대로 사용하므로 Backend(Service Role Key)에서만 호출해야 한다.
create or replace function public.get_my_places(
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
  from public.user_places up
  join public.places p on p.id = up.place_id
  left join public.memories m on m.place_id = p.id and m.user_id = up.user_id
  where up.user_id = p_user_id
    and (p_min_lat is null or p.latitude between p_min_lat and p_max_lat)
    and (p_min_lng is null or p.longitude between p_min_lng and p_max_lng)
  group by p.id, up.status
  order by p.created_at desc;
$$;
