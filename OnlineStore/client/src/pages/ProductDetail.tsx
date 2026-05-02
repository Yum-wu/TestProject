import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/product.api";
import { formatPrice } from "../utils/format";
import { validateQuantity } from "../utils/validators";
import { useCart } from "../hooks/useCart";
import { useAppContext } from "../store/AppContext";
import Loading from "../components/common/Loading";
import type { ProductDetail as ProductDetailType } from "../types/product";

/**
 * 商品详情页
 * 展示商品完整信息，支持选择数量加入购物车
 */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { showToast } = useAppContext();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // 获取商品详情（组件卸载时自动取消未完成的请求）
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getProductById(Number(id), controller.signal)
      .then(setProduct)
      .catch((e) => {
        // AbortError 是请求被取消的预期行为，无需处理
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "获取商品详情失败");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  // 加入购物车
  const handleAddToCart = async () => {
    if (!product) return;
    const validation = validateQuantity(quantity, product.stock);
    if (!validation.valid) {
      showToast(validation.message);
      return;
    }
    try {
      await addToCart(product.id, quantity);
      showToast("已加入购物车");
    } catch {
      showToast("加入购物车失败，请重试");
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="empty-state">
        <div
          className="empty-state-text"
          style={{ color: "var(--color-error)" }}
        >
          {error}
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          返回
        </button>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="empty-state">
        <div className="empty-state-text">商品不存在</div>
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          返回首页
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-2xl)",
        maxWidth: 1024,
        margin: "0 auto",
      }}
    >
      {/* 左侧商品图片 */}
      <div
        className="card"
        style={{
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "80px",
          backgroundColor: "var(--color-gray-50)",
          overflow: "hidden",
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>&#x1F4E6;</span>
        )}
      </div>

      {/* 右侧商品信息 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
        }}
      >
        {/* 分类标签 */}
        <div>
          <span className="badge badge-info">{product.category}</span>
        </div>

        {/* 商品名称 */}
        <h1 style={{ fontSize: "var(--text-2xl)", lineHeight: 1.3 }}>
          {product.name}
        </h1>

        {/* 价格 */}
        <div>
          <span className="price" style={{ fontSize: "var(--text-3xl)" }}>
            {formatPrice(product.price)}
          </span>
        </div>

        {/* 库存信息 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-base)",
          }}
        >
          <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            库存：{product.stock} 件
          </span>
          {isOutOfStock && (
            <span className="badge badge-cancelled">已售罄</span>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="badge badge-pending">即将售罄</span>
          )}
        </div>

        {/* 商品描述 */}
        {product.description && (
          <div>
            <h3
              style={{
                fontSize: "var(--text-md)",
                marginBottom: "var(--space-sm)",
                color: "var(--color-gray-700)",
              }}
            >
              商品描述
            </h3>
            <p
              style={{
                color: "var(--color-gray-600)",
                lineHeight: 1.75,
                fontSize: "var(--text-base)",
              }}
            >
              {product.description}
            </p>
          </div>
        )}

        <div className="divider" />

        {/* 数量选择 + 加购 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-lg)",
          }}
        >
          <span style={{ fontWeight: 500 }}>数量：</span>
          <div className="quantity-control">
            <button
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              &minus;
            </button>
            <input
              type="number"
              value={quantity}
              min={1}
              max={product.stock}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= product.stock) setQuantity(v);
              }}
            />
            <button
              disabled={quantity >= product.stock}
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <button
            className="btn btn-primary btn-lg"
            disabled={isOutOfStock || cartLoading}
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? "暂时缺货"
              : cartLoading
                ? "添加中..."
                : "加入购物车"}
          </button>
        </div>
      </div>
    </div>
  );
}
