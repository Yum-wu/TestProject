import api from "./api";
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  CoverUploadData,
  PaginatedResponse,
  PostQueryParams,
  ApiResponse,
} from "../types";

/**
 * 获取文章列表（分页、搜索、筛选）
 * GET /api/posts
 */
export async function getPosts(
  params?: PostQueryParams
): Promise<PaginatedResponse<Post>> {
  const res = await api.get<PaginatedResponse<Post>>("/posts", { params });
  return res.data;
}

/**
 * 根据 slug 获取文章详情
 * GET /api/posts/:slug
 */
export async function getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
  const res = await api.get<ApiResponse<Post>>(`/posts/${slug}`);
  return res.data;
}

/**
 * 创建文章
 * POST /api/posts
 */
export async function createPost(
  data: CreatePostRequest
): Promise<ApiResponse<Post>> {
  const res = await api.post<ApiResponse<Post>>("/posts", data);
  return res.data;
}

/**
 * 更新文章
 * PUT /api/posts/:id
 */
export async function updatePost(
  id: number,
  data: UpdatePostRequest
): Promise<ApiResponse<Post>> {
  const res = await api.put<ApiResponse<Post>>(`/posts/${id}`, data);
  return res.data;
}

/**
 * 删除文章
 * DELETE /api/posts/:id
 */
export async function deletePost(id: number): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/posts/${id}`);
  return res.data;
}

/**
 * 上传封面图
 * POST /api/posts/upload-cover
 */
export async function uploadCover(
  file: File
): Promise<ApiResponse<CoverUploadData>> {
  const formData = new FormData();
  formData.append("cover", file);
  const res = await api.post<ApiResponse<CoverUploadData>>(
    "/posts/upload-cover",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}
