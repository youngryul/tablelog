import { Header } from '../components/layout/Header'
import { MemoryCard } from '../components/memory/MemoryCard'
import { useMyTimeline } from '../hooks/useMemories'

export function MemoryTimelinePage() {
  const { data: memories = [], isLoading } = useMyTimeline()

  return (
    <div className="pb-20">
      <Header title="내 추억 타임라인" />

      {isLoading && <p className="p-4 text-sm text-[var(--color-text-muted)]">불러오는 중...</p>}

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
        {!isLoading && memories.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[var(--color-text-muted)]">
            아직 남긴 추억이 없어요.
          </p>
        )}
      </div>
    </div>
  )
}
