#!/bin/sh
# 启动 nginx（守护进程模式），然后 exec uvicorn 以正确接收信号
nginx
exec uvicorn app.main:app --host 127.0.0.1 --port 8000
