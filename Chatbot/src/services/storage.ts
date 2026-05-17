import type { Message } from "../types/message";

/** LocalStorage 存储键名 */
const STORAGE_KEY = "chat-messages";

/**
 * 从 LocalStorage 加载对话历史
 *
 * @returns 已保存的消息数组，解析失败时返回空数组
 */
export function loadMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 将对话历史保存到 LocalStorage
 *
 * @param messages - 需要保存的消息数组
 */
export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    console.error("保存对话历史失败");
  }
}

/** 清除 LocalStorage 中的对话历史 */
export function clearMessages(): void {
  localStorage.removeItem(STORAGE_KEY);
}
