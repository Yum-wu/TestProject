# 增量： Chatbot Container Runtime

**变更 ID:** `docker-containerize-chatbot`
**影响范围:** Chatbot backend runtime, frontend runtime, Docker Compose orchestration, env/config documentation

---

## 新增

### 需求： Backend service runs in container

System SHALL provide a Docker image capable of running Chatbot FastAPI backend without host Python virtualenv.

#### 场景： Backend image builds

- 给定 backend source code and dependency files exist
- 当 backend image build command runs
- 则 Docker build completes successfully
- AND runtime dependencies are installed inside image

#### 场景： Backend starts with valid config

- 给定 required environment variables are provided
- 当 backend container starts
- 则 FastAPI service listens on documented container port
- AND logs are visible through `docker compose logs`

#### 场景： Missing required backend config

- 给定 required environment variables are missing
- 当 backend container starts or first protected request runs
- 则 failure is visible through logs or structured error response
- AND missing config requirement is documented

#### 场景： Backend readiness check

- 给定 backend container is starting
- 当 readiness or health endpoint is checked
- 则 caller can determine whether backend is ready
- AND compose documentation does not claim readiness from `depends_on` alone

---

### 需求： Frontend service runs in container

System SHALL provide a Docker image or container flow for Chatbot frontend without host Node dependencies.

#### 场景： Frontend image builds

- 给定 frontend source code and package files exist
- 当 frontend image build command runs
- 则 Docker build completes successfully
- AND frontend dependencies are installed inside image

#### 场景： Frontend starts with valid config

- 给定 backend URL config is provided or documented
- 当 frontend container starts
- 则 frontend is reachable on documented host port
- AND user can open UI in browser

#### 场景： Frontend backend URL misconfigured

- 给定 frontend points to unreachable backend URL
- 当 user triggers backend-dependent behavior
- 则 request failure is visible in UI or browser dev tools
- AND troubleshooting docs explain expected URL configuration

---

### 需求： Compose stack orchestrates local runtime

System SHALL provide Docker Compose configuration to start Chatbot backend and frontend as a local stack.

#### 场景： Compose happy path

- 给定 required env/config values are available
- 当 `docker compose up` runs
- 则 backend and frontend services start
- AND documented host ports are reachable

#### 场景： Backend unhealthy

- 给定 backend container fails health/readiness check
- 当 compose stack is running
- 则 backend failure is visible in logs or health status
- AND docs explain how to inspect backend logs

#### 场景： Missing env file or env vars

- 给定 env file or required env vars are absent
- 当 compose stack starts
- 则 failure mode is visible or documented
- AND no secret values are baked into images

#### 场景： Service network failure

- 给定 frontend cannot reach backend due to network or URL mismatch
- 当 user performs backend-dependent action
- 则 failure can be diagnosed using documented service names, ports, and logs
- AND docs distinguish browser host URL from compose service URL

---

## 修改

(None)

---

## 删除

(None)
