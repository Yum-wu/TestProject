/* ===== Spinner 组件属性 ===== */
interface SpinnerProps {
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
  /** 颜色 */
  color?: string;
}

/* ===== Spinner 尺寸映射 ===== */
const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

/**
 * 旋转加载指示器
 */
export function Spinner({ size = "md", color }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]}`}
      style={color ? { color } : undefined}
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
  );
}

/* ===== 全屏加载组件属性 ===== */
interface FullScreenLoadingProps {
  /** 提示文字 */
  text?: string;
}

/**
 * 全屏加载组件
 */
export function FullScreenLoading({ text = "加载中..." }: FullScreenLoadingProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        {text}
      </p>
    </div>
  );
}

/* ===== 页面加载组件属性 ===== */
interface PageLoadingProps {
  /** 提示文字 */
  text?: string;
}

/**
 * 页面区域加载组件
 */
export function PageLoading({ text }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size="md" />
      {text && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {text}
        </p>
      )}
    </div>
  );
}

/* ===== Skeleton 骨架屏组件属性 ===== */
interface SkeletonProps {
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
  /** 圆角 */
  rounded?: "sm" | "md" | "lg" | "full";
  /** 额外类名 */
  className?: string;
}

/* ===== 骨架屏圆角映射 ===== */
const skeletonRounded = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
} as const;

/**
 * 骨架屏占位组件
 */
export function Skeleton({
  width,
  height = "1em",
  rounded = "md",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${skeletonRounded[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/* ===== 文章卡片骨架屏属性 ===== */
interface PostCardSkeletonProps {
  /** 显示数量 */
  count?: number;
}

/**
 * 文章卡片骨架屏
 */
export function PostCardSkeleton({ count = 1 }: PostCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          {/* 封面图占位 */}
          <Skeleton height="180px" rounded="sm" />
          <div className="p-5 space-y-3">
            {/* 标题占位 */}
            <Skeleton height="20px" width="75%" />
            {/* 摘要占位 */}
            <Skeleton height="14px" width="100%" />
            <Skeleton height="14px" width="60%" />
            {/* 底部信息占位 */}
            <div className="flex items-center gap-3 pt-2">
              <Skeleton height="24px" width="60px" rounded="full" />
              <Skeleton height="24px" width="48px" rounded="full" />
              <Skeleton height="14px" width="80px" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
