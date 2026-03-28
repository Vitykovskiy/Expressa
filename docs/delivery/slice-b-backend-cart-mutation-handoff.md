# Slice B Backend Cart-Mutation Handoff (Issue #20)

This document is the backend handoff for implementation issue `#20`.

## Scope Delivered

- Customer cart line-quantity mutation contract for frontend `+/-` controls.
- Deterministic validation and error behavior for cart mutation payloads.
- Stable `cartItemId` and `quantity` fields in customer cart snapshots.
- Line removal behavior when quantity reaches `0`.

## Repository Assets

- Service implementation: `backend/src/app.js`, `backend/src/store.js`
- Backend tests: `backend/tests/api.test.js`

## API Coverage Added In Slice B Backend

- `POST /customer/cart/items/:id/quantity`

## Contract Notes For Frontend Task #13

- Path parameter `:id` maps to `cartItemId` from `GET /customer/cart`.
- Payload must be a JSON object with `delta: 1 | -1`.
- `delta=1` increments line quantity by one.
- `delta=-1` decrements line quantity by one.
- When quantity reaches `0`, the line is removed from cart snapshot.
- Unknown `cartItemId` returns `404` with `Cart item not found`.
- Invalid payload returns `400` with deterministic validation message.

## Verification Command

- `cd backend && npm test`
