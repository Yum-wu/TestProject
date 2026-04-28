import { useState } from "react";
import type { Task } from "../types";
import { useTodoStore } from "../store/useTodoStore";
import { format, isPast, isToday } from "date-fns";
import { zhCN } from "date-fns/locale";

interface TaskItemProps {
  task: Task;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-500",
  low: "bg-green-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export default function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const updateTask = useTodoStore((state) => state.updateTask);
  const deleteTask = useTodoStore((state) => state.deleteTask);
  const toggleTask = useTodoStore((state) => state.toggleTask);

  const isOverdue =
    task.dueDate && !task.completed && isPast(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const handleSave = () => {
    if (editTitle.trim()) {
      updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("确定要删除这个任务吗?")) {
      deleteTask(task.id);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 transition-colors hover:bg-gray-50 ${
        isOverdue ? "border-l-4 border-red-500 bg-red-50/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}
              title={`${PRIORITY_LABELS[task.priority]}优先级`}
            />
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className={`text-base cursor-pointer flex-1 ${
                task.completed ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                task.category === "工作"
                  ? "bg-blue-100 text-blue-700"
                  : task.category === "学习"
                    ? "bg-purple-100 text-purple-700"
                    : task.category === "生活"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.category}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-500 text-sm mt-1 ml-5">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 ml-5">
            {task.dueDate && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  isOverdue
                    ? "text-red-600 bg-red-100"
                    : isDueToday
                      ? "text-yellow-700 bg-yellow-100"
                      : "text-gray-500 bg-gray-100"
                }`}
              >
                📅 {format(new Date(task.dueDate), "M月d日", { locale: zhCN })}
                {isOverdue && " · 已过期"}
                {isDueToday && " · 今天"}
              </span>
            )}
            <span className="text-xs text-gray-400">
              优先级: {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
            title="编辑"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="删除"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
