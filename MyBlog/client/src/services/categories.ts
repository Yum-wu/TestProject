import api from "./api";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
} from "../types";

/**
 * 获取所有分类
 * GET /api/categories
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data;
}

/**
 * 创建分类
 * POST /api/categories
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<ApiResponse<Category>> {
  const res = await api.post<ApiResponse<Category>>("/categories", data);
  return res.data;
}

/**
 * 更新分类
 * PUT /api/categories/:id
 */
export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest
): Promise<ApiResponse<Category>> {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
  return res.data;
}

/**
 * 删除分类
 * DELETE /api/categories/:id
 */
export async function deleteCategory(id: number): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return res.data;
}
