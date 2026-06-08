#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pull latest code"
git pull

echo "==> Build backend jar"
cd backend
chmod +x mvnw
./mvnw -DskipTests package
cd ..

echo "==> Restart containers"
docker-compose down --remove-orphans
docker-compose up -d --build

echo "==> Done"
docker-compose ps
