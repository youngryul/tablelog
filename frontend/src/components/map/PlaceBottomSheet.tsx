import type { PlaceSummary } from '../../types/place'

interface PlaceBottomSheetProps {
  place: PlaceSummary | null
  onClose: () => void
  onViewDetail: (placeId: string) => void
}

export function PlaceBottomSheet({ place, onClose, onViewDetail }: PlaceBottomSheetProps) {
  if (!place) return null

  return (
    <div
      className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg
        md:inset-x-auto md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:mx-0 md:h-full md:w-96 md:max-w-none
        md:overflow-y-auto md:rounded-none md:rounded-l-2xl md:border-y-0 md:border-r-0"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-medium">{place.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{place.roadAddress ?? place.address}</p>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--color-text-muted)]" aria-label="닫기">
          ✕
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-[var(--color-text-muted)]">
        <div>
          <dt>내 방문 횟수</dt>
          <dd className="text-[var(--color-text)]">{place.myVisitCount}회</dd>
        </div>
        <div>
          <dt>최근 방문</dt>
          <dd className="text-[var(--color-text)]">{place.lastVisitDate ?? '-'}</dd>
        </div>
        <div>
          <dt>내 추억</dt>
          <dd className="text-[var(--color-text)]">{place.myMemoryCount}개</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => onViewDetail(place.id)}
        className="mt-4 w-full rounded-xl bg-[var(--color-accent)] py-2 text-sm font-medium text-white"
      >
        상세보기
      </button>
    </div>
  )
}
