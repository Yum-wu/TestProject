/**
 * 自定义业务异常类
 *
 * 用于在 Service 层抛出可预期的业务错误，
 * 由全局 errorHandler 中间件统一捕获并转换为统一响应格式。
 */

/**
 * 应用异常基类
 */
export class AppError extends Error {
  /** 业务错误码 */
  public code: number;
  /** HTTP 状态码 */
  public httpStatus: number;

  /**
   * @param code 业务错误码
   * @param message 错误描述
   * @param httpStatus HTTP 状态码（默认 400）
   */
  constructor(code: number, message: string, httpStatus: number = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;

    // 确保 instanceof 正常工作（TypeScript 需手动设置原型链）
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 参数校验异常（1xxx）
 */
export class ValidationError extends AppError {
  constructor(code: number, message: string) {
    super(code, message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * 业务逻辑异常（2xxx）
 */
export class BusinessError extends AppError {
  constructor(code: number, message: string) {
    super(code, message, 400);
    this.name = 'BusinessError';
  }
}

/**
 * 认证/授权异常（4xxx）
 */
export class AuthError extends AppError {
  constructor(code: number, message: string) {
    super(code, message, 401);
    this.name = 'AuthError';
  }
}

/**
 * 系统内部异常（3xxx）
 */
export class SystemError extends AppError {
  constructor(code: number, message: string) {
    super(code, message, 500);
    this.name = 'SystemError';
  }
}
