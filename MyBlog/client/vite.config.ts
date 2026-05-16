import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/TestProject/",
  plugins: [react()],
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
        /* 手动分包 - 将第三方库拆分为独立 chunk */
        manualChunks(id) {
          if (id.includes("node_modules/react-dom/") || id.includes("node_modules/react/")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router-dom/") || id.includes("node_modules/react-router/")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/react-markdown/") || id.includes("node_modules/remark-gfm/")) {
            return "vendor-markdown";
          }
          if (id.includes("node_modules/react-syntax-highlighter/")) {
            return "vendor-highlight";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
