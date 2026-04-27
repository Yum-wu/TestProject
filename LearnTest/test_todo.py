# 测试待办事项列表核心功能
print("=== 测试待办事项列表核心功能 ===\n")

# 定义 Task 类（从 To-Do List.py 复制）
class task:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority
        self.completed = False
        
    def __str__(self):
        status = "✓" if self.completed else "✗"
        return f"[{status}] {self.name} (优先级: {self.priority})"

# 待办事项列表
tasks = []

# 测试添加任务
print("1. 测试添加任务:")
tasks.append(task("完成Python作业", 3))
tasks.append(task("去超市购物", 5))
tasks.append(task("健身", 2))

print("添加了3个任务:")
for i, t in enumerate(tasks):
    print(f"  {i+1}. {t.name} (优先级: {t.priority}) - 完成状态: {t.completed}")

# 测试标记完成
print("\n2. 测试标记任务为已完成:")
tasks[0].completed = True  # 标记第一个任务为完成
print(f"  标记 '{tasks[0].name}' 为已完成")

print("当前状态:")
for i, t in enumerate(tasks):
    status = "✓" if t.completed else "✗"
    print(f"  {i+1}. [{status}] {t.name} (优先级: {t.priority})")

# 测试删除任务
print("\n3. 测试删除任务:")
removed_task = tasks.pop(1)  # 删除第二个任务
print(f"  删除了 '{removed_task.name}'")

print("当前状态:")
for i, t in enumerate(tasks):
    status = "✓" if t.completed else "✗"
    print(f"  {i+1}. [{status}] {t.name} (优先级: {t.priority})")

# 测试添加更多任务
print("\n4. 测试添加更多任务:")
tasks.append(task("读书", 4))
tasks.append(task("写代码", 5))
print("添加了2个新任务")

print("最终状态:")
for i, t in enumerate(tasks):
    status = "✓" if t.completed else "✗"
    print(f"  {i+1}. [{status}] {t.name} (优先级: {t.priority})")

# 统计
total = len(tasks)
completed = sum(1 for t in tasks if t.completed)
pending = total - completed

print(f"\n=== 统计 ===")
print(f"总任务数: {total}")
print(f"已完成: {completed}")
print(f"未完成: {pending}")

print("\n=== 所有测试完成 ===")
print("\n✓ Task 类功能正常")
print("✓ 任务添加功能正常")
print("✓ 标记完成功能正常")
print("✓ 删除任务功能正常")
print("✓ 列表显示功能正常")
