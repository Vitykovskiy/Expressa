#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:18082}"

if curl -fsS "${BASE_URL}/healthz" >/dev/null; then
  echo "Frontend smoke check passed via /healthz"
  exit 0
fi

if curl -fsS "${BASE_URL}/" >/dev/null; then
  echo "Frontend smoke check passed via /"
  exit 0
fi

echo "Frontend smoke check failed for ${BASE_URL}"
exit 1
