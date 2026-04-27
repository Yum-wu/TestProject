import time
#定义时钟类
class Clock:
    def __init__(self, hour=0, minute=0, second=0):
        """初始化时钟 
        :param hour: 小时
        :param minute: 分钟
        :param second: 秒
        :return: None
        """
        self.hour = hour
        self.minute = minute
        self.second = second

    def show(self):
        """显示时间"""
        return f'{self.hour:0>2d}:{self.minute:0>2d}:{self.second:0>2d}'

    def run(self):
        """运行时钟
        :return: None
        """
        while True:
            print(self.show())
            time.sleep(1)
            self.second += 1
            if self.second >= 60:
                self.second = 0
                self.minute += 1
                if self.minute >= 60:
                    self.minute = 0
                    self.hour += 1
                    if self.hour >= 24:
                        self.hour = 0

clock = Clock(23, 59,31)
clock.run()