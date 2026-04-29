import { useEffect, useRef, useCallback } from "react";
import type { Message } from "../types/message";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  /** 消息列表 */
  messages: Message[];
  /** 是否正在等待 AI 回复 */
  isLoading: boolean;
}

/** 消息列表组件，支持智能自动滚动（用户上滚时不强制拉回） */
export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** 判断用户是否在底部 150px 以内 */
  const isAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    if (isAtBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg">开始和 AI 对话吧</p>
          <p className="text-sm mt-2">输入你的问题，AI 将为你解答</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isLoading &&
        messages[messages.length - 1]?.role === "assistant" &&
        !messages[messages.length - 1]?.content && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex space-x-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      <div ref={bottomRef} />
    </div>
  );
}
