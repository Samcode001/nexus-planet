FROM node:20-bookworm-slim

WORKDIR /app

# System deps for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY turbo.json .

# Monorepo source
COPY packages/db packages/db
COPY apps/http apps/http

# Prisma build-time env
ENV DATABASE_URL="file:./dev.db"

# Install deps
RUN pnpm install

# Build everything (Prisma client generated here)
RUN pnpm run build

EXPOSE 3000

CMD ["node", "apps/http/dist/index.js"]
