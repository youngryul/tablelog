import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 배포 환경(Vercel)과 같은 구조로 /api를 같은 출처에서 호출하도록 backend 개발 서버로 프록시한다.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
