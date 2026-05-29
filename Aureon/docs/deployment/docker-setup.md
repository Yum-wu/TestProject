# Docker Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM

## Quick Start

```bash
# Clone repository
git clone https://github.com/Yum-wu/Aureon.git
cd Aureon

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React app via Nginx |
| backend | 8000 | FastAPI server |
| redis | 6379 | Cache layer |

## Environment Variables

```env
# backend/.env
OPENAI_API_KEY=sk-...
CHROMA_HOST=chroma
REDIS_HOST=redis
```

## Production Checklist

- [ ] Set strong SECRET_KEY
- [ ] Configure CORS allowed origins
- [ ] Enable HTTPS
- [ ] Set up log aggregation
- [ ] Configure monitoring
- [ ] Set resource limits
