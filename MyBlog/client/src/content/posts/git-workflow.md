---
title: "Git 工作流最佳实践"
date: 2026-05-08
slug: git-workflow-best-practices
tags: [Git, 工具, 工作流]
category: 技术
excerpt: 团队协作中常用的 Git 工作流模式，以及 commit 规范、分支管理的最佳实践。
---

## 为什么需要规范的工作流？

Git 是一个强大的工具，但如果没有规范的工作流程，很容易陷入混乱。

## 分支策略

### 主干开发 (Trunk-Based Development)

```
main ───●───●───●──────────●───
         \         / \     /
          ●───●───●   ●───●
          feature-a    feature-b
```

### 功能分支流程

```bash
# 从 main 创建功能分支
git checkout -b feat/user-auth

# 开发过程中经常提交
git commit -m "feat: add login form"
git commit -m "feat: add JWT validation"

# 保持与 main 同步
git rebase main

# 合并回 main
git checkout main
git merge feat/user-auth
```

## Commit 规范

推荐使用 Conventional Commits 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat: add user login` |
| fix | Bug 修复 | `fix: fix login redirect` |
| refactor | 重构 | `refactor: extract auth hook` |
| docs | 文档 | `docs: update README` |
| chore | 杂项 | `chore: update dependencies` |

## Code Review 最佳实践

1. **PR 不要太大** — 200-300 行代码是比较合适的范围
2. **提供上下文** — 在 PR 描述中说明改动原因和测试方式
3. **及时 Review** — 尽量在 24 小时内完成
4. **关注逻辑而非风格** — 风格问题用 linter 自动化

## 总结

好的 Git 工作流应该像交通规则——在约束中保证效率。
