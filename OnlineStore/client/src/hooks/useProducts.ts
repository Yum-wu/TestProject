import { useState, useCallback, useEffect } from 'react';
import { getProducts } from '../services/product.api';
import type { Product, ProductFilter } from '../types/product';
import type { PaginationParams } from '../types/api';

/**
 * 商品列表 Hook
 * 管理商品列表的加载状态与分页逻辑，支持筛选/搜索/排序
 */
export function useProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationParams | null>(null);

  /**
   * 加载商品列表（替换现有数据）
   */
  const loadProducts = useCallback(async (filter: ProductFilter = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts(filter);
      setProducts(res.list);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载商品失败');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 加载更多商品（追加到现有列表，用于无限滚动场景）
   */
  const loadMore = useCallback(async (filter: ProductFilter = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts(filter);
      setProducts((prev) => [...prev, ...res.list]);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载更多商品失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, products, pagination, loadProducts, loadMore };
}
