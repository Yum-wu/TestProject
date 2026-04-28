# Todo Manager

一个简洁高效的个人待办事项管理应用，支持任务管理、分类筛选、优先级设置和统计概览。

## 在线预览

![Todo Manager Screenshot](./public/favicon.svg)

## 功能特性

- **任务管理** - 快速添加、编辑、删除和标记完成任务
- **统计概览** - 实时显示总任务数、待完成数、已完成数和完成率（环形进度条）
- **分类筛选** - 按工作、学习、生活、项目四个分类筛选任务
- **优先级标签** - 高（红色）、中（橙色）、低（绿色）三级优先级标识
- **搜索功能** - 按任务标题关键字实时搜索过滤
- **截止日期** - 设置任务截止日期，自动标记过期和今日到期
- **备注功能** - 为任务添加详细描述和备注
- **数据持久化** - 所有数据保存在浏览器 localStorage，刷新不丢失
- **清除已完成** - 一键清除所有已完成任务
- **响应式设计** - 完美适配桌面端和移动端

## 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React 18 | 前端框架 |
| TypeScript 5 | 类型安全 |
| Vite 6 | 构建工具 |
| Zustand | 状态管理 |
| Tailwind CSS 3 | 样式框架 |
| date-fns | 日期处理 |
| Vitest | 单元测试 |
| Testing Library | 组件测试 |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 测试

```bash
# 运行一次测试
npm run test

# 监听模式运行测试
npm run test:watch
```

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
todo-app/
├── public/              # 静态资源
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── __tests__/       # 测试文件
│   │   └── App.test.tsx
│   ├── components/      # React 组件
│   │   ├── StatsOverview.tsx   # 统计概览卡片
│   │   ├── TaskForm.tsx        # 任务添加表单
│   │   ├── TaskItem.tsx        # 任务列表项
│   │   └── TaskList.tsx        # 任务列表
│   ├── store/           # Zustand 状态管理
│   │   └── useTodoStore.ts
│   ├── test/            # 测试配置
│   │   └── setup.ts
│   ├── types/           # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   └── storage.ts
│   ├── App.tsx          # 主应用组件
│   ├── index.css        # 全局样式（Tailwind）
│   └── main.tsx         # 入口文件
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── USER_MANUAL.md       # 用户使用手册
```

## 使用说明

### 添加任务

1. 在顶部输入框中输入任务内容
2. 选择分类（工作/学习/生活/项目）
3. 选择优先级（高/中/低）
4. 设置截止日期（可选）
5. 添加备注说明（可选）
6. 点击「添加」按钮

### 筛选任务

- 按状态：全部 / 待完成 / 已完成
- 按分类：全部 / 工作 / 学习 / 生活 / 项目
- 按关键字：在搜索框输入关键词

### 管理任务

- **完成** - 点击任务左侧复选框
- **编辑** - 双击任务标题或点击铅笔图标
- **删除** - 点击垃圾桶图标并确认

### 清除已完成

点击「清除已完成 (N)」按钮可一键删除所有已完成任务。

## 数据存储

所有任务数据保存在浏览器的 LocalStorage 中：

- **无需注册或登录**
- **无需联网使用**
- **刷新页面数据不丢失**

> **注意**：数据保存在当前浏览器中，更换浏览器或清除浏览器数据会导致数据丢失。

## 浏览器兼容性

| 浏览器 | 版本 |
| :--- | :--- |
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 开发指南

### 添加新功能

1. 在 `src/types/index.ts` 中定义类型
2. 在 `src/store/useTodoStore.ts` 中添加状态逻辑
3. 在 `src/components/` 中创建组件
4. 在 `src/__tests__/` 中编写测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式（开发时推荐）
npm run test:watch
```

## 用户手册

详细的使用说明请参考：[USER_MANUAL.md](./USER_MANUAL.md)

## 许可证

MIT License

## 更新日志

### v1.0.0 (2026-04-28)

- 初始版本发布
- 任务增删改查功能
- 统计概览卡片（含环形进度条）
- 分类筛选和搜索
- 优先级标签（高/中/低）
- 截止日期和过期提醒
- 清除已完成任务
- LocalStorage 数据持久化
- 响应式设计
- 单元测试覆盖
