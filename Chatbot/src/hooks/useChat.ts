import { useState, useCallback, useRef, useEffect } from "react";
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

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => saveMessages(messages), 300);
    return () => clearTimeout(timer);
  }, [messages]);

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
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.id === assistantId) {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
          }
          return updated;
        });
        break;
      }
      case "tool_start": {
        const info = event.content as { tool: string; args: unknown };
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.id === assistantId) {
            updated[updated.length - 1] = {
              ...last,
              content: last.content
                + `\n\n> 正在调用 ${info.tool}...`,
            };
          }
          return updated;
        });
        break;
      }
      case "tool_end": {
        const info = event.content as { tool: string; result: string };
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.id === assistantId) {
            const preview = info.result.length > 100
              ? info.result.slice(0, 100) + "..."
              : info.result;
            updated[updated.length - 1] = {
              ...last,
              content: last.content
                + `\n\n> ${info.tool} 完成: ${preview}`,
            };
          }
          return updated;
        });
        break;
      }
      case "error": {
        const err = event.content as { message: string };
        setError(err.message);
        break;
      }
    }
  }, []);

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
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChat({
      message: userMessage.content,
      sessionId: sessionIdRef.current,
      onEvent: (event) => handleEvent(event, assistantMessage.id),
      onError: (errMsg) => {
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

    setIsLoading(false);
    abortControllerRef.current = null;
    sendingRef.current = false;
  }, [handleEvent]);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    clearStorage();
    setIsLoading(false);
    setError(null);
    sendingRef.current = false;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
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
            content: last.content + "\n\n*[已停止生成]*",
          };
        }
      }
      return updated;
    });
  }, []);

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
