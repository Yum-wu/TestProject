/**
 * Markdown 编辑器组件
 *
 * 功能：提供文本编辑区域，支持 Markdown 语法输入
 * 优化：使用 React.memo 避免内容未变更时不必要的重渲染
 * 特性：自动聚焦、实时统计行数和字符数、保存状态提示
 */
import { useEffect, useRef, useState, memo } from "react";

/**
 * 编辑器组件属性
 * @interface EditorProps
 * @property {string} content - 当前编辑内容
 * @property {(content: string) => void} onChange - 内容变更回调
 * @property {string} title - 笔记标题（显示在标题栏）
 * @property {"已保存" | "未保存"} savedStatus - 保存状态
 */
interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  savedStatus: "已保存" | "未保存";
}

/**
 * 编辑器组件
 * 提供全屏 textarea 编辑体验，包含顶部标题栏和底部状态栏
 */
export const Editor = memo(function Editor({
  content,
  onChange,
  title,
  savedStatus,
}: EditorProps) {
  /** textarea 元素的引用，用于自动聚焦 */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** 当前行数 */
  const [lineCount, setLineCount] = useState(0);
  /** 当前字符数 */
  const [charCount, setCharCount] = useState(0);

  /**
   * 组件挂载时自动聚焦到编辑区域
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /**
   * 内容变更时更新行数和字符数统计
   * 监听 content 变化，实时计算统计信息
   */
  useEffect(() => {
    const lines = content.split("\n").length;
    const chars = content.length;
    setLineCount(lines);
    setCharCount(chars);
  }, [content]);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="text-zinc-400 text-sm font-mono">
          {title || "无标题"}
        </div>
        <div className="text-xs text-zinc-500">Markdown</div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="在这里输入 Markdown 内容..."
          className="w-full h-full p-4 bg-zinc-950 text-zinc-200 resize-none outline-none font-mono text-sm leading-relaxed placeholder-zinc-600"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="px-4 py-1.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        {/* 左侧：编辑统计信息 */}
        <div className="flex items-center gap-3">
          <span>行 {lineCount}</span>
          <span>列 {charCount}</span>
          <span>UTF-8</span>
        </div>
        {/* 右侧：保存状态 */}
        <div className="flex items-center gap-3">
          <span>Markdown</span>
          <span
            className={
              savedStatus === "已保存" ? "text-green-500" : "text-yellow-500"
            }
          >
            {savedStatus === "已保存" ? "● 已保存" : "● 未保存"}
          </span>
        </div>
      </div>
    </div>
  );
});
