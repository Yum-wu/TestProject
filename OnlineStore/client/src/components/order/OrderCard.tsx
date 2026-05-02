import { memo } from "react";
import { formatPrice, formatDate, formatOrderNo } from "../../utils/format";
import StatusBadge from "./StatusBadge";
import type { Order } from "../../types/order";

/**
 * 订单列表卡片组件
 * 展示订单号、时间、商品数、金额、状态，点击查看详情
 * 使用 React.memo 避免列表更新时的无效重渲染
 */
interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard = memo(function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div
      className="card card-body"
      style={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-base)",
      }}
      onClick={onClick}
    >
      {/* 左侧信息 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
            {formatOrderNo(order.order_no)}
          </span>
          <StatusBadge status={order.status} />
        </div>
        <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
          {formatDate(order.created_at)}
        </div>
      </div>

      {/* 右侧价格 */}
      <div style={{ textAlign: "right" }}>
        <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
          {order.item_count ?? 0} 种商品
        </div>
        <div className="price price-lg">{formatPrice(order.total_amount)}</div>
      </div>
    </div>
  );
});

export default OrderCard;
