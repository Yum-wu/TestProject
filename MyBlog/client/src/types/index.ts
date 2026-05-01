/* ===== 博客系统 TypeScript 类型定义 ===== */
/* 与后端 API 响应格式对齐 */

/* ===== 通用类型 ===== */

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页信息 */
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

/** 分页响应（完整 API 响应） */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/* ===== 用户相关类型 ===== */

/** 用户信息 */
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

/** 登录请求 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 注册请求 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** 认证响应数据 */
export interface AuthResponseData {
  user: User;
  token: string;
}

/** 认证响应（完整 API 响应） */
export type AuthResponse = ApiResponse<AuthResponseData>;

/** 更新用户资料请求 */
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

/* ===== 文章相关类型 ===== */

/** 文章信息（后端返回完整数据） */
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status: "draft" | "published";
  view_count: number;
  author_id: number;
  category_id?: number;
  created_at: string;
  updated_at: string;
  author?: User;
  category?: Category;
  tags?: Tag[];
}

/** 文章列表项（用于 PostCard 组件适配） */
export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  viewCount: number;
  readingTime: number;
}

/** 创建文章请求 */
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category_id?: number;
  status?: "draft" | "published";
  tag_ids?: number[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  category_id?: number;
  status?: "draft" | "published";
  tag_ids?: number[];
}

/** 封面上传响应 */
export interface CoverUploadData {
  url: string;
}

/* ===== 分类相关类型 ===== */

/** 分类信息 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  post_count?: number;
}

/** 创建分类请求 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

/** 更新分类请求 */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

/* ===== 标签相关类型 ===== */

/** 标签信息 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
}

/** 创建标签请求 */
export interface CreateTagRequest {
  name: string;
}

/* ===== 评论相关类型 ===== */

/** 评论信息 */
export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  author?: User;
  replies?: Comment[];
}

/** 创建评论请求 */
export interface CreateCommentRequest {
  post_id: number;
  content: string;
}

/** 回复评论请求 */
export interface ReplyCommentRequest {
  content: string;
}

/** 评论树结构（用于 CommentList 组件适配） */
export interface CommentTree {
  id: string;
  content: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likeCount: number;
  isLiked?: boolean;
  replies?: CommentTree[];
}

/* ===== 文章查询参数 ===== */

/** 文章列表查询参数 */
export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  status?: "draft" | "published";
  authorId?: number;
}
