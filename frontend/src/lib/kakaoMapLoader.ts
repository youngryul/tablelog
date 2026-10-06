let loadPromise: Promise<void> | null = null

/** Kakao Maps SDK를 한 번만 로드하고 이후 호출은 같은 Promise를 재사용한다. */
export function loadKakaoMaps(): Promise<void> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve()
      return
    }

    const appKey = import.meta.env.VITE_MAP_API_KEY
    if (!appKey) {
      reject(new Error('VITE_MAP_API_KEY가 설정되지 않았습니다.'))
      return
    }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve())
    script.onerror = () => reject(new Error('Kakao Maps SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}
