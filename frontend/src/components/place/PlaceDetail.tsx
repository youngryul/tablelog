import { useState } from 'react'
import type { Place } from '../../types/place'
import { useMyMemoriesForPlace, usePublicMemoriesForPlace } from '../../hooks/useMemories'
import { MemoryCard } from '../memory/MemoryCard'

interface PlaceDetailProps {
  place: Place
}

type Tab = 'mine' | 'public'

export function PlaceDetail({ place }: PlaceDetailProps) {
  const [tab, setTab] = useState<Tab>('mine')
  const { data: myMemories } = useMyMemoriesForPlace(place.id)
  const { data: publicMemories } = usePublicMemoriesForPlace(place.id)

  return (
    <div className="md:mx-auto md:max-w-3xl">
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <h2 className="text-lg font-medium">{place.name}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{place.roadAddress ?? place.address}</p>
        {place.phone && <p className="text-sm text-[var(--color-text-muted)]">{place.phone}</p>}
      </div>

      <div className="flex border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`flex-1 py-3 text-sm ${tab === 'mine' ? 'border-b-2 border-[var(--color-accent)] font-medium' : 'text-[var(--color-text-muted)]'}`}
        >
          내 추억
        </button>
        <button
          type="button"
          onClick={() => setTab('public')}
          className={`flex-1 py-3 text-sm ${tab === 'public' ? 'border-b-2 border-[var(--color-accent)] font-medium' : 'text-[var(--color-text-muted)]'}`}
        >
          사람들의 추억
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        {tab === 'mine'
          ? myMemories?.map((memory) => <MemoryCard key={memory.id} memory={memory} />)
          : publicMemories?.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}
      </div>
    </div>
  )
}
