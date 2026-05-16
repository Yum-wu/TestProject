import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Actions 部署到 /TestProject/ 子路径，Vercel 部署到根路径
const isGitHubPages = !!process.env.GITHUB_ACTIONS;
const base = isGitHubPages ? "/TestProject/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __BASE_PATH__: JSON.stringify(isGitHubPages ? "/TestProject" : ""),
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
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
