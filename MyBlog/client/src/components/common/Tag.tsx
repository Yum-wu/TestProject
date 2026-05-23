import { memo } from "react";

/* ===== 标签颜色映射 ===== */
const tagColorMap = {
  default:
    "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
  primary:
    "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800",
  secondary:
    "bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800",
  accent:
    "bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-800",
  red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  purple:
    "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  pink: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
} as const;

/* ===== Tag 组件属性 ===== */
interface TagProps {
  /** 标签文字 */
  label: string;
  /** 标签颜色 */
  color?: keyof typeof tagColorMap;
  /** 是否可点击 */
  clickable?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否可删除 */
  removable?: boolean;
  /** 删除回调 */
  onRemove?: () => void;
  /** 尺寸 */
  size?: "sm" | "md";
  /** 额外类名 */
  className?: string;
}

/* ===== 标签尺寸映射 ===== */
const tagSizeMap = {
  sm: "px-2 py-0.5 text-2xs",
  md: "px-2.5 py-1 text-xs",
} as const;

/**
 * 标签组件
 * 支持可点击、不同颜色、可删除
 * 使用 React.memo 优化，标签在列表中大量使用时避免不必要的重渲染
 */
function Tag({
  label,
  color = "default",
  clickable = false,
  onClick,
  removable = false,
  onRemove,
  size = "md",
  className = "",
}: TagProps) {
  const Component = clickable ? "button" : "span";

  return (
    <Component
      type={clickable ? "button" : undefined}
      onClick={clickable ? onClick : undefined}
      className={`
        inline-flex items-center gap-1 font-medium border rounded-full
        transition-all duration-200 whitespace-nowrap
        ${tagColorMap[color]}
        ${tagSizeMap[size]}
        ${
          clickable
            ? "cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95"
            : ""
        }
        ${className}
      `}
    >
      {label}

      {/* 删除按钮 */}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`删除标签 ${label}`}
        >
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Component>
  );
}

/* 使用 React.memo 包装，标签在列表中大量使用时避免不必要的重渲染 */
export default memo(Tag);
