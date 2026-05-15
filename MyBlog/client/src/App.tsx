import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { Spinner } from "./components/common/Loading";
import { getDarkMode, setDarkMode } from "./utils/storage";

/* ===== 路由懒加载 ===== */
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/**
 * 页面加载 fallback 组件
 */
function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size="md" />
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
        页面加载中...
      </p>
    </div>
  );
}

/**
 * 应用内容组件
 */
function AppContent({
  isDark,
  onToggleDark,
}: {
  isDark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* MainLayout 包裹的页面 */}
        <Route element={<MainLayout isDark={isDark} onToggleDark={onToggleDark} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* 404 兜底路由 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

/**
 * 根组件
 */
function App() {
  const [isDark, setIsDark] = useState(getDarkMode);

  /* 初始化暗色模式 */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    setDarkMode(newDark);
  };

  return <AppContent isDark={isDark} onToggleDark={toggleDark} />;
}

export default App;
