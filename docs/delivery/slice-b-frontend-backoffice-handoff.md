# Slice B Frontend Backoffice Handoff

## Task

- Issue: `#14`
- Scope: backoffice tabs and role UX for orders, availability, menu, users, and settings
- Parent block: `#11`
- Figma frames used:
  - backoffice root: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-455`
  - mapped mobile and desktop backoffice frames from `docs/analysis/ui-specification.md`

## Repository Outputs

- Backoffice shell and screens in `frontend/src/components/`:
  - `BackofficeApp.vue`
  - `BackofficeShell.vue`
  - `BackofficeOrdersScreen.vue`
  - `BackofficeAvailabilityScreen.vue`
  - `BackofficeMenuScreen.vue`
  - `BackofficeUsersScreen.vue`
  - `BackofficeSettingsScreen.vue`
- Backoffice state, API integration, role gating, menu editing, reject flow, and settings save in `frontend/src/composables/useBackofficeApp.js`
- Surface routing and backoffice/admin API clients in `frontend/src/lib/api.js`
- Backoffice formatting helpers and icons in:
  - `frontend/src/lib/format.js`
  - `frontend/src/components/AppIcon.vue`
- Shared app entry split into:
  - `frontend/src/App.vue`
  - `frontend/src/components/CustomerApp.vue`
- Backoffice styling in `frontend/src/styles/main.css`
- Frontend verification in `frontend/src/__tests__/backoffice-app.spec.js`
- Screenshot evidence in `docs/delivery/artifacts/issue-14/`:
  - `admin-desktop-orders.png`
  - `admin-desktop-availability.png`
  - `admin-desktop-menu.png`
  - `admin-desktop-users.png`
  - `admin-desktop-settings.png`
  - `admin-mobile-orders.png`
  - `admin-mobile-menu.png`
  - `admin-mobile-users-search.png`
  - `admin-mobile-settings.png`
  - `barista-mobile-orders.png`
  - `barista-mobile-availability.png`

## Runtime Notes

- Frontend still supports relative-path API mode by default.
- `frontend/vite.config.js` now routes the local proxy target through `VITE_API_BASE_URL` when it is set.
- Manual verification used:
  - backend from the current workspace on `127.0.0.1:18081`
  - frontend Vite dev server on `127.0.0.1:4174`
  - a temporary local same-origin verification proxy on `127.0.0.1:18080`
- The temporary verification proxy was only used to avoid local CORS during browser validation. It is not a repository runtime dependency.

## Verification

- Automated:
  - `npm test`
  - `npm run build`
- Manual:
  - verified administrator shell exposes orders, availability, menu, users, and settings
  - verified barista shell exposes only orders and availability
  - confirmed mobile TabBar and desktop SideNav variants render from the same backoffice surface
  - exercised reject flow with required reason and confirmed rejected order reason renders in the queue
  - exercised availability toggle update and confirmed success feedback
  - exercised settings save and confirmed success feedback
  - confirmed menu lands in the collapsed card state and expands only on demand
  - confirmed users mobile search state matches the mapped search frame

## Visual Checklist

- Platform: pass. Verified both desktop `SideNav` and mobile `TabBar` shells against the mapped backoffice frames.
- Background and accent color: pass. Implemented with the Figma background `#f5f5f7`, active surface tint `#e8e8ff`, and primary accent `#1a1aff`.
- Font family: pass. `Inter` is loaded in `frontend/src/styles/main.css` and used across the backoffice surface, with `Consolas` retained for order identifiers.
- Layout direction: pass. Desktop uses the left navigation plus content canvas layout; mobile uses the stacked single-column layout with bottom tab navigation and frame-matching spacing.

## Downstream Notes

- Frontend scope for `#14` is complete and ready for integrated QA under the Slice B block.
- QA can reuse the screenshots above as the baseline for visual comparisons.
- No remaining frontend blocker is open for the backoffice tabs and role UX slice.
