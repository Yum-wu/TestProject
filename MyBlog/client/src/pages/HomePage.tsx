import { useEffect } from "react";
import PostList from "../components/post/PostList";
import { usePosts } from "../hooks/usePosts";
import { useCategories } from "../hooks/useCategories";

/**
 * 首页
 * 包含文章列表、搜索栏、分类/标签筛选、分页
 */
export default function HomePage() {
  const {
    posts,
    loading,
    currentPage,
    totalPages,
    totalItems,
    search,
    setPage,
    setCategory,
  } = usePosts();
  const { categories } = useCategories();

  /* 搜索时跳转到文章列表 */
  const handleSearch = (keyword: string) => {
    search(keyword);
  };

  /* Header 搜索回调 - 通过 URL 参数传递 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q");
    if (keyword) {
      search(keyword);
    }
  }, [search]);

  /* 分类名称列表（用于 PostList 组件） */
  const categoryNames = categories.map((c) => c.name);

  /* 当前分类筛选（通过 URL 参数） */
  const currentCategory = new URLSearchParams(window.location.search).get(
    "category"
  );

  /* 分类切换时映射为 categoryId */
  const handleCategoryChange = (categoryName: string) => {
    if (!categoryName) {
      setCategory(undefined);
    } else {
      const found = categories.find((c) => c.name === categoryName);
      if (found) {
        setCategory(found.id);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 欢迎横幅 ===== */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          探索精彩内容
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          发现技术文章、分享编程心得、记录成长历程
        </p>
      </div>

      {/* ===== 文章列表 ===== */}
      <PostList
        posts={posts}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
        onSearch={handleSearch}
        categories={categoryNames}
        activeCategory={currentCategory || undefined}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
