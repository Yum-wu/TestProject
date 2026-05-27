import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types/message";

/** Lazy-loaded syntax highlighter wrapper — 760KB chunk only loaded when code block appears */
const Highlighter = lazy(() => import("./SyntaxHighlighterWrapper"));

interface MessageItemProps {
  message: Message;
}

/** Code block rendered with syntax highlighting (lazy loaded) */
function SimpleCode({ language, code }: { language?: string; code: string }) {
  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between bg-[#2d323b] px-4 py-1.5 text-xs text-gray-400">
        <span>{language || "code"}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          📋
        </button>
      </div>
      <Suspense
        fallback={
          <pre className="bg-[#1e1e1e] text-gray-300 p-4 text-sm overflow-x-auto m-0">
            <code>{code}</code>
          </pre>
        }
      >
        <Highlighter
          language={language || "text"}
          code={code}
          showLineNumbers={code.split("\n").length > 3}
        />
      </Suspense>
    </div>
  );
}

/** Single message bubble — user plain text, AI rendered markdown + copy */
export function MessageItem({ message }: MessageItemProps) {
  const { t } = useTranslation();
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

  const remarkPlugins = useMemo(() => [remarkGfm], []);
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
          <div className="prose prose-sm max-w-none prose-invert break-words">
            <ReactMarkdown remarkPlugins={remarkPlugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none break-words" translate="no">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              components={components}
            >
              {message.content}
            </ReactMarkdown>

            {/* RAG Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1.5">📚 参考来源</p>
                <div className="space-y-1">
                  {message.sources.map((src, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-blue-600 truncate">{src.title}</span>
                      {src.score !== undefined && (
                        <span className="text-gray-300 shrink-0">
                          {(src.score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intent badge */}
            {message.intent && message.intent !== "chat" && (
              <div className="mt-2">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {message.intent === "rag" ? "📚 知识问答" : message.intent === "mixed" ? "🔗 混合" : "🤖 工具"}
                </span>
              </div>
            )}
          </div>
        )}

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 right-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied ? t("chat.copied") : t("chat.copy")}
          </button>
        )}
      </div>
    </div>
  );
}
