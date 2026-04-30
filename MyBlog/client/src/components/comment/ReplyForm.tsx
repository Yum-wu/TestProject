import { useState } from "react";
import Button from "../common/Button";

/* ===== ReplyForm 组件属性 ===== */
interface ReplyFormProps {
  /** 提交回调 */
  onSubmit: (content: string) => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 占位文字 */
  placeholder?: string;
  /** 是否提交中 */
  submitting?: boolean;
}

/**
 * 回复表单组件
 * 嵌套在评论项中的简短回复输入框
 */
export default function ReplyForm({
  onSubmit,
  onCancel,
  placeholder = "写下你的回复...",
  submitting = false,
}: ReplyFormProps) {
  const [content, setContent] = useState("");

  /* 提交回复 */
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
    /* ESC 取消 */
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* 输入框 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        autoFocus
        className="w-full resize-none rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
      />

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Ctrl+Enter 发送 / ESC 取消
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={submitting}
            disabled={!content.trim()}
          >
            回复
          </Button>
        </div>
      </div>
    </form>
  );
}
