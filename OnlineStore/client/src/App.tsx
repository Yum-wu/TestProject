import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './store/CartContext';
import { AppProvider } from './store/AppContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrderListPage from './pages/OrderListPage';
import OrderDetail from './pages/OrderDetail';
import AddressPage from './pages/AddressPage';
import NotFound from './pages/NotFound';

/**
 * App 根组件
 * 路由配置 + 全局 Provider (CartContext / AppContext)
 * 使用 Layout 组件包裹所有路由，提供 Header + Footer + PageContainer
 */
export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </AppProvider>
  );
}
