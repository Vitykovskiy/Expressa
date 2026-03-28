#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BASE_URL="${BASE_URL:-http://127.0.0.1:18081}"
ACTORS_FILE="${ACTORS_FILE:-${SCRIPT_DIR}/fixtures/actors.json}"
REJECTION_FILE="${REJECTION_FILE:-${SCRIPT_DIR}/fixtures/rejection.json}"
FRONTEND_DIR="${FRONTEND_DIR:-${REPO_ROOT}/frontend}"
NODE_BIN="${NODE_BIN:-node}"
NPM_BIN="${NPM_BIN:-npm}"
SLICE_A_SCENARIO="${SCRIPT_DIR}/slice-a-api.e2e.mjs"
SLICE_B_SCENARIO="${SCRIPT_DIR}/slice-b-api.e2e.mjs"

if ! command -v "${NODE_BIN}" >/dev/null 2>&1; then
  if command -v node.exe >/dev/null 2>&1; then
    NODE_BIN="node.exe"
  else
    echo "Node runtime is not available in PATH for tests/e2e/run-slice-b.sh"
    exit 1
  fi
fi

if ! command -v "${NPM_BIN}" >/dev/null 2>&1; then
  if command -v npm.cmd >/dev/null 2>&1; then
    NPM_BIN="npm.cmd"
  else
    echo "npm is not available in PATH for tests/e2e/run-slice-b.sh"
    exit 1
  fi
fi

if [ "${NODE_BIN}" = "node.exe" ]; then
  if command -v wslpath >/dev/null 2>&1; then
    SLICE_A_SCENARIO="$(wslpath -w "${SLICE_A_SCENARIO}")"
    SLICE_B_SCENARIO="$(wslpath -w "${SLICE_B_SCENARIO}")"
    ACTORS_FILE="$(wslpath -w "${ACTORS_FILE}")"
    REJECTION_FILE="$(wslpath -w "${REJECTION_FILE}")"
  elif command -v cygpath >/dev/null 2>&1; then
    SLICE_A_SCENARIO="$(cygpath -w "${SLICE_A_SCENARIO}")"
    SLICE_B_SCENARIO="$(cygpath -w "${SLICE_B_SCENARIO}")"
    ACTORS_FILE="$(cygpath -w "${ACTORS_FILE}")"
    REJECTION_FILE="$(cygpath -w "${REJECTION_FILE}")"
  fi
fi

echo "Running Slice B QA frontend specs"
(
  cd "${FRONTEND_DIR}"
  "${NPM_BIN}" test -- src/__tests__/customer-app.spec.js src/__tests__/backoffice-app.spec.js
)

echo "Running Slice A API baseline scenarios for shared order lifecycle"
"${NODE_BIN}" "${SLICE_A_SCENARIO}" \
  --base-url "${BASE_URL}" \
  --actors "${ACTORS_FILE}" \
  --rejection "${REJECTION_FILE}"

echo "Running Slice B API scenarios for availability and admin paths"
"${NODE_BIN}" "${SLICE_B_SCENARIO}" \
  --base-url "${BASE_URL}" \
  --actors "${ACTORS_FILE}"
