/**
 * Express 应用初始化
 *
 * 注册全局中间件、路由、错误处理。
 * 中间件执行顺序：
 * 1. CORS
 * 2. JSON 解析
 * 3. 请求日志
 * 4. 路由分发
 * 5. 404 兜底
 * 6. 全局错误处理
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// ---- 全局中间件 ----

// 1. CORS 跨域
app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);

// 2. 请求体 JSON 解析
app.use(express.json({ limit: '1mb' }));

// 3. URL-encoded 解析
app.use(express.urlencoded({ extended: true }));

// 4. 请求日志
app.use(requestLogger);

// ---- 路由挂载 ----

// 健康检查端点
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由挂载
app.use('/api', routes);

// ---- 404 兜底 ----
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    code: 3003,
    message: '请求的资源不存在',
    data: null,
  });
});

// ---- 全局错误处理（必须放在所有路由之后） ----
app.use(errorHandler);

export default app;
