# 个人记账本应用
import datetime
import json
import os
import matplotlib.pyplot as plt
import pymysql


class DBConfig:
    """数据库配置类"""

    def __init__(
            self,
            host='localhost',
            user='root',
            password='',
            database='account_book',
            port=3306):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port


class Transaction:
    """交易记录类"""

    def __init__(self, date, type, amount, category, description):
        """
        初始化交易记录
        :param date: 交易日期
        :param type: 交易类型（收入/支出）
        :param amount: 交易金额
        :param category: 交易类别
        :param description: 交易描述
        """
        # 交易记录ID
        self.id = None
        self.date = datetime.datetime.strptime(
            date, "%Y-%m-%d").date() if isinstance(date, str) else date
        self.type = type
        self.amount = amount
        self.category = category
        self.description = description

    def validate(self):
        """验证交易数据的合法性"""
        if not isinstance(self.date, datetime.date):
            raise ValueError("日期格式错误")
        if self.type not in ["收入", "支出"]:
            raise ValueError("交易类型必须是'收入'或'支出'")
        if not isinstance(self.amount, (int, float)) or self.amount <= 0:
            raise ValueError("交易金额必须是正数")
        if not self.category:
            raise ValueError("交易类别不能为空")

    def __str__(self):
        return f"Transaction(id={
            self.id}, date={
            self.date}, type={
            self.type}, amount={
                self.amount}, category={
                    self.category}, description={
                        self.description})"

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "type": self.type,
            "amount": self.amount,
            "category": self.category,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, data):
        """从字典创建交易记录"""
        transaction = cls(
            data["date"],
            data["type"],
            data["amount"],
            data["category"],
            data["description"]
        )
        transaction.id = data.get("id")
        return transaction


class Category:
    """交易类别类"""

    def __init__(self, name, type, parent=None):
        """
        初始化类别
        :param name: 类别名称
        :param type: 类别类型（收入/支出）
        :param parent: 父类别（支持层级结构）
        """
        # 分类ID
        self.id = None
        self.name = name
        self.type = type
        self.parent = parent

    def is_valid(self):
        """验证类别合法性"""
        if not self.name:
            return False
        if self.type not in ["收入", "支出"]:
            return False
        return True

    def __str__(self):
        parent_name = self.parent.name if self.parent else "None"
        return f"Category(id={
            self.id}, name={
            self.name}, type={
            self.type}, parent={parent_name})"

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "parent_id": self.parent.id if self.parent else None
        }

    @classmethod
    def from_dict(cls, data, categories=None):
        """从字典创建类别"""
        parent = None
        if data.get("parent_id") and categories:
            for cat in categories:
                if cat.id == data["parent_id"]:
                    parent = cat
                    break
        category = cls(
            data["name"],
            data["type"],
            parent
        )
        category.id = data.get("id")
        return category


