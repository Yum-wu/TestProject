import { useState, useEffect, useCallback } from "react";
import type { Category } from "../types";
import * as categoryService from "../services/categories";

/* ===== Hook 返回值类型 ===== */
interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  refresh: () => void;
}

/**
 * 分类数据管理 Hook
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  /* 获取分类列表 */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 初始化加载 */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* 刷新 */
  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refresh };
}

export default useCategories;
