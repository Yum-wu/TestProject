import { memo } from "react";
import type { Address } from "../../types/address";

/**
 * 地址卡片组件
 * 展示收件人、电话、完整地址，支持编辑/删除/设为默认
 * 使用 React.memo 避免列表更新时的无效重渲染
 */
interface AddressCardProps {
  address: Address;
  /** 是否在选择模式（下单时选地址） */
  selectable?: boolean;
  /** 是否已选中 */
  selected?: boolean;
  /** 选中回调 */
  onSelect?: (id: number) => void;
  /** 编辑回调 */
  onEdit?: (address: Address) => void;
  /** 删除回调 */
  onDelete?: (id: number) => void;
}

const AddressCard = memo(function AddressCard({
  address,
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div
      className={`card card-body ${selected ? "" : ""}`}
      style={{
        borderColor: selected ? "var(--color-primary)" : undefined,
        borderWidth: selected ? 2 : 1,
        cursor: selectable ? "pointer" : "default",
        position: "relative",
      }}
      onClick={() => selectable && onSelect?.(address.id)}
    >
      {/* 选择模式下的 radio 指示 */}
      {selectable && (
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-gray-300)"}`,
              backgroundColor: selected
                ? "var(--color-primary)"
                : "transparent",
            }}
          />
        </div>
      )}

      {/* 收件人 + 电话 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          marginBottom: "var(--space-sm)",
        }}
      >
        <strong style={{ fontSize: "var(--text-md)" }}>
          {address.receiver_name}
        </strong>
        <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
          {address.phone}
        </span>
        {address.is_default === 1 && (
          <span className="badge badge-success" style={{ marginLeft: "auto" }}>
            默认
          </span>
        )}
      </div>

      {/* 完整地址 */}
      <div
        className="text-muted"
        style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-md)" }}
      >
        {address.province} {address.city} {address.district} {address.detail}
      </div>

      {/* 操作按钮（非选择模式） */}
      {!selectable && (
        <div style={{ display: "flex", gap: "var(--space-sm)" }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onEdit?.(address)}
          >
            编辑
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{
              color: "var(--color-error)",
              borderColor: "var(--color-error-light)",
            }}
            onClick={() => onDelete?.(address.id)}
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
});

export default AddressCard;
