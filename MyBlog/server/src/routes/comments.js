const { Router } = require("express");
const {
  commentController,
  createCommentValidation,
  replyCommentValidation,
} = require("../controllers/commentController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// 需要认证的路由 - 创建评论和回复
router.post(
  "/",
  authMiddleware,
  createCommentValidation,
  commentController.createComment,
);
router.post(
  "/:id/reply",
  authMiddleware,
  replyCommentValidation,
  commentController.replyComment,
);
router.delete("/:id", authMiddleware, commentController.deleteComment);

module.exports = router;
