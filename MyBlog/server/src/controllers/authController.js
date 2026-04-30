const { body, validationResult } = require("express-validator");
const UserModel = require("../models/UserModel");
const { generateToken } = require("../middleware/auth");
const { success, error } = require("../utils/response");

/**
 * 认证控制器 - 注册、登录、用户信息
 */
const authController = {
  /**
   * 用户注册
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { username, email, password } = req.body;

      // 检查用户名是否已存在
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return error(res, "用户名已被使用", 409);
      }

      // 检查邮箱是否已存在
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return error(res, "邮箱已被注册", 409);
      }

      // 创建用户
      const user = await UserModel.create({ username, email, password });

      // 生成 JWT Token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      return success(res, { user, token }, "注册成功", 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 用户登录
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { email, password } = req.body;

      // 查找用户（含密码哈希）
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return error(res, "邮箱或密码错误", 401);
      }

      // 验证密码
      const isPasswordValid = await UserModel.verifyPassword(
        password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        return error(res, "邮箱或密码错误", 401);
      }

      // 生成 JWT Token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // 返回用户信息（不含密码）
      const { password_hash, ...userInfo } = user;
      return success(res, { user: userInfo, token }, "登录成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取当前用户信息
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return error(res, "用户不存在", 404);
      }
      return success(res, user, "获取成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 更新用户信息
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { username, email, avatar, bio } = req.body;
      const userId = req.user.id;

      // 检查用户名是否已被其他用户使用
      if (username) {
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return error(res, "用户名已被使用", 409);
        }
      }

      // 检查邮箱是否已被其他用户使用
      if (email) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return error(res, "邮箱已被注册", 409);
        }
      }

      const user = await UserModel.update(userId, {
        username,
        email,
        avatar,
        bio,
      });
      return success(res, user, "更新成功");
    } catch (err) {
      next(err);
    }
  },
};

// 注册验证规则
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("用户名长度需在2-50个字符之间")
    .notEmpty()
    .withMessage("用户名不能为空"),
  body("email").isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("密码长度需在6-100个字符之间"),
];

// 登录验证规则
const loginValidation = [
  body("email").isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
  body("password").notEmpty().withMessage("密码不能为空"),
];

// 更新资料验证规则
const updateProfileValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("用户名长度需在2-50个字符之间"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("请输入有效的邮箱地址")
    .normalizeEmail(),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("个人简介不能超过500个字符"),
];

module.exports = {
  authController,
  registerValidation,
  loginValidation,
  updateProfileValidation,
};
