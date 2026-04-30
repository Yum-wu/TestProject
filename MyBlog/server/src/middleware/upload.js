const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 封面图上传目录
const COVER_UPLOAD_DIR = path.join(__dirname, "../../uploads/covers");

// 确保上传目录存在
if (!fs.existsSync(COVER_UPLOAD_DIR)) {
  fs.mkdirSync(COVER_UPLOAD_DIR, { recursive: true });
}

// 允许的图片类型
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// 图片文件头魔数（用于验证文件内容是否为真实图片）
const FILE_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

// 最大文件大小 5MB
const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;

// 配置存储
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, COVER_UPLOAD_DIR);
  },
  filename(req, file, cb) {
    // 使用时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // 安全处理扩展名：仅保留允许的扩展名，防止路径遍历
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : ".jpg";
    cb(null, `cover-${uniqueSuffix}${safeExt}`);
  },
});

// 文件过滤器
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(`不支持的文件类型，仅允许：${ALLOWED_EXTENSIONS.join(", ")}`),
      false,
    );
  }
}

// 创建 multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// 导出封面图上传中间件（单文件上传，字段名为 cover）
const uploadCover = upload.single("cover");

module.exports = { uploadCover, COVER_UPLOAD_DIR, ALLOWED_EXTENSIONS };
