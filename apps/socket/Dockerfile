FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace wiring
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY turbo.json .

# Only socket app
COPY apps/socket apps/socket
COPY packages/redis packages/redis
# Install only socket deps
RUN pnpm install 

RUN pnpm  build

EXPOSE 5000
CMD ["node", "apps/socket/dist/index.js"]
