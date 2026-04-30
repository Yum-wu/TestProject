const { Router } = require("express");
const {
  authController,
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// 公开路由
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);

// 需要认证的路由
router.get("/profile", authMiddleware, authController.getProfile);
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidation,
  authController.updateProfile,
);

module.exports = router;
