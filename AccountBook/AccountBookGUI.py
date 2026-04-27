"""
个人记账本图形化界面程序
基于PEP8规范编写
"""
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import datetime

try:
    from AccountBook.AccountBook import Category, AccountBook
    import matplotlib
    matplotlib.use('TkAgg')
    from matplotlib.figure import Figure
    from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
    matplotlib_available = True
except ImportError as e:
    messagebox.showerror("错误", f"无法导入必要的模块: {e}")
    matplotlib_available = False
except Exception as e:
    messagebox.showerror("错误", f"初始化失败: {e}")
    raise


class AccountBookGUI:
    """记账本图形化界面主类"""

    def __init__(self, root):
        """初始化图形化界面"""
        self.root = root
        self.root.title("个人记账本")
        self.root.geometry("900x600")
        self.root.resizable(True, True)

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
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="文件", menu=file_menu)
        file_menu.add_command(label="保存数据", command=self.save_data)
        file_menu.add_command(label="加载数据", command=self.load_data)
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.root.quit)

        transaction_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="交易", menu=transaction_menu)
        transaction_menu.add_command(
            label="添加交易",
            command=self.add_transaction_gui
        )
        transaction_menu.add_command(
            label="查询交易",
            command=self.query_transactions_gui
        )
        transaction_menu.add_command(
            label="删除交易",
            command=self.delete_transaction_gui
        )

        report_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="报表", menu=report_menu)
        report_menu.add_command(
            label="统计报表",
            command=self.show_report_gui
        )
        report_menu.add_command(
            label="生成可视化图表",
            command=self.generate_charts_gui
        )
        report_menu.add_command(
            label="查看余额",
            command=self.update_balance_display
        )

        category_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="类别", menu=category_menu)
        category_menu.add_command(
            label="查看类别",
            command=self.view_categories_gui
        )
        category_menu.add_command(
            label="添加类别",
            command=self.add_category_gui
        )

    def create_main_layout(self):
        """创建主布局"""
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

        title_label = ttk.Label(
            main_frame,
            text="个人记账本",
            font=("Arial", 20, "bold")
        )
        title_label.grid(row=0, column=0, columnspan=2, pady=20)

        self.balance_label = ttk.Label(
            main_frame,
            text="当前余额: ¥0.00",
            font=("Arial", 14)
        )
        self.balance_label.grid(row=1, column=0, columnspan=2, pady=10)

        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=2, column=0, columnspan=2, pady=20)

        ttk.Button(
            button_frame,
            text="添加交易",
            command=self.add_transaction_gui,
            width=15
        ).grid(row=0, column=0, padx=5, pady=5)

        ttk.Button(
            button_frame,
            text="查询交易",
            command=self.query_transactions_gui,
            width=15
        ).grid(row=0, column=1, padx=5, pady=5)

        ttk.Button(
            button_frame,
            text="统计报表",
            command=self.show_report_gui,
            width=15
        ).grid(row=0, column=2, padx=5, pady=5)

        ttk.Button(
            button_frame,
            text="管理类别",
            command=self.view_categories_gui,
            width=15
        ).grid(row=1, column=0, padx=5, pady=5)

        ttk.Button(
            button_frame,
            text="保存数据",
            command=self.save_data,
            width=15
        ).grid(row=1, column=1, padx=5, pady=5)

        ttk.Button(
            button_frame,
            text="加载数据",
            command=self.load_data,
            width=15
        ).grid(row=1, column=2, padx=5, pady=5)

        self.transaction_list_frame = ttk.LabelFrame(
            main_frame,
            text="最近交易记录",
            padding="10"
        )
        self.transaction_list_frame.grid(
            row=3,
            column=0,
            columnspan=2,
            sticky=(tk.W, tk.E, tk.N, tk.S),
            pady=10
        )

        main_frame.rowconfigure(3, weight=1)
        main_frame.columnconfigure(0, weight=1)

        columns = ("ID", "日期", "类型", "金额", "类别", "描述")
        self.transaction_tree = ttk.Treeview(
            self.transaction_list_frame,
            columns=columns,
            show="headings",
            height=10
        )

        for col in columns:
            self.transaction_tree.heading(col, text=col)
            self.transaction_tree.column(col, width=100)

        self.transaction_tree.column("金额", width=80)
        self.transaction_tree.column("描述", width=200)

        scrollbar = ttk.Scrollbar(
            self.transaction_list_frame,
            orient=tk.VERTICAL,
            command=self.transaction_tree.yview
        )
        self.transaction_tree.configure(yscrollcommand=scrollbar.set)

        self.transaction_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))

        self.transaction_list_frame.columnconfigure(0, weight=1)
        self.transaction_list_frame.rowconfigure(0, weight=1)

        self.refresh_transaction_list()

    def create_status_bar(self):
        """创建状态栏"""
        self.status_bar = ttk.Label(
            self.root,
            text="就绪",
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        self.status_bar.grid(row=1, column=0, sticky=(tk.W, tk.E))
        self.root.columnconfigure(0, weight=1)

    def update_status(self, message):
        """更新状态栏"""
        self.status_bar.config(text=message)
        self.root.update_idletasks()

    def update_balance_display(self):
        """更新余额显示"""
        balance = self.account_book.calculate_balance()
        self.balance_label.config(text=f"当前余额: ¥{balance:.2f}")

    def refresh_transaction_list(self, transactions=None):
        """刷新交易列表"""
        for item in self.transaction_tree.get_children():
            self.transaction_tree.delete(item)

        if transactions is None:
            transactions = self.account_book.transactions

        for trans in transactions:
            self.transaction_tree.insert(
                "",
                tk.END,
                values=(
                    trans.id,
                    trans.date,
                    trans.type,
                    f"¥{trans.amount:.2f}",
                    trans.category,
                    trans.description
                )
            )

    def add_transaction_gui(self):
        """添加交易记录的图形化界面"""
        self.update_status("正在添加交易记录...")

        dialog = tk.Toplevel(self.root)
        dialog.title("添加交易记录")
        dialog.geometry("400x400")
        dialog.transient(self.root)
        dialog.grab_set()

        ttk.Label(dialog, text="交易日期 (YYYY-MM-DD):").grid(
            row=0, column=0, sticky=tk.W, padx=10, pady=5
        )
        date_entry = ttk.Entry(dialog, width=20)
        date_entry.grid(row=0, column=1, padx=10, pady=5)
        date_entry.insert(0, datetime.date.today().strftime("%Y-%m-%d"))

        ttk.Label(dialog, text="交易类型:").grid(
            row=1, column=0, sticky=tk.W, padx=10, pady=5
        )
        type_var = tk.StringVar(value="支出")
        type_frame = ttk.Frame(dialog)
        type_frame.grid(row=1, column=1, padx=10, pady=5)
        ttk.Radiobutton(
            type_frame,
            text="收入",
            variable=type_var,
            value="收入"
        ).pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(
            type_frame,
            text="支出",
            variable=type_var,
            value="支出"
        ).pack(side=tk.LEFT, padx=5)

        ttk.Label(dialog, text="交易金额:").grid(
            row=2, column=0, sticky=tk.W, padx=10, pady=5
        )
        amount_entry = ttk.Entry(dialog, width=20)
        amount_entry.grid(row=2, column=1, padx=10, pady=5)

        ttk.Label(dialog, text="交易类别:").grid(
            row=3, column=0, sticky=tk.W, padx=10, pady=5
        )
        category_var = tk.StringVar()
        category_entry = ttk.Combobox(
            dialog,
            textvariable=category_var,
            width=18
        )
        category_entry.grid(row=3, column=1, padx=10, pady=5)

        def update_categories(*args):
            selected_type = type_var.get()
            categories = [
                c.name for c in self.account_book.categories
                if c.type == selected_type
            ]
            category_entry["values"] = categories
            if categories:
                category_entry.current(0)

        type_var.trace("w", update_categories)
        update_categories()

        ttk.Label(dialog, text="交易描述:").grid(
            row=4, column=0, sticky=tk.W, padx=10, pady=5
        )
        description_entry = tk.Text(dialog, width=20, height=4)
        description_entry.grid(row=4, column=1, padx=10, pady=5)

        def on_submit():
            try:
                date = date_entry.get()
                trans_type = type_var.get()
                amount = float(amount_entry.get())
                category = category_var.get()
                description = description_entry.get("1.0", tk.END).strip()

                if not date or not category or not description:
                    messagebox.showwarning("警告", "请填写所有必填字段")
                    return

                self.account_book.add_transaction(
                    date, trans_type, amount, category, description
                )
                self.update_balance_display()
                self.refresh_transaction_list()
                self.update_status("交易记录添加成功")
                dialog.destroy()

            except ValueError as e:
                messagebox.showerror("错误", f"输入格式错误: {e}")
            except Exception as e:
                messagebox.showerror("错误", f"添加失败: {e}")

        button_frame = ttk.Frame(dialog)
        button_frame.grid(row=5, column=0, columnspan=2, pady=20)

        ttk.Button(
            button_frame,
            text="确定",
            command=on_submit,
            width=10
        ).grid(row=0, column=0, padx=5)

        ttk.Button(
            button_frame,
            text="取消",
            command=dialog.destroy,
            width=10
        ).grid(row=0, column=1, padx=5)

        self.update_status("添加交易记录表单已打开")

    def query_transactions_gui(self):
        """查询交易记录的图形化界面"""
        self.update_status("正在查询交易记录...")

        dialog = tk.Toplevel(self.root)
        dialog.title("查询交易记录")
        dialog.geometry("500x300")
        dialog.transient(self.root)

        query_frame = ttk.LabelFrame(dialog, text="查询条件", padding="10")
        query_frame.pack(fill=tk.X, padx=10, pady=10)

        ttk.Label(query_frame, text="开始日期:").grid(
            row=0, column=0, sticky=tk.W, padx=5, pady=2
        )
        start_date_entry = ttk.Entry(query_frame, width=15)
        start_date_entry.grid(row=0, column=1, padx=5, pady=2)

        ttk.Label(query_frame, text="结束日期:").grid(
            row=0, column=2, sticky=tk.W, padx=5, pady=2
        )
        end_date_entry = ttk.Entry(query_frame, width=15)
        end_date_entry.grid(row=0, column=3, padx=5, pady=2)

        ttk.Label(query_frame, text="类型:").grid(
            row=1, column=0, sticky=tk.W, padx=5, pady=2
        )
        type_query_var = tk.StringVar()
        type_query_combo = ttk.Combobox(
            query_frame,
            textvariable=type_query_var,
            values=["全部", "收入", "支出"],
            width=12
        )
        type_query_combo.grid(row=1, column=1, padx=5, pady=2)
        type_query_combo.current(0)

        ttk.Label(query_frame, text="类别:").grid(
            row=1, column=2, sticky=tk.W, padx=5, pady=2
        )
        category_query_var = tk.StringVar()
        category_query_combo = ttk.Combobox(
            query_frame,
            textvariable=category_query_var,
            width=12
        )
        category_query_combo.grid(row=1, column=3, padx=5, pady=2)

        all_categories = [c.name for c in self.account_book.categories]
        category_query_combo["values"] = ["全部"] + all_categories
        category_query_combo.current(0)

        result_frame = ttk.LabelFrame(dialog, text="查询结果", padding="10")
        result_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        columns = ("ID", "日期", "类型", "金额", "类别", "描述")
        result_tree = ttk.Treeview(
            result_frame,
            columns=columns,
            show="headings"
        )

        for col in columns:
            result_tree.heading(col, text=col)
            result_tree.column(col, width=80)

        result_tree.column("描述", width=150)

        scrollbar = ttk.Scrollbar(result_frame, orient=tk.VERTICAL)
        scrollbar.config(command=result_tree.yview)
        result_tree.configure(yscrollcommand=scrollbar.set)

        result_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        def do_query():
            for item in result_tree.get_children():
                result_tree.delete(item)

            start_date = start_date_entry.get() or None
            end_date = end_date_entry.get() or None
            trans_type = type_query_var.get()
            if trans_type == "全部":
                trans_type = None
            category = category_query_var.get()
            if category == "全部":
                category = None

            transactions = self.account_book.get_transactions(
                start_date, end_date, trans_type, category
            )

            for trans in transactions:
                result_tree.insert(
                    "",
                    tk.END,
                    values=(
                        trans.id,
                        trans.date,
                        trans.type,
                        f"¥{trans.amount:.2f}",
                        trans.category,
                        trans.description
                    )
                )

            self.update_status(f"查询完成，找到 {len(transactions)} 条记录")

        button_frame = ttk.Frame(dialog)
        button_frame.pack(pady=10)

        ttk.Button(
            button_frame,
            text="查询",
            command=do_query,
            width=10
        ).grid(row=0, column=0, padx=5)

        ttk.Button(
            button_frame,
            text="关闭",
            command=dialog.destroy,
            width=10
        ).grid(row=0, column=1, padx=5)

        self.update_status("查询交易记录界面已打开")

    def delete_transaction_gui(self):
        """删除交易记录的图形化界面"""
        self.update_status("正在删除交易记录...")

        transaction_id = simpledialog.askinteger(
            "删除交易",
            "请输入要删除的交易ID:",
            minvalue=1
        )

        if transaction_id is None:
            self.update_status("取消删除")
            return

        success = self.account_book.remove_transaction(transaction_id)
        if success:
            self.update_balance_display()
            self.refresh_transaction_list()
            self.update_status(f"交易记录 {transaction_id} 删除成功")
            messagebox.showinfo("成功", "交易记录删除成功")
        else:
            self.update_status(f"交易记录 {transaction_id} 不存在")
            messagebox.showwarning("警告", "交易记录不存在")

    def show_report_gui(self):
        """显示统计报表的图形化界面"""
        self.update_status("正在生成统计报表...")

        dialog = tk.Toplevel(self.root)
        dialog.title("统计报表")
        dialog.geometry("600x450")
        dialog.transient(self.root)

        report = self.account_book.generate_report()

        main_frame = ttk.Frame(dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(
            main_frame,
            text="个人记账本统计报表",
            font=("Arial", 16, "bold")
        ).pack(pady=10)

        summary_frame = ttk.LabelFrame(main_frame, text="概览", padding="10")
        summary_frame.pack(fill=tk.X, pady=5)

        ttk.Label(
            summary_frame,
            text=f"当前余额: ¥{report['balance']:.2f}",
            font=("Arial", 12)
        ).pack(anchor=tk.W)

        ttk.Label(
            summary_frame,
            text=f"交易总笔数: {report['total_transactions']}",
            font=("Arial", 10)
        ).pack(anchor=tk.W)

        monthly_frame = ttk.LabelFrame(
            main_frame,
            text="月度收支统计",
            padding="10"
        )
        monthly_frame.pack(fill=tk.BOTH, expand=True, pady=5)

        monthly_tree = ttk.Treeview(
            monthly_frame,
            columns=("月份", "收入", "支出"),
            show="headings"
        )
        monthly_tree.heading("月份", text="月份")
        monthly_tree.heading("收入", text="收入")
        monthly_tree.heading("支出", text="支出")

        for col in monthly_tree["columns"]:
            monthly_tree.column(col, width=100)

        for month, stats in report["monthly_stats"].items():
            monthly_tree.insert(
                "",
                tk.END,
                values=(
                    month,
                    f"¥{stats['收入']:.2f}",
                    f"¥{stats['支出']:.2f}"
                )
            )

        monthly_tree.pack(fill=tk.BOTH, expand=True)

        category_frame = ttk.LabelFrame(
            main_frame,
            text="类别支出分析",
            padding="10"
        )
        category_frame.pack(fill=tk.BOTH, expand=True, pady=5)

        category_tree = ttk.Treeview(
            category_frame,
            columns=("类别", "支出金额"),
            show="headings"
        )
        category_tree.heading("类别", text="类别")
        category_tree.heading("支出金额", text="支出金额")

        for col in category_tree["columns"]:
            category_tree.column(col, width=150)

        for category, amount in report["category_stats"].items():
            category_tree.insert(
                "",
                tk.END,
                values=(category, f"¥{amount:.2f}")
            )

        category_tree.pack(fill=tk.BOTH, expand=True)

        ttk.Button(
            main_frame,
            text="关闭",
            command=dialog.destroy,
            width=10
        ).pack(pady=10)

        self.update_status("统计报表已生成")

    def view_categories_gui(self):
        """查看和管理类别的图形化界面"""
        self.update_status("正在打开类别管理...")

        dialog = tk.Toplevel(self.root)
        dialog.title("类别管理")
        dialog.geometry("500x400")
        dialog.transient(self.root)

        main_frame = ttk.Frame(dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(
            main_frame,
            text="类别管理",
            font=("Arial", 14, "bold")
        ).pack(pady=10)

        income_frame = ttk.LabelFrame(main_frame, text="收入类别", padding="10")
        income_frame.pack(fill=tk.X, pady=5)

        income_categories = [
            c for c in self.account_book.categories if c.type == "收入"
        ]

        if income_categories:
            for cat in income_categories:
                parent_name = cat.parent.name if cat.parent else "无"
                ttk.Label(
                    income_frame,
                    text=f"• {cat.name} (ID: {cat.id}, 父类别: {parent_name})"
                ).pack(anchor=tk.W)
        else:
            ttk.Label(income_frame, text="暂无收入类别").pack(anchor=tk.W)

        expense_frame = ttk.LabelFrame(main_frame, text="支出类别", padding="10")
        expense_frame.pack(fill=tk.X, pady=5)

        expense_categories = [
            c for c in self.account_book.categories if c.type == "支出"
        ]

        if expense_categories:
            for cat in expense_categories:
                parent_name = cat.parent.name if cat.parent else "无"
                ttk.Label(
                    expense_frame,
                    text=f"• {cat.name} (ID: {cat.id}, 父类别: {parent_name})"
                ).pack(anchor=tk.W)
        else:
            ttk.Label(expense_frame, text="暂无支出类别").pack(anchor=tk.W)

        button_frame = ttk.Frame(main_frame)
        button_frame.pack(pady=10)

        ttk.Button(
            button_frame,
            text="添加类别",
            command=lambda: [dialog.destroy(), self.add_category_gui()],
            width=10
        ).grid(row=0, column=0, padx=5)

        ttk.Button(
            button_frame,
            text="关闭",
            command=dialog.destroy,
            width=10
        ).grid(row=0, column=1, padx=5)

        self.update_status("类别管理界面已打开")

    def add_category_gui(self):
        """添加类别的图形化界面"""
        self.update_status("正在添加类别...")

        dialog = tk.Toplevel(self.root)
        dialog.title("添加类别")
        dialog.geometry("350x250")
        dialog.transient(self.root)

        ttk.Label(dialog, text="类别名称:").grid(
            row=0, column=0, sticky=tk.W, padx=10, pady=5
        )
        name_entry = ttk.Entry(dialog, width=20)
        name_entry.grid(row=0, column=1, padx=10, pady=5)

        ttk.Label(dialog, text="类别类型:").grid(
            row=1, column=0, sticky=tk.W, padx=10, pady=5
        )
        type_var = tk.StringVar(value="支出")
        type_frame = ttk.Frame(dialog)
        type_frame.grid(row=1, column=1, padx=10, pady=5)
        ttk.Radiobutton(
            type_frame,
            text="收入",
            variable=type_var,
            value="收入"
        ).pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(
            type_frame,
            text="支出",
            variable=type_var,
            value="支出"
        ).pack(side=tk.LEFT, padx=5)

        ttk.Label(dialog, text="父类别:").grid(
            row=2, column=0, sticky=tk.W, padx=10, pady=5
        )
        parent_var = tk.StringVar()
        parent_combo = ttk.Combobox(dialog, textvariable=parent_var, width=18)
        parent_combo.grid(row=2, column=1, padx=10, pady=5)

        def update_parents(*args):
            selected_type = type_var.get()
            parents = [
                c.name for c in self.account_book.categories
                if c.type == selected_type
            ]
            parent_combo["values"] = ["无"] + parents
            parent_combo.current(0)

        type_var.trace("w", update_parents)
        update_parents()

        def on_submit():
            try:
                name = name_entry.get()
                cat_type = type_var.get()
                parent_name = parent_var.get()

                if not name:
                    messagebox.showwarning("警告", "请输入类别名称")
                    return

                parent = None
                if parent_name != "无":
                    for cat in self.account_book.categories:
                        if cat.name == parent_name and cat.type == cat_type:
                            parent = cat
                            break

                category = Category(name, cat_type, parent)
                if category.is_valid():
                    category.id = len(self.account_book.categories) + 1
                    self.account_book.categories.append(category)
                    self.update_status(f"类别 '{name}' 添加成功")
                    messagebox.showinfo("成功", "类别添加成功")
                    dialog.destroy()
                else:
                    messagebox.showerror("错误", "类别信息无效")

            except Exception as e:
                messagebox.showerror("错误", f"添加失败: {e}")

        button_frame = ttk.Frame(dialog)
        button_frame.grid(row=3, column=0, columnspan=2, pady=20)

        ttk.Button(
            button_frame,
            text="确定",
            command=on_submit,
            width=10
        ).grid(row=0, column=0, padx=5)

        ttk.Button(
            button_frame,
            text="取消",
            command=dialog.destroy,
            width=10
        ).grid(row=0, column=1, padx=5)

        self.update_status("添加类别表单已打开")

    def save_data(self):
        """保存数据"""
        self.update_status("正在保存数据...")
        try:
            filename = simpledialog.askstring(
                "保存数据",
                "请输入保存文件名 (默认为account_book.json):",
                initialvalue="account_book.json"
            )
            if filename:
                self.account_book.save_to_file(filename)
                self.update_status("数据保存成功")
                messagebox.showinfo("成功", f"数据保存成功到: {filename}")
            else:
                self.update_status("取消保存")
        except Exception as e:
            self.update_status(f"保存失败: {e}")
            messagebox.showerror("错误", f"保存失败: {e}")

    def load_data(self):
        """加载数据"""
        self.update_status("正在加载数据...")
        try:
            filename = simpledialog.askstring(
                "加载数据",
                "请输入加载文件名 (默认为account_book.json):",
                initialvalue="account_book.json"
            )
            if filename:
                self.account_book.load_from_file(filename)
                self.update_balance_display()
                self.refresh_transaction_list()
                self.update_status("数据加载成功")
                messagebox.showinfo("成功", "数据加载成功")
            else:
                self.update_status("取消加载")
        except Exception as e:
            self.update_status(f"加载失败: {e}")
            messagebox.showerror("错误", f"加载失败: {e}")

    def generate_charts_gui(self):
        """生成可视化图表的图形化界面"""
        if not matplotlib_available:
            messagebox.showerror("错误", "matplotlib模块未安装，无法生成图表")
            return

        self.update_status("正在生成可视化图表...")

        dialog = tk.Toplevel(self.root)
        dialog.title("生成可视化图表")
        dialog.geometry("900x700")
        dialog.transient(self.root)

        control_frame = ttk.Frame(dialog, padding="10")
        control_frame.pack(side=tk.TOP, fill=tk.X)

        chart_frame = ttk.LabelFrame(control_frame, text="图表类型", padding="5")
        chart_frame.pack(side=tk.LEFT, padx=5)

        chart_var = tk.StringVar(value="monthly")
        ttk.Radiobutton(
            chart_frame,
            text="月度收支对比",
            variable=chart_var,
            value="monthly",
            command=lambda: update_preview()
        ).pack(anchor=tk.W, pady=1)

        ttk.Radiobutton(
            chart_frame,
            text="类别支出饼图",
            variable=chart_var,
            value="category",
            command=lambda: update_preview()
        ).pack(anchor=tk.W, pady=1)

        ttk.Radiobutton(
            chart_frame,
            text="收支趋势图",
            variable=chart_var,
            value="trend",
            command=lambda: update_preview()
        ).pack(anchor=tk.W, pady=1)

        date_frame = ttk.LabelFrame(control_frame, text="日期范围(可选)", padding="5")
        date_frame.pack(side=tk.LEFT, padx=5)

        ttk.Label(date_frame, text="开始:").grid(row=0, column=0, padx=2)
        start_entry = ttk.Entry(date_frame, width=12)
        start_entry.grid(row=0, column=1, padx=2)

        ttk.Label(date_frame, text="结束:").grid(row=1, column=0, padx=2)
        end_entry = ttk.Entry(date_frame, width=12)
        end_entry.grid(row=1, column=1, padx=2)

        chart_display_frame = ttk.Frame(dialog)
        chart_display_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        fig = Figure(figsize=(8, 6), dpi=100)
        canvas = FigureCanvasTkAgg(fig, master=chart_display_frame)
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        def update_preview():
            try:
                fig.clear()
                ax = fig.add_subplot(111)
                start_date = start_entry.get() or None
                end_date = end_entry.get() or None
                chart_type = chart_var.get()

                if chart_type == "monthly":
                    self._plot_monthly_chart(ax, start_date, end_date)
                elif chart_type == "category":
                    self._plot_category_chart(ax, start_date, end_date)
                elif chart_type == "trend":
                    self._plot_trend_chart(ax, start_date, end_date)

                canvas.draw()
                self.update_status("图表预览已更新")

            except Exception as e:
                messagebox.showerror("错误", f"生成预览失败: {e}")
                self.update_status(f"预览失败: {e}")

        button_frame = ttk.Frame(dialog, padding="10")
        button_frame.pack(side=tk.BOTTOM, fill=tk.X)

        ttk.Button(
            button_frame,
            text="刷新预览",
            command=update_preview,
            width=12
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="保存图表",
            command=lambda: self._save_chart_dialog(start_entry.get(), end_entry.get(), chart_var.get()),
            width=12
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="关闭",
            command=dialog.destroy,
            width=12
        ).pack(side=tk.RIGHT, padx=5)

        update_preview()
        self.update_status("图表生成界面已打开")

    def _plot_monthly_chart(self, ax, start_date=None, end_date=None):
        """绘制月度收支对比图表"""
        import matplotlib.pyplot as plt
        plt.rcParams['font.sans-serif'] = ['SimHei']
        plt.rcParams['axes.unicode_minus'] = False

        report = self.account_book.generate_report(start_date, end_date)
        monthly_stats = report['monthly_stats']

        if not monthly_stats:
            ax.text(0.5, 0.5, "没有数据可生成图表",
                    ha='center', va='center', transform=ax.transAxes)
            return

        months = list(monthly_stats.keys())
        incomes = [monthly_stats[month]['收入'] for month in months]
        expenses = [monthly_stats[month]['支出'] for month in months]

        x = range(len(months))
        width = 0.35

        ax.bar([i - width/2 for i in x], incomes, width, label='收入', color='green')
        ax.bar([i + width/2 for i in x], expenses, width, label='支出', color='red')
        ax.set_xlabel('月份')
        ax.set_ylabel('金额 (元)')
        ax.set_title('月度收支对比')
        ax.set_xticks(x)
        ax.set_xticklabels(months)
        ax.legend()
        ax.grid(True, axis='y', alpha=0.3)

    def _plot_category_chart(self, ax, start_date=None, end_date=None):
        """绘制类别支出饼图"""
        import matplotlib.pyplot as plt
        plt.rcParams['font.sans-serif'] = ['SimHei']
        plt.rcParams['axes.unicode_minus'] = False

        report = self.account_book.generate_report(start_date, end_date)
        category_stats = report['category_stats']

        if not category_stats:
            ax.text(0.5, 0.5, "没有支出数据可生成图表",
                    ha='center', va='center', transform=ax.transAxes)
            return

        categories = list(category_stats.keys())
        amounts = list(category_stats.values())

        colors = plt.cm.Set3(range(len(categories)))
        ax.pie(amounts, labels=categories, autopct='%1.1f%%',
               startangle=90, colors=colors)
        ax.axis('equal')
        ax.set_title('类别支出分析')

    def _plot_trend_chart(self, ax, start_date=None, end_date=None):
        """绘制收支趋势图"""
        import matplotlib.pyplot as plt
        plt.rcParams['font.sans-serif'] = ['SimHei']
        plt.rcParams['axes.unicode_minus'] = False

        transactions = self.account_book.get_transactions(start_date, end_date)

        if not transactions:
            ax.text(0.5, 0.5, "没有数据可生成图表",
                    ha='center', va='center', transform=ax.transAxes)
            return

        transactions.sort(key=lambda x: x.date)

        dates = [t.date for t in transactions]
        balances = []
        current_balance = 0

        for t in transactions:
            if t.type == "收入":
                current_balance += t.amount
            else:
                current_balance -= t.amount
            balances.append(current_balance)

        ax.plot(dates, balances, marker='o', linestyle='-', color='blue')
        ax.set_xlabel('日期')
        ax.set_ylabel('余额 (元)')
        ax.set_title('收支趋势')
        ax.grid(True, alpha=0.3)

        import matplotlib.dates as mdates
        ax.xaxis.set_major_locator(mdates.AutoDateLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        fig = ax.figure
        fig.autofmt_xdate()

    def _save_chart_dialog(self, start_date, end_date, chart_type):
        """保存图表对话框"""
        filename = simpledialog.askstring(
            "保存图表",
            "请输入保存文件名:",
            initialvalue=f"{chart_type}_chart.png"
        )

        if filename:
            try:
                if chart_type == "monthly":
                    self.account_book.generate_monthly_chart(start_date, end_date, filename)
                elif chart_type == "category":
                    self.account_book.generate_category_chart(start_date, end_date, filename)
                elif chart_type == "trend":
                    self.account_book.generate_trend_chart(start_date, end_date, filename)

                messagebox.showinfo("成功", f"图表已保存到: {filename}")
                self.update_status(f"图表已保存到: {filename}")

            except Exception as e:
                messagebox.showerror("错误", f"保存失败: {e}")
                self.update_status(f"保存失败: {e}")


def main():
    """主函数"""
    root = tk.Tk()
    AccountBookGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
