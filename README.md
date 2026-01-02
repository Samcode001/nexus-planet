# Nexus Planet

A **real‑time multiplayer collaboration / metaverse platform** built as a **production‑ready monorepo**.
Nexus Planet focuses on **low‑latency real‑time interaction**, scalable backend services, and modern DevOps practices.

---

## What is Nexus Planet?

Nexus Planet is a **real-time multiplayer environment** where multiple users can:

- Join shared virtual rooms
- Move avatars in real time
- See other players instantly
- Talk using **proximity-based voice chat (WebRTC)**
- Maintain persistent player state across sessions

This project is designed to simulate **real-world system design challenges**, including:

- Real-time state synchronization
- Server-authoritative movement
- WebSocket scalability
- WebRTC audio signaling
- Monorepo + Docker-based deployment

---

## Core Features

### Real-Time Multiplayer

- Bi-directional WebSocket communication
- Server-authoritative movement
- Redis-backed last-known position caching
- Persistent player state via PostgreSQL

### Avatar System

- Avatar selection & persistence
- Real-time movement broadcast
- X/Y tile-based positioning

### Proximity Voice Chat (WebRTC)

- Peer-to-peer audio using WebRTC
- Socket-based signaling (offer / answer / ICE)
- Push-to-Talk (hold key to speak)
- Mic stream toggling without renegotiation
- Designed for future spatial audio attenuation

### Production-Focused Architecture

- Separate HTTP, WebSocket, and frontend services
- Prisma ORM with PostgreSQL
- Redis for real-time state & caching
- Dockerized monorepo builds
- Nginx reverse proxy (HTTPS-ready)

---

## Screenshots / Demo

### Lobby / Room View

<p align="center">
  <img src="docs/images/lobby.png" width="95%" />
</p>

### Multiple Avatars Interaction

<p align="center">
  <img src="docs/images/interaction.png" width="95%" />
</p>

### Real-time Movement / Chat

<p align="center">
  <img src="docs/images/chat.png" width="95%" />
</p>
---

## Architecture Overview

```
             ┌──────────────────┐
             │   PixiJS Client   │
             │  (React + Vite)   │
             └────────▲─────────┘
                      │
      REST (Auth/Data) │ WebSocket (State)
                      │ WebRTC (Audio)
                      ▼
    ┌──────────────────────────────┐
    │   Node.js Backend (Monorepo) │
    │                              │
    │  ┌────────────┐  ┌────────┐  │
    │  │ HTTP API   │  │ Socket │  │
    │  │ (Express)  │  │ Server │  │
    │  └────▲──────┘  └────▲───┘   │
    │       │               │      │
    │       ▼               ▼      │
    │  PostgreSQL        Redis     │
    │   (Prisma)     (Realtime)    │
    └──────────────────────────────┘


```

---

## Monorepo Structure

```
project/
├── apps/
│   ├── pixi/        # React + PixiJS client
│   ├── http/            # REST API server
│   └── ws/              # WebSocket + WebRTC signaling server
│
├── packages/
│   └── db/              # Prisma database client
|   └── redis/           # Redis client
│
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## Tech Stack

### Frontend

- React
- PixiJS
- TypeScript

### Backend

- Node.js
- Express
- WebSockets
- Prisma ORM
- PostgreSQL

### DevOps / Infra

- PNPM Workspaces
- Turborepo
- Docker & Docker Compose
- AWS EC2 (planned)
- Nginx (reverse proxy)

---

## Getting Started (Local Development)

### 1️ Prerequisites

- Node.js ≥ 18
- PNPM
- Docker (optional but recommended)

---

### 2️ Install Dependencies

```bash
pnpm install
```

---

### 3️ Environment Variables

Create environment files:

```bash
cp .env.example .env
cp .env.ws.example .env.ws
```

> Do not commit real secrets

---

### 4️ Build Packages

```bash
pnpm --filter @repo/db build
pnpm --filter http build
pnpm --filter ws build
```

---

### 5️ Start Services

```bash
pnpm --filter http start
pnpm --filter ws start
pnpm --filter frontend dev
```

---

## Docker Setup

To run the entire stack using Docker:

```bash
docker compose build
docker compose up
```

This will start:

- Frontend
- HTTP API
- WebSocket server
- Database
- Redis

---

## Deployment Strategy

### Recommended (Early Stage)

- **Frontend** → Vercel
- **HTTP + WS** → Single EC2 instance (Docker)
- **Nginx** → Reverse proxy for routing & SSL

### Why?

- Low cost
- Simple scaling
- Production‑like architecture

---

## Testing (Planned)

- Unit tests for core logic
- Integration tests for APIs
- WebSocket event testing

---

## Roadmap

- [ ] Improve avatar movement reconciliation
- [ ] Add proximity chat
- [ ] Load testing WebSocket server
- [ ] CI/CD with GitHub Actions
- [ ] Kubernetes (optional)

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## License

MIT License

---

## Author

**Himanshu Jaiswal**
Full‑Stack Developer | Real‑Time Systems Enthusiast

---

> If you like this project, consider starring the repo!
