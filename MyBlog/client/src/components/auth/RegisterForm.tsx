import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import Input from "../common/Input";

/* ===== RegisterForm 组件属性 ===== */
interface RegisterFormProps {
  /** 注册回调 */
  onRegister: (data: {
    username: string;
    email: string;
    password: string;
  }) => void;
  /** 是否加载中 */
  loading?: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 注册表单组件
 * 包含用户名/邮箱/密码/确认密码输入
 */
export default function RegisterForm({
  onRegister,
  loading = false,
  error,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* 表单验证错误 */
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  /* 验证用户名 */
  const validateUsername = (value: string) => {
    if (!value.trim()) return "请输入用户名";
    if (value.length < 2) return "用户名至少2个字符";
    if (value.length > 20) return "用户名不超过20个字符";
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value))
      return "用户名只能包含字母、数字、下划线和中文";
    return undefined;
  };

  /* 验证邮箱 */
  const validateEmail = (value: string) => {
    if (!value.trim()) return "请输入邮箱地址";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "邮箱格式不正确";
    return undefined;
  };

  /* 验证密码 */
  const validatePassword = (value: string) => {
    if (!value) return "请输入密码";
    if (value.length < 8) return "密码至少8个字符";
    if (!/(?=.*[a-z])/.test(value)) return "密码需包含小写字母";
    if (!/(?=.*[A-Z])/.test(value)) return "密码需包含大写字母";
    if (!/(?=.*\d)/.test(value)) return "密码需包含数字";
    return undefined;
  };

  /* 验证确认密码 */
  const validateConfirmPassword = (value: string) => {
    if (!value) return "请确认密码";
    if (value !== password) return "两次密码输入不一致";
    return undefined;
  };

  /* 密码强度计算 */
  const getPasswordStrength = (value: string): number => {
    if (!value) return 0;
    let strength = 0;
    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(password);

  const strengthLabels = ["", "弱", "一般", "强", "很强"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-accent-500",
    "bg-secondary-500",
    "bg-secondary-500",
  ];

  /* 提交表单 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (!usernameError && !emailError && !passwordError && !confirmPasswordError && agreeTerms) {
      onRegister({ username, email, password });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          创建账户
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          注册后即可开始写作和分享
        </p>
      </div>

      {/* 全局错误提示 */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-slideDown">
          {error}
        </div>
      )}

      {/* 注册表单 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 用户名 */}
        <Input
          label="用户名"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username)
              setErrors((prev) => ({ ...prev, username: undefined }));
          }}
          placeholder="输入用户名"
          error={errors.username}
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        />

        {/* 邮箱 */}
        <Input
          label="邮箱地址"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email)
              setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="your@email.com"
          error={errors.email}
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          }
        />

        {/* 密码 */}
        <div>
          <Input
            label="密码"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="至少8个字符"
            error={errors.password}
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            }
          />
          {/* 密码强度指示器 */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength
                        ? strengthColors[passwordStrength]
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-2xs text-neutral-500 dark:text-neutral-400">
                密码强度：{strengthLabels[passwordStrength]}
              </p>
            </div>
          )}
        </div>

        {/* 确认密码 */}
        <Input
          label="确认密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="再次输入密码"
          error={errors.confirmPassword}
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
        />

        {/* 同意条款 */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-500 focus:ring-primary-500/20"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            我已阅读并同意{" "}
            <Link
              to="/terms"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              服务条款
            </Link>{" "}
            和{" "}
            <Link
              to="/privacy"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              隐私政策
            </Link>
          </span>
        </label>

        {/* 注册按钮 */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
          disabled={!agreeTerms}
        >
          创建账户
        </Button>
      </form>

      {/* 登录链接 */}
      <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        已有账户？{" "}
        <Link
          to="/login"
          className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          立即登录
        </Link>
      </p>
    </div>
  );
}
