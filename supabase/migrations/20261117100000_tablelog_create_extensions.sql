-- gen_random_uuid() 사용을 위한 확장. Supabase 프로젝트는 기본 활성화되어 있는 경우가 많지만 명시적으로 보장한다.
create extension if not exists pgcrypto;
