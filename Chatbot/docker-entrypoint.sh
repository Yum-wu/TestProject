#!/bin/sh
set -e

# Railway 通过 $PORT 路由流量，nginx 需要监听此端口
NGINX_PORT="${PORT:-80}"

# 替换 nginx 配置中的 listen 端口
sed -i "s/listen 80;/listen ${NGINX_PORT};/" /etc/nginx/conf.d/default.conf

# 启动 nginx（守护进程模式）
nginx

# 等待 uvicorn 就绪后 exec（信号正确传递到 uvicorn）
exec uvicorn app.main:app --host 127.0.0.1 --port 8000
