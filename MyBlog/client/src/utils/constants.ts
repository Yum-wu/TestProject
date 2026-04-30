/* ===== 应用常量定义 ===== */

/** API 基础路径 */
export const API_BASE_URL = "/api";

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 10;

/** 文章状态 */
export const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

/** 文章阅读速度（字/分钟） */
export const READING_SPEED = 500;

/** 文章摘要最大长度 */
export const EXCERPT_MAX_LENGTH = 200;

/** 评论最大嵌套深度 */
export const MAX_COMMENT_DEPTH = 3;

/** 评论内容最大长度 */
export const COMMENT_MAX_LENGTH = 2000;

/** 封面图最大文件大小（5MB） */
export const COVER_MAX_SIZE = 5 * 1024 * 1024;

/** 允许的封面图类型 */
export const COVER_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** 路由路径常量 */
export const ROUTES = {
  HOME: "/",
  POSTS: "/posts",
  POST_DETAIL: "/posts/:slug",
  POST_EDITOR: "/editor",
  POST_EDIT: "/editor/:id",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CATEGORIES: "/categories",
  TAGS: "/tags",
} as const;
