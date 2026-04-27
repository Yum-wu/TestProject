#定义一个简单的猜数字游戏
import random
print("欢迎来到猜数字游戏！")
print("游戏规则：")
print("1. 猜一个1到100之间的数字")
print("2. 如果你猜的数字正确，游戏结束")
print("3. 如果你猜的数字错误，游戏继续")
# 生成一个1到100之间的随机数
secret_number = random.randint(1, 100)
print("游戏开始！")
#用户直接输入需要猜的数字
while True:
    try:
        guess = int(input("请输入你猜的数字: "))
        if 1 <= guess <= 100:
            break
        else:
            print("输入错误: 请输入一个1到100之间的数字。")
    except ValueError:
        print("输入错误: 请输入一个数字。")
# 检查用户猜的数字是否正确
if guess == secret_number:
    print("恭喜你猜对了！")
else:
    #提示比随机数字大或小，并让用户继续猜直到猜对为止
    while guess != secret_number:
        if guess < secret_number:
            print("你猜的数字太小了。")
        else:
            print("你猜的数字太大了。")
        while True:
            try:
                guess = int(input("请重新输入你猜的数字: "))
                if 1 <= guess <= 100:
                    break
                else:
                    print("输入错误: 请输入一个1到100之间的数字。")
            except ValueError:
                print("输入错误: 请输入一个数字。")
        # 检查用户猜的数字是否正确
        if guess == secret_number:
            print("恭喜你猜对了！")
        else:
            print("很遗憾，你猜错了。")
