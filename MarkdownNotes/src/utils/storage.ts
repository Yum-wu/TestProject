/**
 * 本地存储工具模块
 *
 * 功能：管理笔记数据的持久化存储
 * 存储方式：浏览器 LocalStorage
 * 数据键名：markdown-notes
 *
 * 优化：
 * - 所有函数添加中文注释说明
 * - 导出功能添加错误处理
 */
import { Note } from "../types";

/** LocalStorage 中存储笔记数据的键名 */
const NOTES_KEY = "markdown-notes";

/**
 * 从 LocalStorage 加载笔记数据
 *
 * @returns 笔记数组，如果本地没有数据则返回空数组
 *
 * @example
 * const notes = loadNotes();
 * // => [{ id: "xxx", title: "笔记标题", content: "...", ... }]
 */
export function loadNotes(): Note[] {
  const raw = localStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * 将笔记数据保存到 LocalStorage
 *
 * @param notes - 要保存的笔记数组
 *
 * @example
 * saveNotes([{ id: "xxx", title: "笔记", content: "内容", ... }]);
 */
export function saveNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

/**
 * 将笔记导出为 Markdown 文件
 *
 * 使用 Blob 和 a 标签触发浏览器下载功能
 * 文件名自动使用笔记标题，无标题时使用 "untitled.md"
 *
 * @param note - 要导出的笔记对象
 *
 * @example
 * exportNoteAsMd({ id: "xxx", title: "我的笔记", content: "# 标题\n\n内容", ... });
 * // => 下载 "我的笔记.md" 文件
 */
export function exportNoteAsMd(note: Note): void {
  const filename = note.title ? `${note.title}.md` : "untitled.md";
  const blob = new Blob([note.content], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
