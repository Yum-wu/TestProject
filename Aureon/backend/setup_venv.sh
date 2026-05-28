#!/bin/bash
# Chatbot Backend - 一键设置 Python 3.12 虚拟环境 (MINGW64 / Git Bash)
# 运行: bash setup_venv.sh

PYTHON312="/c/Users/Yum/AppData/Local/Programs/Python/Python312/python.exe"

echo "========================================"
echo "Chatbot Backend - Python 3.12 环境设置"
echo "========================================"

# 1. 验证 Python 版本
echo "[1/4] 验证 Python 版本..."
"$PYTHON312" --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3.12 未找到！"
    exit 1
fi

# 2. 创建虚拟环境
echo "[2/4] 创建虚拟环境..."
"$PYTHON312" -m venv venv
if [ $? -ne 0 ]; then
    echo "❌ 创建虚拟环境失败！"
    exit 1
fi

# 3. 激活并安装依赖
echo "[3/4] 安装依赖..."
source venv/Scripts/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "⚠️ 部分依赖安装失败，继续..."
fi

# 4. 验证关键依赖
echo "[4/4] 验证关键依赖..."
python -c "import langchain; print(f'langchain: {langchain.__version__}')"
python -c "import langgraph; print('langgraph: ✓')" 2>/dev/null || echo "langgraph: 需手动检查"
python -c "from langchain_text_splitters import RecursiveCharacterTextSplitter; print('text_splitter: ✓')"
python -c "import numpy; print(f'numpy: {numpy.__version__}')"

echo ""
echo "========================================"
echo "✅ 环境设置完成！"
echo ""
echo "启动后端:"
echo "  cd Chatbot/backend"
echo "  source venv/Scripts/activate"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
echo "退出虚拟环境:"
echo "  deactivate"
echo "========================================"
