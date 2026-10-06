import type { PlaceSummary } from '../../types/place'

interface PlaceCardProps {
  place: PlaceSummary
  onClick: (placeId: string) => void
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(place.id)}
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
    >
      <p className="font-medium">{place.name}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{place.roadAddress ?? place.address}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        방문 {place.myVisitCount}회 · 추억 {place.myMemoryCount}개
      </p>
    </button>
  )
}
