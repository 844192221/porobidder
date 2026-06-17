#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${DEPLOY_BRANCH:-frontend-ui}"

echo "==> Pull latest code (${BRANCH})"
git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

if [ ! -f frontend/dist/index.html ]; then
  echo "==> Build frontend (npm)"
  if ! command -v npm >/dev/null 2>&1; then
    echo "frontend/dist missing and npm is not installed on this host." >&2
    exit 1
  fi
  cd frontend
  npm ci
  npm run build
  cd ..
fi

chmod -R a+rX frontend/dist

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
