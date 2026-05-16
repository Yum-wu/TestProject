import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutProps {
  isDark?: boolean;
  onToggleDark?: () => void;
}

/**
 * 主布局组件
 * 包含 Header + main 内容区 + Footer
 */
export default function MainLayout({ isDark, onToggleDark }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Header isDark={isDark} onToggleDark={onToggleDark} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
