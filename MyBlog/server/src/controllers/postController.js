const { body, param, query, validationResult } = require("express-validator");
const PostModel = require("../models/PostModel");
const CategoryModel = require("../models/CategoryModel");
const TagModel = require("../models/TagModel");
const { success, error, paginate } = require("../utils/response");
const { generateUniqueSlug } = require("../utils/slug");
const { uploadCover: uploadCoverMiddleware } = require("../middleware/upload");

/**
 * 文章控制器 - 文章 CRUD 及封面图上传
 */
const postController = {
  /**
   * 创建文章
   * POST /api/posts
   */
  async createPost(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { title, content, excerpt, category_id, status, tag_ids } =
        req.body;
      const author_id = req.user.id;

      // 生成唯一 slug
      const slug = await generateUniqueSlug(title, (s) =>
        PostModel.slugExists(s),
      );

      // 验证分类是否存在
      if (category_id) {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          return error(res, "分类不存在", 404);
        }
      }

      // 创建文章
      const post = await PostModel.create({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        cover_image: null,
        category_id: category_id || null,
        author_id,
        status: status || "draft",
      });

      // 设置标签
      if (tag_ids && tag_ids.length > 0) {
        await PostModel.setTags(post.id, tag_ids);
      }

      // 重新查询以获取完整信息
      const result = await PostModel.findById(post.id);
      return success(res, result, "文章创建成功", 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 更新文章
   * PUT /api/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const postId = parseInt(req.params.id, 10);
      const { title, content, excerpt, category_id, status, tag_ids } =
        req.body;

      // 检查文章是否存在
      const existingPost = await PostModel.findById(postId);
      if (!existingPost) {
        return error(res, "文章不存在", 404);
      }

      // 检查是否是文章作者
      if (existingPost.author_id !== req.user.id) {
        return error(res, "无权修改此文章", 403);
      }

      // 如果标题改变，重新生成 slug
      let slug;
      if (title && title !== existingPost.title) {
        slug = await generateUniqueSlug(title, (s) =>
          PostModel.slugExists(s, postId),
        );
      }

      // 验证分类是否存在
      if (category_id) {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          return error(res, "分类不存在", 404);
        }
      }

      // 更新文章
      await PostModel.update(postId, {
        title,
        slug,
        content,
        excerpt,
        category_id,
        status,
      });

      // 更新标签
      if (tag_ids !== undefined) {
        await PostModel.setTags(postId, tag_ids);
      }

      const result = await PostModel.findById(postId);
      return success(res, result, "文章更新成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 删除文章
   * DELETE /api/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const postId = parseInt(req.params.id, 10);

      // 检查文章是否存在
      const post = await PostModel.findById(postId);
      if (!post) {
        return error(res, "文章不存在", 404);
      }

      // 检查是否是文章作者
      if (post.author_id !== req.user.id) {
        return error(res, "无权删除此文章", 403);
      }

      await PostModel.delete(postId);
      return success(res, null, "文章删除成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取文章列表（分页、搜索、筛选）
   * GET /api/posts
   * 添加缓存控制头，列表数据缓存 60 秒
   */
  async getPosts(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 10,
        keyword = "",
        categoryId = "",
        tagId = "",
        status = "published",
        authorId = "",
      } = req.query;

      // 安全处理分页参数：限制范围，防止恶意输入
      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safePageSize = Math.min(
        100,
        Math.max(1, parseInt(pageSize, 10) || 10),
      );

      const result = await PostModel.findAll({
        page: safePage,
        pageSize: safePageSize,
        keyword,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        tagId: tagId ? parseInt(tagId, 10) : null,
        status: status || null,
        authorId: authorId ? parseInt(authorId, 10) : null,
      });

      // 设置缓存控制头 - 文章列表缓存 60 秒
      res.setHeader(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=30",
      );

      return paginate(res, {
        items: result.items,
        total: result.total,
        page: safePage,
        pageSize: safePageSize,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 根据 slug 获取文章详情
   * GET /api/posts/:slug
   * 添加缓存控制头，文章详情缓存 5 分钟
   */
  async getPostBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const post = await PostModel.findBySlug(slug);

      if (!post) {
        return error(res, "文章不存在", 404);
      }

      // 增加浏览量
      await PostModel.incrementViewCount(post.id);
      post.view_count += 1;

      // 设置缓存控制头 - 文章详情缓存 5 分钟（内容更新不频繁）
      res.setHeader(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=60",
      );

      return success(res, post, "获取成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 上传封面图
   * POST /api/posts/upload-cover
   */
  uploadCover(req, res, next) {
    uploadCoverMiddleware(req, res, (err) => {
      if (err) {
        // Multer 错误
        if (err.code === "LIMIT_FILE_SIZE") {
          return error(res, "文件大小超出限制，最大允许 5MB", 400);
        }
        return error(res, err.message, 400);
      }

      if (!req.file) {
        return error(res, "请选择要上传的文件", 400);
      }

      // 返回文件访问路径
      const coverUrl = `/uploads/covers/${req.file.filename}`;
      return success(res, { url: coverUrl }, "封面上传成功");
    });
  },
};

// 创建文章验证规则
const createPostValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("标题长度需在1-200个字符之间"),
  body("content").notEmpty().withMessage("文章内容不能为空"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("状态只能是 draft 或 published"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("分类ID必须是正整数"),
  body("tag_ids").optional().isArray().withMessage("标签ID必须是数组"),
  body("tag_ids.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("标签ID必须是正整数"),
];

// 更新文章验证规则
const updatePostValidation = [
  param("id").isInt({ min: 1 }).withMessage("文章ID必须是正整数"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("标题长度需在1-200个字符之间"),
  body("content").optional().notEmpty().withMessage("文章内容不能为空"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("状态只能是 draft 或 published"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("分类ID必须是正整数"),
  body("tag_ids").optional().isArray().withMessage("标签ID必须是数组"),
];

module.exports = {
  postController,
  createPostValidation,
  updatePostValidation,
};
