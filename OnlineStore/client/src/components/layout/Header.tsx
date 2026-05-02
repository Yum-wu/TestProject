import { Link } from 'react-router-dom';
import { useCartContext } from '../../store/CartContext';

/**
 * 全局顶部导航栏 Header
 * 固定顶部，显示 Logo、导航链接、购物车角标
 */
export default function Header() {
  const { cartCount } = useCartContext();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        className="container flex-between"
        style={{ height: '100%' }}
      >
        {/* 左侧 Logo */}
        <Link
          to="/"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          Mini商城
        </Link>

        {/* 右侧导航 */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <Link to="/orders" className="btn btn-ghost btn-sm">
            我的订单
          </Link>
          <Link to="/addresses" className="btn btn-ghost btn-sm">
            地址管理
          </Link>

          {/* 购物车入口 + 角标 */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '22px',
              textDecoration: 'none',
              padding: 'var(--space-xs)',
            }}
            title="购物车"
          >
            &#x1F6D2;
            {cartCount > 0 && (
              <span className="badge badge-count">{cartCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
