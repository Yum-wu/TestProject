import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/openweather': {
          target: 'https://api.openweathermap.org',
          changeOrigin: true,
          rewrite: (path) => {
            const rewritten = path.replace(/^\/api\/openweather/, '')
            const separator = rewritten.includes('?') ? '&' : '?'
            return `${rewritten}${separator}appid=${env.VITE_WEATHER_API_KEY}`
          },
        },
      },
    },
  }
})
