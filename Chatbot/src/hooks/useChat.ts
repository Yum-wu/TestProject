import { useState, useCallback, useRef, useEffect } from "react";
import i18n from "i18next";
import type { Message } from "../types/message";
import { streamChat, type SSEEvent } from "../services/api";
import {
  loadMessages,
  saveMessages,
  clearMessages as clearStorage,
} from "../services/storage";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const SESSION_KEY = "chatbot_session_id";

/** SSE 文本块累积刷新间隔（ms） */
const FLUSH_INTERVAL = 60;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(
    localStorage.getItem(SESSION_KEY),
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const messagesRef = useRef(messages);

  /** 文本累积缓冲 — 减少 setMessages 频率 */
  const textBufferRef = useRef<string>("");
  const assistantIdRef = useRef<string>("");
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      const buf = textBufferRef.current;
      if (!buf) return;
      textBufferRef.current = "";
      const aid = assistantIdRef.current;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && last.id === aid) {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + buf,
          };
        }
        return updated;
      });
    }, FLUSH_INTERVAL);
  }, []);

  const flushNow = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    const buf = textBufferRef.current;
    if (!buf) return;
    textBufferRef.current = "";
    const aid = assistantIdRef.current;
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant" && last.id === aid) {
        updated[updated.length - 1] = {
          ...last,
          content: last.content + buf,
        };
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 仅在消息稳定后（非加载中）保存到 LocalStorage
  const prevLoadingRef = useRef(isLoading);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;
    if (wasLoading && !isLoading) {
      // 流结束：保存一次
      saveMessages(messages);
    }
  }, [isLoading, messages]);

  const handleEvent = useCallback((
    event: SSEEvent,
    assistantId: string,
  ) => {
    switch (event.type) {
      case "session": {
        const sid = (event.content as { session_id: string }).session_id;
        sessionIdRef.current = sid;
        localStorage.setItem(SESSION_KEY, sid);
        break;
      }
      case "text": {
        const chunk = event.content as string;
        textBufferRef.current += chunk;
        scheduleFlush();
        break;
      }
      case "tool_start":
      case "tool_end": {
        flushNow();
        const info = event.content as Record<string, unknown>;
        const toolName = String(info.tool ?? "");
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.id === assistantId) {
            let suffix = "";
            if (event.type === "tool_start") {
              suffix = `\n\n> ${i18n.t("chat.calling")} ${toolName}...`;
            } else {
              const result = String(info.result ?? "");
              const preview = result.length > 100
                ? result.slice(0, 100) + "..."
                : result;
              suffix = `\n\n> ${toolName} ${i18n.t("chat.completed")}: ${preview}`;
            }
            updated[updated.length - 1] = {
              ...last,
              content: last.content + suffix,
            };
          }
          return updated;
        });
        break;
      }
      case "error": {
        flushNow();
        const err = event.content as { message: string };
        setError(err.message);
        break;
      }
    }
  }, [scheduleFlush, flushNow]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sendingRef.current) return;

    sendingRef.current = true;
    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    assistantIdRef.current = assistantMessage.id;
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChat({
      message: userMessage.content,
      sessionId: sessionIdRef.current,
      onEvent: (event) => handleEvent(event, assistantMessage.id),
      onError: (errMsg) => {
        flushNow();
        setError(errMsg);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: `Error: ${errMsg}`,
            };
          }
          return updated;
        });
      },
      signal: abortController.signal,
    });

    flushNow();
    setIsLoading(false);
    abortControllerRef.current = null;
    sendingRef.current = false;
  }, [handleEvent, flushNow]);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    flushNow();
    setMessages([]);
    clearStorage();
    setIsLoading(false);
    setError(null);
    sendingRef.current = false;
  }, [flushNow]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    flushNow();
    setIsLoading(false);
    sendingRef.current = false;

    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        if (!last.content) {
          updated.pop();
        } else {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + `\n\n*[${i18n.t("chat.stopped")}]*`,
          };
        }
      }
      return updated;
    });
  }, [flushNow]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    clearError,
  };
}
