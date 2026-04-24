#!/bin/bash
set -e

# Ensure database exists and run migrations
if [ ! -f "./dev.db" ]; then
  echo "Creating SQLite database..."
  touch ./dev.db
fi

if [ -d "./prisma/migrations" ]; then
  echo "Running migrations..."
  npx prisma migrate deploy
fi

echo "Starting signaling server..."
node signaling-server.js &

echo "Starting Next.js server..."
node server.js
