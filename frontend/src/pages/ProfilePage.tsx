import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '../components/layout/Header'
import { userApi } from '../api/userApi'
import { supabase } from '../lib/supabase'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { data: profile } = useQuery({ queryKey: ['profile', 'me'], queryFn: userApi.getMyProfile })
  const [nickname, setNickname] = useState('')

  const updateProfile = useMutation({
    mutationFn: () => userApi.updateMyProfile({ nickname }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
  })

  return (
    <div className="pb-20">
      <Header title="프로필" />

      <div className="flex flex-col items-center gap-2 p-6 md:mx-auto md:max-w-md">
        {profile?.profileImageUrl && (
          <img
            src={profile.profileImageUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <p className="text-lg font-medium">{profile?.nickname}</p>
      </div>

      <div className="flex flex-col gap-3 px-4 md:mx-auto md:max-w-md">
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder={profile?.nickname ?? '닉네임'}
          className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm"
        />
        <button
          type="button"
          onClick={() => updateProfile.mutate()}
          disabled={!nickname || updateProfile.isPending}
          className="rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          닉네임 변경
        </button>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
