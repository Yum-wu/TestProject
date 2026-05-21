# 方案： Docker Containerize Chatbot

**变更 ID:** `docker-containerize-chatbot`
**创建日期:** 2026-05-21
**状态:** In Progress

---

## 问题分析

Chatbot 当前依赖本机分别启动 FastAPI 后端和 Vite 前端。环境配置、依赖版本、启动顺序、端口约定都靠人工记忆，导致复现成本高。需要容器化，使本地开发、演示、后续 CI/CD 和部署有稳定的运行基线。

## 解决方案

容器化 Chatbot 前后端：
- 后端 FastAPI 服务创建 Python Docker image
- 前端 Vite/React 服务创建 Node build/runtime image
- Docker Compose 编排前后端服务
- 明确端口、环境变量、启动顺序和 healthcheck

## 范围

### 包含

- Backend Dockerfile（Python 3.12-slim）
- Frontend Dockerfile（multi-stage 或 runtime）
- Docker Compose local stack
- Runtime env injection strategy
- Healthcheck / startup order
- README / run instructions

### 不包含

- Production deployment / K8s
- CI/CD pipeline
- Secret manager / registry publishing
- HTTPS / TLS
- Multi-env config (dev/staging/prod)

## 影响分析

| 组件 | 变更 | 说明 |
|------|-----------------|---------|
| Backend runtime | Yes | FastAPI app runs inside Python container |
| Frontend runtime | Yes | Frontend serves via build or dev inside container |
| Compose orchestration | Yes | Compose defines services, network, ports |
| Config/env injection | Yes | Runtime env vars through compose / .env |
| Healthcheck | Yes | Backend readiness must be observable |
| Source code | Minimal | Only change if container reveals hardcoded path/config issues |

## 依赖与复用

### 依赖

- Existing `Chatbot/backend` FastAPI application
- Existing `Chatbot` frontend application
- Documented env variable list (or `.env.example`)

### 复用

- Existing frontend/backend project structure
- Existing provider/API key env var conventions

### 后续能力

- Future CI/CD build verification
- More reliable local demos
- Runtime baseline for CrewAI / multi-agent work

## 非功能约束

- Logging: container output must go to stdout/stderr for `docker compose logs`
- Error handling: missing required env vars must fail visibly or be documented as prerequisites
- Timeout/retry: `depends_on` alone does not guarantee readiness
- Config/env: secrets must come from env or local files, never hardcoded in images
- Security/secrets: API keys must not be copied into Docker images
- Volume strategy: bind mounts allowed for dev only, must be explicit
- Port mapping: exposed host ports must be documented in README

## 架构设计

- Keep backend and frontend images independent
- Compose is orchestration layer, not application logic layer
- Use narrow Docker build context to avoid copying monorepo files
- Prefer reproducible dependency install over relying on host state
- Dev and production behavior: this proposal is local runtime baseline only

## 成功标准

- [ ] Backend image builds successfully
- [ ] Frontend image builds successfully
- [ ] `docker compose up` starts required services
- [ ] Frontend can reach backend through documented URL/config
- [ ] Missing env/config failure mode is documented or visible
- [ ] README contains container run commands, ports, and env requirements

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-------------|--------|------------|
| API keys accidentally copied into image | Med | High | Use .dockerignore, env injection, local ignored env files |
| Frontend points to wrong backend URL | Med | Med | Document browser URL vs container service URL difference |
| depends_on starts frontend before backend ready | Med | Med | Add healthcheck or document manual readiness check |
| Build context includes too much monorepo content | Med | Low | Narrow context + .dockerignore |
