import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { useAppContext } from '../store/AppContext';
import { createOrder } from '../services/order.api';
import CartItemComponent from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import AddressCard from '../components/address/AddressCard';
import Loading from '../components/common/Loading';
import Empty from '../components/common/Empty';

/**
 * 购物车页面
 * 展示购物车列表、汇总、提供下单流程（选地址 -> 创建订单）
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { loading, cartData, updateQuantity, removeItem, refresh } = useCart();
  const { addresses, refresh: refreshAddresses } = useAddresses();
  const { showToast } = useAppContext();

  // 地址选择模态框
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 页面加载时获取购物车数据
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 打开地址选择模态框时刷新地址列表
  const openAddressModal = useCallback(async () => {
    await refreshAddresses();
    setSelectedAddressId(null);
    setShowAddressModal(true);
  }, [refreshAddresses]);

  // 提交订单
  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      alert('请选择收货地址');
      return;
    }
    if (!cartData || cartData.items.length === 0) return;

    setSubmitting(true);
    try {
      await createOrder({
        address_id: selectedAddressId,
        cart_item_ids: cartData.items.map((i) => i.id),
      });
      setShowAddressModal(false);
      showToast('下单成功！');
      navigate('/orders');
    } catch (e) {
      alert(e instanceof Error ? e.message : '下单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 无数据时显示空状态
  if (!loading && (!cartData || cartData.items.length === 0)) {
    return <Empty text="购物车是空的，快去逛逛吧" />;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>我的购物车</h2>

      {loading && <Loading />}

      {/* 购物车商品列表 */}
      {cartData && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
            {cartData.items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onChangeQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* 底部汇总栏 */}
          <CartSummary
            itemCount={cartData.items.length}
            totalAmount={cartData.total_amount}
            onCheckout={openAddressModal}
            disabled={loading}
          />
        </>
      )}

      {/* 地址选择模态框 */}
      {showAddressModal && (
        <div className="dialog-overlay" onClick={() => setShowAddressModal(false)}>
          <div
            className="dialog"
            style={{ maxWidth: 560, maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">选择收货地址</div>
            <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
              {addresses.length === 0 ? (
                <div className="text-muted text-center" style={{ padding: 'var(--space-xl) 0' }}>
                  暂无收货地址，
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowAddressModal(false);
                      navigate('/addresses');
                    }}
                  >
                    去新增
                  </button>
                </div>
              ) : (
                addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selectable
                    selected={selectedAddressId === addr.id}
                    onSelect={(id) => setSelectedAddressId(id)}
                  />
                ))
              )}
            </div>
            <div className="dialog-footer">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddressModal(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!selectedAddressId || submitting || addresses.length === 0}
                onClick={handleSubmitOrder}
              >
                {submitting ? '提交中...' : '确认下单'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
