# Slice B Backend Availability Handoff (Issue #23)

This document records backend delivery for implementation issue `#23`.

## Scope Delivered

- Implemented `POST /backoffice/availability/list` for both `barista` and `administrator`.
- Implemented availability mutation coverage for `product`, `size`, `addon-group`, and `addon`.
- Preserved availability-only mutation boundary for backoffice role endpoints (no structural or pricing mutation in `/backoffice/availability/*`).
- Added deterministic validation/auth errors and target-specific not-found errors for availability endpoints.

## Response Contract Delivered

- `POST /backoffice/availability/list` returns:
  - `categories`, `products`, `sizes`, `addonGroups`, `addons`
  - `updatedAt`
- Read-model includes entities with `isTemporarilyAvailable=false` so the backoffice can re-enable them.
- `POST /backoffice/availability/{...}` returns:
  - `target`, `id`, `isTemporarilyAvailable`, `updatedAt`

## Repository Assets

- Service implementation: `backend/src/app.js`, `backend/src/store.js`
- Backend tests: `backend/tests/api.test.js`
- Canonical contract update: `docs/analysis/integration-contracts.md`

## Frontend Unblock Note

Frontend issue `#14` can consume availability data without contract guessing once issue `#23` is marked done and the dependency is cleared from `Blocked`.

## Verification Command

- `cd backend && npm test`
