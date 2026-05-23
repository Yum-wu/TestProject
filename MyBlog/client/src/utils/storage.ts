const DARK_MODE_KEY = "myblog_dark_mode";

/**
 * 获取暗色模式设置
 */
export function getDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * 设置暗色模式
 */
export function setDarkMode(isDark: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(isDark));
}
