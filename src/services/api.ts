import type { Message } from "../types/message";

/** 智谱 AI Chat Completions 接口地址 */
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

/** 使用的模型名称 */
const MODEL = "glm-4-flash";

/** 构建请求头，包含认证信息 */
function buildHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_ZHIPU_API_KEY}`,
  };
}

/** 将消息数组序列化为请求体 JSON */
function buildBody(messages: Pick<Message, "role" | "content">[]) {
  return JSON.stringify({
    model: MODEL,
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
  });
}

/**
 * 以流式方式调用智谱 AI Chat Completions API
 *
 * @param messages - 对话消息列表（仅含角色和内容）
 * @param onChunk - 收到流式文本片段时的回调
 * @param onError - 发生错误时的回调
 * @param signal - 可选的 AbortSignal，用于取消请求
 */
export async function streamChat(
  messages: Pick<Message, "role" | "content">[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: buildHeaders(),
      body: buildBody(messages),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError(errorData.error?.message || `请求失败 (${response.status})`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("无法读取响应流");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          continue;
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onError(
      err instanceof Error ? err.message : "网络请求异常，请检查网络连接",
    );
  }
}
