import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /* API 代理到后端服务 */
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      /* 上传文件代理 */
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    /* 生产环境不生成 sourcemap */
    sourcemap: false,
    /* 启用 CSS 代码分割 */
    cssCodeSplit: true,
    /* Rollup 构建配置 */
    rollupOptions: {
      output: {
        /* 自定义 chunk 文件名 */
        chunkFileNames: "assets/js/[name]-[hash].js",
        /* 入口文件名 */
        entryFileNames: "assets/js/[name]-[hash].js",
        /* 资源文件名 */
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        /* 手动分包 - 将第三方库拆分为独立 chunk（函数形式兼容 Rolldown） */
        manualChunks(id) {
          /* React 核心 */
          if (id.includes("node_modules/react-dom/") || id.includes("node_modules/react/")) {
            return "vendor-react";
          }
          /* React Router */
          if (id.includes("node_modules/react-router-dom/") || id.includes("node_modules/react-router/")) {
            return "vendor-router";
          }
          /* Markdown 渲染相关（体积较大，独立分包） */
          if (id.includes("node_modules/react-markdown/") || id.includes("node_modules/remark-gfm/")) {
            return "vendor-markdown";
          }
          /* 代码高亮（体积较大，独立分包） */
          if (id.includes("node_modules/react-syntax-highlighter/")) {
            return "vendor-highlight";
          }
          /* HTTP 客户端 */
          if (id.includes("node_modules/axios/")) {
            return "vendor-http";
          }
          /* Toast 通知 */
          if (id.includes("node_modules/react-hot-toast/")) {
            return "vendor-toast";
          }
        },
      },
    },
    /* 块大小警告阈值（KB） */
    chunkSizeWarningLimit: 500,
  },
});
