# To-Do List
# 一个简单的待办事项列表，用户可以添加、删除和查看待办事项。
class task:
    def __init__(self, name, priority):
        """
        初始化一个待办事项
        :param name: 待办事项的名称
        :param priority: 待办事项的优先级，1-5
        """
        self.name = name
        self.priority = priority
        self.completed = False

# 定义一个待办事项列表
tasks = []

# 主程序入口,且检查用户输入是否有效
# 将检查错误封装为函数
while True:
    # 显示待办事项列表
    print("\n=== 待办事项列表 ===")
    if not tasks:
        print("（空）")
    for i in range(len(tasks)):
        status = "✓" if tasks[i].completed else "✗"
        print(f"{i+1}. [{status}] {tasks[i].name} (优先级: {tasks[i].priority})")
    print("===================\n")
    
    print("请选择要执行的操作:")
    print("1. 添加待办事项")
    print("2. 删除待办事项")
    print("3. 标记待办事项为已完成")
    print("4. 退出程序")
    choice = input("请输入你的选择: ")
    
    if choice == "1":
        name = input("请输入待办事项的名称: ")
        if not name.strip():
            print("名称不能为空，请重新输入。\n\n\n")
            continue
        try:
            priority = int(input("请输入待办事项的优先级（1-5）: "))
            if priority < 1 or priority > 5:
                print("优先级必须在1-5之间，请重新输入。\n\n\n")
                continue
        except ValueError:
            print("优先级必须是数字，请重新输入。\n\n\n")
            continue
        tasks.append(task(name, priority))
        print("待办事项添加成功！\n\n\n")
        continue
        
    elif choice == "2":
        try:
            index = int(input("请输入要删除的待办事项的序号: ")) - 1
            if 0 <= index < len(tasks):
                tasks.pop(index)
                print("待办事项删除成功！\n\n\n")
            else:
                print("序号无效，请重新输入。\n\n\n")
        except ValueError:
            print("序号必须是数字，请重新输入。\n\n\n")
        continue
        
    elif choice == "3":
        try:
            index = int(input("请输入要标记为已完成的待办事项的序号: ")) - 1
            if 0 <= index < len(tasks):
                tasks[index].completed = True
                print("待办事项标记为已完成！\n\n\n")
            else:
                print("序号无效，请重新输入。\n\n\n")
        except ValueError:
            print("序号必须是数字，请重新输入。\n\n\n")
        continue
        
    elif choice == "4":
        print("程序退出。")
        exit()
        
    else:
        print("无效的选择，请重新输入。\n\n\n")
        continue
