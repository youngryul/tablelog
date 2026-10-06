import type { Memory, PublicMemory } from '../../types/memory'
import { MemoryImageGrid } from './MemoryImageGrid'

interface MemoryCardProps {
  memory: Memory | PublicMemory
}

function isPublicMemory(memory: Memory | PublicMemory): memory is PublicMemory {
  return 'authorNickname' in memory
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          {isPublicMemory(memory) && (
            <>
              {memory.authorProfileImageUrl && (
                <img
                  src={memory.authorProfileImageUrl}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="text-[var(--color-text)]">{memory.authorNickname}</span>
              <span>·</span>
            </>
          )}
          <span>{memory.visitDate}</span>
          {memory.companion && <span>· {memory.companion}와 방문</span>}
        </div>
        {!isPublicMemory(memory) && (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs">
            {memory.visibility === 'PRIVATE' ? '나만 보기' : '전체 공개'}
          </span>
        )}
      </div>

      {memory.menus.length > 0 && (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{memory.menus.join(' / ')}</p>
      )}

      <p className="mt-2 whitespace-pre-line text-sm">{memory.memoryText}</p>

      {memory.images.length > 0 && (
        <div className="mt-3">
          <MemoryImageGrid images={memory.images} />
        </div>
      )}
    </article>
  )
}
