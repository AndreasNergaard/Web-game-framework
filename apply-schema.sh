#!/bin/bash
# Apply database schema changes
echo "🔄 Pushing DB schema..."
docker compose exec web npx prisma db push

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
docker compose exec web npx prisma generate

# Restart the web container to reload the new client
echo "🔄 Restarting web container..."
docker compose restart web

echo "✅ Done! Database and Client updated."
