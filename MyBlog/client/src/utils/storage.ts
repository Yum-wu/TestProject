import type { User } from "../types";

/* ===== localStorage 键名常量 ===== */
const TOKEN_KEY = "myblog_token";
const USER_KEY = "myblog_user";
const DARK_MODE_KEY = "myblog_dark_mode";

/**
 * 获取 Token
 * @returns Token 字符串或 null
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 Token
 * @param token - JWT Token 字符串
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 获取用户信息
 * @returns 用户对象或 null
 */
export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * 设置用户信息
 * @param user - 用户对象
 */
export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 移除用户信息
 */
export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * 清除所有认证信息（Token + 用户信息）
 */
export function clearAuth(): void {
  removeToken();
  removeUser();
}

/**
 * 获取暗色模式设置
 * @returns 是否暗色模式
 */
export function getDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) return stored === "true";
  /* 默认跟随系统偏好 */
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * 设置暗色模式
 * @param isDark - 是否暗色模式
 */
export function setDarkMode(isDark: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(isDark));
}
