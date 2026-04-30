import axios, { type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types";
import { getToken, clearAuth } from "../utils/storage";
import { API_BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

/* ===== 创建 axios 实例 ===== */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== 请求重试配置 ===== */
const MAX_RETRY_COUNT = 1; // 最大重试次数
const RETRY_DELAY = 1000; // 重试延迟（毫秒）
const retryCountMap = new WeakMap<InternalAxiosRequestConfig, number>();

/* ===== 请求拦截器：自动添加 Token + AbortController ===== */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* 为每个请求自动创建 AbortController（如果未提供） */
    if (!config.signal) {
      const controller = new AbortController();
      config.signal = controller.signal;
      /* 将 controller 挂载到 config 上，方便外部取消 */
      (config as unknown as Record<string, unknown>)._abortController = controller;
    }

    /* 初始化重试计数 */
    if (retryCountMap.get(config) === undefined) {
      retryCountMap.set(config, 0);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ===== 响应拦截器：统一处理错误 + 请求重试 ===== */
api.interceptors.response.use(
  (response) => {
    /* 直接返回响应数据 */
    return response;
  },
  async (error) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;

    /* 判断是否需要重试（仅网络错误和 5xx 错误重试） */
    if (config && !error.config?.signal?.aborted) {
      const currentRetryCount = retryCountMap.get(config) || 0;
      const isNetworkError = !error.response;
      const isServerError = error.response?.status >= 500;
      const isRetryableMethod = ["get", "GET"].includes(config.method || "");

      if (
        currentRetryCount < MAX_RETRY_COUNT &&
        (isNetworkError || isServerError) &&
        isRetryableMethod
      ) {
        retryCountMap.set(config, currentRetryCount + 1);

        /* 延迟重试 */
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        /* 重新创建 AbortController（旧的可能已失效） */
        const controller = new AbortController();
        config.signal = controller.signal;
        (config as unknown as Record<string, unknown>)._abortController = controller;

        return api(config);
      }
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = (data as ApiResponse)?.message || "请求失败";

      switch (status) {
        case 401:
          /* Token 过期或无效，清除认证信息并跳转登录 */
          clearAuth();
          toast.error("登录已过期，请重新登录");
          /* 避免在登录页循环重定向 */
          if (!window.location.pathname.startsWith("/login")) {
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
          break;
        case 403:
          toast.error("没有操作权限");
          break;
        case 404:
          toast.error("请求的资源不存在");
          break;
        case 409:
          toast.error(message);
          break;
        case 422:
          toast.error(message);
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      /* 请求已发出但没有响应 */
      if (!axios.isCancel(error)) {
        toast.error("网络连接失败，请检查网络");
      }
    } else {
      if (!axios.isCancel(error)) {
        toast.error("请求发送失败");
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 创建可取消的请求
 * 返回请求 Promise 和取消函数
 *
 * @example
 * const { request, cancel } = createCancelableRequest(() => api.get('/api/posts'));
 * request.then(res => console.log(res));
 * // 需要取消时
 * cancel();
 */
export function createCancelableRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>
): {
  request: Promise<T>;
  cancel: () => void;
} {
  const controller = new AbortController();
  const request = requestFn(controller.signal);
  return {
    request,
    cancel: () => controller.abort(),
  };
}

export default api;
