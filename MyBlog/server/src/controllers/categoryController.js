const { body, param, validationResult } = require("express-validator");
const CategoryModel = require("../models/CategoryModel");
const { success, error } = require("../utils/response");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * 分类控制器 - 分类 CRUD
 */
const categoryController = {
  /**
   * 创建分类
   * POST /api/categories
   */
  async createCategory(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { name, description } = req.body;

      // 生成唯一 slug
      const slug = await generateUniqueSlug(name, (s) =>
        CategoryModel.findBySlug(s).then((c) => !!c),
      );

      const category = await CategoryModel.create({ name, slug, description });
      return success(res, category, "分类创建成功", 201);
    } catch (err) {
      // 处理唯一键冲突
      if (err.code === "ER_DUP_ENTRY") {
        return error(res, "分类名称已存在", 409);
      }
      next(err);
    }
  },

  /**
   * 更新分类
   * PUT /api/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const categoryId = parseInt(req.params.id, 10);
      const { name, description } = req.body;

      // 检查分类是否存在
      const existing = await CategoryModel.findById(categoryId);
      if (!existing) {
        return error(res, "分类不存在", 404);
      }

      // 如果名称改变，重新生成 slug
      let slug;
      if (name && name !== existing.name) {
        slug = await generateUniqueSlug(name, (s) =>
          CategoryModel.findBySlug(s).then((c) => !!c && c.id !== categoryId),
        );
      }

      const category = await CategoryModel.update(categoryId, {
        name,
        slug,
        description,
      });
      return success(res, category, "分类更新成功");
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return error(res, "分类名称已存在", 409);
      }
      next(err);
    }
  },

  /**
   * 删除分类
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10);

      const existing = await CategoryModel.findById(categoryId);
      if (!existing) {
        return error(res, "分类不存在", 404);
      }

      await CategoryModel.delete(categoryId);
      return success(res, null, "分类删除成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取所有分类
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.findAll();
      return success(res, categories, "获取成功");
    } catch (err) {
      next(err);
    }
  },
};

// 创建分类验证规则
const createCategoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("分类名称长度需在1-50个字符之间"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("分类描述不能超过255个字符"),
];

// 更新分类验证规则
const updateCategoryValidation = [
  param("id").isInt({ min: 1 }).withMessage("分类ID必须是正整数"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("分类名称长度需在1-50个字符之间"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("分类描述不能超过255个字符"),
];

module.exports = {
  categoryController,
  createCategoryValidation,
  updateCategoryValidation,
};
