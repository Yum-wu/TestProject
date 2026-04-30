const dotenv = require("dotenv");

// 加载环境变量（必须在最前面）
dotenv.config({ path: require("path").join(__dirname, "../.env") });

const app = require("./app");
const { initDatabase } = require("./config/init-db");
const { pool } = require("./config/database");

const PORT = process.env.PORT || 3000;

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();

    // 启动 HTTP 服务器
    const server = app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境：${process.env.NODE_ENV || "development"}`);
    });

    // 优雅关闭处理
    const shutdown = async (signal) => {
      console.log(`\n收到 ${signal} 信号，正在关闭服务器...`);

      // 停止接受新连接
      server.close(async () => {
        console.log("HTTP 服务器已关闭");

        // 关闭数据库连接池
        try {
          await pool.end();
          console.log("数据库连接池已关闭");
        } catch (err) {
          console.error("关闭数据库连接池失败：", err.message);
        }

        process.exit(0);
      });

      // 超时强制退出
      setTimeout(() => {
        console.error("优雅关闭超时，强制退出");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("服务器启动失败：", error.message);
    process.exit(1);
  }
}

startServer();
