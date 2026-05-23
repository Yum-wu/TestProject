import { useState, useRef } from "react";

/* ===== SearchBar 组件属性 ===== */
interface SearchBarProps {
  /** 搜索回调 */
  onSearch: (query: string) => void;
  /** 占位文字 */
  placeholder?: string;
  /** 默认值 */
  defaultValue?: string;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
  /** 额外类名 */
  className?: string;
}

/* ===== 搜索栏尺寸映射 ===== */
const searchBarSizes = {
  sm: "h-8 text-xs rounded-lg",
  md: "h-10 text-sm rounded-xl",
  lg: "h-12 text-base rounded-xl",
} as const;

/**
 * 搜索栏组件
 * 包含输入框、搜索按钮、清除按钮
 */
export default function SearchBar({
  onSearch,
  placeholder = "搜索...",
  defaultValue = "",
  autoFocus = false,
  size = "md",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 提交搜索 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  /* 清除搜索 */
  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
    >
      {/* 搜索图标 */}
      <div className="pointer-events-none absolute left-3 flex items-center">
        <svg
          className="h-4 w-4 text-neutral-400 dark:text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full pl-10 pr-20
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          text-neutral-900 dark:text-neutral-100
          placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          outline-none transition-all duration-200
          ${searchBarSizes[size]}
        `}
      />

      {/* 右侧操作区 */}
      <div className="absolute right-1.5 flex items-center gap-1">
        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="清除搜索"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* 搜索按钮 */}
        <button
          type="submit"
          className="flex h-7 items-center justify-center rounded-md bg-primary-500 px-3 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors"
          aria-label="搜索"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
