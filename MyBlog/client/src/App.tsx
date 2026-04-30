import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import MainLayout from "./components/layout/MainLayout";
import { Spinner } from "./components/common/Loading";
import { getDarkMode, setDarkMode } from "./utils/storage";

/* ===== 路由懒加载 ===== */
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const PostEditorPage = lazy(() => import("./pages/PostEditorPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/* ===== 预加载关键路由（首页） ===== */
const preloadHomePage = () => import("./pages/HomePage");

/**
 * 页面加载 fallback 组件
 * 路由切换时显示的加载占位
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
 * 路由守卫组件 - 需要认证才能访问的页面
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, state } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /* 等待初始化完成后再判断 */
    if (state.initialized && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, state.initialized, navigate]);

  /* 未初始化完成时显示空白 */
  if (!state.initialized) return null;

  /* 未登录时返回 null（会跳转） */
  if (!isLoggedIn) return null;

  return <>{children}</>;
}

/**
 * 暗色模式管理组件
 */
function DarkModeManager({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(getDarkMode);

  /* 初始化暗色模式 */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  /* 切换暗色模式 */
  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    setDarkMode(newDark);
  };

  /* 首次加载后预加载首页路由 */
  useEffect(() => {
    preloadHomePage();
  }, []);

  return (
    <AuthProvider>
      <AppContent isDark={isDark} onToggleDark={toggleDark} />
      {children}
    </AuthProvider>
  );
}

/**
 * 应用内容组件（需要 AuthProvider 内部）
 */
function AppContent({
  isDark,
  onToggleDark,
}: {
  isDark: boolean;
  onToggleDark: () => void;
}) {
  const { state, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  /* Header 搜索回调 */
  const handleSearch = (query: string) => {
    navigate(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* ===== MainLayout 包裹的页面 ===== */}
          <Route
            element={
              <MainLayout
                isLoggedIn={isLoggedIn}
                avatarUrl={state.user?.avatar}
                username={state.user?.username}
                onLogout={logout}
                onSearch={handleSearch}
                isDark={isDark}
                onToggleDark={onToggleDark}
              />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/:slug" element={<PostDetailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ===== 独立布局的页面 ===== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ===== 需要认证的独立页面 ===== */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <PostEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <PostEditorPage />
              </ProtectedRoute>
            }
          />

          {/* ===== 404 兜底路由 ===== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast 通知 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
          },
        }}
      />
    </>
  );
}

/**
 * 根组件
 */
function App() {
  return (
    <DarkModeManager>
      <></>
    </DarkModeManager>
  );
}

export default App;