class AccountBook:
    """记账本核心类"""

    def __init__(self, db_config=None):
        """初始化记账本"""
        self.transactions = []
        self.categories = []
        self.balance = 0
        self._next_id = 1
        self._load_default_categories()

        # 数据库配置
        self.db_config = db_config
        if self.db_config:
            self._init_database()
            self.load_from_database()

    def _load_default_categories(self):
        """加载默认类别"""
        default_categories = [
            Category("工资", "收入"),
            Category("奖金", "收入"),
            Category("其他收入", "收入"),
            Category("餐饮", "支出"),
            Category("交通", "支出"),
            Category("购物", "支出"),
            Category("娱乐", "支出"),
            Category("其他支出", "支出")
        ]
        for i, category in enumerate(default_categories):
            category.id = i + 1
            self.categories.append(category)

    def _init_database(self):
        """初始化数据库连接和表结构"""
        try:
            # 连接数据库
            self.conn = pymysql.connect(
                host=self.db_config.host,
                user=self.db_config.user,
                password=self.db_config.password,
                port=self.db_config.port
            )

            # 创建数据库
            with self.conn.cursor() as cursor:
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS {
                        self.db_config.database}")

            # 选择数据库
            self.conn.select_db(self.db_config.database)

            # 创建类别表
            with self.conn.cursor() as cursor:
                cursor.execute('''
                CREATE TABLE IF NOT EXISTS categories (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    parent_id INT DEFAULT NULL,
                    FOREIGN KEY (parent_id) REFERENCES categories(id)
                )''')

            # 创建交易记录表
            with self.conn.cursor() as cursor:
                cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    date DATE NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT
                )''')

            # 创建配置表
            with self.conn.cursor() as cursor:
                cursor.execute('''
                CREATE TABLE IF NOT EXISTS config (
                    key_name VARCHAR(50) PRIMARY KEY,
                    value VARCHAR(255) NOT NULL
                )''')

            self.conn.commit()
        except Exception as e:
            print(f"数据库初始化失败: {e}")
            self.db_config = None

    def load_from_database(self):
        """从数据库加载数据"""
        if not self.db_config:
            return

        try:
            # 加载类别
            self.categories = []
            with self.conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name, type, parent_id FROM categories")
                categories_data = cursor.fetchall()

            # 先创建所有类别对象
            category_dict = {}
            for cat_data in categories_data:
                category = Category(cat_data[1], cat_data[2])
                category.id = cat_data[0]
                category_dict[cat_data[0]] = category
                self.categories.append(category)

            # 关联父类别
            for cat_data in categories_data:
                if cat_data[3]:
                    category_id = cat_data[0]
                    parent_id = cat_data[3]
                    if category_id in category_dict and parent_id in category_dict:
                        category_dict[category_id].parent = category_dict[parent_id]

            # 如果没有类别，加载默认类别并保存到数据库
            if not self.categories:
                self._load_default_categories()
                self.save_categories_to_database()

            # 加载交易记录
            self.transactions = []
            with self.conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, date, type, amount, category, description FROM transactions")
                transactions_data = cursor.fetchall()

            for trans_data in transactions_data:
                transaction = Transaction(
                    trans_data[1].strftime("%Y-%m-%d"),
                    trans_data[2],
                    trans_data[3],
                    trans_data[4],
                    trans_data[5] or ""
                )
                transaction.id = trans_data[0]
                self.transactions.append(transaction)

            # 加载下一个ID
            with self.conn.cursor() as cursor:
                cursor.execute(
                    "SELECT value FROM config WHERE key_name = 'next_id'")
                result = cursor.fetchone()
                if result:
                    self._next_id = int(result[0])
                else:
                    # 计算下一个ID
                    if self.transactions:
                        max_id = max(t.id for t in self.transactions)
                        self._next_id = max_id + 1
                    else:
                        self._next_id = 1
                    # 保存到数据库
                    with self.conn.cursor() as cursor:
                        cursor.execute(
                            "INSERT IGNORE INTO config (key_name, value) VALUES ('next_id', %s)",
                            (self._next_id,
                             ))
                    self.conn.commit()

            # 重新计算余额
            self.calculate_balance()
        except Exception as e:
            print(f"从数据库加载失败: {e}")

    def add_transaction(self, date, type, amount, category, description):
        """添加新交易"""
        transaction = Transaction(date, type, amount, category, description)
        transaction.validate()
        transaction.id = self._next_id
        self._next_id += 1
        self.transactions.append(transaction)
        self.calculate_balance()

        # 保存到数据库
        if self.db_config:
            self.save_transaction_to_database(transaction)
            self.update_next_id_in_database()

        return transaction

    def remove_transaction(self, transaction_id):
        """删除交易"""
        for i, transaction in enumerate(self.transactions):
            if transaction.id == transaction_id:
                del self.transactions[i]
                self.calculate_balance()

                # 从数据库删除
                if self.db_config:
                    self.delete_transaction_from_database(transaction_id)

                return True
        return False

    def get_transactions(
            self,
            start_date=None,
            end_date=None,
            type=None,
            category=None):
        """查询交易记录"""
        result = self.transactions
        if start_date:
            start_date = datetime.datetime.strptime(
                start_date, "%Y-%m-%d").date() if isinstance(start_date, str) else start_date
            result = [t for t in result if t.date >= start_date]
        if end_date:
            end_date = datetime.datetime.strptime(
                end_date, "%Y-%m-%d").date() if isinstance(end_date, str) else end_date
            result = [t for t in result if t.date <= end_date]
        if type:
            result = [t for t in result if t.type == type]
        if category:
            result = [t for t in result if t.category == category]
        return result

    def calculate_balance(self):
        """计算当前余额"""
        income = sum(t.amount for t in self.transactions if t.type == "收入")
        expense = sum(t.amount for t in self.transactions if t.type == "支出")
        self.balance = income - expense
        return self.balance

    def save_transaction_to_database(self, transaction):
        """保存交易到数据库"""
        if not self.db_config:
            return

        try:
            with self.conn.cursor() as cursor:
                cursor.execute('''
                INSERT INTO transactions (id, date, type, amount, category, description)
                VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    transaction.id,
                    transaction.date,
                    transaction.type,
                    transaction.amount,
                    transaction.category,
                    transaction.description
                ))
            self.conn.commit()
        except Exception as e:
            print(f"保存交易到数据库失败: {e}")

    def delete_transaction_from_database(self, transaction_id):
        """从数据库删除交易"""
        if not self.db_config:
            return

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM transactions WHERE id = %s", (transaction_id,))
            self.conn.commit()
        except Exception as e:
            print(f"从数据库删除交易失败: {e}")

    def save_categories_to_database(self):
        """保存类别到数据库"""
        if not self.db_config:
            return

        try:
            # 先清空类别表
            with self.conn.cursor() as cursor:
                cursor.execute("DELETE FROM categories")

            # 保存类别
            for category in self.categories:
                parent_id = category.parent.id if category.parent else None
                with self.conn.cursor() as cursor:
                    cursor.execute('''
                    INSERT INTO categories (id, name, type, parent_id)
                    VALUES (%s, %s, %s, %s)
                    ''', (
                        category.id,
                        category.name,
                        category.type,
                        parent_id
                    ))
            self.conn.commit()
        except Exception as e:
            print(f"保存类别到数据库失败: {e}")

    def update_next_id_in_database(self):
        """更新数据库中的下一个ID"""
        if not self.db_config:
            return

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO config (key_name, value) VALUES ('next_id', %s) ON DUPLICATE KEY UPDATE value = %s",
                    (self._next_id, self._next_id)
                )
            self.conn.commit()
        except Exception as e:
            print(f"更新下一个ID失败: {e}")

    def save_to_database(self):
        """保存所有数据到数据库"""
        if not self.db_config:
            return

        try:
            # 保存类别
            self.save_categories_to_database()

            # 清空交易表并重新保存
            with self.conn.cursor() as cursor:
                cursor.execute("DELETE FROM transactions")

            for transaction in self.transactions:
                self.save_transaction_to_database(transaction)

            # 更新下一个ID
            self.update_next_id_in_database()

            print("数据保存到数据库成功")
        except Exception as e:
            print(f"保存到数据库失败: {e}")

    def close_connection(self):
        """关闭数据库连接"""
        if hasattr(self, 'conn') and self.conn:
            try:
                self.conn.close()
            except Exception as e:
                print(f"关闭数据库连接失败: {e}")

    def generate_report(self, start_date=None, end_date=None):
        """生成统计报表"""
        transactions = self.get_transactions(start_date, end_date)

        # 月度收支统计
        monthly_stats = {}
        for transaction in transactions:
            month_key = transaction.date.strftime("%Y-%m")
            if month_key not in monthly_stats:
                monthly_stats[month_key] = {"收入": 0, "支出": 0}
            monthly_stats[month_key][transaction.type] += transaction.amount

        # 类别支出分析
        category_stats = {}
        for transaction in transactions:
            if transaction.type == "支出":
                if transaction.category not in category_stats:
                    category_stats[transaction.category] = 0
                category_stats[transaction.category] += transaction.amount

        return {
            "balance": self.balance,
            "monthly_stats": monthly_stats,
            "category_stats": category_stats,
            "total_transactions": len(transactions)
        }

    def save_to_file(self, filename="account_book.json"):
        """保存数据到文件"""
        if filename.endswith('.txt'):
            self.save_to_txt_file(filename)
        else:
            data = {
                "transactions": [t.to_dict() for t in self.transactions],
                "categories": [c.to_dict() for c in self.categories],
                "next_id": self._next_id
            }
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    def load_from_file(self, filename="account_book.json"):
        """从文件加载数据"""
        if not os.path.exists(filename):
            return

        if filename.endswith('.txt'):
            self.load_from_txt_file(filename)
        else:
            with open(filename, "r", encoding="utf-8") as f:
                data = json.load(f)

            # 加载类别
            self.categories = []
            for cat_data in data.get("categories", []):
                category = Category.from_dict(cat_data)
                self.categories.append(category)

            # 重新关联父类别
            for cat in self.categories:
                for cat_data in data.get("categories", []):
                    if cat.id == cat_data.get(
                            "id") and cat_data.get("parent_id"):
                        for parent_cat in self.categories:
                            if parent_cat.id == cat_data["parent_id"]:
                                cat.parent = parent_cat
                                break

            # 加载交易记录
            self.transactions = []
            for trans_data in data.get("transactions", []):
                transaction = Transaction.from_dict(trans_data)
                self.transactions.append(transaction)

            # 加载下一个ID
            self._next_id = data.get("next_id", 1)

            # 重新计算余额
            self.calculate_balance()

    def save_to_txt_file(self, filename="account_book.txt"):
        """保存数据到TXT文件"""
        with open(filename, "w", encoding="utf-8") as f:
            # 写入类别信息
            f.write("# 类别信息\n")
            f.write("ID,名称,类型,父类别ID\n")
            for category in self.categories:
                parent_id = category.parent.id if category.parent else "-"
                f.write(
                    f"{category.id},{category.name},{category.type},{parent_id}\n")

            # 写入交易记录
            f.write("\n# 交易记录\n")
            f.write("ID,日期,类型,金额,类别,描述\n")
            for transaction in self.transactions:
                f.write(
                    f"{
                        transaction.id},{
                        transaction.date},{
                        transaction.type},{
                        transaction.amount}," f"{
                        transaction.category},{
                            transaction.description}\n")

            # 写入下一个ID
            f.write(f"\n# 下一个ID\n{self._next_id}\n")

    def load_from_txt_file(self, filename="account_book.txt"):
        """从TXT文件加载数据"""
        with open(filename, "r", encoding="utf-8") as f:
            lines = f.readlines()

        mode = "none"
        self.categories = []
        self.transactions = []
        self._next_id = 1

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line == "# 类别信息":
                mode = "categories"
                continue
            elif line == "# 交易记录":
                mode = "transactions"
                continue
            elif line == "# 下一个ID":
                mode = "next_id"
                continue

            if mode == "categories" and line != "ID,名称,类型,父类别ID":
                parts = line.split(",")
                if len(parts) >= 4:
                    cat_id = int(parts[0])
                    name = parts[1]
                    cat_type = parts[2]
                    parent_id = parts[3] if parts[3] != "-" else None

                    category = Category(name, cat_type)
                    category.id = cat_id
                    self.categories.append(category)

            elif mode == "transactions" and line != "ID,日期,类型,金额,类别,描述":
                parts = line.split(",")
                if len(parts) >= 6:
                    trans_id = int(parts[0])
                    date = parts[1]
                    trans_type = parts[2]
                    amount = float(parts[3])
                    category = parts[4]
                    description = ",".join(parts[5:])

                    transaction = Transaction(
                        date, trans_type, amount, category, description)
                    transaction.id = trans_id
                    self.transactions.append(transaction)

            elif mode == "next_id":
                try:
                    self._next_id = int(line)
                except Exception:
                    pass

        # 重新关联父类别
        for cat in self.categories:
            for other_cat in self.categories:
                for line in lines:
                    line = line.strip()
                    if line.startswith(f"{cat.id},"):
                        parts = line.split(",")
                        if len(parts) >= 4 and parts[3] != "-":
                            try:
                                parent_id = int(parts[3])
                                if other_cat.id == parent_id:
                                    cat.parent = other_cat
                                    break
                            except Exception:
                                pass

        # 重新计算余额
        self.calculate_balance()

    def generate_monthly_chart(
            self,
            start_date=None,
            end_date=None,
            save_path=None):
        """生成月度收支对比图表"""
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
        plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号

        report = self.generate_report(start_date, end_date)
        monthly_stats = report['monthly_stats']

        if not monthly_stats:
            print("没有数据可生成图表")
            return

        # 准备数据
        months = list(monthly_stats.keys())
        incomes = [monthly_stats[month]['收入'] for month in months]
        expenses = [monthly_stats[month]['支出'] for month in months]

        # 创建图表
        plt.figure(figsize=(10, 6))
        x = range(len(months))
        width = 0.35

        plt.bar([i - width / 2 for i in x], incomes, width, label='收入')
        plt.bar([i + width / 2 for i in x], expenses, width, label='支出')

        plt.xlabel('月份')
        plt.ylabel('金额 (元)')
        plt.title('月度收支对比')
        plt.xticks(x, months)
        plt.legend()
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)
            print(f"图表已保存到: {save_path}")
        else:
            plt.show()

    def generate_category_chart(
            self,
            start_date=None,
            end_date=None,
            save_path=None):
        """生成类别支出饼图"""
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
        plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号

        report = self.generate_report(start_date, end_date)
        category_stats = report['category_stats']

        if not category_stats:
            print("没有支出数据可生成图表")
            return

        # 准备数据
        categories = list(category_stats.keys())
        amounts = list(category_stats.values())

        # 创建图表
        plt.figure(figsize=(8, 8))
        plt.pie(amounts, labels=categories, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')  # 确保饼图是圆的
        plt.title('类别支出分析')
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)
            print(f"图表已保存到: {save_path}")
        else:
            plt.show()

    def generate_trend_chart(
            self,
            start_date=None,
            end_date=None,
            save_path=None):
        """生成收支趋势图"""
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
        plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号

        transactions = self.get_transactions(start_date, end_date)

        if not transactions:
            print("没有数据可生成图表")
            return

        # 按日期排序
        transactions.sort(key=lambda x: x.date)

        # 准备数据
        dates = [t.date for t in transactions]
        balances = []
        current_balance = 0

        for t in transactions:
            if t.type == "收入":
                current_balance += t.amount
            else:
                current_balance -= t.amount
            balances.append(current_balance)

        # 创建图表
        plt.figure(figsize=(12, 6))
        plt.plot(dates, balances, marker='o', linestyle='-')
        plt.xlabel('日期')
        plt.ylabel('余额 (元)')
        plt.title('收支趋势')
        plt.grid(True)
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)
            print(f"图表已保存到: {save_path}")
        else:
            plt.show()


