-- 다른 사용자의 PUBLIC 추억에 닉네임/프로필 이미지를 표시해야 하므로 SELECT는 전체 공개한다.
create policy "profiles_select_all"
on public.profiles for select
to authenticated
using (true);

create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- DELETE 정책 없음: 회원 탈퇴는 Auth 사용자 삭제(및 CASCADE)로만 처리한다.
