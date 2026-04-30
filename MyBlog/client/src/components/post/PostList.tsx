import { useState } from "react";
import PostCard from "./PostCard";
import type { Post } from "./PostCard";
import Pagination from "../common/Pagination";
import SearchBar from "../common/SearchBar";
import Tag from "../common/Tag";
import EmptyState from "../common/EmptyState";
import { PostCardSkeleton } from "../common/Loading";

/* ===== PostList 组件属性 ===== */
interface PostListProps {
  /** 文章列表 */
  posts: Post[];
  /** 是否加载中 */
  loading?: boolean;
  /** 当前页码 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 总条数 */
  totalItems?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 页码变化回调 */
  onPageChange: (page: number) => void;
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 分类列表 */
  categories?: string[];
  /** 当前分类 */
  activeCategory?: string;
  /** 分类切换回调 */
  onCategoryChange?: (category: string) => void;
  /** 布局模式 */
  variant?: "grid" | "list";
}

/**
 * 文章列表组件
 * 网格布局，带筛选和分页
 */
export default function PostList({
  posts,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onSearch,
  categories,
  activeCategory,
  onCategoryChange,
  variant = "grid",
}: PostListProps) {
  const [layout, setLayout] = useState<"grid" | "list">(variant);

  return (
    <div className="space-y-6">
      {/* ===== 顶部工具栏 ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* 搜索栏 */}
        {onSearch && (
          <SearchBar
            onSearch={onSearch}
            placeholder="搜索文章..."
            size="md"
            className="w-full sm:w-80"
          />
        )}

        {/* 布局切换 */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5">
          <button
            type="button"
            onClick={() => setLayout("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              layout === "grid"
                ? "bg-primary-500 text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
            aria-label="网格视图"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setLayout("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              layout === "list"
                ? "bg-primary-500 text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
            aria-label="列表视图"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== 分类筛选 ===== */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Tag
            label="全部"
            color={!activeCategory ? "primary" : "default"}
            clickable
            onClick={() => onCategoryChange?.("")}
          />
          {categories.map((category) => (
            <Tag
              key={category}
              label={category}
              color={activeCategory === category ? "primary" : "default"}
              clickable
              onClick={() => onCategoryChange?.(category)}
            />
          ))}
        </div>
      )}

      {/* ===== 文章列表内容 ===== */}
      {loading ? (
        /* 加载骨架屏 */
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          <PostCardSkeleton count={layout === "grid" ? 6 : 4} />
        </div>
      ) : posts.length === 0 ? (
        /* 空状态 */
        <EmptyState
          title="暂无文章"
          description="还没有发布任何文章，敬请期待精彩内容。"
          actionText="浏览全部"
          onAction={() => {
            onCategoryChange?.("");
            onPageChange(1);
          }}
        />
      ) : (
        /* 文章列表 */
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant={layout === "list" ? "horizontal" : "vertical"}
            />
          ))}
        </div>
      )}

      {/* ===== 分页 ===== */}
      {!loading && posts.length > 0 && totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
