# Web Game Framework

A template for creating browser games with Next.js, Postgres, and Docker.

## Getting Started

1.  **Prerequisites**: Make sure you have Docker and Docker Compose installed.
2.  **Run the application**:
    ```bash
    docker compose up --build
    ```
3.  **Access the app**: Open [http://localhost:3000](http://localhost:3000).

## Features

-   **Next.js 16** (App Router)
-   **PostgreSQL** Database
-   **Prisma** ORM
-   **Better Auth** Authentication (Email/Password)
-   **Tailwind CSS** Styling
-   **Docker Compose** Setup

## Development

-   The `web` folder contains the Next.js application.
-   The `docker-compose.yml` file defines the services (web and db).
-   Database schema is in `web/prisma/schema/`.
-   To modify the database schema:
    1.  Edit files in `web/prisma/schema/` or add new `.prisma` files.
    2.  Restart the container (migrations are applied on startup via `prisma db push`).

## Deployment

This setup is ready to be deployed to any host that supports Docker or Next.js + Postgres.
