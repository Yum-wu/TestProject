/**
 * Jest 测试配置文件
 * 使用 ts-jest 预设支持 TypeScript 测试文件
 */
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^../src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      diagnostics: false,
    }],
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/models/**/*.ts',
    'src/middleware/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  // 无需 transformIgnorePatterns，ts-jest 会处理所有 ts 文件
};

export default config;
