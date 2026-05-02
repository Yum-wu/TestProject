import { memo } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import type { Product } from "../../types/product";

/**
 * 商品卡片组件
 * 展示商品图片、名称、价格、库存标签，点击跳转详情
 * 使用 React.memo 避免父组件更新时的不必要重渲染
 */
const ProductCard = memo(function ProductCard({
  product,
}: {
  product: Product;
}) {
  const isLowStock = product.stock <= 10 && product.stock > 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="card"
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 商品图片区域 */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          backgroundColor: "var(--color-gray-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          overflow: "hidden",
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          // emoji 占位图
          <span>&#x1F4E6;</span>
        )}
      </div>

      {/* 商品信息 */}
      <div
        className="card-body"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        {/* 分类标签 */}
        <span className="badge badge-info" style={{ alignSelf: "flex-start" }}>
          {product.category}
        </span>

        {/* 商品名称 */}
        <h3
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 500,
            lineHeight: 1.4,
            // 最多显示两行
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h3>

        {/* 价格与库存 */}
        <div className="flex-between" style={{ marginTop: "auto" }}>
          <span className="price price-lg">{formatPrice(product.price)}</span>
          {isLowStock && <span className="badge badge-pending">即将售罄</span>}
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;
