# 个人记账本PyQt5图形化界面程序
# 基于PEP8规范编写

from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QLineEdit, QComboBox, QTextEdit,
    QTableWidget, QTableWidgetItem, QDialog, QDateEdit,
    QRadioButton, QGroupBox, QGridLayout, QMessageBox,
    QAction, QStatusBar, QTabWidget,
    QSpinBox, QDoubleSpinBox, QFormLayout, QInputDialog
)
from PyQt5.QtCore import Qt, QDate
from PyQt5.QtGui import QFont
import sys

from AccountBook.AccountBook import AccountBook, DBConfig


class AccountBookPyQtGUI(QMainWindow):
    """记账本PyQt5图形化界面主类"""

    def __init__(self):
        """初始化图形化界面"""
        super().__init__()
        self.setWindowTitle("个人记账本 - PyQt5")
        self.setGeometry(100, 100, 1000, 700)

        # 初始化数据库配置
        self.db_config = None
        self.account_book = AccountBook()

        self.setup_ui()
        self.update_balance_display()

    def setup_ui(self):
        """设置用户界面"""
        self.create_menu_bar()
        self.create_main_layout()
        self.create_status_bar()

    def create_menu_bar(self):
        """创建菜单栏"""
        menubar = self.menuBar()

        # 文件菜单
        file_menu = menubar.addMenu("文件")

        save_action = QAction("保存数据", self)
        save_action.triggered.connect(self.save_data)
        file_menu.addAction(save_action)

        load_action = QAction("加载数据", self)
        load_action.triggered.connect(self.load_data)
        file_menu.addAction(load_action)

        db_config_action = QAction("数据库配置", self)
        db_config_action.triggered.connect(self.db_config_dialog)
        file_menu.addAction(db_config_action)

        file_menu.addSeparator()

        exit_action = QAction("退出", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # 交易菜单
        transaction_menu = menubar.addMenu("交易")

        add_transaction_action = QAction("添加交易", self)
        add_transaction_action.triggered.connect(self.add_transaction_dialog)
        transaction_menu.addAction(add_transaction_action)

        query_transaction_action = QAction("查询交易", self)
        query_transaction_action.triggered.connect(
            self.query_transaction_dialog)
        transaction_menu.addAction(query_transaction_action)

        delete_transaction_action = QAction("删除交易", self)
        delete_transaction_action.triggered.connect(
            self.delete_transaction_dialog)
        transaction_menu.addAction(delete_transaction_action)

        # 报表菜单
        report_menu = menubar.addMenu("报表")

        report_action = QAction("统计报表", self)
        report_action.triggered.connect(self.show_report_dialog)
        report_menu.addAction(report_action)

        chart_action = QAction("生成可视化图表", self)
        chart_action.triggered.connect(self.generate_chart_dialog)
        report_menu.addAction(chart_action)

        balance_action = QAction("查看余额", self)
        balance_action.triggered.connect(self.update_balance_display)
        report_menu.addAction(balance_action)

        # 类别菜单
        category_menu = menubar.addMenu("类别")

        view_category_action = QAction("查看类别", self)
        view_category_action.triggered.connect(self.view_category_dialog)
        category_menu.addAction(view_category_action)

        add_category_action = QAction("添加类别", self)
        add_category_action.triggered.connect(self.add_category_dialog)
        category_menu.addAction(add_category_action)

    def create_main_layout(self):
        """创建主布局"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QVBoxLayout(central_widget)

        # 标题和余额显示
        title_label = QLabel("个人记账本")
        title_label.setFont(QFont("Arial", 20, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(title_label)

        self.balance_label = QLabel("当前余额: ¥0.00")
        self.balance_label.setFont(QFont("Arial", 14))
        self.balance_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.balance_label)

        # 按钮区域
        button_layout = QHBoxLayout()
        button_layout.setSpacing(10)

        add_trans_btn = QPushButton("添加交易")
        add_trans_btn.setFixedWidth(120)
        add_trans_btn.clicked.connect(self.add_transaction_dialog)
        button_layout.addWidget(add_trans_btn)

        query_trans_btn = QPushButton("查询交易")
        query_trans_btn.setFixedWidth(120)
        query_trans_btn.clicked.connect(self.query_transaction_dialog)
        button_layout.addWidget(query_trans_btn)

        report_btn = QPushButton("统计报表")
        report_btn.setFixedWidth(120)
        report_btn.clicked.connect(self.show_report_dialog)
        button_layout.addWidget(report_btn)

        category_btn = QPushButton("管理类别")
        category_btn.setFixedWidth(120)
        category_btn.clicked.connect(self.view_category_dialog)
        button_layout.addWidget(category_btn)

        save_btn = QPushButton("保存数据")
        save_btn.setFixedWidth(120)
        save_btn.clicked.connect(self.save_data)
        button_layout.addWidget(save_btn)

        load_btn = QPushButton("加载数据")
        load_btn.setFixedWidth(120)
        load_btn.clicked.connect(self.load_data)
        button_layout.addWidget(load_btn)

        main_layout.addLayout(button_layout)

        # 交易记录表格
        self.transaction_table = QTableWidget()
        self.transaction_table.setColumnCount(6)
        self.transaction_table.setHorizontalHeaderLabels(
            ["ID", "日期", "类型", "金额", "类别", "描述"])
        self.transaction_table.setColumnWidth(0, 50)
        self.transaction_table.setColumnWidth(1, 100)
        self.transaction_table.setColumnWidth(2, 80)
        self.transaction_table.setColumnWidth(3, 100)
        self.transaction_table.setColumnWidth(4, 100)
        self.transaction_table.setColumnWidth(5, 300)
        main_layout.addWidget(self.transaction_table)

        self.refresh_transaction_table()

    def create_status_bar(self):
        """创建状态栏"""
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.update_status("就绪")

    def update_status(self, message):
        """更新状态栏"""
        self.status_bar.showMessage(message)

    def update_balance_display(self):
        """更新余额显示"""
        balance = self.account_book.calculate_balance()
        self.balance_label.setText(f"当前余额: ¥{balance:.2f}")

    def refresh_transaction_table(self, transactions=None):
        """刷新交易表格"""
        self.transaction_table.setRowCount(0)

        if transactions is None:
            transactions = self.account_book.transactions

        for transaction in transactions:
            row_position = self.transaction_table.rowCount()
            self.transaction_table.insertRow(row_position)

            self.transaction_table.setItem(
                row_position, 0, QTableWidgetItem(str(transaction.id)))
            self.transaction_table.setItem(
                row_position, 1, QTableWidgetItem(str(transaction.date)))
            self.transaction_table.setItem(
                row_position, 2, QTableWidgetItem(
                    transaction.type))
            self.transaction_table.setItem(
                row_position, 3, QTableWidgetItem(f"¥{transaction.amount:.2f}"))
            self.transaction_table.setItem(
                row_position, 4, QTableWidgetItem(
                    transaction.category))
            self.transaction_table.setItem(
                row_position, 5, QTableWidgetItem(
                    transaction.description))

    def db_config_dialog(self):
        """数据库配置对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("数据库配置")
        dialog.setGeometry(300, 300, 400, 300)

        layout = QVBoxLayout(dialog)

        form_layout = QFormLayout()

        self.host_edit = QLineEdit("localhost")
        self.user_edit = QLineEdit("root")
        self.password_edit = QLineEdit()
        self.password_edit.setEchoMode(QLineEdit.Password)
        self.database_edit = QLineEdit("account_book")
        self.port_spin = QSpinBox()
        self.port_spin.setRange(1, 65535)
        self.port_spin.setValue(3306)

        form_layout.addRow("主机:", self.host_edit)
        form_layout.addRow("用户名:", self.user_edit)
        form_layout.addRow("密码:", self.password_edit)
        form_layout.addRow("数据库:", self.database_edit)
        form_layout.addRow("端口:", self.port_spin)

        layout.addLayout(form_layout)

        button_layout = QHBoxLayout()

        ok_btn = QPushButton("确定")
        ok_btn.clicked.connect(lambda: self.save_db_config(dialog))
        button_layout.addWidget(ok_btn)

        cancel_btn = QPushButton("取消")
        cancel_btn.clicked.connect(dialog.close)
        button_layout.addWidget(cancel_btn)

        layout.addLayout(button_layout)

        dialog.exec_()

    def save_db_config(self, dialog):
        """保存数据库配置"""
        try:
            host = self.host_edit.text()
            user = self.user_edit.text()
            password = self.password_edit.text()
            database = self.database_edit.text()
            port = self.port_spin.value()

            self.db_config = DBConfig(host, user, password, database, port)

            # 关闭旧连接
            if hasattr(self.account_book, 'close_connection'):
                self.account_book.close_connection()

            # 重新初始化AccountBook
            self.account_book = AccountBook(self.db_config)
            self.refresh_transaction_table()
            self.update_balance_display()

            QMessageBox.information(self, "成功", "数据库配置成功")
            self.update_status("数据库连接成功")
            dialog.close()
        except Exception as e:
            QMessageBox.critical(self, "错误", f"数据库配置失败: {e}")
            self.update_status(f"数据库配置失败: {e}")

    def add_transaction_dialog(self):
        """添加交易对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("添加交易")
        dialog.setGeometry(300, 300, 500, 350)

        layout = QVBoxLayout(dialog)

        form_layout = QFormLayout()

        # 日期
        self.date_edit = QDateEdit()
        self.date_edit.setDate(QDate.currentDate())
        self.date_edit.setCalendarPopup(True)
        form_layout.addRow("日期:", self.date_edit)

        # 类型
        type_group = QGroupBox("交易类型")
        type_layout = QHBoxLayout()
        self.type_income = QRadioButton("收入")
        self.type_expense = QRadioButton("支出")
        self.type_expense.setChecked(True)
        type_layout.addWidget(self.type_income)
        type_layout.addWidget(self.type_expense)
        type_group.setLayout(type_layout)
        form_layout.addRow(type_group)

        # 金额
        self.amount_edit = QDoubleSpinBox()
        self.amount_edit.setRange(0.01, 9999999.99)
        self.amount_edit.setDecimals(2)
        form_layout.addRow("金额:", self.amount_edit)

        # 类别
        self.category_combo = QComboBox()
        self.update_category_combo()
        self.type_income.toggled.connect(self.update_category_combo)
        self.type_expense.toggled.connect(self.update_category_combo)
        form_layout.addRow("类别:", self.category_combo)

        # 描述
        self.description_edit = QTextEdit()
        form_layout.addRow("描述:", self.description_edit)

        layout.addLayout(form_layout)

        button_layout = QHBoxLayout()

        ok_btn = QPushButton("确定")
        ok_btn.clicked.connect(lambda: self.save_transaction(dialog))
        button_layout.addWidget(ok_btn)

        cancel_btn = QPushButton("取消")
        cancel_btn.clicked.connect(dialog.close)
        button_layout.addWidget(cancel_btn)

        layout.addLayout(button_layout)

        dialog.exec_()

    def update_category_combo(self):
        """更新类别下拉框"""
        self.category_combo.clear()

        if self.type_income.isChecked():
            categories = [
                c.name for c in self.account_book.categories if c.type == "收入"]
        else:
            categories = [
                c.name for c in self.account_book.categories if c.type == "支出"]

        self.category_combo.addItems(categories)

    def save_transaction(self, dialog):
        """保存交易"""
        try:
            date = self.date_edit.date().toString("yyyy-MM-dd")
            trans_type = "收入" if self.type_income.isChecked() else "支出"
            amount = self.amount_edit.value()
            category = self.category_combo.currentText()
            description = self.description_edit.toPlainText()

            if not category:
                QMessageBox.warning(self, "警告", "请选择交易类别")
                return

            self.account_book.add_transaction(
                date, trans_type, amount, category, description)
            self.refresh_transaction_table()
            self.update_balance_display()

            QMessageBox.information(self, "成功", "交易添加成功")
            self.update_status("交易添加成功")
            dialog.close()
        except Exception as e:
            QMessageBox.critical(self, "错误", f"添加失败: {e}")
            self.update_status(f"添加失败: {e}")

    def query_transaction_dialog(self):
        """查询交易对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("查询交易")
        dialog.setGeometry(300, 300, 600, 400)

        layout = QVBoxLayout(dialog)

        # 查询条件
        query_group = QGroupBox("查询条件")
        query_layout = QGridLayout()

        start_date_label = QLabel("开始日期:")
        self.start_date_edit = QDateEdit()
        self.start_date_edit.setCalendarPopup(True)

        end_date_label = QLabel("结束日期:")
        self.end_date_edit = QDateEdit()
        self.end_date_edit.setCalendarPopup(True)

        type_label = QLabel("类型:")
        self.type_combo = QComboBox()
        self.type_combo.addItems(["全部", "收入", "支出"])

        category_label = QLabel("类别:")
        self.query_category_combo = QComboBox()
        self.query_category_combo.addItem("全部")
        all_categories = [c.name for c in self.account_book.categories]
        self.query_category_combo.addItems(all_categories)

        query_layout.addWidget(start_date_label, 0, 0)
        query_layout.addWidget(self.start_date_edit, 0, 1)
        query_layout.addWidget(end_date_label, 0, 2)
        query_layout.addWidget(self.end_date_edit, 0, 3)
        query_layout.addWidget(type_label, 1, 0)
        query_layout.addWidget(self.type_combo, 1, 1)
        query_layout.addWidget(category_label, 1, 2)
        query_layout.addWidget(self.query_category_combo, 1, 3)

        query_group.setLayout(query_layout)
        layout.addWidget(query_group)

        # 查询按钮
        query_btn = QPushButton("查询")
        query_btn.clicked.connect(self.do_query)
        layout.addWidget(query_btn)

        # 结果表格
        self.result_table = QTableWidget()
        self.result_table.setColumnCount(6)
        self.result_table.setHorizontalHeaderLabels(
            ["ID", "日期", "类型", "金额", "类别", "描述"])
        self.result_table.setColumnWidth(0, 50)
        self.result_table.setColumnWidth(1, 100)
        self.result_table.setColumnWidth(2, 80)
        self.result_table.setColumnWidth(3, 100)
        self.result_table.setColumnWidth(4, 100)
        self.result_table.setColumnWidth(5, 200)
        layout.addWidget(self.result_table)

        # 关闭按钮
        close_btn = QPushButton("关闭")
        close_btn.clicked.connect(dialog.close)
        layout.addWidget(close_btn)

        dialog.exec_()

    def do_query(self):
        """执行查询"""
        try:
            start_date = self.start_date_edit.date().toString(
                "yyyy-MM-dd") if self.start_date_edit.date().isValid() else None
            end_date = self.end_date_edit.date().toString(
                "yyyy-MM-dd") if self.end_date_edit.date().isValid() else None

            trans_type = self.type_combo.currentText()
            if trans_type == "全部":
                trans_type = None

            category = self.query_category_combo.currentText()
            if category == "全部":
                category = None

            transactions = self.account_book.get_transactions(
                start_date, end_date, trans_type, category)

            self.result_table.setRowCount(0)
            for transaction in transactions:
                row_position = self.result_table.rowCount()
                self.result_table.insertRow(row_position)

                self.result_table.setItem(
                    row_position, 0, QTableWidgetItem(str(transaction.id)))
                self.result_table.setItem(
                    row_position, 1, QTableWidgetItem(str(transaction.date)))
                self.result_table.setItem(
                    row_position, 2, QTableWidgetItem(
                        transaction.type))
                self.result_table.setItem(
                    row_position, 3, QTableWidgetItem(f"¥{transaction.amount:.2f}"))
                self.result_table.setItem(
                    row_position, 4, QTableWidgetItem(
                        transaction.category))
                self.result_table.setItem(
                    row_position, 5, QTableWidgetItem(
                        transaction.description))

            self.update_status(f"查询完成，找到 {len(transactions)} 条记录")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"查询失败: {e}")
            self.update_status(f"查询失败: {e}")

    def delete_transaction_dialog(self):
        """删除交易对话框"""
        transaction_id, ok = QInputDialog.getInt(
            self, "删除交易", "请输入要删除的交易ID:", min=1)

        if ok:
            try:
                success = self.account_book.remove_transaction(transaction_id)
                if success:
                    self.refresh_transaction_table()
                    self.update_balance_display()
                    QMessageBox.information(self, "成功", "交易删除成功")
                    self.update_status(f"交易 {transaction_id} 删除成功")
                else:
                    QMessageBox.warning(self, "警告", "交易记录不存在")
                    self.update_status(f"交易 {transaction_id} 不存在")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"删除失败: {e}")
                self.update_status(f"删除失败: {e}")

    def view_category_dialog(self):
        """查看类别对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("类别管理")
        dialog.setGeometry(300, 300, 500, 400)

        layout = QVBoxLayout(dialog)

        tab_widget = QTabWidget()

        # 收入类别
        income_tab = QWidget()
        income_layout = QVBoxLayout(income_tab)
        income_categories = [
            c for c in self.account_book.categories if c.type == "收入"]
        income_list = QTableWidget()
        income_list.setColumnCount(3)
        income_list.setHorizontalHeaderLabels(["ID", "名称", "父类别"])
        income_list.setColumnWidth(0, 50)
        income_list.setColumnWidth(1, 200)
        income_list.setColumnWidth(2, 200)

        for category in income_categories:
            row = income_list.rowCount()
            income_list.insertRow(row)
            income_list.setItem(row, 0, QTableWidgetItem(str(category.id)))
            income_list.setItem(row, 1, QTableWidgetItem(category.name))
            parent_name = category.parent.name if category.parent else "无"
            income_list.setItem(row, 2, QTableWidgetItem(parent_name))

        income_layout.addWidget(income_list)
        tab_widget.addTab(income_tab, "收入类别")

        # 支出类别
        expense_tab = QWidget()
        expense_layout = QVBoxLayout(expense_tab)
        expense_categories = [
            c for c in self.account_book.categories if c.type == "支出"]
        expense_list = QTableWidget()
        expense_list.setColumnCount(3)
        expense_list.setHorizontalHeaderLabels(["ID", "名称", "父类别"])
        expense_list.setColumnWidth(0, 50)
        expense_list.setColumnWidth(1, 200)
        expense_list.setColumnWidth(2, 200)

        for category in expense_categories:
            row = expense_list.rowCount()
            expense_list.insertRow(row)
            expense_list.setItem(row, 0, QTableWidgetItem(str(category.id)))
            expense_list.setItem(row, 1, QTableWidgetItem(category.name))
            parent_name = category.parent.name if category.parent else "无"
            expense_list.setItem(row, 2, QTableWidgetItem(parent_name))

        expense_layout.addWidget(expense_list)
        tab_widget.addTab(expense_tab, "支出类别")

        layout.addWidget(tab_widget)

        button_layout = QHBoxLayout()

        add_btn = QPushButton("添加类别")
        add_btn.clicked.connect(
            lambda: [
                dialog.close(),
                self.add_category_dialog()])
        button_layout.addWidget(add_btn)

        close_btn = QPushButton("关闭")
        close_btn.clicked.connect(dialog.close)
        button_layout.addWidget(close_btn)

        layout.addLayout(button_layout)

        dialog.exec_()

    def add_category_dialog(self):
        """添加类别对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("添加类别")
        dialog.setGeometry(300, 300, 400, 250)

        layout = QVBoxLayout(dialog)

        form_layout = QFormLayout()

        # 名称
        self.category_name_edit = QLineEdit()
        form_layout.addRow("类别名称:", self.category_name_edit)

        # 类型
        type_group = QGroupBox("类别类型")
        type_layout = QHBoxLayout()
        self.cat_type_income = QRadioButton("收入")
        self.cat_type_expense = QRadioButton("支出")
        self.cat_type_expense.setChecked(True)
        type_layout.addWidget(self.cat_type_income)
        type_layout.addWidget(self.cat_type_expense)
        type_group.setLayout(type_layout)
        form_layout.addRow(type_group)

        # 父类别
        self.parent_combo = QComboBox()
        self.update_parent_combo()
        self.cat_type_income.toggled.connect(self.update_parent_combo)
        self.cat_type_expense.toggled.connect(self.update_parent_combo)
        form_layout.addRow("父类别:", self.parent_combo)

        layout.addLayout(form_layout)

        button_layout = QHBoxLayout()

        ok_btn = QPushButton("确定")
        ok_btn.clicked.connect(lambda: self.save_category(dialog))
        button_layout.addWidget(ok_btn)

        cancel_btn = QPushButton("取消")
        cancel_btn.clicked.connect(dialog.close)
        button_layout.addWidget(cancel_btn)

        layout.addLayout(button_layout)

        dialog.exec_()

    def update_parent_combo(self):
        """更新父类别下拉框"""
        self.parent_combo.clear()
        self.parent_combo.addItem("无")

        if self.cat_type_income.isChecked():
            categories = [
                c for c in self.account_book.categories if c.type == "收入"]
        else:
            categories = [
                c for c in self.account_book.categories if c.type == "支出"]

        for category in categories:
            self.parent_combo.addItem(category.name, category)

    def save_category(self, dialog):
        """保存类别"""
        try:
            name = self.category_name_edit.text()
            if not name:
                QMessageBox.warning(self, "警告", "请输入类别名称")
                return

            cat_type = "收入" if self.cat_type_income.isChecked() else "支出"
            parent_index = self.parent_combo.currentIndex()
            parent = self.parent_combo.itemData(
                parent_index) if parent_index > 0 else None

            from AccountBook.AccountBook import Category
            category = Category(name, cat_type, parent)
            if category.is_valid():
                category.id = len(self.account_book.categories) + 1
                self.account_book.categories.append(category)

                # 保存到数据库
                if self.db_config:
                    self.account_book.save_categories_to_database()

                QMessageBox.information(self, "成功", "类别添加成功")
                self.update_status(f"类别 '{name}' 添加成功")
                dialog.close()
            else:
                QMessageBox.critical(self, "错误", "类别信息无效")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"添加失败: {e}")
            self.update_status(f"添加失败: {e}")

    def show_report_dialog(self):
        """显示统计报表对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("统计报表")
        dialog.setGeometry(300, 200, 600, 500)

        layout = QVBoxLayout(dialog)

        # 日期范围
        date_group = QGroupBox("日期范围")
        date_layout = QHBoxLayout()

        start_date_label = QLabel("开始日期:")
        self.report_start_date = QDateEdit()
        self.report_start_date.setCalendarPopup(True)

        end_date_label = QLabel("结束日期:")
        self.report_end_date = QDateEdit()
        self.report_end_date.setCalendarPopup(True)

        date_layout.addWidget(start_date_label)
        date_layout.addWidget(self.report_start_date)
        date_layout.addWidget(end_date_label)
        date_layout.addWidget(self.report_end_date)

        date_group.setLayout(date_layout)
        layout.addWidget(date_group)

        # 生成按钮
        generate_btn = QPushButton("生成报表")
        generate_btn.clicked.connect(self.generate_report)
        layout.addWidget(generate_btn)

        # 报表内容
        self.report_text = QTextEdit()
        self.report_text.setReadOnly(True)
        layout.addWidget(self.report_text)

        # 关闭按钮
        close_btn = QPushButton("关闭")
        close_btn.clicked.connect(dialog.close)
        layout.addWidget(close_btn)

        dialog.exec_()

    def generate_report(self):
        """生成统计报表"""
        try:
            start_date = self.report_start_date.date().toString(
                "yyyy-MM-dd") if self.report_start_date.date().isValid() else None
            end_date = self.report_end_date.date().toString(
                "yyyy-MM-dd") if self.report_end_date.date().isValid() else None

            report = self.account_book.generate_report(start_date, end_date)

            report_text = "===== 统计报表 =====\n"
            report_text += f"当前余额: ¥{report['balance']:.2f}\n"
            report_text += f"交易总笔数: {report['total_transactions']}\n\n"

            report_text += "月度收支统计:\n"
            for month, stats in report['monthly_stats'].items():
                report_text += f"{month}: 收入 ¥{
                    stats['收入']:.2f}, 支出 ¥{
                    stats['支出']:.2f}\n"

            report_text += "\n类别支出分析:\n"
            for category, amount in report['category_stats'].items():
                report_text += f"{category}: ¥{amount:.2f}\n"

            self.report_text.setText(report_text)
            self.update_status("报表生成成功")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"生成报表失败: {e}")
            self.update_status(f"生成报表失败: {e}")

    def generate_chart_dialog(self):
        """生成可视化图表对话框"""
        dialog = QDialog(self)
        dialog.setWindowTitle("生成可视化图表")
        dialog.setGeometry(300, 200, 500, 400)

        layout = QVBoxLayout(dialog)

        # 图表类型
        chart_group = QGroupBox("图表类型")
        chart_layout = QVBoxLayout()

        self.chart_type = QComboBox()
        self.chart_type.addItems(["月度收支对比", "类别支出饼图", "收支趋势图"])
        chart_layout.addWidget(self.chart_type)
        chart_group.setLayout(chart_layout)
        layout.addWidget(chart_group)

        # 日期范围
        date_group = QGroupBox("日期范围")
        date_layout = QHBoxLayout()

        start_date_label = QLabel("开始日期:")
        self.chart_start_date = QDateEdit()
        self.chart_start_date.setCalendarPopup(True)

        end_date_label = QLabel("结束日期:")
        self.chart_end_date = QDateEdit()
        self.chart_end_date.setCalendarPopup(True)

        date_layout.addWidget(start_date_label)
        date_layout.addWidget(self.chart_start_date)
        date_layout.addWidget(end_date_label)
        date_layout.addWidget(self.chart_end_date)

        date_group.setLayout(date_layout)
        layout.addWidget(date_group)

        # 保存选项
        save_group = QGroupBox("保存选项")
        save_layout = QVBoxLayout()

        self.save_checkbox = QRadioButton("保存到文件")
        self.show_checkbox = QRadioButton("直接显示")
        self.show_checkbox.setChecked(True)

        self.save_path_edit = QLineEdit("chart.png")
        self.save_path_edit.setEnabled(False)

        self.save_checkbox.toggled.connect(
            lambda checked: self.save_path_edit.setEnabled(checked))

        save_layout.addWidget(self.save_checkbox)
        save_layout.addWidget(self.show_checkbox)
        save_layout.addWidget(QLabel("保存路径:"))
        save_layout.addWidget(self.save_path_edit)
        save_group.setLayout(save_layout)
        layout.addWidget(save_group)

        # 生成按钮
        generate_btn = QPushButton("生成图表")
        generate_btn.clicked.connect(self.generate_chart)
        layout.addWidget(generate_btn)

        # 关闭按钮
        close_btn = QPushButton("关闭")
        close_btn.clicked.connect(dialog.close)
        layout.addWidget(close_btn)

        dialog.exec_()

    def generate_chart(self):
        """生成图表"""
        try:
            start_date = self.chart_start_date.date().toString(
                "yyyy-MM-dd") if self.chart_start_date.date().isValid() else None
            end_date = self.chart_end_date.date().toString(
                "yyyy-MM-dd") if self.chart_end_date.date().isValid() else None

            chart_type = self.chart_type.currentIndex()
            save_path = self.save_path_edit.text() if self.save_checkbox.isChecked() else None

            if chart_type == 0:
                self.account_book.generate_monthly_chart(
                    start_date, end_date, save_path)
            elif chart_type == 1:
                self.account_book.generate_category_chart(
                    start_date, end_date, save_path)
            elif chart_type == 2:
                self.account_book.generate_trend_chart(
                    start_date, end_date, save_path)

            if save_path:
                QMessageBox.information(self, "成功", f"图表已保存到: {save_path}")
            else:
                QMessageBox.information(self, "成功", "图表已生成并显示")

            self.update_status("图表生成成功")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"生成图表失败: {e}")
            self.update_status(f"生成图表失败: {e}")

    def save_data(self):
        """保存数据"""
        try:
            if self.db_config:
                self.account_book.save_to_database()
                QMessageBox.information(self, "成功", "数据保存到数据库成功")
            else:
                # 保存到文件
                filename, ok = QInputDialog.getText(
                    self, "保存数据", "请输入保存文件名:", text="account_book.json")
                if ok:
                    self.account_book.save_to_file(filename)
                    QMessageBox.information(self, "成功", f"数据保存成功到: {filename}")

            self.update_status("数据保存成功")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"保存失败: {e}")
            self.update_status(f"保存失败: {e}")

    def load_data(self):
        """加载数据"""
        try:
            if self.db_config:
                self.account_book.load_from_database()
                self.refresh_transaction_table()
                self.update_balance_display()
                QMessageBox.information(self, "成功", "数据从数据库加载成功")
            else:
                # 从文件加载
                filename, ok = QInputDialog.getText(
                    self, "加载数据", "请输入加载文件名:", text="account_book.json")
                if ok:
                    self.account_book.load_from_file(filename)
                    self.refresh_transaction_table()
                    self.update_balance_display()
                    QMessageBox.information(self, "成功", "数据加载成功")

            self.update_status("数据加载成功")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"加载失败: {e}")
            self.update_status(f"加载失败: {e}")

    def closeEvent(self, event):
        """关闭窗口时的处理"""
        if hasattr(self.account_book, 'close_connection'):
            self.account_book.close_connection()
        event.accept()


def main():
    """主函数"""
    app = QApplication(sys.argv)
    window = AccountBookPyQtGUI()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
