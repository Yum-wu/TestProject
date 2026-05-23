import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { Spinner } from "./components/common/Loading";
import { getDarkMode, setDarkMode } from "./utils/storage";

/* ===== 路由懒加载 ===== */
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
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

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<MainLayout isDark={isDark} onToggleDark={toggleDark} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
