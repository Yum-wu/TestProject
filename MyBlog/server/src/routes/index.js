const { Router } = require("express");
const authRoutes = require("./auth");
const postRoutes = require("./posts");
const categoryRoutes = require("./categories");
const tagRoutes = require("./tags");
const commentRoutes = require("./comments");
const { commentController } = require("../controllers/commentController");

const router = Router();

// 挂载各模块路由
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
router.use("/comments", commentRoutes);

// 文章评论 - 通过文章 ID 获取评论列表
// GET /api/posts/:postId/comments
router.get("/posts/:postId/comments", commentController.getCommentsByPost);

module.exports = router;
