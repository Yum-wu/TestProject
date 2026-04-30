import { useState, useEffect, useCallback } from "react";
import type { Tag } from "../types";
import * as tagService from "../services/tags";

/* ===== Hook 返回值类型 ===== */
interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  refresh: () => void;
}

/**
 * 标签数据管理 Hook
 */
export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  /* 获取标签列表 */
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagService.getTags();
      setTags(res.data);
    } catch {
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 初始化加载 */
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  /* 刷新 */
  const refresh = useCallback(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, refresh };
}

export default useTags;
