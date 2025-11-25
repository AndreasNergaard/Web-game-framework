# Web Game Framework - AI Agent Instructions

## Project Overview
This is a browser game framework built with **Next.js 16 (App Router)**, **PostgreSQL**, **Prisma**, and **Docker**. The application logic resides in the `web/` directory.

## Architecture & Core Components

### Infrastructure
- **Docker**: The primary development environment.
  - `docker-compose.yml` defines `web` (Next.js) and `db` (PostgreSQL) services.
  - The `web` container mounts the local `web/` directory for hot reloading.
  - **Command**: `docker compose up --build` to start the environment.

### Database (Prisma)
- **ORM**: Prisma v7.
- **Schema**: Split into multiple files in `web/prisma/schema/*.prisma`.
  - **Convention**: Do NOT edit a single `schema.prisma`. Create or modify specific `.prisma` files in the `schema/` directory.
- **Migrations**: The `web` container automatically runs `npx prisma db push` on startup.
  - **Workflow**: To apply schema changes, modify the `.prisma` files and restart the `web` container.
- **Client**: Singleton instance exported from `web/lib/prisma.ts`.

### Authentication (Better Auth)
- **Library**: `better-auth` with Prisma adapter.
- **Server**: Configuration in `web/lib/auth.ts`.
- **Client**: Client-side hooks exported from `web/lib/auth-client.ts`.
- **Schema**: Auth-related models (`User`, `Session`, `Account`) are defined in `web/prisma/schema/auth.prisma`.

### Frontend
- **Framework**: Next.js 16 App Router.
- **Styling**: Tailwind CSS v4.
- **Structure**:
  - `web/app/`: Routes and pages.
  - `web/components/`: Reusable UI components.
  - `web/lib/`: Shared utilities and configuration (auth, prisma).

## Critical Workflows

### Development
1.  **Start**: Run `docker compose up` in the root directory.
2.  **Access**: App is available at `http://localhost:3000`.
3.  **Logs**: View container logs to debug server-side issues.

### Database Updates
1.  Modify files in `web/prisma/schema/`.
2.  Restart the docker container or run `npx prisma db push` inside the `web` container if you need immediate updates without restart.

## Coding Conventions
- **Imports**: Use absolute imports `@/` where possible (configured in `tsconfig.json`).
- **Components**: Prefer server components by default. Use `"use client"` only when interactivity is needed.
- **Auth**: Use `authClient` for client-side auth interactions (signIn, signOut, useSession).
- **Type Safety**: Ensure all database operations use Prisma generated types.

## Key Files
- `docker-compose.yml`: Service definitions.
- `web/prisma/schema/`: Database schema definitions.
- `web/lib/auth.ts`: Auth configuration.
- `web/lib/prisma.ts`: Database client.
