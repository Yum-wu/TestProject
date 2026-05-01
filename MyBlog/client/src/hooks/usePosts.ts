import { useState, useEffect, useCallback } from "react";
import type { Post, PostListItem, PostQueryParams } from "../types";
import * as postService from "../services/posts";
import { DEFAULT_PAGE_SIZE, READING_SPEED, EXCERPT_MAX_LENGTH } from "../utils/constants";

/**
 * 将后端 Post 数据转换为 PostCard 组件所需的 PostListItem 格式
 */
function mapPostToListItem(post: Post): PostListItem {
  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.content.slice(0, EXCERPT_MAX_LENGTH) + "...",
    coverUrl: post.cover_image || undefined,
    category: post.category?.name || "未分类",
    tags: post.tags?.map((t) => t.name) || [],
    author: {
      name: post.author?.username || "匿名",
      avatarUrl: post.author?.avatar || undefined,
    },
    createdAt: post.created_at,
    viewCount: post.view_count,
    readingTime: Math.max(1, Math.ceil(post.content.length / READING_SPEED)),
  };
}

/* ===== Hook 返回值类型 ===== */
interface UsePostsReturn {
  posts: PostListItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  search: (keyword: string) => void;
  setPage: (page: number) => void;
  setCategory: (categoryId: number | undefined) => void;
  setTag: (tagId: number | undefined) => void;
  refresh: () => void;
}

/**
 * 文章列表状态管理 Hook
 * 管理分页、搜索、分类/标签筛选
 * 所有回调函数使用 useCallback 包装，避免子组件不必要的重渲染
 */
export function usePosts(initialParams?: PostQueryParams): UsePostsReturn {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<PostQueryParams>({
    pageSize: DEFAULT_PAGE_SIZE,
    status: "published",
    ...initialParams,
  });

  /* 获取文章列表 */
  const fetchPosts = useCallback(async (queryParams: PostQueryParams) => {
    setLoading(true);
    try {
      const res = await postService.getPosts(queryParams);
      const { items, pagination } = res.data;
      setPosts(items.map(mapPostToListItem));
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
      setCurrentPage(pagination.page);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 参数变化时重新获取 */
  useEffect(() => {
    fetchPosts(params);
  }, [params, fetchPosts]);

  /* 搜索 - useCallback 包装 */
  const search = useCallback((keyword: string) => {
    setParams((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }));
  }, []);

  /* 切换页码 - useCallback 包装 */
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  /* 切换分类 - useCallback 包装 */
  const setCategory = useCallback((categoryId: number | undefined) => {
    setParams((prev) => ({ ...prev, categoryId, page: 1 }));
  }, []);

  /* 切换标签 - useCallback 包装 */
  const setTag = useCallback((tagId: number | undefined) => {
    setParams((prev) => ({ ...prev, tagId, page: 1 }));
  }, []);

  /* 刷新列表 - useCallback 包装 */
  const refresh = useCallback(() => {
    fetchPosts(params);
  }, [params, fetchPosts]);

  return {
    posts,
    loading,
    currentPage,
    totalPages,
    totalItems,
    search,
    setPage,
    setCategory,
    setTag,
    refresh,
  };
}

export default usePosts;
