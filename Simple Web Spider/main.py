#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Simple Web Spider with PyQt GUI
"""

import sys
import os
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import Qt
from src.ui.gui import SpiderGUI

if __name__ == "__main__":
    # 确保当前工作目录正确
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    app = QApplication(sys.argv)
    
    window = SpiderGUI()
    # 设置窗口置顶，确保能看到
    window.setWindowFlags(window.windowFlags() | Qt.WindowStaysOnTopHint)
    window.show()
    
    sys.exit(app.exec_())
