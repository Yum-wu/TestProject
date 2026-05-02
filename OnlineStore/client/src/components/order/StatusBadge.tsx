import { memo } from "react";
import type { OrderStatus } from "../../types/order";

/** 订单状态与展示文本的映射 */
const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "待支付", className: "badge badge-pending" },
  cancelled: { label: "已取消", className: "badge badge-cancelled" },
};

/**
 * 订单状态徽章组件
 * pending -> 待支付（warning 色）
 * cancelled -> 已取消（error 色）
 * 使用 React.memo 避免父组件更新时的无效重渲染
 */
const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "badge badge-info",
  };

  return <span className={config.className}>{config.label}</span>;
});

export default StatusBadge;
