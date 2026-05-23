/** 后端 API 地址（通过环境变量配置，默认本地开发） */
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api/chat/stream";

/** SSE 事件数据结构 */
export interface SSEEvent {
  type: "session" | "text" | "tool_start" | "tool_end" | "done" | "error";
  content: unknown;
}

/** 流式聊天参数 */
export interface StreamChatParams {
  message: string;
  sessionId: string | null;
  onEvent: (event: SSEEvent) => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

/**
 * 以 SSE 流式方式调用后端 Chat API
 */
export async function streamChat(params: StreamChatParams): Promise<void> {
  const { message, sessionId, onEvent, onError, signal } = params;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
      signal,
    });

    if (!response.ok) {
      onError(`请求失败 (${response.status})`);
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
        try {
          const event: SSEEvent = JSON.parse(data);
          onEvent(event);
        } catch {
          continue;
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onError(
      err instanceof Error ? err.message : "网络请求异常，请检查后端是否运行",
    );
  }
}
