# 安装全局技能计划

## 项目研究结论
- 当前系统中没有安装 Node.js，无法直接使用 npx 命令
- 用户需要安装 `find-skills` 技能为全局技能
- 安装路径：https://github.com/vercel-labs/skills

## 安装步骤
1. 安装 Node.js
2. 验证 Node.js 和 npm 安装成功
3. 执行技能安装命令：`npx skills add https://github.com/vercel-labs/skills --skill find-skills --global`
4. 验证技能安装成功

## 潜在依赖
- Node.js (v16+ 推荐)
- npm (随 Node.js 一起安装)

## 风险处理
- 如果 Node.js 安装失败，需要检查网络连接和系统权限
- 如果技能安装失败，可能需要检查技能名称是否正确或网络连接问题

## 预期结果
- 成功安装 `find-skills` 技能为全局技能
- 技能可在所有项目中使用