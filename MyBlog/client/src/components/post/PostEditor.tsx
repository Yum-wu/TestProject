import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "../common/Button";

/* ===== 工具栏按钮配置 ===== */
interface ToolbarAction {
  label: string;
  icon: string;
  action: () => void;
  active?: boolean;
}

/* ===== PostEditor 组件属性 ===== */
interface PostEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (data: {
    title: string;
    content: string;
    status: "draft" | "published";
  }) => void;
  saving?: boolean;
  isEdit?: boolean;
}

/**
 * Markdown 编辑器组件
 * 支持编辑/预览切换、工具栏
 */
export default function PostEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  saving = false,
  isEdit = false,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* 在光标位置插入文本 */
  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newContent =
      content.substring(0, start) +
      before +
      (selectedText || "文本") +
      after +
      content.substring(end);

    setContent(newContent);

    /* 恢复光标位置 */
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos =
        start + before.length + (selectedText || "文本").length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  /* 工具栏操作 */
  const toolbarActions: ToolbarAction[] = [
    {
      label: "加粗",
      icon: "bold",
      action: () => insertAtCursor("**", "**"),
    },
    {
      label: "斜体",
      icon: "italic",
      action: () => insertAtCursor("*", "*"),
    },
    {
      label: "删除线",
      icon: "strikethrough",
      action: () => insertAtCursor("~~", "~~"),
    },
    {
      label: "标题",
      icon: "heading",
      action: () => insertAtCursor("## "),
    },
    {
      label: "链接",
      icon: "link",
      action: () => insertAtCursor("[", "](url)"),
    },
    {
      label: "图片",
      icon: "image",
      action: () => insertAtCursor("![alt](", ")"),
    },
    {
      label: "代码",
      icon: "code",
      action: () => insertAtCursor("`", "`"),
    },
    {
      label: "代码块",
      icon: "codeblock",
      action: () => insertAtCursor("\n```javascript\n", "\n```\n"),
    },
    {
      label: "引用",
      icon: "quote",
      action: () => insertAtCursor("> "),
    },
    {
      label: "列表",
      icon: "list",
      action: () => insertAtCursor("- "),
    },
    {
      label: "有序列表",
      icon: "ordered-list",
      action: () => insertAtCursor("1. "),
    },
    {
      label: "分割线",
      icon: "divider",
      action: () => insertAtCursor("\n---\n"),
    },
  ];

  /* 渲染工具栏图标 */
  const renderToolbarIcon = (icon: string) => {
    switch (icon) {
      case "bold":
        return <span className="font-bold text-sm">B</span>;
      case "italic":
        return <span className="italic text-sm">I</span>;
      case "strikethrough":
        return <span className="line-through text-sm">S</span>;
      case "heading":
        return <span className="font-bold text-sm">H</span>;
      case "link":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.342"
            />
          </svg>
        );
      case "image":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        );
      case "code":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            />
          </svg>
        );
      case "codeblock":
        return <span className="font-mono text-xs">{"{ }"}</span>;
      case "quote":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        );
      case "list":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        );
      case "ordered-list":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        );
      case "divider":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  /* 估算字数和阅读时间 */
  const wordCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 500));

  return (
    <div className="space-y-4">
      {/* ===== 标题输入 ===== */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入文章标题..."
        className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-neutral-100 py-2"
      />

      {/* ===== 工具栏 ===== */}
      <div className="flex items-center justify-between gap-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 px-3 py-2">
        {/* 格式化按钮 */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.action}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              title={action.label}
            >
              {renderToolbarIcon(action.icon)}
            </button>
          ))}
        </div>

        {/* 编辑/预览切换 */}
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "edit"
                ? "bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "preview"
                ? "bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* ===== 编辑/预览区域 ===== */}
      <div className="min-h-[500px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {mode === "edit" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作..."
            className="w-full h-full min-h-[500px] p-5 bg-transparent border-none outline-none resize-none font-mono text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 leading-relaxed"
          />
        ) : (
          <div className="p-5 markdown-body">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-neutral-400 dark:text-neutral-500 text-center py-20">
                暂无内容可预览
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== 底部状态栏 ===== */}
      <div className="flex items-center justify-between">
        {/* 字数统计 */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
          <span>{wordCount} 字</span>
          <span>约 {readingTime} 分钟阅读</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSave({ title, content, status: "draft" })}
          >
            存草稿
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={() => onSave({ title, content, status: "published" })}
            disabled={!title.trim() || !content.trim()}
          >
            {isEdit ? "更新文章" : "发布文章"}
          </Button>
        </div>
      </div>
    </div>
  );
}
