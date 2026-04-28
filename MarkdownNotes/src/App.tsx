/**
 * Markdown 笔记应用 - 主组件
 *
 * 功能：管理笔记的全局状态，包括创建、编辑、删除、搜索和导出
 * 布局：左侧笔记列表 + 中间编辑器 + 右侧实时预览
 *
 * 优化点：
 * - 使用 useCallback 稳定事件处理函数引用，避免子组件不必要的重渲染
 * - 使用 useMemo 缓存选中的笔记对象
 * - 防抖保存机制，减少 localStorage 写入频率
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Note } from "./types";
import { loadNotes, saveNotes, exportNoteAsMd } from "./utils/storage";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";

/**
 * 笔记数据结构
 * @interface Note
 * @property {string} id - 唯一标识符
 * @property {string} title - 笔记标题（自动从内容第一行提取）
 * @property {string} content - 笔记内容（Markdown 格式）
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 更新时间戳
 */

function App() {
  /** 笔记列表状态 */
  const [notes, setNotes] = useState<Note[]>([]);
  /** 当前选中笔记的 ID */
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  /** 搜索关键词 */
  const [searchQuery, setSearchQuery] = useState("");
  /** 保存状态：已保存 / 未保存 */
  const [savedStatus, setSavedStatus] = useState<"已保存" | "未保存">("已保存");

  /**
   * 组件挂载时加载笔记数据
   * 如果已有笔记，自动选中第一条
   */
  useEffect(() => {
    const loadedNotes = loadNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setSelectedNoteId(loadedNotes[0].id);
    }
  }, []);

  /**
   * 根据选中 ID 查找当前笔记
   * 使用 useMemo 缓存查找结果，避免每次渲染都执行 find
   */
  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId],
  );

  /**
   * 创建新笔记
   * 新笔记插入到列表顶部，自动选中并保存
   */
  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    saveNotes(updatedNotes);
  }, [notes]);

  /**
   * 选中笔记
   * 切换笔记时重置保存状态为已保存
   */
  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    setSavedStatus("已保存");
  }, []);

  /**
   * 删除笔记
   * 删除后如果当前选中笔记被删除，自动切换到第一条笔记
   */
  const handleDeleteNote = useCallback(
    (id: string) => {
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
      saveNotes(updatedNotes);
    },
    [notes, selectedNoteId],
  );

  /**
   * 笔记内容变更处理
   * 自动从内容第一行提取标题，更新笔记信息
   * 使用防抖机制延迟保存，避免频繁写入 localStorage
   */
  const handleContentChange = useCallback(
    (content: string) => {
      if (!selectedNoteId) return;

      const updatedNotes = notes.map((note) => {
        if (note.id === selectedNoteId) {
          // 从内容第一行提取标题，去除 Markdown 标题符号
          const title =
            content
              .split("\n")[0]
              ?.replace(/^#+\s*/, "")
              .trim() || "";
          return { ...note, content, title, updatedAt: Date.now() };
        }
        return note;
      });
      setNotes(updatedNotes);
      setSavedStatus("未保存");

      // 清除之前的定时器
      clearTimeout((window as any).__saveTimer);
      // 防抖保存：500ms 后执行
      (window as any).__saveTimer = setTimeout(() => {
        saveNotes(updatedNotes);
        setSavedStatus("已保存");
      }, 500);
    },
    [notes, selectedNoteId],
  );

  /** 搜索关键词变更处理 */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * 导出为 Markdown 文件
   * 使用 Blob 和 a 标签触发浏览器下载
   */
  const handleExportMd = useCallback(() => {
    if (selectedNote) {
      exportNoteAsMd(selectedNote);
    }
  }, [selectedNote]);

  /**
   * 导出为 PDF
   * 调用浏览器打印功能，用户可选择另存为 PDF
   */
  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-200">
      {/* 左侧：笔记列表 */}
      <div className="w-72 flex flex-col border-r border-zinc-800">
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* 中间和右侧：编辑器和预览 */}
      {selectedNote ? (
        <>
          {/* 中间：编辑器 */}
          <div className="flex-1 flex flex-col border-r border-zinc-800">
            <Editor
              content={selectedNote.content}
              onChange={handleContentChange}
              title={selectedNote.title || "无标题笔记"}
              savedStatus={savedStatus}
            />
          </div>

          {/* 右侧：实时预览 */}
          <div className="flex-1 flex flex-col">
            <Preview
              content={selectedNote.content}
              title={selectedNote.title || "无标题笔记"}
              onExportMd={handleExportMd}
              onExportPdf={handleExportPdf}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />
          </div>
        </>
      ) : (
        /* 未选中笔记时的占位提示 */
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          选择或创建一篇笔记开始编辑
        </div>
      )}
    </div>
  );
}

export default App;
