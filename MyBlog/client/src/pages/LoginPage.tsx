import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";

/**
 * 登录页
 * 居中卡片布局，使用 LoginForm 组件
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 处理登录 */
  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      /* 从 axios 错误中提取消息 */
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md">
        {/* 登录卡片 */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 shadow-soft-lg">
          <LoginForm onLogin={handleLogin} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
