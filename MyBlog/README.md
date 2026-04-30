# MyBlog - 现代化博客系统

[![CI](https://github.com/Yum-wu/TestProject/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Yum-wu/TestProject/actions/workflows/ci.yml)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Yum-wu/TestProject/actions)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](https://github.com/Yum-wu/TestProject)
[![Release](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/Yum-wu/TestProject)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

一个功能完善的个人博客系统，支持 Markdown 编辑、分类标签、评论互动等功能。

---

## ✨ 功能特性

### 用户功能
- 👤 用户注册与登录 (JWT 认证)
- 👥 个人中心 - 修改头像、个人简介
- 🔐 安全密码存储 (bcryptjs)

### 文章功能
- ✍️ Markdown 编辑器 (实时预览)
- 🖼️ 封面图上传
- 📝 文章发布 / 编辑 / 删除
- 📖 文章详情页 (代码高亮、目录结构)
- 🔍 文章搜索 (按标题/内容)
- 📑 分类筛选 / 标签筛选
- 📄 分页列表

### 互动功能
- 💬 评论系统 (支持嵌套回复)
- 🏷️ 分类管理
- 🏷️ 标签系统

### 技术亮点
- ⚡ 前后端分离架构
- 🔒 完整的安全防护 (SQL注入、XSS、CSRF)
- 🚀 性能优化 (懒加载、代码分割、缓存)
- 📱 响应式设计 / 暗色模式
- ✅ 完整的单元测试

---

## 🛠️ 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 8.x | 构建工具 |
| Tailwind CSS | - | 样式框架 |
| React Router | v6 | 路由管理 |
| React Markdown | - | Markdown 渲染 |
| Axios | - | HTTP 客户端 |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18.x | 运行环境 |
| Express | 4.x | Web 框架 |
| MySQL | >= 5.7 | 数据库 |
| JWT | - | 用户认证 |
| Multer | - | 文件上传 |
| bcryptjs | - | 密码加密 |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- MySQL >= 5.7

### 1. 配置数据库

```bash
mysql -u root -p
CREATE DATABASE myblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置后端

```bash
cd server
cp .env.example .env
# 编辑 .env，修改 DB_PASSWORD 为你的 MySQL 密码
```

### 3. 启动后端

```bash
cd server
npm install
npm run dev
# 服务器将在 http://localhost:3001 启动
```

### 4. 启动前端

```bash
cd client
npm install
npm run dev
# 前端将在 http://localhost:5173 启动
```

### 5. 访问应用

- 🌐 前端地址: http://localhost:5173
- 🔌 API 地址: http://localhost:3001/api
- ❤️ 健康检查: http://localhost:3001/health

---

## 📁 项目结构

```
MyBlog/
├── client/                 # 前端 (React)
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── services/      # API 服务
│   │   ├── types/         # TypeScript 类型
│   │   └── utils/         # 工具函数
│   └── ...
│
└── server/                # 后端 (Express)
    ├── src/
    │   ├── config/        # 配置文件
    │   ├── controllers/   # 控制器
    │   ├── middleware/     # 中间件
    │   ├── models/        # 数据模型
    │   ├── routes/        # 路由
    │   └── utils/         # 工具函数
    └── ...
```

---

## 📊 CI/CD 流水线

本项目使用 GitHub Actions 实现自动化 CI/CD 流水线：

| Job | 功能 |
|-----|------|
| 🔍 **Type Check** | TypeScript 类型检查 |
| 🧪 **Test Client** | Vitest 前端单元测试 |
| 🧪 **Test Server** | Jest 后端单元测试 |
| 📦 **Build Client** | Vite 生产构建 |

每次 push 到 main 或创建 PR 时自动触发。

---

## 🧪 运行测试

```bash
# 后端测试
cd server && npm test

# 前端测试
cd client && npm test
```

---

## 🔒 安全特性

| 特性 | 说明 |
|------|------|
| SQL 注入防护 | 参数化查询 |
| XSS 防护 | Markdown 禁止危险元素 |
| JWT 认证 | 7天有效期 Token |
| 密码加密 | bcryptjs (salt=10) |
| 文件上传 | 扩展名白名单校验 |
| API 限流 | 15分钟100次/IP |
| CORS | 精确 Origin 白名单 |

---

## ⚡ 性能优化

| 优化项 | 说明 |
|--------|------|
| 路由懒加载 | React.lazy + Suspense |
| 代码分割 | 6 个独立 vendor chunk |
| 组件缓存 | React.memo 包装高频组件 |
| 图片懒加载 | Intersection Observer |
| API 响应缓存 | stale-while-revalidate |
| Gzip 压缩 | compression 中间件 |

---

## 📝 API 接口

### 认证接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/auth/profile | 获取当前用户信息 | ✅ |
| PUT | /api/auth/profile | 更新用户信息 | ✅ |

### 文章接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/posts | 文章列表（分页/搜索/筛选） | ❌ |
| GET | /api/posts/detail/:id | 根据ID获取文章详情 | ❌ |
| GET | /api/posts/:slug | 根据Slug获取文章详情 | ❌ |
| POST | /api/posts | 创建文章 | ✅ |
| PUT | /api/posts/:id | 更新文章 | ✅ |
| DELETE | /api/posts/:id | 删除文章 | ✅ |
| POST | /api/posts/upload-cover | 上传封面图 | ✅ |

### 分类接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/categories | 分类列表 | ❌ |
| POST | /api/categories | 创建分类 | ✅ |
| PUT | /api/categories/:id | 更新分类 | ✅ |
| DELETE | /api/categories/:id | 删除分类 | ✅ |

### 标签接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/tags | 标签列表 | ❌ |
| POST | /api/tags | 创建标签 | ✅ |
| DELETE | /api/tags/:id | 删除标签 | ✅ |

### 评论接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/posts/:postId/comments | 获取文章评论 | ❌ |
| POST | /api/comments | 发表评论 | ✅ |
| POST | /api/comments/:id/reply | 回复评论 | ✅ |
| DELETE | /api/comments/:id | 删除评论 | ✅ |

---

## 🚀 部署指南

### 方式一：手动部署

```bash
# 1. 初始化服务器
bash scripts/setup-server.sh

# 2. 配置环境变量
cd server
cp .env.example .env
nano .env  # 填写数据库密码、JWT密钥等

# 3. 部署
bash scripts/deploy.sh
```

### 方式二：CD 自动部署（推荐）

#### 1. 在服务器上配置 SSH 密钥

```bash
# 在服务器上生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "deploy@myblog"

# 将公钥添加到 authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

#### 2. 在 GitHub 仓库设置 Secrets

进入 `Settings → Secrets and variables → Actions`，添加以下 secrets：

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `DEPLOY_HOST` | 服务器 IP 地址 | `192.168.1.100` |
| `DEPLOY_USER` | SSH 用户名 | `root` |
| `DEPLOY_KEY` | 私钥（id_ed25519 内容） | `-----BEGIN OPENSSH...` |
| `DEPLOY_PORT` | SSH 端口（可选） | `22` |

同时在 `Settings → Variables` 中添加：

| Variable 名称 | 说明 | 示例 |
|--------------|------|------|
| `DEPLOY_PATH` | 服务器部署路径 | `/var/www/myblog` |
| `API_BASE_URL` | API 基础 URL | `https://api.yourdomain.com` |

#### 3. 触发部署

推送代码到 main 分支，或在 GitHub Actions 页面手动触发 `CD` workflow。

### 方式三：Docker 一键部署

```bash
# 复制生产环境配置
cp server/.env.production server/.env
nano server/.env  # 修改密码和域名

# 启动所有服务
docker-compose up -d
```

---

## 📄 License

MIT License
