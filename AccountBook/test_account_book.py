"""
自动化测试文件
测试AccountBook的核心功能
"""
import unittest
import tempfile
import os
from AccountBook.AccountBook import Transaction, Category, AccountBook


class TestAccountBook(unittest.TestCase):
    """测试AccountBook类"""

    def setUp(self):
        """设置测试环境"""
        self.account_book = AccountBook()

    def test_add_transaction(self):
        """测试添加交易记录"""
        # 添加收入
        transaction1 = self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.assertEqual(transaction1.id, 1)
        self.assertEqual(transaction1.type, "收入")
        self.assertEqual(transaction1.amount, 1000)

        # 添加支出
        transaction2 = self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )
        self.assertEqual(transaction2.id, 2)
        self.assertEqual(transaction2.type, "支出")
        self.assertEqual(transaction2.amount, 200)

        # 验证交易记录数量
        self.assertEqual(len(self.account_book.transactions), 2)

    def test_remove_transaction(self):
        """测试删除交易记录"""
        # 添加交易
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )

        # 删除存在的交易
        success = self.account_book.remove_transaction(1)
        self.assertTrue(success)
        self.assertEqual(len(self.account_book.transactions), 1)

        # 删除不存在的交易
        success = self.account_book.remove_transaction(999)
        self.assertFalse(success)

    def test_calculate_balance(self):
        """测试计算余额"""
        # 添加收入和支出
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )
        self.account_book.add_transaction(
            "2024-01-03", "支出", 300, "交通", "打车"
        )

        # 计算余额
        balance = self.account_book.calculate_balance()
        self.assertEqual(balance, 500)  # 1000 - 200 - 300

    def test_get_transactions(self):
        """测试查询交易记录"""
        # 添加交易
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )
        self.account_book.add_transaction(
            "2024-02-01", "收入", 1500, "奖金", "季度奖金"
        )

        # 测试按类型查询
        income_transactions = self.account_book.get_transactions(type="收入")
        self.assertEqual(len(income_transactions), 2)

        # 测试按类别查询
        food_transactions = self.account_book.get_transactions(category="餐饮")
        self.assertEqual(len(food_transactions), 1)

        # 测试按日期范围查询
        jan_transactions = self.account_book.get_transactions(
            start_date="2024-01-01", end_date="2024-01-31"
        )
        self.assertEqual(len(jan_transactions), 2)

    def test_generate_report(self):
        """测试生成统计报表"""
        # 添加交易
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )
        self.account_book.add_transaction(
            "2024-01-03", "支出", 300, "交通", "打车"
        )
        self.account_book.add_transaction(
            "2024-02-01", "收入", 1500, "奖金", "季度奖金"
        )

        # 生成报表
        report = self.account_book.generate_report()

        # 验证报表数据
        self.assertEqual(report['balance'], 2000)  # 1000 + 1500 - 200 - 300
        self.assertEqual(report['total_transactions'], 4)
        self.assertIn('2024-01', report['monthly_stats'])
        self.assertIn('2024-02', report['monthly_stats'])
        self.assertIn('餐饮', report['category_stats'])
        self.assertIn('交通', report['category_stats'])

    def test_save_and_load_json(self):
        """测试JSON文件保存和加载"""
        # 添加交易
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )

        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
            temp_filename = f.name

        try:
            # 保存数据
            self.account_book.save_to_file(temp_filename)

            # 创建新的AccountBook实例
            new_account_book = AccountBook()

            # 加载数据
            new_account_book.load_from_file(temp_filename)

            # 验证数据
            self.assertEqual(len(new_account_book.transactions), 2)
            self.assertEqual(new_account_book.transactions[0].amount, 1000)
            self.assertEqual(new_account_book.transactions[1].amount, 200)

        finally:
            # 清理临时文件
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    def test_save_and_load_txt(self):
        """测试TXT文件保存和加载"""
        # 添加交易
        self.account_book.add_transaction(
            "2024-01-01", "收入", 1000, "工资", "1月工资"
        )
        self.account_book.add_transaction(
            "2024-01-02", "支出", 200, "餐饮", "午餐"
        )

        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            temp_filename = f.name

        try:
            # 保存数据
            self.account_book.save_to_file(temp_filename)

            # 创建新的AccountBook实例
            new_account_book = AccountBook()

            # 加载数据
            new_account_book.load_from_file(temp_filename)

            # 验证数据
            self.assertEqual(len(new_account_book.transactions), 2)
            self.assertEqual(new_account_book.transactions[0].amount, 1000)
            self.assertEqual(new_account_book.transactions[1].amount, 200)

        finally:
            # 清理临时文件
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    def test_category_management(self):
        """测试类别管理"""
        # 验证默认类别
        self.assertEqual(len(self.account_book.categories), 8)

        # 添加新类别
        new_category = Category("医疗", "支出")
        new_category.id = len(self.account_book.categories) + 1
        self.account_book.categories.append(new_category)

        # 验证类别添加
        self.assertEqual(len(self.account_book.categories), 9)
        self.assertEqual(self.account_book.categories[-1].name, "医疗")

    def test_transaction_validation(self):
        """测试交易记录验证"""
        # 测试无效的交易类型
        with self.assertRaises(ValueError):
            transaction = Transaction("2024-01-01", "无效类型", 100, "工资", "测试")
            transaction.validate()

        # 测试无效的金额
        with self.assertRaises(ValueError):
            transaction = Transaction("2024-01-01", "收入", -100, "工资", "测试")
            transaction.validate()

        # 测试空类别
        with self.assertRaises(ValueError):
            transaction = Transaction("2024-01-01", "收入", 100, "", "测试")
            transaction.validate()

    def test_category_validation(self):
        """测试类别验证"""
        # 测试无效的类别
        invalid_category = Category("", "支出")
        self.assertFalse(invalid_category.is_valid())

        # 测试有效类别
        valid_category = Category("测试类别", "支出")
        self.assertTrue(valid_category.is_valid())


if __name__ == '__main__':
    unittest.main()
