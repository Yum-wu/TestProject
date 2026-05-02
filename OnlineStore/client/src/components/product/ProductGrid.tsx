import ProductCard from './ProductCard';
import type { Product } from '../../types/product';

/**
 * 商品网格布局组件
 * 响应式 CSS Grid：4 列 (desktop) / 2 列 (tablet) / 1 列 (mobile)
 */
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 'var(--space-lg)',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
