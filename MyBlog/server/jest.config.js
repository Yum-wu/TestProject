/** @type {import('jest').Config} */
module.exports = {
  // 测试环境
  testEnvironment: "node",

  // 测试文件匹配模式
  testMatch: ["**/tests/**/*.test.js"],

  // 测试超时时间（毫秒）
  testTimeout: 10000,

  // 全局设置和清理
  globalSetup: "./tests/setup.js",

  // 覆盖率配置
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/config/**",
    "!src/routes/**",
  ],

  // 覆盖率输出目录
  coverageDirectory: "coverage",

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // 模块路径映射
  moduleDirectories: ["node_modules", "src"],

  // 清除模拟
  clearMocks: true,

  // 重置模拟
  resetMocks: true,

  // 恢复模拟
  restoreMocks: true,
};
