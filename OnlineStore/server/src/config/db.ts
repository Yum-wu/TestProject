/**
 * 数据库连接池配置
 *
 * 基于 mysql2/promise 创建连接池，统一管理数据库连接生命周期。
 *
 * 设计原则：
 * - connectionLimit=10 适合小型商城并发量
 * - waitForConnections=true 无空闲连接时排队等待，避免直接报错
 * - charset=utf8mb4 支持完整 Unicode 及 Emoji
 */

import mysql from 'mysql2/promise';
import { env } from './env';

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  charset: 'utf8mb4',
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,            // 排队无上限
  waitForConnections: true, // 无空闲连接时等待
  idleTimeout: 10000,       // 10 秒闲置后释放
  enableKeepAlive: true,    // TCP Keep-Alive
  keepAliveInitialDelay: 0,
});

export default pool;
