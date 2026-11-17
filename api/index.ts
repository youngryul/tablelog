// Vercel 서버리스 함수 진입점.
// backend의 Express 앱을 그대로 핸들러로 내보낸다. (로컬 개발은 backend/src/server.ts가 listen 담당)
// /api/* 요청은 루트 vercel.json의 rewrite로 이 함수에 모이고, req.url에는 원래 경로가 유지되어
// Express 라우터(/api/places, /api/me, /api/memories)가 그대로 매칭된다.
import { app } from '../backend/src/app'

export default app
