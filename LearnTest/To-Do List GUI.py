# To-Do List GUI
# 一个基于图形界面的待办事项列表程序
import tkinter as tk
from tkinter import ttk, messagebox

class Task:
    """任务类"""
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority
        self.completed = False

    def __str__(self):
        status = "✓" if self.completed else "✗"
        return f"[{status}] {self.name} (优先级: {self.priority})"


class TodoListApp:
    """待办事项列表图形界面应用"""

    def __init__(self, root):
        self.root = root
        self.root.title("待办事项列表")

        # 待办事项列表
        self.tasks = []

        # 优先级计数器（用于递进）
        self.priority_counter = 1

        # 创建界面组件
        self.create_widgets()

        # 初始窗口大小
        self.root.geometry("700x550")

        # 禁止窗口缩小到最小尺寸
        self.root.minsize(650, 500)

    def create_widgets(self):
        """创建界面组件"""
        # 标题
        title_label = tk.Label(self.root, text="待办事项列表",
                              font=("Arial", 20, "bold"))
        title_label.pack(pady=15)

        # 任务输入区域
        input_frame = tk.Frame(self.root)
        input_frame.pack(pady=10, padx=30, fill=tk.X)

        # 任务名称输入
        tk.Label(input_frame, text="任务名称:", font=("Arial", 12)).grid(row=0, column=0, padx=5, pady=8, sticky=tk.W)
        self.name_entry = tk.Entry(input_frame, width=35, font=("Arial", 11))
        self.name_entry.grid(row=0, column=1, padx=5, pady=8)

        # 优先级选择
        tk.Label(input_frame, text="优先级:", font=("Arial", 12)).grid(row=0, column=2, padx=5, pady=8, sticky=tk.W)
        self.priority_var = tk.StringVar(value="1")
        priority_combo = ttk.Combobox(input_frame, textvariable=self.priority_var,
                                       values=[1, 2, 3, 4, 5], width=8, state="readonly", font=("Arial", 11))
        priority_combo.grid(row=0, column=3, padx=5, pady=8)
        priority_combo.current(0)  # 默认选择1

        # 添加按钮
        add_btn = tk.Button(input_frame, text="添加任务",
                            command=self.add_task, bg="#4CAF50", fg="white",
                            width=12, height=2, font=("Arial", 11, "bold"))
        add_btn.grid(row=0, column=4, padx=10, pady=8)

        # 任务列表区域
        list_frame = tk.Frame(self.root)
        list_frame.pack(pady=10, padx=30, fill=tk.BOTH, expand=True)

        # 任务列表标题
        list_title = tk.Label(list_frame, text="任务列表",
                             font=("Arial", 14, "bold"))
        list_title.pack(anchor=tk.W, pady=(0, 5))

        # 列表框和滚动条
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.task_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set,
                                        font=("Arial", 12), height=12,
                                        selectmode=tk.SINGLE)
        self.task_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.task_listbox.yview)

        # 操作按钮区域
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=15)

        # 完成按钮
        complete_btn = tk.Button(btn_frame, text="标记完成",
                                 command=self.mark_completed, bg="#2196F3", fg="white",
                                 width=12, height=2, font=("Arial", 11, "bold"))
        complete_btn.grid(row=0, column=0, padx=15)

        # 删除按钮
        delete_btn = tk.Button(btn_frame, text="删除任务",
                              command=self.delete_task, bg="#f44336", fg="white",
                              width=12, height=2, font=("Arial", 11, "bold"))
        delete_btn.grid(row=0, column=1, padx=15)

        # 刷新按钮
        refresh_btn = tk.Button(btn_frame, text="刷新列表",
                               command=self.refresh_list, bg="#FF9800", fg="white",
                               width=12, height=2, font=("Arial", 11, "bold"))
        refresh_btn.grid(row=0, column=2, padx=15)

        # 状态栏
        self.status_var = tk.StringVar()
        self.status_var.set("共 0 个任务")
        status_label = tk.Label(self.root, textvariable=self.status_var,
                                font=("Arial", 11), fg="gray")
        status_label.pack(pady=5)

    def add_task(self):
        """添加任务"""
        name = self.name_entry.get().strip()

        if not name:
            messagebox.showwarning("警告", "请输入任务名称！")
            return

        try:
            priority = int(self.priority_var.get())
            if priority < 1 or priority > 5:
                messagebox.showwarning("警告", "优先级必须在1-5之间！")
                return
        except ValueError:
            messagebox.showwarning("警告", "请选择有效的优先级！")
            return

        # 创建任务并添加到列表
        new_task = Task(name, priority)
        self.tasks.append(new_task)

        # 清空输入框
        self.name_entry.delete(0, tk.END)

        # 更新优先级计数器并递进（优先级1-5循环）
        self.priority_counter = (self.priority_counter % 5) + 1
        self.priority_var.set(str(self.priority_counter))

        # 刷新列表
        self.refresh_list()

        messagebox.showinfo("成功", "任务添加成功！")

    def delete_task(self):
        """删除任务"""
        selection = self.task_listbox.curselection()

        if not selection:
            messagebox.showwarning("警告", "请先选择一个任务！")
            return

        index = selection[0]
        self.tasks.pop(index)

        # 刷新列表
        self.refresh_list()

        messagebox.showinfo("成功", "任务删除成功！")

    def mark_completed(self):
        """标记任务为已完成"""
        selection = self.task_listbox.curselection()

        if not selection:
            messagebox.showwarning("警告", "请先选择一个任务！")
            return

        index = selection[0]
        self.tasks[index].completed = True

        # 刷新列表
        self.refresh_list()

        messagebox.showinfo("成功", "任务已标记为完成！")

    def refresh_list(self):
        """刷新任务列表"""
        # 清空列表框
        self.task_listbox.delete(0, tk.END)

        # 添加任务到列表框
        for i, task in enumerate(self.tasks):
            display_text = f"{i+1}. {task}"
            self.task_listbox.insert(tk.END, display_text)

            # 根据完成状态设置颜色
            if task.completed:
                self.task_listbox.itemconfig(i, {'bg': '#E8F5E9', 'fg': '#4CAF50'})
            else:
                self.task_listbox.itemconfig(i, {'bg': 'white', 'fg': 'black'})

        # 更新状态栏
        total = len(self.tasks)
        completed = sum(1 for task in self.tasks if task.completed)
        self.status_var.set(f"共 {total} 个任务，已完成 {completed} 个")


def main():
    """主函数"""
    root = tk.Tk()
    app = TodoListApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
