import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { usePagination } from '../hooks/usePagination';
import OrderCard from '../components/order/OrderCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import Empty from '../components/common/Empty';

/** 订单状态 Tab */
const TABS = [
  { key: '', label: '全部订单' },
  { key: 'pending', label: '待支付' },
  { key: 'cancelled', label: '已取消' },
];

/**
 * 订单列表页
 * 展示全部/待支付/已取消订单，支持分页浏览
 */
export default function OrderListPage() {
  const navigate = useNavigate();
  const { loading, orders, pagination, loadOrders } = useOrders();
  const { page, goToPage } = usePagination(1, 12);

  // 当前选中的状态 Tab
  const [statusFilter, setStatusFilter] = useState('');

  // 加载订单
  useEffect(() => {
    loadOrders(statusFilter || undefined, page);
  }, [statusFilter, page, loadOrders]);

  // 分页变化
  const handlePageChange = (p: number) => {
    goToPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>我的订单</h2>

      {/* 状态 Tab 切换 */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setStatusFilter(tab.key);
              goToPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 加载状态 */}
      {loading && <Loading />}

      {/* 订单列表或空状态 */}
      {!loading && orders.length === 0 && <Empty text="暂无订单" />}
      {!loading && orders.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>

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
