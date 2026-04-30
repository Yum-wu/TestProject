const { body, param, validationResult } = require("express-validator");
const TagModel = require("../models/TagModel");
const { success, error } = require("../utils/response");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * 标签控制器 - 标签 CRUD
 */
const tagController = {
  /**
   * 创建标签
   * POST /api/tags
   */
  async createTag(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { name } = req.body;

      // 生成唯一 slug
      const slug = await generateUniqueSlug(name, (s) =>
        TagModel.findBySlug(s).then((t) => !!t),
      );

      const tag = await TagModel.create({ name, slug });
      return success(res, tag, "标签创建成功", 201);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return error(res, "标签名称已存在", 409);
      }
      next(err);
    }
  },

  /**
   * 删除标签
   * DELETE /api/tags/:id
   */
  async deleteTag(req, res, next) {
    try {
      const tagId = parseInt(req.params.id, 10);

      const existing = await TagModel.findById(tagId);
      if (!existing) {
        return error(res, "标签不存在", 404);
      }

      await TagModel.delete(tagId);
      return success(res, null, "标签删除成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取所有标签
   * GET /api/tags
   */
  async getTags(req, res, next) {
    try {
      const tags = await TagModel.findAll();
      return success(res, tags, "获取成功");
    } catch (err) {
      next(err);
    }
  },
};

// 创建标签验证规则
const createTagValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("标签名称长度需在1-50个字符之间"),
];

module.exports = {
  tagController,
  createTagValidation,
};
