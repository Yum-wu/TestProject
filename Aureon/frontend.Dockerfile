# ── Aureon Frontend: Vite + React (Production Build) ──
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_CREW_API_URL
ENV VITE_API_URL=
ENV VITE_CREW_API_URL=

RUN npm run build

# ── Serve with nginx ──
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


