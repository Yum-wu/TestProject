import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types/message";

interface MessageItemProps {
  /** 单条聊天消息 */
  message: Message;
}

/** 代码块简易渲染（避免 react-syntax-highlighter 懒加载导致的 DOM 冲突） */
function SimpleCode({ language, code }: { language?: string; code: string }) {
  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-xs text-gray-400">
        <span>{language || "code"}</span>
      </div>
      <pre className="bg-gray-900 text-gray-300 p-4 text-sm overflow-x-auto m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
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

  /** 自定义 components：代码块用简易渲染，避免 react-syntax-highlighter DOM 冲突 */
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
          return <SimpleCode language={match[1]} code={codeString} />;
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
      // 用 div 包裹预格式化文本，避免片段节点导致的 removeChild 错误
      pre({ children }: { children?: React.ReactNode }) {
        return <div className="my-2">{children}</div>;
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
          <div className="prose prose-sm max-w-none break-words" translate="no">
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
