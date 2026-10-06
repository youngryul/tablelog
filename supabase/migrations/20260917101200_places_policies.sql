-- 장소 정보 자체는 개인정보가 아니므로 조회는 전체 공개한다.
create policy "places_select_all"
on public.places for select
to authenticated
using (true);

-- 신규 장소는 로그인한 사용자 누구나 등록할 수 있다 (지도 검색 결과 저장 시).
create policy "places_insert_authenticated"
on public.places for insert
to authenticated
with check (true);

-- UPDATE/DELETE 정책 없음: 장소 정보 수정(UPSERT)과 삭제는 Backend가 Service Role Key로만 수행한다.
