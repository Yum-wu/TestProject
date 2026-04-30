const { Router } = require("express");
const {
  tagController,
  createTagValidation,
} = require("../controllers/tagController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// 公开路由 - 获取标签列表
router.get("/", tagController.getTags);

// 需要认证的路由
router.post("/", authMiddleware, createTagValidation, tagController.createTag);
router.delete("/:id", authMiddleware, tagController.deleteTag);

module.exports = router;
