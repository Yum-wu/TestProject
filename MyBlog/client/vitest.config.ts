import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 模拟浏览器环境
    environment: "jsdom",

    // 全局设置文件
    setupFiles: ["./src/__tests__/setup.ts"],

    // 全局 API（describe, it, expect 等）
    globals: true,

    // CSS 模块处理
    css: false,

    // 覆盖率配置
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/types/**",
      ],
    },

    // 路径别名
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
