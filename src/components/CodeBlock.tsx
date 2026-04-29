import { lazy, Suspense } from "react";

/** 语法高亮组件（懒加载，避免首屏加载所有语言包） */
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter/dist/esm/prism").then((mod) => ({
    default: mod.default,
  })),
);

import { useState, useCallback } from "react";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  /** 代码语言标识，如 "typescript"、"python" */
  language: string;
  /** 代码文本内容 */
  code: string;
}

/** 代码块组件，提供语法高亮和一键复制功能 */
export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-xs text-gray-400">
        <span>{language || "代码"}</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? "✓ 已复制" : "复制"}
        </button>
      </div>
      <Suspense
        fallback={
          <pre className="bg-gray-900 text-gray-300 p-4 text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        }
      >
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.875rem" }}
        >
          {code}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
}
