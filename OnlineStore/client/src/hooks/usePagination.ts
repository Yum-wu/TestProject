import { useState, useCallback } from 'react';

/**
 * 通用分页 Hook
 * @param initialPage - 初始页码，默认 1
 * @param initialPageSize - 每页大小，默认 12
 */
export function usePagination(initialPage = 1, initialPageSize = 12) {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const goToPage = useCallback((p: number) => setPage(p), []);
  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  return { page, pageSize, goToPage, nextPage, prevPage, setPage };
}
