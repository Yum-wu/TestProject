import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/* ===== MainLayout 组件属性 ===== */
interface MainLayoutProps {
  /** 暗色模式状态 */
  isDark?: boolean;
  /** 暗色模式切换回调 */
  onToggleDark?: () => void;
}

/**
 * 主布局组件
 * 纯静态版本：无认证相关 props
 */
export default function MainLayout({
  isDark = false,
  onToggleDark,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      {/* 顶部导航栏 */}
      <Header isDark={isDark} onToggleDark={onToggleDark} />

      {/* 主内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
