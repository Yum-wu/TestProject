import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 构建配置
 * - React 插件支持 JSX Transform
 * - 开发服务器端口 5173
 * - /api 请求代理到后端 3000 端口
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
