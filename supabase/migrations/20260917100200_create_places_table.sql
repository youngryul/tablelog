create table public.places (
  id uuid primary key default gen_random_uuid(),
  external_place_id varchar(100) unique,
  name varchar(200) not null,
  address text,
  road_address text,
  latitude double precision not null,
  longitude double precision not null,
  phone varchar(30),
  category varchar(100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 지도 Bounds 조회(latitude/longitude BETWEEN)를 위한 복합 인덱스
create index places_lat_lng_idx on public.places (latitude, longitude);

comment on table public.places is '장소 정보. external_place_id 기준으로 지도 Provider의 동일 장소 중복 생성을 방지한다.';
