# Slice B Backend Handoff (Issue #12)

This document is the backend handoff for implementation issue `#12`.

## Scope Delivered

- Administrator-only contracts for backoffice `Menu`, `Users`, and `Settings` tabs.
- Deterministic validation errors for admin tab mutation payloads.
- Role-boundary preservation:
  - barista keeps availability-only scope in `/backoffice/availability/*`;
  - administrator-only access is enforced for `/admin/*`.
- Root administrator safety rules for role and block mutations.

## Repository Assets

- Service implementation: `backend/src/app.js`, `backend/src/store.js`
- Backend tests: `backend/tests/api.test.js`
- Contract update: `docs/analysis/integration-contracts.md`

## API Coverage Added In Slice B Backend

- `POST /admin/menu/list`
- `POST /admin/menu/category`
- `POST /admin/menu/product`
- `POST /admin/menu/size`
- `POST /admin/menu/addon-group`
- `POST /admin/menu/addon`
- `POST /admin/users/list`
- `POST /admin/users/role`
- `POST /admin/users/block`
- `POST /admin/settings`

## Contract Notes For Frontend Tasks #13 And #14

- All `/admin/*` endpoints require an actor with `administrator` role.
- Barista requests to `/admin/*` return `403` with `Administrator role is required`.
- `POST /admin/settings` behavior:
  - empty object returns current settings;
  - non-empty payload updates supported fields only (`workingHoursStart`, `workingHoursEnd`, `slotCapacity`);
  - unknown fields are rejected with `400`.
- `POST /admin/users/role` accepts only `customer` or `barista` as the target role.
- Root administrator identified by `ADMIN_TELEGRAM_ID` cannot be blocked or demoted.

## Verification Command

- `cd backend && npm test`
