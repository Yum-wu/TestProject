const { body, param, validationResult } = require("express-validator");
const CommentModel = require("../models/CommentModel");
const PostModel = require("../models/PostModel");
const { success, error } = require("../utils/response");

/**
 * 评论控制器 - 评论 CRUD 及嵌套回复
 */
const commentController = {
  /**
   * 创建评论
   * POST /api/comments
   */
  async createComment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const { post_id, content } = req.body;
      const user_id = req.user.id;

      // 检查文章是否存在
      const post = await PostModel.findById(post_id);
      if (!post) {
        return error(res, "文章不存在", 404);
      }

      const comment = await CommentModel.create({ post_id, user_id, content });
      const result = await CommentModel.findById(comment.id);
      return success(res, result, "评论成功", 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 回复评论
   * POST /api/comments/:id/reply
   */
  async replyComment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "输入验证失败", 422, errors.array());
      }

      const parent_id = parseInt(req.params.id, 10);
      const { content } = req.body;
      const user_id = req.user.id;

      // 检查父评论是否存在
      const parentComment = await CommentModel.findById(parent_id);
      if (!parentComment) {
        return error(res, "父评论不存在", 404);
      }

      const comment = await CommentModel.create({
        post_id: parentComment.post_id,
        user_id,
        parent_id,
        content,
      });

      const result = await CommentModel.findById(comment.id);
      return success(res, result, "回复成功", 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 删除评论
   * DELETE /api/comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.id, 10);

      // 检查评论是否存在
      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        return error(res, "评论不存在", 404);
      }

      // 检查是否是评论作者
      if (comment.user_id !== req.user.id) {
        return error(res, "无权删除此评论", 403);
      }

      await CommentModel.delete(commentId);
      return success(res, null, "评论删除成功");
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取文章评论列表
   * GET /api/posts/:postId/comments
   */
  async getCommentsByPost(req, res, next) {
    try {
      const postId = parseInt(req.params.postId, 10);

      // 检查文章是否存在
      const post = await PostModel.findById(postId);
      if (!post) {
        return error(res, "文章不存在", 404);
      }

      const comments = await CommentModel.findByPostId(postId);
      return success(res, comments, "获取成功");
    } catch (err) {
      next(err);
    }
  },
};

// 创建评论验证规则
const createCommentValidation = [
  body("post_id").isInt({ min: 1 }).withMessage("文章ID必须是正整数"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("评论内容长度需在1-2000个字符之间"),
];

// 回复评论验证规则
const replyCommentValidation = [
  param("id").isInt({ min: 1 }).withMessage("评论ID必须是正整数"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("回复内容长度需在1-2000个字符之间"),
];

module.exports = {
  commentController,
  createCommentValidation,
  replyCommentValidation,
};
