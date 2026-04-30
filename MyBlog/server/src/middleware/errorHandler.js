const logger = require("../utils/logger");

/**
 * 全局错误处理中间件
 * 统一处理所有抛出的错误，返回标准格式响应
 */
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV !== "production";

  logger.error("服务器错误", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      code: 400,
      message: "文件大小超出限制，最大允许 5MB",
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      code: 400,
      message: "文件上传错误",
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      code: 400,
      message: "请求体解析失败，请检查 JSON 格式",
    });
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      code: 403,
      message: "跨域请求被拒绝",
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
    });
  }

  const statusCode = err.status || 500;
  const message =
    statusCode === 500 && !isDev
      ? "服务器内部错误"
      : err.message || "服务器内部错误";

  res.status(statusCode).json({
    code: statusCode,
    message,
  });
}

/**
 * 404 处理中间件
 */
function notFoundHandler(req, res, _next) {
  logger.warn("404 请求", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    code: 404,
    message: "请求的接口不存在",
  });
}

module.exports = { errorHandler, notFoundHandler };
