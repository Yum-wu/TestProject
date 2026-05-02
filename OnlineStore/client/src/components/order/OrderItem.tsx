import { memo } from "react";
import { formatPrice } from "../../utils/format";
import type { OrderItem as OrderItemType } from "../../types/order";

/**
 * 订单商品明细组件（详情页用）
 * 展示商品图片、名称、快照单价 x 数量 = 小计
 * 使用 React.memo 避免列表更新时的无效重渲染
 */
const OrderItemComponent = memo(function OrderItemComponent({
  item,
}: {
  item: OrderItemType;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "var(--space-md) 0",
        gap: "var(--space-base)",
        borderBottom: "1px solid var(--color-gray-100)",
      }}
    >
      {/* 商品图片 */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--color-gray-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {item.product_image ? (
          <img
            src={item.product_image}
            alt={item.product_name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>&#x1F4E6;</span>
        )}
      </div>

      {/* 商品信息 */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>
          {item.product_name}
        </div>
        <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
          {formatPrice(item.price)} &times; {item.quantity}
        </div>
      </div>

      {/* 小计 */}
      <div
        className="price price-lg"
        style={{ minWidth: 80, textAlign: "right" }}
      >
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
});

export default OrderItemComponent;
