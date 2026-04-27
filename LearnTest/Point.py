class Point:
    def __init__(self, x=0, y=0):
        """初始化点
        :param x: 横坐标
        :param y: 纵坐标
        :return: None
        """
        self.x = x
        self.y = y

    def show(self):
        """显示点的坐标"""
        # f-string 是一种格式化字符串的方式，可以在字符串中嵌入表达式
        # 这里的 f 表示这是一个 f-string（格式化字符串字面量）
        # 花括号 {} 内的内容会被求值并转换为字符串
        return f"({self.x},{self.y})"
    
    def distance(self, other):
        """计算点到其他点的距离
        :param other: 另一个点
        :return: 距离
        """
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5
    
p1 = Point(2, 9)
p2 = Point(3, 4)
print(p1.show())
print(p2.show())
print(p1.distance(p2))