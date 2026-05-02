import { useState, useCallback } from 'react';
import { getOrders, cancelOrder as cancelOrderApi } from '../services/order.api';
import type { Order, OrderStatus } from '../types/order';
import type { PaginationParams } from '../types/api';

/**
 * 订单列表 Hook
 * 管理订单列表的加载、筛选、取消操作
 */
export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationParams | null>(null);

  /**
   * 加载订单列表
   * @param status - 可选的状态筛选
   * @param page - 页码（默认 1）
   */
  const loadOrders = useCallback(
    async (status?: string, page = 1) => {
      setLoading(true);
      try {
        const res = await getOrders({
          page,
          pageSize: 12,
          status: status || undefined,
        });
        setOrders(res.list);
        setPagination(res.pagination);
      } catch {
        // 静默失败
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 取消订单
   */
  const cancelOrder = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await cancelOrderApi(id);
      // 本地更新状态为已取消
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: 'cancelled' as OrderStatus } : o
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /** 刷新（重新加载当前页） */
  const refresh = useCallback(
    (status?: string, page = 1) => loadOrders(status, page),
    [loadOrders]
  );

  return { loading, orders, pagination, loadOrders, cancelOrder, refresh };
}
