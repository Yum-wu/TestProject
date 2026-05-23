# 手动安装技能步骤

## 步骤 1：安装 Node.js
1. 访问 Node.js 官网：https://nodejs.org
2. 下载 LTS 版本的 Node.js 安装包（推荐 v16+）
3. 运行安装包并按照提示完成安装
4. 验证安装：
   - 打开命令提示符或 PowerShell
   - 运行 `node -v` 检查 Node.js 版本
   - 运行 `npm -v` 检查 npm 版本

## 步骤 2：安装技能
1. 打开命令提示符或 PowerShell
2. 执行以下命令：
   ```
   npx skills add https://github.com/vercel-labs/skills --skill find-skills --global
   ```

## 步骤 3：验证安装
1. 运行 `npx skills list --global` 查看已安装的技能
2. 确认 `find-skills` 技能已成功安装

## 注意事项
- 如果遇到网络问题，可以尝试使用国内镜像：
  - npm 镜像：`npm config set registry https://registry.npmmirror.com`
  - Node.js 镜像：访问 https://npmmirror.com/mirrors/node/ 下载安装包
- 确保使用管理员权限运行命令提示符或 PowerShell
- 如果技能名称有误，请检查技能的正确名称