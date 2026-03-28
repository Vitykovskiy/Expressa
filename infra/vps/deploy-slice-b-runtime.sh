#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "deploy-slice-b-runtime.sh must run as root."
  exit 1
fi

if [ $# -lt 1 ] || [ $# -gt 3 ]; then
  echo "Usage: deploy-slice-b-runtime.sh <compose-file-path> [backend-image] [frontend-image]"
  exit 1
fi

if [ -z "${DISABLE_TG_AUTH:-}" ]; then
  echo "DISABLE_TG_AUTH is required."
  exit 1
fi

if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "POSTGRES_PASSWORD is required."
  exit 1
fi

COMPOSE_SOURCE="$1"
BACKEND_IMAGE="${2:-}"
FRONTEND_IMAGE="${3:-}"
TARGET_DIR="/opt/expressa/staging/slice-b"
TARGET_COMPOSE="${TARGET_DIR}/docker-compose.slice-b.yml"
TARGET_ENV="${TARGET_DIR}/.env"
BACKEND_PORT="${BACKEND_PORT:-18081}"
FRONTEND_PORT="${FRONTEND_PORT:-18082}"
DISABLE_TG_AUTH_NORMALIZED="$(echo "${DISABLE_TG_AUTH}" | tr '[:upper:]' '[:lower:]')"
DEFAULT_BACKEND_IMAGE="ghcr.io/vitykovskiy/expressa-backend:slice-b-latest"
DEFAULT_FRONTEND_IMAGE="ghcr.io/vitykovskiy/expressa-frontend:slice-b-latest"

if [ -z "${ADMIN_TELEGRAM_ID:-}" ]; then
  if [ "${DISABLE_TG_AUTH_NORMALIZED}" = "true" ]; then
    ADMIN_TELEGRAM_ID="1001"
  else
    echo "ADMIN_TELEGRAM_ID is required."
    exit 1
  fi
fi

if [ -z "${BACKEND_IMAGE}" ]; then
  if [ "${DISABLE_TG_AUTH_NORMALIZED}" = "true" ]; then
    BACKEND_IMAGE="${DEFAULT_BACKEND_IMAGE}"
  else
    echo "BACKEND_IMAGE is required."
    exit 1
  fi
fi

if [ -z "${FRONTEND_IMAGE}" ]; then
  if [ "${DISABLE_TG_AUTH_NORMALIZED}" = "true" ]; then
    FRONTEND_IMAGE="${DEFAULT_FRONTEND_IMAGE}"
  else
    echo "FRONTEND_IMAGE is required."
    exit 1
  fi
fi

mkdir -p "${TARGET_DIR}"
cp "${COMPOSE_SOURCE}" "${TARGET_COMPOSE}"

cat > "${TARGET_ENV}" <<EOF
BACKEND_IMAGE=${BACKEND_IMAGE}
FRONTEND_IMAGE=${FRONTEND_IMAGE}
POSTGRES_DB=${POSTGRES_DB:-expressa}
POSTGRES_USER=${POSTGRES_USER:-expressa}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ADMIN_TELEGRAM_ID=${ADMIN_TELEGRAM_ID}
DISABLE_TG_AUTH=${DISABLE_TG_AUTH}
BACKEND_PORT=${BACKEND_PORT}
BACKEND_INTERNAL_PORT=${BACKEND_INTERNAL_PORT:-80}
FRONTEND_PORT=${FRONTEND_PORT}
DATABASE_URL=${DATABASE_URL:-postgresql://${POSTGRES_USER:-expressa}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-expressa}}
EOF

docker compose -f "${TARGET_COMPOSE}" --env-file "${TARGET_ENV}" pull
docker compose -f "${TARGET_COMPOSE}" --env-file "${TARGET_ENV}" up -d --remove-orphans

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/healthz" >/dev/null; then
    docker compose -f "${TARGET_COMPOSE}" --env-file "${TARGET_ENV}" ps
    exit 0
  fi
  if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null; then
    docker compose -f "${TARGET_COMPOSE}" --env-file "${TARGET_ENV}" ps
    exit 0
  fi
  sleep 2
done

echo "Slice B runtime health check failed."
docker compose -f "${TARGET_COMPOSE}" --env-file "${TARGET_ENV}" ps
exit 1
