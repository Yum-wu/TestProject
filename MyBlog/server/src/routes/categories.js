const { Router } = require("express");
const {
  categoryController,
  createCategoryValidation,
  updateCategoryValidation,
} = require("../controllers/categoryController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// 公开路由 - 获取分类列表
router.get("/", categoryController.getCategories);

// 需要认证的路由
router.post(
  "/",
  authMiddleware,
  createCategoryValidation,
  categoryController.createCategory,
);
router.put(
  "/:id",
  authMiddleware,
  updateCategoryValidation,
  categoryController.updateCategory,
);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
