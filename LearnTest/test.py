class Student:
    def __init__(self, name, age):
        # self 指向新创建的对象
        self.__name = name  # 给这个对象设置 name 属性
        self.__age = age    # 给这个对象设置 age 属性

    def study(self, course_name):
        # self 指向调用这个方法的对象
        print(f'{self.__name}正在学习{course_name}.')

# 创建第一个学生对象
stu1 = Student('王大锤', 20)
# 此时，__init__ 中的 self 指向 stu1

# 创建第二个学生对象
stu2 = Student('李小美', 18)
# 此时，__init__ 中的 self 指向 stu2

stu1.study('Python')  # study 中的 self 指向 stu1，输出：王大锤正在学习Python.
stu2.study('数学')     # study 中的 self 指向 stu2，输出：李小美正在学习数学.