/**
 * 统一响应构造器
 *
 * 提供快捷方法构建符合项目规范的 API 响应格式：
 * { code: number, message: string, data: T | null }
 */

import { Response } from 'express';
import { ApiResponse, PaginatedData, PaginationInfo } from '../types';

/**
 * 成功响应
 * @param res Express Response 对象
 * @param data 响应数据
 * @param message 可选的消息（默认 "success"）
 * @param httpStatus HTTP 状态码（默认 200）
 */
export function success<T>(
  res: Response,
  data: T,
  message: string = 'success',
  httpStatus: number = 200
): void {
  const body: ApiResponse<T> = {
    code: 0,
    message,
    data,
  };
  res.status(httpStatus).json(body);
}

/**
 * 失败响应
 * @param res Express Response 对象
 * @param code 业务错误码
 * @param message 错误描述
 * @param httpStatus HTTP 状态码（由 AppError 决定）
 */
export function fail(
  res: Response,
  code: number,
  message: string,
  httpStatus: number = 400
): void {
  const body: ApiResponse<null> = {
    code,
    message,
    data: null,
  };
  res.status(httpStatus).json(body);
}

/**
 * 分页成功响应
 * @param res Express Response 对象
 * @param list 数据列表
 * @param pagination 分页信息
 * @param message 可选的消息
 */
export function paginated<T>(
  res: Response,
  list: T[],
  pagination: PaginationInfo,
  message: string = 'success'
): void {
  const body: ApiResponse<PaginatedData<T>> = {
    code: 0,
    message,
    data: {
      list,
      pagination,
    },
  };
  res.status(200).json(body);
}
