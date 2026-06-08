import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 開発時は Vercel Functions をローカルで動かさずとも UI 検証できるよう、
// /api へのリクエストはローカルのモックサーバ（任意）or 本番 Vercel に向ける。
// デプロイ後は同一オリジンの /api がそのまま動作する。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
