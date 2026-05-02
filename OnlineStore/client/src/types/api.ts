/**
 * API 通用类型定义
 * 统一后端接口响应格式与分页参数
 */

/** 通用 API 响应包裹类型 */
export interface ApiResponse<T> {
  /** 业务状态码，0 或 200 表示成功 */
  code: number;
  /** 响应消息（成功/失败描述） */
  message: string;
  /** 响应数据体 */
  data: T;
}

/** 分页查询参数 */
export interface PaginationParams {
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 数据总条数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/** 分页数据包裹类型 */
export interface PaginatedData<T> {
  /** 当前页数据列表 */
  list: T[];
  /** 分页元信息 */
  pagination: PaginationParams;
}
