# MyBlog 架构文档

## 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 8.x | 构建工具 |
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| React Router | 7.x | 前端路由 |
| Axios | 1.x | HTTP 客户端 |
| React Markdown | 9.x | Markdown 渲染 |
| remark-gfm | 4.x | GitHub 风格 Markdown 扩展 |
| react-syntax-highlighter | 15.x | 代码高亮 |
| Day.js | 1.x | 日期处理 |
| react-hot-toast | 2.x | 消息提示 |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Express | 4.x | Web 框架 |
| MySQL2 | 3.x | MySQL 驱动 |
| bcryptjs | 2.x | 密码加密 |
| jsonwebtoken | 9.x | JWT 认证 |
| multer | 1.x | 文件上传 |
| express-validator | 7.x | 请求验证 |
| marked | 15.x | Markdown 解析 |
| slugify | 1.x | URL 友好 slug 生成 |
| cors | 2.x | 跨域支持 |
| dotenv | 16.x | 环境变量管理 |

---

## API 接口设计（RESTful）

### 认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/profile` | 获取当前用户信息 | 是 |

#### POST /api/auth/register
请求体：
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "avatar": "string",
    "token": "string"
  }
}
```

#### POST /api/auth/login
请求体：
```json
{
  "email": "string",
  "password": "string"
}
```
响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "avatar": "string",
    "token": "string"
  }
}
```

#### GET /api/auth/profile
请求头：`Authorization: Bearer <token>`

响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string",
    "created_at": "string"
  }
}
```

### 文章模块 `/api/posts`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts` | 获取文章列表（分页、搜索、筛选） | 否 |
| GET | `/api/posts/:slug` | 获取文章详情 | 否 |
| POST | `/api/posts` | 创建文章 | 是 |
| PUT | `/api/posts/:id` | 更新文章 | 是 |
| DELETE | `/api/posts/:id` | 删除文章 | 是 |
| POST | `/api/posts/:id/cover` | 上传封面图 | 是 |

#### GET /api/posts
查询参数：
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10）
- `search`: 搜索关键词
- `category`: 分类 ID 筛选
- `tag`: 标签 ID 筛选
- `sort`: 排序方式（newest / oldest / popular）

响应：
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "cover_image": "string",
        "category": { "id": 1, "name": "string" },
        "tags": [{ "id": 1, "name": "string" }],
        "author": { "id": 1, "username": "string", "avatar": "string" },
        "view_count": 0,
        "comment_count": 0,
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

#### POST /api/posts
请求体：
```json
{
  "title": "string",
  "content": "string (Markdown)",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "excerpt": "string",
  "status": "draft | published"
}
```

#### POST /api/posts/:id/cover
请求体：`multipart/form-data`
- `cover`: 图片文件

响应：
```json
{
  "success": true,
  "data": {
    "cover_image": "/uploads/covers/xxx.jpg"
  }
}
```

### 分类模块 `/api/categories`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/categories` | 获取所有分类 | 否 |
| POST | `/api/categories` | 创建分类 | 是 |
| PUT | `/api/categories/:id` | 更新分类 | 是 |
| DELETE | `/api/categories/:id` | 删除分类 | 是 |

### 标签模块 `/api/tags`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/tags` | 获取所有标签 | 否 |
| POST | `/api/tags` | 创建标签 | 是 |
| PUT | `/api/tags/:id` | 更新标签 | 是 |
| DELETE | `/api/tags/:id` | 删除标签 | 是 |

### 评论模块 `/api/comments`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts/:id/comments` | 获取文章评论 | 否 |
| POST | `/api/posts/:id/comments` | 发表评论 | 是 |
| POST | `/api/comments/:id/reply` | 回复评论 | 是 |

#### POST /api/posts/:id/comments
请求体：
```json
{
  "content": "string"
}
```

#### POST /api/comments/:id/reply
请求体：
```json
{
  "content": "string"
}
```

---

## JWT 认证方案

### 认证流程

1. **注册/登录**：用户通过 `/api/auth/register` 或 `/api/auth/login` 获取 JWT Token
2. **请求携带**：客户端在请求头中携带 `Authorization: Bearer <token>`
3. **服务端验证**：中间件验证 Token 的有效性和过期时间
4. **Token 刷新**：Token 过期后需重新登录获取新 Token

### Token 结构

