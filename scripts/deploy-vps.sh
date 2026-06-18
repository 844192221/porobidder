#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${DEPLOY_BRANCH:-frontend-ui}"

echo "==> Pull latest code (${BRANCH})"
git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

echo "==> Build backend jar"
cd backend
chmod +x mvnw
./mvnw -DskipTests package
cd ..

echo "==> Build images and restart containers"
docker-compose down --remove-orphans
docker-compose up -d --build

echo "==> Done"
docker-compose ps
