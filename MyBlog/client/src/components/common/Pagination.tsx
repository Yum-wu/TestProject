import { memo, useState } from "react";

/* ===== Pagination 组件属性 ===== */
interface PaginationProps {
  /** 当前页码（从1开始） */
  current: number;
  /** 总页数 */
  total: number;
  /** 页码变化回调 */
  onChange: (page: number) => void;
  /** 每页显示条数 */
  pageSize?: number;
  /** 总条数 */
  totalItems?: number;
  /** 是否显示跳转 */
  showJumper?: boolean;
}

/**
 * 分页组件
 * 支持上一页/下一页、页码、跳转功能
 * 使用 React.memo 优化，避免父组件重渲染时不必要的更新
 */
function Pagination({
  current,
  total,
  onChange,
  pageSize,
  totalItems,
  showJumper = true,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  /* 计算显示的页码范围 */
  const getPageNumbers = (): (number | "...")[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];

    /* 始终显示第一页 */
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    /* 当前页附近的页码 */
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    /* 始终显示最后一页 */
    pages.push(total);

    return pages;
  };

  /* 处理跳转 */
  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (page >= 1 && page <= total && page !== current) {
      onChange(page);
    }
    setJumpValue("");
  };

  /* 无数据时不渲染 */
  if (total <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* 左侧信息 */}
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        {totalItems !== undefined && pageSize && (
          <span>
            共 <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalItems}</span> 条，
          </span>
        )}
        <span>
          第 <span className="font-medium text-neutral-700 dark:text-neutral-300">{current}</span> / {total} 页
        </span>
      </div>

      {/* 右侧分页控件 */}
      <div className="flex items-center gap-1.5">
        {/* 上一页 */}
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="上一页"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* 页码 */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-neutral-400 dark:text-neutral-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              className={`
                flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${
                  page === current
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        {/* 下一页 */}
        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current >= total}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="下一页"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* 跳转 */}
        {showJumper && total > 5 && (
          <div className="ml-2 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="hidden sm:inline">跳至</span>
            <input
              type="number"
              min={1}
              max={total}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJump()}
              className="h-9 w-14 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 text-center text-sm text-neutral-900 dark:text-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all"
            />
            <span className="hidden sm:inline">页</span>
            <button
              type="button"
              onClick={handleJump}
              className="h-9 px-2.5 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              确定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* 使用 React.memo 包装，分页状态不变时避免重渲染 */
export default memo(Pagination);
