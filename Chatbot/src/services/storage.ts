import type { Message } from "../types/message";

/** LocalStorage 存储键名 */
const STORAGE_KEY = "chat-messages";

/**
 * 从 LocalStorage 加载对话历史
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
 * 增量保存最后一条消息到 LocalStorage（避免全量序列化）
 */
export function saveMessages(messages: Message[]): void {
  try {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    // 尝试从现有数据追加最后一条
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const existing: Message[] = JSON.parse(raw);
        // 如果最后一条 id 已存在 → 替换（覆盖更新），否则追加
        const idx = existing.findIndex((m) => m.id === lastMsg.id);
        if (idx >= 0) {
          existing[idx] = lastMsg;
          // 清理旧版本去重
          const clean = existing.filter((m, i) =>
            i === idx || !existing.slice(i + 1).some((n) => n.id === m.id)
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean.length === 0 ? messages : clean));
        } else {
          existing.push(lastMsg);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        }
        return;
      } catch {
        // fall through to full save
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    console.error("保存对话历史失败");
  }
}

/** 清除 LocalStorage 中的对话历史 */
export function clearMessages(): void {
  localStorage.removeItem(STORAGE_KEY);
}
