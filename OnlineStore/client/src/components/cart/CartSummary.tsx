import { formatPrice } from '../../utils/format';

/**
 * 购物车底部汇总栏
 * 显示商品种类数、合计金额、去结算按钮
 */
interface CartSummaryProps {
  /** 商品种类数 */
  itemCount: number;
  /** 合计金额 */
  totalAmount: number;
  /** 去结算回调 */
  onCheckout: () => void;
  /** 是否禁用结算按钮 */
  disabled?: boolean;
}

export default function CartSummary({
  itemCount,
  totalAmount,
  onCheckout,
  disabled = false,
}: CartSummaryProps) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-base) var(--space-lg)',
        marginTop: 'var(--space-lg)',
        flexWrap: 'wrap',
        gap: 'var(--space-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <span style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
          已选 <strong>{itemCount}</strong> 种商品
        </span>
        <span className="price price-lg" style={{ fontSize: 'var(--text-xl)' }}>
          合计：{formatPrice(totalAmount)}
        </span>
      </div>

      <button
        className="btn btn-primary btn-lg"
        disabled={disabled || itemCount === 0}
        onClick={onCheckout}
      >
        去结算
      </button>
    </div>
  );
}
