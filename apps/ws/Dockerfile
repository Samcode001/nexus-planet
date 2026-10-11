FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace wiring
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY turbo.json .

#Only Ws App
COPY apps/ws apps/ws
COPY packages/redis packages/redis
COPY packages/types packages/types

#Install only ws dep
RUN pnpm install

RUN pnpm build

EXPOSE 8080
CMD ["node","apps/ws/dist/index.js"]