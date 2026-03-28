# Slice B QA Assets Handoff (Issue #16)

This document defines the reusable QA automation assets produced by issue `#16` for deploy issue `#17` and block validation issue `#18`.

## Scope Delivered

- Executable Slice B QA entrypoint that combines UI-oriented frontend specs with backend-backed integration scenarios.
- Backend-backed scenarios for availability read/mutate flows and administrator read/update paths required by Slice B backoffice tabs.
- Explicit environment assumptions and actor fixtures for downstream deploy/e2e handoff.
- CI workflow that validates the Slice B QA asset contract against a running backend process.

## Repository Assets

- Entrypoint script: `tests/e2e/run-slice-b.sh`
- Slice A baseline scenario reuse: `tests/e2e/slice-a-api.e2e.mjs`
- Slice B scenario runner: `tests/e2e/slice-b-api.e2e.mjs`
- Shared fixtures:
  - `tests/e2e/fixtures/actors.json`
  - `tests/e2e/fixtures/rejection.json`
- Validation wrapper: `infra/validation/run-e2e.sh`
- CI workflow: `.github/workflows/slice-b-qa-assets-validation.yml`
- Frontend UI-flow specs reused as part of the QA asset contract:
  - `frontend/src/__tests__/customer-app.spec.js`
  - `frontend/src/__tests__/backoffice-app.spec.js`

## Scenario Coverage

1. Customer UI flow baseline: catalog -> product detail -> cart mutation -> checkout -> order history (`CUS-01`, `CUS-02`) through frontend specs plus backend-backed order lifecycle scenario reuse.
2. Backoffice UI baseline: role-gated navigation, reject-reason flow, orders shell behavior, and admin tab visibility (`BAR-01`, `ADM-01`, `ADM-02`) through frontend specs.
3. Backoffice availability read-model and mutation round-trip (`BAR-02`) through backend-backed e2e scenarios.
4. Administrator settings/menu/users read-model access plus settings update/restore round-trip (`ADM-01`, `ADM-02`) through backend-backed e2e scenarios.

## Environment Assumptions

- Backend is reachable via `BASE_URL` (default `http://127.0.0.1:18081`).
- Slice B live frontend validation on VPS is not part of issue `#16`; that validation remains owned by issue `#18` after deploy issue `#17` makes the frontend surface reachable.
- Test mode uses `DISABLE_TG_AUTH=true`.
- Actor identities are supplied by fixtures or environment variables:
  - `ADMIN_TELEGRAM_ID` (default `1` for the QA asset workflow)
  - `BARISTA_TELEGRAM_ID` (default `2001`)
  - `CUSTOMER_TELEGRAM_ID` (default `3001`)
  - `SECONDARY_CUSTOMER_TELEGRAM_ID` (default `3002`)
- Frontend dependencies must be installed in `frontend/` before running the combined Slice B entrypoint because the entrypoint executes the frontend vitest specs directly.

## Execution Commands

- Local execution against a running backend:
  - `BASE_URL=http://127.0.0.1:18081 bash tests/e2e/run-slice-b.sh`
- Through the standard validation wrapper:
  - `E2E_ENTRYPOINT=tests/e2e/run-slice-b.sh E2E_STRICT=true BASE_URL=http://127.0.0.1:18081 bash infra/validation/run-e2e.sh`

## Handoff To Issues #17 And #18

- Issue `#17` should keep `infra/validation/run-e2e.sh` wired with `E2E_ENTRYPOINT=tests/e2e/run-slice-b.sh` when validating the deployed Slice B environment.
- Issue `#18` should reuse this asset set as the executable contract for integrated validation, then add live VPS BrowserMCP comparison against the mapped Figma frames before giving a go / no-go recommendation.
