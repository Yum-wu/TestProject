/**
 * Markdown 实时预览组件
 *
 * 功能：将 Markdown 内容渲染为 HTML，支持代码高亮和 GFM 扩展语法
 * 优化：
 * - 使用 useMemo 缓存 ReactMarkdown 组件配置，避免每次渲染都重新创建
 * - 使用 React.memo 避免内容未变更时不必要的重渲染
 * - 将正则表达式提升到模块级别，避免重复创建
 * - 将自定义渲染组件提取到模块级别，减少内联函数创建
 */
import { useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Trash2, FileText, FileCode } from "lucide-react";

/**
 * 预览组件属性
 * @interface PreviewProps
 * @property {string} content - Markdown 内容
 * @property {string} title - 笔记标题
 * @property {() => void} [onExportMd] - 导出 MD 文件的回调
 * @property {() => void} [onExportPdf] - 导出 PDF 的回调
 * @property {() => void} [onDelete] - 删除笔记的回调
 */
interface PreviewProps {
  content: string;
  title: string;
  onExportMd?: () => void;
  onExportPdf?: () => void;
  onDelete?: () => void;
}

/**
 * 语言匹配正则表达式（模块级别缓存，避免重复创建）
 * 用于从 className 中提取编程语言名称
 */
const LANGUAGE_REGEX = /language-(\w+)/;

/**
 * 语法高亮组件
 * 根据代码语言使用 Prism 进行高亮渲染
 */
function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const match = LANGUAGE_REGEX.exec(className || "");
  const language = match ? match[1] : null;
  const codeContent = String(children ?? "").replace(/\n$/, "");

  if (language) {
    const SyntaxHighlighterComponent =
      SyntaxHighlighter as React.ComponentType<any>;
    return (
      <div className="my-4 rounded-lg overflow-hidden">
        <SyntaxHighlighterComponent
          style={oneDark}
          language={language}
          PreTag="div"
          {...props}
        >
          {codeContent}
        </SyntaxHighlighterComponent>
      </div>
    );
  }

  return (
    <code
      className="bg-zinc-800 text-green-400 px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    >
      {codeContent}
    </code>
  );
}

import type { Components } from "react-markdown";

/**
 * ReactMarkdown 自定义组件配置（模块级别定义，配合 useMemo 使用）
 * 将 Markdown 元素映射到带有暗色主题样式的 React 组件
 */
const MARKDOWN_COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-green-500 font-bold text-2xl border-b border-zinc-800 pb-3 mt-0 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-green-400 font-bold text-xl mb-3 mt-6">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-green-300 font-bold text-lg mb-3 mt-5">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="text-zinc-300 space-y-1 mb-4 pl-6 list-disc">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="text-zinc-300 space-y-1 mb-4 pl-6 list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-zinc-300">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-green-400 font-semibold">{children}</strong>
  ),
  code: CodeBlock,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-green-500 pl-4 text-zinc-400 italic my-4">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-zinc-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-zinc-700 px-3 py-2 bg-zinc-800 text-green-400 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-zinc-700 px-3 py-2 text-zinc-300">
      {children}
    </td>
  ),
  hr: () => <hr className="border-zinc-700 my-6" />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-green-400 hover:text-green-300 underline"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
} as Components;

/**
 * 预览组件
 * 渲染 Markdown 内容为 HTML，支持代码高亮、表格、任务列表等 GFM 扩展
 */
export const Preview = memo(function Preview({
  content,
  title,
  onExportMd,
  onExportPdf,
  onDelete,
}: PreviewProps) {
  /**
   * 计算字数（按空白字符分割统计单词数）
   * 内容为空时返回 0
   */
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  /**
   * 缓存 ReactMarkdown 组件配置
   * 避免每次渲染都重新创建组件配置对象
   */
  const markdownComponents = useMemo(() => MARKDOWN_COMPONENTS, []);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="text-green-500 font-bold text-lg">
          {title || "无标题笔记"}
        </div>
        <div className="flex items-center gap-2">
          {/* 导出 MD 按钮 */}
          <button
            onClick={onExportMd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors"
            title="导出 Markdown 文件"
          >
            <FileText className="w-3.5 h-3.5" />
            导出 MD
          </button>
          {/* 导出 PDF 按钮 */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors"
            title="导出 PDF 文件"
          >
            <FileCode className="w-3.5 h-3.5" />
            导出 PDF
          </button>
          {/* 删除按钮 */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-600 rounded-lg text-xs text-zinc-300 transition-colors"
            title="删除笔记"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除
          </button>
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className="flex-1 overflow-auto p-6 bg-zinc-950">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="px-4 py-1.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span>字数：{wordCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-500">● 已渲染</span>
        </div>
      </div>
    </div>
  );
});
