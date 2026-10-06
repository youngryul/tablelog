-- auth.users에 신규 가입이 발생하면 profiles row를 자동 생성한다.
-- 닉네임은 회원가입 시 전달된 metadata.nickname을 우선 사용하고, 없으면 이메일 앞부분을 기본값으로 사용한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
