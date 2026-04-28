/**
 * 笔记列表侧边栏组件
 *
 * 功能：展示笔记列表、搜索过滤、新建和删除笔记
 * 优化：使用 React.memo 避免笔记列表未变更时不必要的重渲染
 */
import { memo } from "react";
import { Note } from "../types";
import { Search, Plus, Trash2 } from "lucide-react";

/**
 * 侧边栏组件属性
 * @interface SidebarProps
 * @property {Note[]} notes - 笔记列表
 * @property {string | null} selectedNoteId - 当前选中笔记的 ID
 * @property {(id: string) => void} onSelectNote - 选中笔记的回调
 * @property {() => void} onCreateNote - 创建笔记的回调
 * @property {(id: string) => void} onDeleteNote - 删除笔记的回调
 * @property {string} searchQuery - 搜索关键词
 * @property {(query: string) => void} onSearchChange - 搜索关键词变更回调
 */
interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * 格式化时间戳为相对时间
 *
 * @param timestamp - 时间戳（毫秒）
 * @returns 相对时间字符串，如 "刚刚"、"5 分钟前"、"2 小时前"
 *
 * @example
 * formatTime(Date.now() - 60000) // => "1 分钟前"
 */
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * 格式化内容大小为可读字符串
 *
 * @param content - 笔记内容字符串
 * @returns 格式化的大小字符串，如 "1.2 KB"、"5.8 KB"
 *
 * @example
 * formatSize("Hello World") // => "11 B"
 */
function formatSize(content: string): string {
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * 侧边栏组件
 * 展示笔记列表，支持搜索、新建和删除操作
 */
export const Sidebar = memo(function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  // 根据搜索关键词过滤笔记列表
  const filteredNotes = notes.filter((note) =>
    (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Logo 区域 */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-green-500 font-bold text-sm tracking-wider">
            MARKDOWN NOTES
          </span>
        </div>
        <div className="text-zinc-500 text-xs mt-1">我的笔记本</div>
      </div>

      {/* 搜索框 */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none placeholder-zinc-500"
          />
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-sm">
            {searchQuery ? "没有找到匹配的笔记" : "暂无笔记，点击下方按钮创建"}
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  selectedNoteId === note.id
                    ? "border border-green-500 bg-zinc-900"
                    : "hover:bg-zinc-900 border border-transparent"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm truncate ${
                      selectedNoteId === note.id
                        ? "text-green-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {note.title || "无标题笔记"}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <span>{formatSize(note.content)}</span>
                    <span>{formatTime(note.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("确定要删除这条笔记吗？")) {
                      onDeleteNote(note.id);
                    }
                  }}
                  className="p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建笔记按钮 */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>
    </div>
  );
});
