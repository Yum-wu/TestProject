import { forwardRef } from "react";

/* ===== 输入框尺寸样式映射 ===== */
const sizeStyles = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-3.5 text-sm rounded-lg",
  lg: "h-12 px-4 text-base rounded-xl",
} as const;

/* ===== 输入框组件属性 ===== */
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 输入框尺寸 */
  size?: keyof typeof sizeStyles;
  /** 标签文字 */
  label?: string;
  /** 错误提示 */
  error?: string;
  /** 提示文字 */
  hint?: string;
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
}

/**
 * 通用输入框组件
 * 支持标签、错误提示、图标前缀、多种尺寸
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      label,
      error,
      hint,
      icon,
      rightIcon,
      disabled,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    /* 生成唯一 ID */
    const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase() || Math.random().toString(36).slice(2)}`;

    return (
      <div className={`w-full ${className}`}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {icon}
            </span>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full bg-white dark:bg-neutral-800
              border transition-all duration-200
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? "border-red-300 dark:border-red-600 text-red-900 dark:text-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-300 dark:hover:border-neutral-600"
              }
              ${icon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${sizeStyles[size]}
            `}
            {...props}
          />

          {/* 右侧图标 */}
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {rightIcon}
            </span>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* 提示文字 */}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
