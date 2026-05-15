import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostList from "../components/post/PostList";
import { getAllPosts, getAllCategories, getAllTags, searchPosts } from "../utils/posts-loader";
import type { Post } from "../types/blog";
import type { PostListItem } from "../types/blog";
import { estimateReadingTime } from "../utils/posts-loader";

/**
 * 将 Post 转换为 PostListItem（适配 PostCard 组件）
 */
function toListItem(post: Post): PostListItem {
  return {
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.content.slice(0, 150) + "...",
    coverUrl: post.cover,
    category: post.category,
    tags: post.tags,
    author: {
      name: post.author || "Yum",
    },
    createdAt: post.date,
    viewCount: 0,
    readingTime: estimateReadingTime(post.content),
  };
}

/**
 * 首页
 * 从本地 Markdown 文件加载文章列表，支持搜索和分类筛选
 */
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const activeCategory = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  // 获取所有文章
  const allPosts = useMemo(() => getAllPosts(), []);

  // 搜索和筛选
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (searchQuery) {
      posts = searchPosts(searchQuery);
    }
    if (activeCategory) {
      posts = posts.filter((p) => p.category === activeCategory);
    }
    return posts;
  }, [allPosts, searchQuery, activeCategory]);

  // 分页
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const pagedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 分类列表
  const categories = useMemo(() => getAllCategories(), [allPosts]);

  // 搜索回调
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setSearchParams(params, { replace: true });
  };

  // 分页回调
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 分类切换
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 欢迎横幅 ===== */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Yum 的博客
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          记录技术成长，分享编程心得
        </p>
      </div>

      {/* ===== 文章列表 ===== */}
      <PostList
        posts={pagedPosts.map(toListItem)}
        loading={false}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPosts.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        categories={categories}
        activeCategory={activeCategory || undefined}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
