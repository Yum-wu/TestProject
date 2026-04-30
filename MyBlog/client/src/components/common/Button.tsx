import { forwardRef } from "react";

/* ===== 按钮变体样式映射 ===== */
const variantStyles = {
  primary:
    "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm hover:from-primary-600 hover:to-primary-700 hover:shadow-glow focus-visible:ring-primary-500/40 active:from-primary-700 active:to-primary-800",
  secondary:
    "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-visible:ring-neutral-500/40 active:bg-neutral-300 dark:active:bg-neutral-600",
  danger:
    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500/40 active:from-red-700 active:to-red-800",
  ghost:
    "bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-500/40 active:bg-neutral-200 dark:active:bg-neutral-700",
} as const;

/* ===== 按钮尺寸样式映射 ===== */
const sizeStyles = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2.5",
} as const;

/* ===== 按钮组件属性 ===== */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: keyof typeof variantStyles;
  /** 按钮尺寸 */
  size?: keyof typeof sizeStyles;
  /** 是否加载中 */
  loading?: boolean;
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 是否占满宽度 */
  fullWidth?: boolean;
}

/**
 * 通用按钮组件
 * 支持 primary/secondary/danger/ghost 变体，sm/md/lg 尺寸，loading 状态
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    /* 加载状态时禁用按钮 */
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {/* 加载动画 */}
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 左侧图标 */}
        {!loading && icon && <span className="shrink-0">{icon}</span>}

        {/* 按钮文字 */}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
