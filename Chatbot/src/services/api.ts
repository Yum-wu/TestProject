/** 后端 API 地址（通过环境变量配置，默认本地开发） */
const API_URL = (import.meta.env.VITE_API_URL as string) || "/api/chat/stream";

/** 增强 API 地址（含 RAG 意图路由） */
const ENHANCED_API_URL = (import.meta.env.VITE_ENHANCED_API_URL as string) || "/api/chat/enhanced/stream";

/** SSE 事件数据结构 */
export interface SSEEvent {
  type: "session" | "text" | "tool_start" | "tool_end" | "sources" | "intent" | "route" | "done" | "error";
  content: unknown;
  sources?: Array<{ title: string; slug: string; score?: number }>;
}

/** 流式聊天参数 */
export interface StreamChatParams {
  message: string;
  sessionId: string | null;
  onEvent: (event: SSEEvent) => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

const BACKPRESSURE_HIGH_WATER = 50; // 未处理事件超过此数则暂停读取

/**
 * 以 SSE 流式方式调用后端 Chat API，带背压控制
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
    let pendingEvents = 0;

    while (true) {
      // 背压：如果 React 处理速度跟不上，暂停读取
      if (pendingEvents > BACKPRESSURE_HIGH_WATER) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        continue;
      }

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
          pendingEvents++;
          onEvent(event);
          // Defer decrement to next macrotask so pendingEvents reflects
          // events dispatched but not yet rendered by React
          setTimeout(() => pendingEvents--, 0);
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

/**
 * 以 SSE 流式方式调用增强 Chat API（含 RAG 意图路由）
 */
export async function streamEnhancedChat(params: StreamChatParams): Promise<void> {
  const { message, sessionId, onEvent, onError, signal } = params;

  try {
    const response = await fetch(ENHANCED_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
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
    onError(err instanceof Error ? err.message : "网络请求异常");
  }
}
