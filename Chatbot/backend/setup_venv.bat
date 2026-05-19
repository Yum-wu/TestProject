@echo off
REM Chatbot Backend - 一键设置 Python 3.12 虚拟环境
REM 在 MINGW64 或 CMD 中运行: bash setup_venv.sh

set PYTHON312=/c/Users/Yum/AppData/Local/Programs/Python/Python312/python.exe

echo ========================================
echo Chatbot Backend - Python 3.12 环境设置
echo ========================================

REM 1. 验证 Python 版本
echo [1/4] 验证 Python 版本...
"%PYTHON312%" --version
if %errorlevel% neq 0 (
    echo ❌ Python 3.12 未找到！
    exit /b 1
)

REM 2. 创建虚拟环境
echo [2/4] 创建虚拟环境...
"%PYTHON312%" -m venv venv
if %errorlevel% neq 0 (
    echo ❌ 创建虚拟环境失败！
    exit /b 1
)

REM 3. 激活并安装依赖
echo [3/4] 安装依赖...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ⚠️ 部分依赖安装失败，继续...
)

REM 4. 验证关键依赖
echo [4/4] 验证关键依赖...
python -c "import langchain; print(f'langchain: {langchain.__version__}')"
python -c "import langgraph; print(f'langgraph: ✓')" 2>nul || echo "langgraph: 需手动检查"
python -c "from langchain_text_splitters import RecursiveCharacterTextSplitter; print('text_splitter: ✓')"
python -c "import numpy; print(f'numpy: {numpy.__version__}')"

echo.
echo ========================================
echo ✅ 环境设置完成！
echo.
echo 启动后端:
echo   cd Chatbot/backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload --port 8000
echo.
echo 退出虚拟环境:
echo   deactivate
echo ========================================
