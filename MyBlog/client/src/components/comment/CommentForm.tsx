import { useState } from "react";
import Button from "../common/Button";

/* ===== CommentForm 组件属性 ===== */
interface CommentFormProps {
  /** 提交回调 */
  onSubmit: (content: string) => void;
  /** 用户头像 URL */
  avatarUrl?: string;
  /** 用户名 */
  username?: string;
  /** 占位文字 */
  placeholder?: string;
  /** 是否提交中 */
  submitting?: boolean;
}

/**
 * 评论表单组件
 * 包含头像、输入框、提交按钮
 */
export default function CommentForm({
  onSubmit,
  avatarUrl,
  username,
  placeholder = "写下你的评论...",
  submitting = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);

  /* 提交评论 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  /* 按下 Ctrl+Enter 提交 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (content.trim()) {
        onSubmit(content.trim());
        setContent("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* 用户头像 */}
      <div className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username || "用户头像"}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-medium text-white">
            {username?.charAt(0)?.toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* 输入区域 */}
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={focused || content ? 3 : 1}
          className={`
            w-full resize-none rounded-xl border bg-white dark:bg-neutral-800
            px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            outline-none transition-all duration-200
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            ${
              focused || content
                ? "border-primary-300 dark:border-primary-700"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
            }
          `}
        />

        {/* 底部操作栏 */}
        {(focused || content) && (
          <div className="mt-2 flex items-center justify-between animate-slideDown">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Ctrl + Enter 发送
            </span>
            <Button
              type="submit"
              size="sm"
              loading={submitting}
              disabled={!content.trim()}
            >
              发表评论
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
