import { memo, useRef, useEffect } from "react";
import { formatPrice } from "../../utils/format";
import type { CartItem as CartItemType } from "../../types/cart";

/**
 * 购物车单项组件
 * 显示商品图片、名称、单价、数量调节器、小计金额、删除按钮
 * 使用 React.memo 避免列表更新时的无效重渲染
 */
interface CartItemProps {
  item: CartItemType;
  /** 数量变化回调 */
  onChangeQuantity: (id: number, newQty: number) => void;
  /** 删除回调 */
  onRemove: (id: number) => void;
}

const CartItemComponent = memo(function CartItemComponent({
  item,
  onChangeQuantity,
  onRemove,
}: CartItemProps) {
  const maxQty = item.stock;

  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "var(--space-base)",
        gap: "var(--space-base)",
        flexWrap: "wrap",
      }}
    >
      {/* 左侧商品图片 */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--color-gray-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
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

      {/* 中间：商品名 + 单价 */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>
          {item.product_name}
        </div>
        <div className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
          单价：{formatPrice(item.price)}
        </div>
      </div>

      {/* 右侧：数量调节器 */}
      <div className="quantity-control">
        <button
          disabled={item.quantity <= 1}
          onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
        >
          &minus;
        </button>
        <DebouncedInput
          value={item.quantity}
          min={1}
          max={maxQty}
          onChange={(v) => onChangeQuantity(item.id, v)}
        />
        <button
          disabled={item.quantity >= maxQty}
          onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      {/* 小计金额 */}
      <div style={{ minWidth: 80, textAlign: "right" }}>
        <div className="price price-lg">{formatPrice(item.subtotal)}</div>
      </div>

      {/* 删除按钮 */}
      <button
        className="btn btn-outline btn-sm"
        style={{
          color: "var(--color-error)",
          borderColor: "var(--color-error-light)",
        }}
        onClick={() => onRemove(item.id)}
      >
        删除
      </button>
    </div>
  );
});

/**
 * 防抖输入组件：用户停止输入 500ms 后再触发 onChange
 */
function DebouncedInput({
  value, min, max, onChange,
}: {
  value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v) || v < min || v > max) return;
    if (timer.current) clearTimeout(timer.current);
    const captured = v;
    timer.current = setTimeout(() => onChange(captured), 500);
  };

  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
}

export default CartItemComponent;
