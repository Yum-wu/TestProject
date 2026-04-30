import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";

/**
 * 注册页
 * 居中卡片布局，使用 RegisterForm 组件
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 处理注册 */
  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      await register(data);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 注册卡片 */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 shadow-soft-lg">
          <RegisterForm
            onRegister={handleRegister}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
