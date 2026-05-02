/**
 * API 请求封装层
 * 基于 fetch 的统一请求工具，所有后端接口调用都通过此模块发起
 * MVP 阶段使用固定的测试 Token 模拟认证
 */

/** API 基础路径，开发环境由 Vite proxy 转发到 localhost:3000 */
const BASE_URL = "/api";

/** MVP 阶段固定认证 Token，后续替换为真实登录流程 */
const TOKEN = "Bearer test-token-user-1";

/** 扩展请求选项，支持 AbortSignal */
interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
}

/**
 * 通用请求函数
 * @param url - API 路径（不含 BASE_URL）
 * @param options - 可选的 fetch 配置，支持 AbortSignal 用于取消请求
 * @returns Promise<T> 直接返回解析后的 data 字段
 * @throws 当后端返回 code !== 0 时抛出错误；请求被取消时抛出 AbortError
 */
async function request<T>(url: string, options?: RequestOptions): Promise<T> {
  const { signal, ...fetchOptions } = options || {};

  const res = await fetch(BASE_URL + url, {
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN,
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  const json = await res.json();

  // 后端统一返回 { code, message, data } 格式
  if (json.code !== 0) {
    throw new Error(json.message || "请求失败");
  }

  return json.data as T;
}

/** API 工具对象，封装 HTTP 动词方法，均支持可选的 AbortSignal */
export const api = {
  /** GET 请求 */
  get: <T>(url: string, signal?: AbortSignal) => request<T>(url, { signal }),

  /** POST 请求 */
  post: <T>(url: string, body: unknown, signal?: AbortSignal) =>
    request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    }),

  /** PATCH 请求（部分更新） */
  patch: <T>(url: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    }),

  /** PUT 请求（全量更新） */
  put: <T>(url: string, body: unknown, signal?: AbortSignal) =>
    request<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      signal,
    }),

  /** DELETE 请求 */
  delete: <T>(url: string, signal?: AbortSignal) =>
    request<T>(url, { method: "DELETE", signal }),
};
