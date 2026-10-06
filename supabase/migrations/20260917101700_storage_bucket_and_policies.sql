-- memory-images 버킷: 공개 버킷(공개 URL로 이미지 서빙), 5MB 제한, 이미지 확장자만 허용
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-images',
  'memory-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- storage.objects는 Supabase 플랫폼이 소유하며 RLS도 기본 활성화되어 있다.
-- 프로젝트 소유자(postgres role)는 이 테이블의 owner가 아니므로 `alter table ... enable row level security`를
-- 실행하면 "must be owner of table objects" 에러가 난다. 아래 CREATE POLICY만으로 충분하다.

-- 파일 경로 규칙: /{userId}/{memoryId}/{uuid}.jpg
-- storage.foldername(name)은 파일명을 제외한 경로 segment 배열을 반환한다. (storage.foldername(name))[1] = userId
create policy "memory_images_bucket_select"
on storage.objects for select
to authenticated
using (bucket_id = 'memory-images');

create policy "memory_images_bucket_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "memory_images_bucket_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "memory_images_bucket_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
