/**
 * 环境变量校验与导出模块
 *
 * 启动时校验必需环境变量，避免运行时才发现配置缺失。
 * 将环境变量统一转为类型安全的结构体导出。
 */

// 必需的环境变量列表
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

/**
 * 启动时校验必需环境变量
 * 若缺少年抛出异常阻止应用启动
 */
export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[配置错误] 缺少必需的环境变量: ${missing.join(', ')}。请检查 .env 文件。`
    );
  }
}

/**
 * 类型安全的环境变量导出对象
 */
export const env = {
  /** 运行环境 */
  nodeEnv: process.env.NODE_ENV || 'development',
  /** 服务端口 */
  port: Number(process.env.PORT) || 3000,

  /** 数据库相关配置 */
  db: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME!,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  },

  /** CORS 跨域配置 */
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  /** 分页默认值 */
  pagination: {
    defaultPageSize: Number(process.env.PAGE_SIZE_DEFAULT) || 20,
    maxPageSize: Number(process.env.PAGE_SIZE_MAX) || 100,
  },

  /** 业务配置 */
  stockAlertThreshold: Number(process.env.STOCK_ALERT_THRESHOLD) || 10,
} as const;
