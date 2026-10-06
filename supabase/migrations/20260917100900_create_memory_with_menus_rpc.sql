-- Memory 등록(memories + memory_menus)을 하나의 트랜잭션으로 처리하기 위한 RPC.
-- p_user_id를 검증 없이 그대로 사용하므로, 반드시 Backend(Service Role Key)에서만 호출해야 한다.
-- Anon Key로 Frontend에 노출하면 임의의 user_id로 기록을 생성할 수 있으므로 절대 노출 금지.
create or replace function public.create_memory_with_menus(
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
  insert into public.memories (
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
    insert into public.memory_menus (memory_id, menu_name, sort_order)
    values (v_memory_id, v_menu_name, v_sort_order);
    v_sort_order := v_sort_order + 1;
  end loop;

  return v_memory_id;
end;
$$;
