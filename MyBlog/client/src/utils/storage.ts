/* ===== localStorage 键名常量 ===== */
const DARK_MODE_KEY = "myblog_dark_mode";

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
