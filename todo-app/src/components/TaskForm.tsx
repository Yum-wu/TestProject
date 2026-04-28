import { useState } from "react";
import { useTodoStore } from "../store/useTodoStore";
import type { Category, Priority } from "../types";

const CATEGORIES: Category[] = ["工作", "学习", "生活", "项目"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("工作");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const addTask = useTodoStore((state) => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      completed: false,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : "",
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">添加新任务</h2>

      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务内容..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">优先级</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">截止日期</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            添加
          </button>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm text-gray-500 mb-1">备注</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入任务备注（可选）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {title.trim() && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>预览：</span>
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              priority === "high"
                ? "bg-red-500"
                : priority === "medium"
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
          />
          <span className="text-gray-600 font-medium">{title}</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
            {category}
          </span>
        </div>
      )}
    </form>
  );
}