class AccountBookUI:
    """用户界面类"""

    def __init__(self, account_book):
        """初始化用户界面"""
        self.account_book = account_book

    def show_menu(self):
        """显示主菜单"""
        print("\n===== 个人记账本 =====")
        print("1. 添加交易记录")
        print("2. 查询交易记录")
        print("3. 删除交易记录")
        print("4. 查看统计报表")
        print("5. 管理类别")
        print("6. 保存数据")
        print("7. 加载数据")
        print("8. 查看当前余额")
        print("9. 生成可视化图表")
        print("0. 退出")

    def handle_input(self):
        """处理用户输入"""
        while True:
            self.show_menu()
            choice = input("请输入您的选择: ")

            if choice == "1":
                self._add_transaction()
            elif choice == "2":
                self._query_transactions()
            elif choice == "3":
                self._delete_transaction()
            elif choice == "4":
                self._show_report()
            elif choice == "5":
                self._manage_categories()
            elif choice == "6":
                self._save_data()
            elif choice == "7":
                self._load_data()
            elif choice == "8":
                self._show_balance()
            elif choice == "9":
                self._generate_charts()
            elif choice == "0":
                print("谢谢使用，再见！")
                break
            else:
                print("无效的选择，请重新输入。")

    def _add_transaction(self):
        """添加交易记录"""
        try:
            date = input("请输入交易日期 (YYYY-MM-DD): ")
            type = input("请输入交易类型 (收入/支出): ")
            amount = float(input("请输入交易金额: "))

            # 显示可用类别
            print("可用类别:")
            for category in self.account_book.categories:
                if category.type == type:
                    print(f"  - {category.name}")

            category = input("请输入交易类别: ")
            description = input("请输入交易描述: ")

            transaction = self.account_book.add_transaction(
                date, type, amount, category, description)
            print(f"交易记录添加成功: {transaction}")
        except Exception as e:
            print(f"添加失败: {e}")

    def _query_transactions(self):
        """查询交易记录"""
        start_date = input("请输入开始日期 (YYYY-MM-DD, 按回车跳过): ") or None
        end_date = input("请输入结束日期 (YYYY-MM-DD, 按回车跳过): ") or None
        type = input("请输入交易类型 (收入/支出, 按回车跳过): ") or None
        category = input("请输入交易类别 (按回车跳过): ") or None

        transactions = self.account_book.get_transactions(
            start_date, end_date, type, category)
        print(f"\n查询结果 ({len(transactions)} 条):")
        for transaction in transactions:
            print(transaction)

    def _delete_transaction(self):
        """删除交易记录"""
        transaction_id = int(input("请输入要删除的交易ID: "))
        success = self.account_book.remove_transaction(transaction_id)
        if success:
            print("交易记录删除成功")
        else:
            print("交易记录不存在")

    def _show_report(self):
        """显示统计报表"""
        start_date = input("请输入开始日期 (YYYY-MM-DD, 按回车跳过): ") or None
        end_date = input("请输入结束日期 (YYYY-MM-DD, 按回车跳过): ") or None

        report = self.account_book.generate_report(start_date, end_date)
        print("\n===== 统计报表 =====")
        print(f"当前余额: {report['balance']}")
        print(f"交易总笔数: {report['total_transactions']}")

        print("\n月度收支统计:")
        for month, stats in report['monthly_stats'].items():
            print(f"  {month}: 收入={stats['收入']}, 支出={stats['支出']}")

        print("\n类别支出分析:")
        for category, amount in report['category_stats'].items():
            print(f"  {category}: {amount}")

    def _manage_categories(self):
        """管理类别"""
        print("\n===== 类别管理 =====")
        print("1. 查看所有类别")
        print("2. 添加类别")
        print("3. 返回主菜单")

        choice = input("请输入您的选择: ")
        if choice == "1":
            print("\n所有类别:")
            for category in self.account_book.categories:
                print(category)
        elif choice == "2":
            try:
                name = input("请输入类别名称: ")
                type = input("请输入类别类型 (收入/支出): ")
                parent_name = input("请输入父类别名称 (按回车跳过): ") or None

                parent = None
                if parent_name:
                    for category in self.account_book.categories:
                        if category.name == parent_name and category.type == type:
                            parent = category
                            break
                    if not parent:
                        print("父类别不存在")
                        return

                category = Category(name, type, parent)
                if category.is_valid():
                    category.id = len(self.account_book.categories) + 1
                    self.account_book.categories.append(category)
                    print(f"类别添加成功: {category}")
                else:
                    print("类别信息无效")
            except Exception as e:
                print(f"添加失败: {e}")

    def _save_data(self):
        """保存数据"""
        filename = input(
            "请输入保存文件名 (默认为account_book.json): ") or "account_book.json"
        self.account_book.save_to_file(filename)
        print(f"数据保存成功到 {filename}")

    def _load_data(self):
        """加载数据"""
        filename = input(
            "请输入加载文件名 (默认为account_book.json): ") or "account_book.json"
        self.account_book.load_from_file(filename)
        print(f"数据加载成功从 {filename}")

    def _show_balance(self):
        """查看当前余额"""
        balance = self.account_book.calculate_balance()
        print(f"当前余额: {balance}")

    def _generate_charts(self):
        """生成可视化图表"""
        print("\n===== 生成可视化图表 =====")
        print("1. 月度收支对比图表")
        print("2. 类别支出饼图")
        print("3. 收支趋势图")
        print("4. 返回主菜单")

        chart_choice = input("请输入您的选择: ")

        if chart_choice == "1":
            start_date = input("请输入开始日期 (YYYY-MM-DD, 按回车跳过): ") or None
            end_date = input("请输入结束日期 (YYYY-MM-DD, 按回车跳过): ") or None
            save_path = input("请输入保存路径 (按回车直接显示): ") or None
            self.account_book.generate_monthly_chart(
                start_date, end_date, save_path)
        elif chart_choice == "2":
            start_date = input("请输入开始日期 (YYYY-MM-DD, 按回车跳过): ") or None
            end_date = input("请输入结束日期 (YYYY-MM-DD, 按回车跳过): ") or None
            save_path = input("请输入保存路径 (按回车直接显示): ") or None
            self.account_book.generate_category_chart(
                start_date, end_date, save_path)
        elif chart_choice == "3":
            start_date = input("请输入开始日期 (YYYY-MM-DD, 按回车跳过): ") or None
            end_date = input("请输入结束日期 (YYYY-MM-DD, 按回车跳过): ") or None
            save_path = input("请输入保存路径 (按回车直接显示): ") or None
            self.account_book.generate_trend_chart(
                start_date, end_date, save_path)
        elif chart_choice == "4":
            return
        else:
            print("无效的选择，请重新输入。")
            self._generate_charts()


# 主程序
if __name__ == "__main__":
    # 初始化记账本
    account_book = AccountBook()

    # 初始化用户界面
    ui = AccountBookUI(account_book)

    # 启动用户界面
    ui.handle_input()
