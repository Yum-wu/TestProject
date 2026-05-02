/**
 * 全局错误处理中间件
 *
 * 捕获 Controller/Service 层抛出的所有异常，转换为统一响应格式。
 *
 * 处理优先级：
 * 1. AppError（已知业务异常）→ 使用其 code / message / httpStatus
 * 2. SyntaxError（JSON 解析错误）→ 返回 1004 参数格式错误
 * 3. 其他未知异常 → 返回 3003 服务内部错误，生产环境隐藏原始错误信息
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { fail } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 记录错误日志（生产环境应接入日志系统）
  console.error(`[ErrorHandler] ${err.name}: ${err.message}`);

  // 1. 已知业务异常
  if (err instanceof AppError) {
    fail(res, err.code, err.message, err.httpStatus);
    return;
  }

  // 2. JSON 解析错误（Express body-parser 产生）
  if (err instanceof SyntaxError && 'body' in err) {
    fail(res, 1004, '请求体 JSON 格式错误', 400);
    return;
  }

  // 3. 未知异常 → 3003
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? '服务内部错误，请稍后重试' : err.message || '服务内部错误';

  fail(res, 3003, message, 500);
}
