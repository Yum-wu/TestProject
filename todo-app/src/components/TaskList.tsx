import { useTodoStore } from "../store/useTodoStore";
import TaskItem from "./TaskItem";
import type { Category } from "../types";

const CATEGORIES: Category[] = ["全部", "工作", "学习", "生活", "项目"];

export default function TaskList() {
  const tasks = useTodoStore((state) => state.tasks);
  const filterStatus = useTodoStore((state) => state.filterStatus);
  const filterCategory = useTodoStore((state) => state.filterCategory);
  const searchQuery = useTodoStore((state) => state.searchQuery);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const setFilterStatus = useTodoStore((state) => state.setFilterStatus);
  const setFilterCategory = useTodoStore((state) => state.setFilterCategory);
  const setSearchQuery = useTodoStore((state) => state.setSearchQuery);

  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "active" && task.completed) return false;
    if (filterStatus === "completed" && !task.completed) return false;
    if (filterCategory !== "全部" && task.category !== filterCategory)
      return false;
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const statusFilters: {
    key: "all" | "active" | "completed";
    label: string;
  }[] = [
    { key: "all", label: "全部" },
    { key: "active", label: "待完成" },
    { key: "completed", label: "已完成" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索任务..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {statusFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `确定要清除 ${completedCount} 个已完成的任务吗？`,
                  )
                ) {
                  clearCompleted();
                }
              }}
              className="px-4 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              清除已完成 ({completedCount})
            </button>
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg">暂无任务</p>
          <p className="text-sm mt-2">添加一个新任务开始吧!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
