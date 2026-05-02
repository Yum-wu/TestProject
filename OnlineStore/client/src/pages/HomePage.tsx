import { useEffect, useState, useCallback } from "react";
import { useProducts } from "../hooks/useProducts";
import { usePagination } from "../hooks/usePagination";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import Empty from "../components/common/Empty";
import type { ProductFilter } from "../types/product";

/** 分类选项 */
const CATEGORIES = [
  { value: "", label: "全部" },
  { value: "电子产品", label: "电子产品" },
  { value: "服装", label: "服装" },
  { value: "图书", label: "图书" },
  { value: "食品", label: "食品" },
];

/** 排序选项 */
const SORT_OPTIONS = [
  { value: "", label: "默认排序" },
  { value: "price_asc", label: "价格从低到高" },
  { value: "price_desc", label: "价格从高到低" },
];

/**
 * 商品首页
 * 搜索栏 + 分类筛选 + 排序 + 商品网格 + 分页
 */
export default function HomePage() {
  const { loading, error, products, pagination, loadProducts } = useProducts();
  const { page, goToPage } = usePagination(1, 12);

  // 筛选状态
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");

  /**
   * 触发搜索/筛选
   */
  const doSearch = useCallback(
    (p = 1) => {
      const filter: ProductFilter = { page: p, pageSize: 12 };
      if (category) filter.category = category;
      if (keyword.trim()) filter.keyword = keyword.trim();
      if (sort) filter.sort = sort as ProductFilter["sort"];
      loadProducts(filter);
      goToPage(p);
    },
    [category, keyword, sort, loadProducts, goToPage],
  );

  // 首次加载 & 筛选变化时重新加载
  useEffect(() => {
    doSearch(1);
  }, [category, sort]);

  // 搜索按钮点击
  const handleSearchClick = () => {
    doSearch(1);
  };

  // 回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearchClick();
  };

  // 分页变化
  const handlePageChange = (p: number) => {
    doSearch(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* 搜索栏 */}
      <div
        className="card card-body"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-base)",
          marginBottom: "var(--space-lg)",
          flexWrap: "wrap",
        }}
      >
        {/* 分类下拉 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: 140 }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* 关键词输入 */}
        <input
          type="search"
          placeholder="搜索商品名称..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, minWidth: 180 }}
        />

        {/* 排序下拉 */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ width: 160 }}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* 搜索按钮 */}
        <button className="btn btn-primary" onClick={handleSearchClick}>
          搜索
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div
          className="card card-body"
          style={{
            color: "var(--color-error)",
            backgroundColor: "var(--color-error-light)",
            marginBottom: "var(--space-lg)",
          }}
        >
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && <Loading />}

      {/* 商品列表或空状态 */}
      {!loading && !error && products.length === 0 && (
        <Empty text="没有找到符合条件的商品" />
      )}
      {!loading && products.length > 0 && (
        <>
          <ProductGrid products={products} />
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
