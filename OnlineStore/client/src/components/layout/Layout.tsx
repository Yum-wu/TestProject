import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PageContainer from './PageContainer';

/**
 * 全局布局组件 Layout
 * Header + PageContainer(子路由) + Footer
 * 使用 React Router v6 的 Outlet 渲染子路由
 */
export default function Layout() {
  return (
    <>
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <Footer />
    </>
  );
}
