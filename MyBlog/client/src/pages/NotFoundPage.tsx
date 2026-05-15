import { Link } from "react-router-dom";

/**
 * 404 页面
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* 404 大字 */}
      <h1 className="text-8xl sm:text-9xl font-bold text-gradient">404</h1>

      {/* 提示文字 */}
      <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        页面不存在
      </h2>
      <p className="mt-2 max-w-md text-neutral-500 dark:text-neutral-400 leading-relaxed">
        抱歉，你访问的页面不存在或已被移除。
      </p>

      {/* 操作按钮 */}
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-glow transition-all duration-200"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
