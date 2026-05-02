/**
 * 分页器组件
 * 提供上一页、页码指示、下一页操作
 */
interface PaginationProps {
  /** 当前页码 */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 切换页码回调 */
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="flex-center"
      style={{ gap: 'var(--space-base)', marginTop: 'var(--space-xl)' }}
    >
      <button
        className="btn btn-outline btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>

      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
        第 {page} / {totalPages} 页
      </span>

      <button
        className="btn btn-outline btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </button>
    </div>
  );
}
