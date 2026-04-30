import { useState, useCallback, useRef } from "react";

/* ===== 缓存项类型 ===== */
interface CacheItem<T> {
  /** 缓存数据 */
  data: T;
  /** 过期时间戳（毫秒） */
  expireAt: number;
}

/* ===== 内存缓存存储 ===== */
const memoryCache = new Map<string, CacheItem<unknown>>();

/**
 * 清理过期缓存
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (now >= item.expireAt) {
      memoryCache.delete(key);
    }
  }
}

/* ===== useCache Hook 配置 ===== */
interface UseCacheOptions {
  /** 缓存过期时间（毫秒），默认 5 分钟 */
  ttl?: number;
}

/* ===== useCache Hook 返回值类型 ===== */
interface UseCacheReturn<T> {
  /** 缓存数据 */
  data: T | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 获取数据（优先从缓存读取，缓存未命中则调用 fetcher） */
  fetch: (key: string, fetcher: () => Promise<T>) => Promise<T | null>;
  /** 手动设置缓存 */
  set: (key: string, data: T, ttl?: number) => void;
  /** 使指定缓存失效 */
  invalidate: (key: string) => void;
  /** 使所有缓存失效 */
  invalidateAll: () => void;
}

/**
 * 前端内存缓存 Hook
 * - 内存缓存 + TTL 过期机制
 * - 用于缓存分类、标签等不常变化的数据
 * - 避免重复请求相同数据
 *
 * @param options 缓存配置
 * @returns 缓存操作方法
 */
export function useCache<T = unknown>(options?: UseCacheOptions): UseCacheReturn<T> {
  const defaultTtl = options?.ttl ?? 5 * 60 * 1000; // 默认 5 分钟
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  /* 使用 ref 跟踪进行中的请求，避免重复请求 */
  const pendingRequests = useRef<Map<string, Promise<T | null>>>(new Map());

  /* 获取数据（优先从缓存读取） */
  const fetch = useCallback(
    async (key: string, fetcher: () => Promise<T>): Promise<T | null> => {
      /* 清理过期缓存 */
      cleanExpiredCache();

      /* 检查缓存是否命中 */
      const cached = memoryCache.get(key) as CacheItem<T> | undefined;
      if (cached && Date.now() < cached.expireAt) {
        setData(cached.data);
        return cached.data;
      }

      /* 检查是否有进行中的相同请求 */
      const pending = pendingRequests.current.get(key);
      if (pending) {
        return pending;
      }

      /* 发起新请求 */
      setLoading(true);
      const request = fetcher()
        .then((result) => {
          /* 写入缓存 */
          memoryCache.set(key, {
            data: result,
            expireAt: Date.now() + defaultTtl,
          });
          setData(result);
          return result;
        })
        .catch(() => {
          return null;
        })
        .finally(() => {
          setLoading(false);
          pendingRequests.current.delete(key);
        });

      pendingRequests.current.set(key, request);
      return request;
    },
    [defaultTtl]
  );

  /* 手动设置缓存 */
  const set = useCallback(
    (key: string, newData: T, ttl?: number) => {
      const expireTtl = ttl ?? defaultTtl;
      memoryCache.set(key, {
        data: newData,
        expireAt: Date.now() + expireTtl,
      });
      setData(newData);
    },
    [defaultTtl]
  );

  /* 使指定缓存失效 */
  const invalidate = useCallback((key: string) => {
    memoryCache.delete(key);
    if (data !== null) {
      setData(null);
    }
  }, [data]);

  /* 使所有缓存失效 */
  const invalidateAll = useCallback(() => {
    memoryCache.clear();
    setData(null);
  }, []);

  return {
    data,
    loading,
    fetch,
    set,
    invalidate,
    invalidateAll,
  };
}

/**
 * 直接操作缓存的工具方法（不依赖 Hook，可在组件外使用）
 */
export const cacheUtils = {
  /** 获取缓存 */
  get<T>(key: string): T | null {
    cleanExpiredCache();
    const cached = memoryCache.get(key) as CacheItem<T> | undefined;
    if (cached && Date.now() < cached.expireAt) {
      return cached.data;
    }
    return null;
  },

  /** 设置缓存 */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    memoryCache.set(key, {
      data,
      expireAt: Date.now() + ttl,
    });
  },

  /** 使指定缓存失效 */
  invalidate(key: string): void {
    memoryCache.delete(key);
  },

  /** 使所有缓存失效 */
  invalidateAll(): void {
    memoryCache.clear();
  },
};

export default useCache;
