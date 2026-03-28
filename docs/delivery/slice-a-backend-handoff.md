# Slice A Backend Handoff (Issue #5)

This document is the backend handoff for implementation issue `#5`.

## Scope Delivered

- Customer APIs for menu, cart, slots, order creation, and order history
- Backoffice APIs for order queue and lifecycle transitions
- Backoffice availability toggles for products and addons
- Domain-rule enforcement for status transitions, rejection reason, slot-capacity accounting, role checks, and blocked users
- Automated backend tests for critical business rules

## Repository Assets

- Service implementation: `backend/src/app.js`, `backend/src/store.js`, `backend/src/server.js`
- Backend tests: `backend/tests/api.test.js`
- Runtime image definition: `backend/Dockerfile`
- Package manifest and lockfile: `backend/package.json`, `backend/package-lock.json`

## Request Context Contract

- `x-telegram-id` header is used as actor identity in Slice A APIs
- `DISABLE_TG_AUTH=true` allows seeded test identities without Telegram signature validation
- Seed identities:
  - administrator: `ADMIN_TELEGRAM_ID` (required)
  - barista: `BARISTA_TELEGRAM_ID` (default `2001`)
  - customer: `CUSTOMER_TELEGRAM_ID` (default `3001`)

## API Coverage

- `GET /healthz`
- `GET /customer/menu`
- `POST /customer/cart/items`
- `GET /customer/cart`
- `GET /customer/slots`
- `POST /customer/orders`
- `GET /customer/orders`
- `GET /backoffice/orders`
- `POST /backoffice/orders/:id/confirm`
- `POST /backoffice/orders/:id/reject`
- `POST /backoffice/orders/:id/ready`
- `POST /backoffice/orders/:id/close`
- `POST /backoffice/availability/product`
- `POST /backoffice/availability/addon`

## Operational Notes For #7 And #8

- Backoffice endpoints require barista/administrator role.
- Blocked users are denied on both customer and backoffice surfaces.
- Rejection requires a non-empty `reason`.
- Slot-capacity consumption includes only `Created`, `Confirmed`, and `Ready for pickup`; `Rejected` and `Closed` free capacity.
- Runtime container serves HTTP on `PORT` (default `80`).

## Verification Commands

- `cd backend && npm test`
