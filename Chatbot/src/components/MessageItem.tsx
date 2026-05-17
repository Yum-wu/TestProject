import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types/message";
import { CodeBlock } from "./CodeBlock";

interface MessageItemProps {
  /** 单条聊天消息 */
  message: Message;
}

/** 消息项组件，用户消息纯文本显示，AI 消息支持 Markdown 渲染和复制 */
export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  /** 缓存 remarkPlugins 避免每次渲染创建新数组 */
  const remarkPlugins = useMemo(() => [remarkGfm], []);

  /** 缓存自定义 components 避免每次渲染重建 */
  const components = useMemo(
    () => ({
      code({
        className,
        children,
        ...props
      }: React.ClassAttributes<HTMLElement> &
        React.HTMLAttributes<HTMLElement> & {
          className?: string;
          children?: React.ReactNode;
        }) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        if (match) {
          return <CodeBlock language={match[1]} code={codeString} />;
        }

        return (
          <code
            className={`px-1.5 py-0.5 rounded text-sm font-mono ${
              isUser ? "bg-blue-600 text-blue-100" : "bg-gray-100 text-gray-800"
            }`}
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    [isUser],
  );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-800 shadow-sm border border-gray-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 right-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied ? "✓ 已复制" : "复制"}
          </button>
        )}
      </div>
    </div>
  );
}
