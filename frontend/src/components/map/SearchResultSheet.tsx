import type { PlaceSearchResult, PlaceSummary } from '../../types/place'

interface SearchResultSheetProps {
  result: PlaceSearchResult | null
  /** 이미 내 장소로 저장돼 있으면 해당 장소 */
  savedPlace: PlaceSummary | null
  isSaving: boolean
  errorMessage: string | null
  onClose: () => void
  onSave: (result: PlaceSearchResult) => void
  onSaveAndWrite: (result: PlaceSearchResult) => void
  onViewSaved: (placeId: string) => void
}

export function SearchResultSheet({
  result,
  savedPlace,
  isSaving,
  errorMessage,
  onClose,
  onSave,
  onSaveAndWrite,
  onViewSaved,
}: SearchResultSheetProps) {
  if (!result) return null

  return (
    <div
      className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg
        md:inset-x-auto md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:mx-0 md:h-full md:w-96 md:max-w-none
        md:overflow-y-auto md:rounded-none md:rounded-l-2xl md:border-y-0 md:border-r-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {result.category && (
            <p className="text-xs text-[var(--color-text-muted)]">{result.category.split(' > ').pop()}</p>
          )}
          <h2 className="text-base font-medium">{result.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{result.roadAddress || result.address}</p>
          {result.phone && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{result.phone}</p>}
        </div>
        <button type="button" onClick={onClose} className="text-[var(--color-text-muted)]" aria-label="닫기">
          ✕
        </button>
      </div>

      {errorMessage && <p className="mt-3 text-xs text-[var(--color-accent)]">{errorMessage}</p>}

      {savedPlace ? (
        <div className="mt-4">
          <p className="text-xs text-[var(--color-text-muted)]">이미 내 장소에 저장되어 있어요.</p>
          <button
            type="button"
            onClick={() => onViewSaved(savedPlace.id)}
            className="mt-2 w-full rounded-xl bg-[var(--color-accent)] py-2 text-sm font-medium text-white"
          >
            저장한 장소 보기
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSave(result)}
            disabled={isSaving}
            className="rounded-xl border border-[var(--color-accent)] py-2 text-sm font-medium text-[var(--color-accent)] disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '가고 싶은 곳 저장'}
          </button>
          <button
            type="button"
            onClick={() => onSaveAndWrite(result)}
            disabled={isSaving}
            className="rounded-xl bg-[var(--color-accent)] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            저장하고 기록하기
          </button>
        </div>
      )}
    </div>
  )
}