```json
{
  "payload": {
    "id": 1,
    "username": "string",
    "email": "string",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

### 配置参数

| 参数 | 值 | 说明 |
|------|------|------|
| JWT_SECRET | 环境变量配置 | 签名密钥 |
| JWT_EXPIRES_IN | 24h | Token 有效期 |
| 算法 | HS256 | 签名算法 |

### 中间件保护路由

- 需要认证的路由使用 `authMiddleware` 中间件
- 文章创建/更新/删除需验证用户身份
- 评论发表需验证用户身份
- 分类/标签管理需验证用户身份

---

## 数据库表设计

### users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码（bcrypt 加密） |
| avatar | VARCHAR(255) | NULL | 头像 URL |
| bio | TEXT | NULL | 个人简介 |
| role | ENUM('admin', 'author', 'reader') | DEFAULT 'reader' | 角色 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### posts 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章 ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| slug | VARCHAR(250) | UNIQUE, NOT NULL | URL 友好标识 |
| content | LONGTEXT | NOT NULL | Markdown 内容 |
| excerpt | VARCHAR(500) | NULL | 摘要 |
| cover_image | VARCHAR(255) | NULL | 封面图 URL |
| category_id | INT | FOREIGN KEY -> categories.id | 分类 ID |
| author_id | INT | FOREIGN KEY -> users.id | 作者 ID |
| status | ENUM('draft', 'published') | DEFAULT 'draft' | 状态 |
| view_count | INT | DEFAULT 0 | 浏览量 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### categories 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类 ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名称 |
| slug | VARCHAR(60) | UNIQUE, NOT NULL | URL 标识 |
| description | VARCHAR(200) | NULL | 分类描述 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### tags 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签 ID |
| name | VARCHAR(30) | UNIQUE, NOT NULL | 标签名称 |
| slug | VARCHAR(40) | UNIQUE, NOT NULL | URL 标识 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### post_tags 表（多对多关联）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| post_id | INT | FOREIGN KEY -> posts.id | 文章 ID |
| tag_id | INT | FOREIGN KEY -> tags.id | 标签 ID |
| PRIMARY KEY | | (post_id, tag_id) | 联合主键 |

### comments 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论 ID |
| content | TEXT | NOT NULL | 评论内容 |
| post_id | INT | FOREIGN KEY -> posts.id | 文章 ID |
| user_id | INT | FOREIGN KEY -> users.id | 评论者 ID |
| parent_id | INT | FOREIGN KEY -> comments.id, NULL | 父评论 ID（回复） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 表关系图

```
users ──1:N──> posts
users ──1:N──> comments
categories ──1:N──> posts
posts ──M:N──> tags (通过 post_tags)
posts ──1:N──> comments
comments ──1:N──> comments (自关联，parent_id)
```

---

## 目录结构设计

```
MyBlog/
├── package.json                    # 根项目配置
├── ARCHITECTURE.md                 # 架构文档
│
├── client/                         # 前端项目
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx                # 入口文件
│       ├── App.tsx                 # 根组件
│       ├── components/             # 组件
│       │   ├── layout/             # 布局组件
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── MainLayout.tsx
│       │   ├── common/             # 通用组件
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Loading.tsx
│       │   │   └── Pagination.tsx
│       │   ├── post/               # 文章组件
│       │   │   ├── PostCard.tsx
│       │   │   ├── PostList.tsx
│       │   │   ├── PostDetail.tsx
│       │   │   ├── PostEditor.tsx
│       │   │   └── MarkdownRenderer.tsx
│       │   ├── auth/               # 认证组件
│       │   │   ├── LoginForm.tsx
│       │   │   ├── RegisterForm.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   └── comment/            # 评论组件
│       │       ├── CommentList.tsx
│       │       ├── CommentItem.tsx
│       │       └── CommentForm.tsx
│       ├── pages/                  # 页面
│       │   ├── Home.tsx
│       │   ├── PostPage.tsx
│       │   ├── WritePost.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── Profile.tsx
│       ├── hooks/                  # 自定义 Hooks
│       │   ├── useAuth.ts
│       │   ├── usePosts.ts
│       │   └── useComments.ts
│       ├── services/               # API 服务
│       │   ├── api.ts              # Axios 实例
│       │   ├── auth.ts
│       │   ├── posts.ts
│       │   ├── categories.ts
│       │   ├── tags.ts
│       │   └── comments.ts
│       ├── types/                  # TypeScript 类型
│       │   ├── auth.ts
│       │   ├── post.ts
│       │   ├── category.ts
│       │   ├── tag.ts
│       │   └── comment.ts
│       ├── utils/                  # 工具函数
│       │   ├── format.ts
│       │   └── storage.ts
│       └── styles/                 # 样式
│           └── index.css           # Tailwind 入口
│
├── server/                         # 后端项目
│   ├── package.json
│   ├── .env                        # 环境变量（不提交）
│   ├── .env.example                # 环境变量示例
│   ├── uploads/                    # 上传文件目录
│   │   └── covers/                 # 封面图
│   └── src/
│       ├── index.js                # 入口文件
│       ├── config/                 # 配置
│       │   └── database.js         # 数据库连接配置
│       ├── controllers/            # 控制器
│       │   ├── authController.js
│       │   ├── postController.js
│       │   ├── categoryController.js
│       │   ├── tagController.js
│       │   └── commentController.js
│       ├── middleware/             # 中间件
│       │   ├── auth.js             # JWT 认证中间件
│       │   ├── errorHandler.js     # 错误处理
│       │   └── upload.js           # 文件上传配置
│       ├── models/                 # 数据模型
│       │   ├── User.js
│       │   ├── Post.js
│       │   ├── Category.js
│       │   ├── Tag.js
│       │   └── Comment.js
│       ├── routes/                 # 路由
│       │   ├── auth.js
│       │   ├── posts.js
│       │   ├── categories.js
│       │   ├── tags.js
│       │   └── comments.js
│       └── utils/                  # 工具函数
│           ├── response.js         # 统一响应格式
│           └── validator.js        # 验证规则
```
