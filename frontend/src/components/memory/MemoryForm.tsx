import { useState } from 'react'
import type { CreateMemoryRequest, MemoryVisibility } from '../../types/memory'
import { VisibilitySelector } from './VisibilitySelector'

interface MemoryFormProps {
  placeId: string
  placeName: string
  onSubmit: (payload: CreateMemoryRequest, images: File[]) => Promise<void>
  isSubmitting: boolean
}

export function MemoryForm({ placeId, placeName, onSubmit, isSubmitting }: MemoryFormProps) {
  const [visitDate, setVisitDate] = useState('')
  const [memoryText, setMemoryText] = useState('')
  const [shortComment, setShortComment] = useState('')
  const [companion, setCompanion] = useState('')
  const [menuInput, setMenuInput] = useState('')
  const [visibility, setVisibility] = useState<MemoryVisibility>('PRIVATE')
  const [revisitYn, setRevisitYn] = useState<boolean | null>(null)
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!visitDate || !memoryText) return

    const menus = menuInput
      .split(',')
      .map((menu) => menu.trim())
      .filter((menu) => menu.length > 0)

    await onSubmit(
      {
        placeId,
        visitDate,
        memoryText,
        shortComment: shortComment || undefined,
        companion: companion || undefined,
        visibility,
        revisitYn: revisitYn ?? undefined,
        menus,
      },
      images,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 md:mx-auto md:max-w-lg">
      <div>
        <label className="text-sm text-[var(--color-text-muted)]">장소</label>
        <p className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">{placeName}</p>
      </div>

      <div>
        <label htmlFor="visitDate" className="text-sm text-[var(--color-text-muted)]">
          방문 날짜
        </label>
        <input
          id="visitDate"
          type="date"
          value={visitDate}
          onChange={(event) => setVisitDate(event.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="companion" className="text-sm text-[var(--color-text-muted)]">
          함께한 사람
        </label>
        <input
          id="companion"
          value={companion}
          onChange={(event) => setCompanion(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="menu" className="text-sm text-[var(--color-text-muted)]">
          메뉴 (쉼표로 구분)
        </label>
        <input
          id="menu"
          value={menuInput}
          onChange={(event) => setMenuInput(event.target.value)}
          placeholder="라구 파스타, 뇨끼"
          className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="memoryText" className="text-sm text-[var(--color-text-muted)]">
          추억
        </label>
        <textarea
          id="memoryText"
          value={memoryText}
          onChange={(event) => setMemoryText(event.target.value)}
          required
          rows={4}
          className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="shortComment" className="text-sm text-[var(--color-text-muted)]">
          한줄평
        </label>
        <input
          id="shortComment"
          value={shortComment}
          onChange={(event) => setShortComment(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input
          id="revisitYn"
          type="checkbox"
          checked={revisitYn ?? false}
          onChange={(event) => setRevisitYn(event.target.checked)}
        />
        <label htmlFor="revisitYn">다시 방문하고 싶어요</label>
      </div>

      <div>
        <label htmlFor="images" className="text-sm text-[var(--color-text-muted)]">
          사진
        </label>
        <input
          id="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => setImages(Array.from(event.target.files ?? []))}
          className="mt-1 w-full text-sm"
        />
      </div>

      <div>
        <label className="text-sm text-[var(--color-text-muted)]">공개 범위</label>
        <div className="mt-1">
          <VisibilitySelector value={visibility} onChange={setVisibility} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : '추억 저장하기'}
      </button>
    </form>
  )
}
