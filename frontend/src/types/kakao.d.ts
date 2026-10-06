// Kakao Maps JS SDK는 공식 타입 패키지가 없어 window.kakao를 any로 선언한다.
// 이 any는 카카오맵 연동 파일(MapView.tsx, lib/kakaoMapLoader.ts) 내부로만 한정해서 사용한다.
export {}

declare global {
  interface Window {
    kakao: any
  }
}
