#!/bin/bash
# ===========================================
# MyBlog 服务器初始化脚本
# 运行方式: bash setup-server.sh
# ===========================================

set -e

echo "=========================================="
echo "  MyBlog 服务器初始化"
echo "=========================================="

# ===== 颜色定义 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ===== 检查 root 权限 =====
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# ===== 更新系统 =====
echo -e "${YELLOW}[1/6] 更新系统...${NC}"
apt update && apt upgrade -y

# ===== 安装 Node.js 18 =====
echo -e "${YELLOW}[2/6] 安装 Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version
npm --version

# ===== 安装 PM2 =====
echo -e "${YELLOW}[3/6] 安装 PM2...${NC}"
npm install -g pm2
pm2 --version

# ===== 安装 Nginx =====
echo -e "${YELLOW}[4/6] 安装 Nginx...${NC}"
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# ===== 配置防火墙 =====
echo -e "${YELLOW}[5/6] 配置防火墙...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ===== 创建应用目录 =====
echo -e "${YELLOW}[6/6] 创建应用目录...${NC}"
APP_DIR="/var/www/myblog"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads/covers
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backups

# 设置权限
chown -R $USER:$USER $APP_DIR

echo ""
echo "=========================================="
echo -e "${GREEN}  服务器初始化完成！${NC}"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 将项目代码复制到 $APP_DIR"
echo "2. 配置环境变量:"
echo "   cp .env.example .env"
echo "   nano .env"
echo "3. 安装依赖并启动:"
echo "   cd server && npm install --production"
echo "4. 配置 Nginx:"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/myblog"
echo "   sudo ln -s /etc/nginx/sites-available/myblog /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "5. 启动服务:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "或在 GitHub Actions 中配置 secrets 后使用 CD 自动部署"
echo ""
