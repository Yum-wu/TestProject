import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../services/order.api";
import { useOrders } from "../hooks/useOrders";
import { formatPrice, formatDate } from "../utils/format";
import StatusBadge from "../components/order/StatusBadge";
import OrderItemComponent from "../components/order/OrderItem";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Loading from "../components/common/Loading";
import type { Order } from "../types/order";

/**
 * 订单详情页
 * 展示订单完整信息：商品列表、地址快照、金额，支持取消订单
 */
export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cancelOrder } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // 获取订单详情（组件卸载时自动取消未完成的请求）
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getOrderById(Number(id), controller.signal)
      .then(setOrder)
      .catch((e) => {
        // AbortError 是请求被取消的预期行为，无需处理
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "获取订单详情失败");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  // 取消订单
  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrder(order.id);
      setOrder({ ...order, status: "cancelled" });
      setShowCancelDialog(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "取消订单失败");
    }
    setShowCancelDialog(false);
  };

  if (loading) return <Loading />;
  if (error || !order) {
    return (
      <div className="empty-state">
        <div
          className="empty-state-text"
          style={{ color: error ? "var(--color-error)" : undefined }}
        >
          {error || "订单不存在"}
        </div>
        <button
          className="btn btn-outline mt-base"
          onClick={() => navigate("/orders")}
        >
          返回订单列表
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* 订单头部信息 */}
      <div
        className="card card-body"
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <div
          className="flex-between"
          style={{ marginBottom: "var(--space-base)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-base)",
            }}
          >
            <h2 style={{ fontSize: "var(--text-lg)" }}>
              订单号：{order.order_no}
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            {formatDate(order.created_at)}
          </span>
        </div>
      </div>

      {/* 收货地址快照 */}
      {order.address_snapshot && (
        <div
          className="card card-body"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          <h3
            style={{
              fontSize: "var(--text-md)",
              marginBottom: "var(--space-sm)",
              color: "var(--color-gray-700)",
            }}
          >
            收货地址
          </h3>
          <div>
            <strong>{order.address_snapshot.receiver_name}</strong>
            <span
              className="text-muted"
              style={{ marginLeft: "var(--space-base)" }}
            >
              {order.address_snapshot.phone}
            </span>
          </div>
          <div className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            {order.address_snapshot.province} {order.address_snapshot.city}{" "}
            {order.address_snapshot.district} {order.address_snapshot.detail}
          </div>
        </div>
      )}

      {/* 订单商品明细 */}
      <div
        className="card card-body"
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <h3
          style={{
            fontSize: "var(--text-md)",
            marginBottom: "var(--space-base)",
            color: "var(--color-gray-700)",
          }}
        >
          商品明细
        </h3>
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <OrderItemComponent key={item.id} item={item} />
          ))
        ) : (
          <div className="text-muted">暂无商品信息</div>
        )}

        {/* 总金额 */}
        <div
          className="flex-between"
          style={{
            marginTop: "var(--space-base)",
            paddingTop: "var(--space-base)",
            borderTop: "1px solid var(--color-gray-200)",
          }}
        >
          <span style={{ fontWeight: 500 }}>合计金额</span>
          <span
            className="price price-lg"
            style={{ fontSize: "var(--text-xl)" }}
          >
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>

      {/* 操作区域 */}
      <div style={{ display: "flex", gap: "var(--space-base)" }}>
        <button className="btn btn-outline" onClick={() => navigate("/orders")}>
          返回列表
        </button>
        {order.status === "pending" && (
          <button
            className="btn btn-danger"
            onClick={() => setShowCancelDialog(true)}
          >
            取消订单
          </button>
        )}
      </div>

      {/* 取消订单确认弹窗 */}
      {showCancelDialog && (
        <ConfirmDialog
          title="取消订单"
          message="确定要取消该订单吗？此操作不可恢复。"
          confirmText="确认取消"
          onConfirm={handleCancel}
          onCancel={() => setShowCancelDialog(false)}
        />
      )}
    </div>
  );
}
