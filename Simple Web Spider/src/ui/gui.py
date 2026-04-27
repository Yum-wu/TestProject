#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PyQt GUI for Simple Web Spider
"""

from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QLabel, QLineEdit,
    QSpinBox, QComboBox, QPushButton, QTextEdit, QFileDialog, QMessageBox,
    QProgressBar, QGroupBox, QGridLayout
)
from PyQt5.QtCore import QThread, pyqtSignal, Qt
from src.core.spider import Spider
from src.core.data_processor import DataProcessor
from src.utils.utils import validate_url


class CrawlThread(QThread):
    """Thread for crawling"""
    signal = pyqtSignal(str)
    progress = pyqtSignal(int, int)  # current, total
    finished = pyqtSignal(list)

    def __init__(self, start_urls, max_depth, output_format):
        super().__init__()
        self.start_urls = start_urls
        self.max_depth = max_depth
        self.output_format = output_format

    def run(self):
        """Run crawling"""
        self.signal.emit("开始爬取...")
        try:
            def progress_callback(current, total):
                self.progress.emit(current, total)
            
            spider = Spider(
                start_urls=self.start_urls,
                max_depth=self.max_depth,
                data_processor=DataProcessor(output_format=self.output_format),
                progress_callback=progress_callback
            )
            spider.crawl()
            results = spider.get_results()
            self.signal.emit(f"爬取完成，共处理 {len(results)} 个页面")
            self.finished.emit(results)
        except Exception as e:
            self.signal.emit(f"错误: {str(e)}")
            self.finished.emit([])


class SpiderGUI(QMainWindow):
    """Spider GUI class"""

    def __init__(self):
        super().__init__()
        self.results = []
        self.init_ui()

    def init_ui(self):
        """Initialize UI"""
        self.setWindowTitle("Simple Web Spider")
        self.setGeometry(100, 100, 800, 600)
        # 设置窗口属性，确保能看到
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        self.raise_()
        self.activateWindow()

        # Main widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        main_layout = QVBoxLayout(central_widget)

        # Input group
        input_group = QGroupBox("爬取设置")
        input_layout = QGridLayout()

        # URL input
        input_layout.addWidget(QLabel("起始URL:"), 0, 0)
        self.url_input = QLineEdit()
        # 设置默认的国内允许爬虫的练手网站
        self.url_input.setText("https://www.runoob.com")
        self.url_input.setPlaceholderText(
            "请输入要爬取的网站URL，例如：https://www.runoob.com"
        )
        input_layout.addWidget(self.url_input, 0, 1, 1, 2)

        # Depth setting
        input_layout.addWidget(QLabel("爬取深度:"), 1, 0)
        self.depth_spin = QSpinBox()
        self.depth_spin.setMinimum(1)
        self.depth_spin.setMaximum(10)
        self.depth_spin.setValue(2)
        input_layout.addWidget(self.depth_spin, 1, 1)

        # Output format
        input_layout.addWidget(QLabel("输出格式:"), 1, 2)
        self.format_combo = QComboBox()
        self.format_combo.addItems(["JSON", "CSV"])
        input_layout.addWidget(self.format_combo, 1, 3)

        # Start button
        self.start_button = QPushButton("开始爬取")
        self.start_button.clicked.connect(self.start_crawling)
        input_layout.addWidget(self.start_button, 2, 0, 1, 4)

        input_group.setLayout(input_layout)
        main_layout.addWidget(input_group)

        # Log area
        log_group = QGroupBox("日志信息")
        log_layout = QVBoxLayout()
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        log_layout.addWidget(self.log_text)
        log_group.setLayout(log_layout)
        main_layout.addWidget(log_group)

        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)

        # Results group
        results_group = QGroupBox("爬取结果")
        results_layout = QVBoxLayout()

        # Results info
        self.results_info = QLabel("等待爬取...")
        results_layout.addWidget(self.results_info)

        # Results display
        self.results_display = QTextEdit()
        self.results_display.setReadOnly(True)
        self.results_display.setPlaceholderText("爬取的结果将显示在这里...")
        results_layout.addWidget(self.results_display)

        # Save button
        self.save_button = QPushButton("保存结果")
        self.save_button.setEnabled(False)
        self.save_button.clicked.connect(self.save_results)
        results_layout.addWidget(self.save_button)

        results_group.setLayout(results_layout)
        main_layout.addWidget(results_group)

    def start_crawling(self):
        """Start crawling"""
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "警告", "请输入起始URL")
            return

        if not validate_url(url):
            QMessageBox.warning(self, "警告", "请输入有效的URL")
            return

        max_depth = self.depth_spin.value()
        output_format = self.format_combo.currentText().lower()

        # Clear log
        self.log_text.clear()
        self.results_info.setText("正在爬取...")
        self.start_button.setEnabled(False)
        self.save_button.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, 0)  # Indeterminate

        # Start crawling thread
        self.crawl_thread = CrawlThread([url], max_depth, output_format)
        self.crawl_thread.signal.connect(self.update_log)
        self.crawl_thread.progress.connect(self.update_progress)
        self.crawl_thread.finished.connect(self.crawl_finished)
        self.crawl_thread.start()

    def update_log(self, message):
        """Update log"""
        self.log_text.append(message)
        # Auto scroll to bottom
        self.log_text.verticalScrollBar().setValue(
            self.log_text.verticalScrollBar().maximum()
        )

    def update_progress(self, current, total):
        """Update progress bar"""
        if total > 0:
            # Set progress bar range
            self.progress_bar.setRange(0, total)
            # Set current progress
            self.progress_bar.setValue(current)
            # Update status text
            self.results_info.setText(f"正在爬取... ({current}/{total})")

    def crawl_finished(self, results):
        """Handle crawl finished"""
        self.results = results
        self.results_info.setText(f"爬取完成，共处理 {len(results)} 个页面")
        
        # 显示爬取结果
        if results:
            display_text = ""
            for i, result in enumerate(results):
                display_text += f"=== 页面 {i+1} ===\n"
                display_text += f"URL: {result.get('url', '')}\n"
                if 'data' in result:
                    data = result['data']
                    if 'title' in data:
                        display_text += f"标题: {data['title']}\n"
                    if 'description' in data:
                        display_text += f"描述: {data['description']}\n"
                    if 'headings' in data:
                        display_text += "标题层级:\n"
                        for level, headings in data['headings'].items():
                            if headings:
                                display_text += f"  {level}: {headings[0]}\n"
                display_text += "\n"
            self.results_display.setText(display_text)
        else:
            self.results_display.setText("没有爬取到任何结果")
        
        self.start_button.setEnabled(True)
        self.save_button.setEnabled(len(results) > 0)
        self.progress_bar.setVisible(False)

    def save_results(self):
        """Save results"""
        if not self.results:
            QMessageBox.warning(self, "警告", "没有可保存的结果")
            return

        output_format = self.format_combo.currentText().lower()
        file_extension = ".json" if output_format == "json" else ".csv"

        # Open file dialog
        filename, _ = QFileDialog.getSaveFileName(
            self, "保存结果", f"spider_results{file_extension}",
            f"{output_format.upper()} Files (*{file_extension})"
        )

        if filename:
            # Ensure correct file extension
            if not filename.endswith(file_extension):
                filename += file_extension

            # Save results
            try:
                data_processor = DataProcessor(output_format=output_format)
                data_processor.save(self.results, filename)
                QMessageBox.information(self, "成功", f"结果已保存到 {filename}")
            except Exception as e:
                QMessageBox.error(self, "错误", f"保存失败: {str(e)}")
