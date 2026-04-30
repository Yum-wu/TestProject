import api from "./api";
import type {
  Comment,
  CreateCommentRequest,
  ReplyCommentRequest,
  ApiResponse,
} from "../types";

/**
 * 获取文章评论列表
 * GET /api/posts/:postId/comments
 */
export async function getCommentsByPost(
  postId: number
): Promise<ApiResponse<Comment[]>> {
  const res = await api.get<ApiResponse<Comment[]>>(
    `/posts/${postId}/comments`
  );
  return res.data;
}

/**
 * 创建评论
 * POST /api/comments
 */
export async function createComment(
  data: CreateCommentRequest
): Promise<ApiResponse<Comment>> {
  const res = await api.post<ApiResponse<Comment>>("/comments", data);
  return res.data;
}

/**
 * 回复评论
 * POST /api/comments/:id/reply
 */
export async function replyComment(
  id: number,
  data: ReplyCommentRequest
): Promise<ApiResponse<Comment>> {
  const res = await api.post<ApiResponse<Comment>>(
    `/comments/${id}/reply`,
    data
  );
  return res.data;
}

/**
 * 删除评论
 * DELETE /api/comments/:id
 */
export async function deleteComment(id: number): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/comments/${id}`);
  return res.data;
}
