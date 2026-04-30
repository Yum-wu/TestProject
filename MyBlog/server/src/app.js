const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// 创建 Express 应用
const app = express();

// 安全中间件 - Helmet 设置各种 HTTP 头以增强安全性
app.use(
  helmet({
    // 允许加载同源图片（封面图等）
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
    // 跨域嵌入策略
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// 跨域配置 - 精确指定允许的源
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : process.env.NODE_ENV === "production"
    ? [] // 生产环境必须通过环境变量配置
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin(origin, callback) {
      // 允许没有 origin 的请求（如服务端请求、Postman）
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS 策略不允许此来源"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 预检请求缓存 24 小时
  }),
);

// Gzip 压缩中间件 - 压缩响应体，减少传输体积
app.use(
  compression({
    // 仅压缩大于 1KB 的响应
    threshold: 1024,
    // 压缩级别（1-9），6 是性能与压缩率的平衡点
    level: 6,
    // 支持压缩的 MIME 类型
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// 请求限流 - 防止恶意请求和 DDoS 攻击
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟时间窗口
  max: 100, // 每个 IP 在时间窗口内最多 100 次请求
  message: {
    status: "error",
    message: "请求过于频繁，请稍后再试",
  },
  standardHeaders: true, // 返回 RateLimit-* 头信息
  legacyHeaders: false, // 禁用 X-RateLimit-* 头信息
});

// 对 API 路由应用限流
app.use("/api", apiLimiter);

// 解析 JSON 请求体
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 上传文件目录（带缓存头）
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    // 静态文件缓存 1 天
    maxAge: "1d",
    // 设置 Cache-Control 头
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);

// 挂载 API 路由
app.use("/api", routes);

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

module.exports = app;
