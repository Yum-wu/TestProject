/**
 * 应用入口文件
 *
 * 启动流程：
 * 1. 加载 .env 环境变量
 * 2. 校验必需环境变量
 * 3. 启动 Express 服务
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// 优先从项目根目录加载 .env
dotenv.config({ path: resolve(__dirname, '..', '.env') });

import { validateEnv, env } from './config/env';
import app from './app';

// 启动前校验环境变量
try {
  validateEnv();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

// 启动服务
const server = app.listen(env.port, () => {
  console.log('========================================');
  console.log(`  Mini 在线商城后端服务`);
  console.log(`  环境: ${env.nodeEnv}`);
  console.log(`  端口: ${env.port}`);
  console.log(`  地址: http://localhost:${env.port}`);
  console.log(`  API:  http://localhost:${env.port}/api`);
  console.log(`  健康: http://localhost:${env.port}/health`);
  console.log('========================================');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('[Shutdown] 收到 SIGTERM 信号，准备关闭服务...');
  server.close(() => {
    console.log('[Shutdown] 服务已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Shutdown] 收到 SIGINT 信号，准备关闭服务...');
  server.close(() => {
    console.log('[Shutdown] 服务已关闭');
    process.exit(0);
  });
});
