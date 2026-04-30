/**
 * 测试全局配置
 * - 设置测试环境变量
 * - 提供数据库连接和清理工具
 */

// 设置测试环境变量（必须在加载其他模块之前）
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_only";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "3306";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "";
process.env.DB_NAME = "myblog_test";
process.env.CORS_ORIGINS = "http://localhost:5173";

const { pool, execute } = require("../src/config/database");

/**
 * 清理所有测试数据表
 * 按照外键依赖顺序删除
 */
async function cleanDatabase() {
  try {
    await execute("SET FOREIGN_KEY_CHECKS = 0");
    await execute("TRUNCATE TABLE post_tags");
    await execute("TRUNCATE TABLE comments");
    await execute("TRUNCATE TABLE posts");
    await execute("TRUNCATE TABLE tags");
    await execute("TRUNCATE TABLE categories");
    await execute("TRUNCATE TABLE users");
    await execute("SET FOREIGN_KEY_CHECKS = 1");
  } catch (err) {
    console.error("清理测试数据库失败:", err.message);
  }
}

/**
 * 创建测试用的种子数据
 */
async function seedTestData() {
  // 创建测试用户
  const userResult = await execute(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    ["testuser", "test@example.com", "$2a$10$fakehashfortestingonly"]
  );

  // 创建测试分类
  const categoryResult = await execute(
    "INSERT INTO categories (name, slug) VALUES (?, ?)",
    ["技术", "tech"]
  );

  // 创建测试标签
  const tagResult1 = await execute(
    "INSERT INTO tags (name, slug) VALUES (?, ?)",
    ["JavaScript", "javascript"]
  );
  const tagResult2 = await execute(
    "INSERT INTO tags (name, slug) VALUES (?, ?)",
    ["React", "react"]
  );

  return {
    userId: userResult.insertId,
    categoryId: categoryResult.insertId,
    tagIds: [tagResult1.insertId, tagResult2.insertId],
  };
}

// Jest 全局设置 - 在所有测试之前执行
module.exports = async function globalSetup() {
  console.log("=== 测试全局初始化 ===");
  try {
    // 验证数据库连接
    await execute("SELECT 1");
    console.log("测试数据库连接成功");
  } catch (err) {
    console.error("测试数据库连接失败:", err.message);
    console.error("请确保 MySQL 服务已启动且 myblog_test 数据库已创建");
  }

  // 清理测试数据
  await cleanDatabase();
  console.log("测试数据库已清理");

  // 关闭连接池
  await pool.end();
  console.log("=== 测试全局初始化完成 ===");
};

// 导出工具函数供测试文件使用
module.exports.cleanDatabase = cleanDatabase;
module.exports.seedTestData = seedTestData;
