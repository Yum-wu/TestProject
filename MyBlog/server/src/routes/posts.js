const { Router } = require("express");
const {
  postController,
  createPostValidation,
  updatePostValidation,
} = require("../controllers/postController");
const { authMiddleware, optionalAuth } = require("../middleware/auth");

const router = Router();

// 公开路由 - 文章列表和详情
router.get("/", optionalAuth, postController.getPosts);
router.get("/:slug", optionalAuth, postController.getPostBySlug);

// 需要认证的路由
// 注意：upload-cover 放在 /:slug 之后，因为 Express 5 路由匹配是按注册顺序的
// 但 upload-cover 不会被误匹配为 slug，因为 POST 方法与 GET /:slug 不同
router.post(
  "/",
  authMiddleware,
  createPostValidation,
  postController.createPost,
);
router.post("/upload-cover", authMiddleware, postController.uploadCover);
router.put(
  "/:id",
  authMiddleware,
  updatePostValidation,
  postController.updatePost,
);
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
