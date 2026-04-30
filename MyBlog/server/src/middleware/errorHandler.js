/**
 * 全局错误处理中间件
 * 统一处理所有抛出的错误，返回标准格式响应
 */
function errorHandler(err, req, res, _next) {
  // 生产环境不输出详细错误日志到响应
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    console.error("服务器错误：", err);
  } else {
    // 生产环境只记录简要信息
    console.error(
      `服务器错误 [${new Date().toISOString()}]: ${err.message || "未知错误"}`,
    );
  }

  // Multer 文件上传错误
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      code: 400,
      message: "文件大小超出限制，最大允许 5MB",
    });
  }

  // Multer 其他错误
  if (err.name === "MulterError") {
    return res.status(400).json({
      code: 400,
      message: "文件上传错误",
    });
  }

  // express-validator 验证错误
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      code: 400,
      message: "请求体解析失败，请检查 JSON 格式",
    });
  }

  // CORS 错误
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      code: 403,
      message: "跨域请求被拒绝",
    });
  }

  // 自定义业务错误（带有 statusCode 属性）
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
    });
  }

  // 默认服务器内部错误 - 生产环境隐藏详情
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
  res.status(404).json({
    code: 404,
    message: "请求的接口不存在",
  });
}

module.exports = { errorHandler, notFoundHandler };
