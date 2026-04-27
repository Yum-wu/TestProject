class Calculator:
    """
    定义一个简单的计算器类
    该类提供了基本的数学运算功能，包括加减乘除、幂运算和平方根运算
    """
    def __init__(self, a, b):
        """
        初始化计算器实例
        创建计算器对象时，需要传入两个操作数
        :param a: 第一个操作数，可以是整数或浮点数
        :param b: 第二个操作数，可以是整数或浮点数
        """
        self.a = a  # 将第一个操作数保存为实例属性
        self.b = b  # 将第二个操作数保存为实例属性

    def add(self):
        """
        加法运算方法
        实现两个操作数的相加操作
        :return: 两个操作数的和，返回值为数值类型
        """
        return self.a + self.b  # 返回a与b相加的结果

    def sub(self):
        """
        减法运算方法
        实现第一个操作数减去第二个操作数的操作
        :return: 两个操作数的差，即a - b的结果
        """
        return self.a - self.b  # 返回a减去b的结果

    def mul(self):
        """
        乘法运算方法
        实现两个操作数相乘的操作
        :return: 两个操作数的积，即a * b的结果
        """
        return self.a * self.b  # 返回a与b相乘的结果

    def div(self):
        """
        除法运算方法
        实现第一个操作数除以第二个操作数的操作
        注意：当b为0时会抛出ZeroDivisionError异常
        :return: 两个操作数的商，即a / b的结果（浮点数）
        """
        return self.a / self.b  # 返回a除以b的结果

    def power(self):
        """
        幂运算方法
        实现第一个操作数的第二个操作数次方的操作
        即计算a的b次方
        :return: 两个操作数的幂，即a ** b的结果
        """
        return self.a ** self.b  # 返回a的b次方的结果

    def sqrt(self):
        """
        平方根运算方法
        实现第一个操作数的平方根计算
        注意：当a为负数时会返回复数结果
        :return: 第一个操作数的平方根，即a的0.5次方
        """
        return self.a ** 0.5  # 返回a的平方根（a的0.5次方）


# 主程序入口：用户直接输入需要的计算式子
# 使用eval函数直接计算用户输入的数学表达式
expression = input("请输入需要的计算式子: ")  # 获取用户输入的数学表达式字符串

try:
    # 尝试使用eval函数计算用户输入的表达式
    # eval函数会将字符串作为Python表达式进行求值
    result = eval(expression)
    print(result)  # 输出计算结果
except Exception as e:
    # 捕获所有可能的异常，如语法错误、名称错误、除零错误等
    print(f"计算错误: {e}")  # 显示错误信息，帮助用户了解出错原因
    
    # 用户输入的计算式子有误，提示用户重新输入
    # 给用户第二次机会输入正确的表达式
    expression = input("请输入正确的计算式子: ")
    try:
        # 再次尝试计算用户重新输入的表达式
        result = eval(expression)
        print(result)  # 输出第二次计算的结果
    except Exception as e:
        # 如果第二次仍然出错，再次捕获异常并显示错误信息
        # 程序不会提供第三次输入机会，直接结束
        print(f"计算错误: {e}")


