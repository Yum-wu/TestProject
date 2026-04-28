import { create } from "zustand";
import type { Task, Category, FilterStatus, TodoState } from "../types";
import { loadTasks, saveTasks } from "../utils/storage";

const initialState = {
  tasks: loadTasks(),
  filterStatus: "all" as FilterStatus,
  filterCategory: "全部" as Category,
  searchQuery: "",
};

export const useTodoStore = create<TodoState>((set, get) => ({
  ...initialState,

  addTask: (task) =>
    set((state) => {
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newTasks = [...state.tasks, newTask];
      saveTasks(newTasks);
      return { tasks: newTasks };
    }),

  updateTask: (id, updates) =>
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task,
      );
      saveTasks(newTasks);
      return { tasks: newTasks };
    }),

  deleteTask: (id) =>
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.id !== id);
      saveTasks(newTasks);
      return { tasks: newTasks };
    }),

  toggleTask: (id) =>
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task,
      );
      saveTasks(newTasks);
      return { tasks: newTasks };
    }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setFilterCategory: (filterCategory) => set({ filterCategory }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  clearCompleted: () =>
    set((state) => {
      const newTasks = state.tasks.filter((task) => !task.completed);
      saveTasks(newTasks);
      return { tasks: newTasks };
    }),

  getFilteredTasks: () => {
    const state = get();
    const { tasks, filterStatus, filterCategory, searchQuery } = state;
    return tasks.filter((task) => {
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
  },

  getStats: () => {
    const { tasks } = get();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, completionRate };
  },
}));
