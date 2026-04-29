import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "../types/message";
import { streamChat } from "../services/api";
import {
  loadMessages,
  saveMessages,
  clearMessages as clearStorage,
} from "../services/storage";

/** 生成唯一消息 ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * 聊天逻辑 Hook，管理消息状态、流式请求和本地存储
 *
 * @returns 消息列表、加载状态、错误信息及操作方法
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 中断控制器引用，用于取消进行中的请求 */
  const abortControllerRef = useRef<AbortController | null>(null);
  /** 发送锁，防止并发请求 */
  const sendingRef = useRef(false);
  /** 消息列表引用，避免 sendMessage 依赖 messages 导致频繁重建 */
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /** 消息变化时防抖保存到 LocalStorage（300ms） */
  useEffect(() => {
    const timer = setTimeout(() => saveMessages(messages), 300);
    return () => clearTimeout(timer);
  }, [messages]);

  /** 发送消息并接收流式回复 */
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

    const conversationMessages = [...messagesRef.current, userMessage];
    const apiMessages = conversationMessages.map(({ role, content: c }) => ({
      role,
      content: c,
    }));

    setMessages([...conversationMessages, assistantMessage]);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChat(
      apiMessages,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunk,
            };
          }
          return updated;
        });
      },
      (errorMsg) => {
        setError(errorMsg);
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: `❌ ${errorMsg}`,
            };
          }
          return updated;
        });
      },
      abortController.signal,
    );

    setIsLoading(false);
    abortControllerRef.current = null;
    sendingRef.current = false;
  }, []);

  /** 清空所有对话记录和状态 */
  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    clearStorage();
    setIsLoading(false);
    setError(null);
    sendingRef.current = false;
  }, []);

  /** 清除错误提示 */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /** 停止当前生成，空消息移除，有内容则追加停止标记 */
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    sendingRef.current = false;

    setMessages((prev) => {
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        if (!lastMsg.content) {
          updated.pop();
        } else {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + "\n\n*[已停止生成]*",
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
