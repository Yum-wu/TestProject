export type Priority = "high" | "medium" | "low";

export type Category = "全部" | "工作" | "学习" | "生活" | "项目";

export type FilterStatus = "all" | "active" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoStats {
  total: number;
  pending: number;
  completed: number;
  completionRate: number;
}

export interface TodoState {
  tasks: Task[];
  filterStatus: FilterStatus;
  filterCategory: Category;
  searchQuery: string;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterCategory: (category: Category) => void;
  setSearchQuery: (query: string) => void;
  clearCompleted: () => void;
  getFilteredTasks: () => Task[];
  getStats: () => TodoStats;
}
