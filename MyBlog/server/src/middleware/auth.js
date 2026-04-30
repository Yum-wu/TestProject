const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("生产环境必须设置 JWT_SECRET 环境变量，请勿使用默认密钥");
  }
  // 开发环境使用默认值，但输出警告
  console.warn(
    "[安全警告] 未设置 JWT_SECRET 环境变量，使用不安全的默认值。生产环境请务必设置！",
  );
}
const SECRET =
  JWT_SECRET || "dev_only_insecure_jwt_secret_do_not_use_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // Token 有效期

/**
 * 生成 JWT Token
 * @param {object} payload - 载荷数据（用户信息）
 * @returns {string} JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT 认证中间件 - 验证 token 并将用户信息附加到 req
 */
function authMiddleware(req, res, next) {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code: 401,
      message: "未提供认证令牌，请先登录",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 验证 token
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: 401,
        message: "认证令牌已过期，请重新登录",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "认证令牌无效",
    });
  }
}

/**
 * 可选认证中间件 - 有 token 则解析，无 token 也不报错
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
    } catch {
      // token 无效时忽略，继续处理
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, generateToken };
