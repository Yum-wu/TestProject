/**
 * 请求日志中间件
 *
 * 记录每个 HTTP 请求的关键信息：
 * - 请求方法 (GET/POST/PATCH/DELETE)
 * - 请求路径 (URL)
 * - 响应状态码
 * - 处理耗时 (ms)
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // 监听响应 finish 事件，记录完整信息
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`;
    console.log(logLine);
  });

  next();
}
