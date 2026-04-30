import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/* ===== MainLayout 组件属性 ===== */
interface MainLayoutProps {
  /** 是否已登录 */
  isLoggedIn?: boolean;
  /** 用户头像 URL */
  avatarUrl?: string;
  /** 用户名 */
  username?: string;
  /** 登出回调 */
  onLogout?: () => void;
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 暗色模式状态 */
  isDark?: boolean;
  /** 暗色模式切换回调 */
  onToggleDark?: () => void;
}

/**
 * 主布局组件
 * 包含 Header + main 内容区 + Footer
 * 使用 Outlet 渲染子路由内容
 */
export default function MainLayout({
  isLoggedIn = false,
  avatarUrl,
  username,
  onLogout,
  onSearch,
  isDark = false,
  onToggleDark,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      {/* 顶部导航栏 */}
      <Header
        isLoggedIn={isLoggedIn}
        avatarUrl={avatarUrl}
        username={username}
        onLogout={onLogout}
        onSearch={onSearch}
        isDark={isDark}
        onToggleDark={onToggleDark}
      />

      {/* 主内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
