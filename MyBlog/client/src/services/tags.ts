import api from "./api";
import type { Tag, CreateTagRequest, ApiResponse } from "../types";

/**
 * 获取所有标签
 * GET /api/tags
 */
export async function getTags(): Promise<ApiResponse<Tag[]>> {
  const res = await api.get<ApiResponse<Tag[]>>("/tags");
  return res.data;
}

/**
 * 创建标签
 * POST /api/tags
 */
export async function createTag(
  data: CreateTagRequest
): Promise<ApiResponse<Tag>> {
  const res = await api.post<ApiResponse<Tag>>("/tags", data);
  return res.data;
}

/**
 * 删除标签
 * DELETE /api/tags/:id
 */
export async function deleteTag(id: number): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/tags/${id}`);
  return res.data;
}
