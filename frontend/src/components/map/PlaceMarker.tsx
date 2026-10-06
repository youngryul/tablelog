import type { PlaceSummary } from '../../types/place'

/**
 * MapView 내부(지도 SDK 연동 시)에서 사용할 마커 상태 스타일 매핑.
 * 실제 마커 렌더링은 지도 SDK 연동 시 MapView.tsx에서 이 매핑을 사용한다.
 */
export function getMarkerVariant(place: PlaceSummary): 'saved' | 'visited' | 'favorite' {
  if (place.status === 'FAVORITE') return 'favorite'
  if (place.status === 'VISITED') return 'visited'
  return 'saved'
}
