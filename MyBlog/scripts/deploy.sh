#!/bin/bash
# ===========================================
# MyBlog 手动部署脚本
# 运行方式: bash deploy.sh
# ===========================================

set -e

APP_DIR="/var/www/myblog"
APP_NAME="myblog-api"

echo "=========================================="
echo "  MyBlog 部署脚本"
echo "=========================================="

# ===== 颜色定义 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ===== 检查目录 =====
if [ ! -d "$APP_DIR" ]; then
  echo -e "${RED}错误: 目录 $APP_DIR 不存在${NC}"
  echo "请先运行 setup-server.sh 初始化服务器"
  exit 1
fi

cd $APP_DIR

# ===== 备份 =====
echo -e "${YELLOW}[1/5] 备份当前版本...${NC}"
mkdir -p backups
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf backups/$BACKUP_NAME client/dist server/uploads 2>/dev/null || true
echo "备份已保存: $BACKUP_NAME"

# ===== 拉取代码 =====
echo -e "${YELLOW}[2/5] 更新代码...${NC}"
if [ -d ".git" ]; then
  git pull origin main
else
  echo -e "${RED}错误: 不是 git 仓库${NC}"
  exit 1
fi

# ===== 安装依赖 =====
echo -e "${YELLOW}[3/5] 安装依赖...${NC}"
cd server && npm install --production
cd ../client && npm install

# ===== 构建前端 =====
echo -e "${YELLOW}[4/5] 构建前端...${NC}"
npm run build

# ===== 重启服务 =====
echo -e "${YELLOW}[5/5] 重启服务...${NC}"
pm2 delete $APP_NAME 2>/dev/null || true
cd $APP_DIR
pm2 start ecosystem.config.js --env production
pm2 save

# ===== 检查状态 =====
sleep 3
if pm2 list | grep -q "$APP_NAME"; then
  echo -e "${GREEN}=========================================="
  echo -e "  部署成功！"
  echo -e "==========================================${NC}"
  pm2 list
else
  echo -e "${RED}部署失败，请检查日志${NC}"
  pm2 logs $APP_NAME --lines 30
  exit 1
fi
