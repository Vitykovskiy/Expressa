# Slice B Frontend Backoffice Blocker

## Task

- Blocked issue: `#14`
- Follow-up analysis: `#21`, `#22`
- Scope: backoffice tabs and role UX for barista and administrator

## Status

- Analysis issue `#21`: `resolved`
- Analysis issue `#22`: `open`
- Remaining blocker: missing barista-capable availability read contract

## Resolved By #21

- Corrected full-screen mappings for:
  - orders (`2-455` mobile, `1-2` desktop);
  - availability (`3-281` mobile, `3-2` desktop);
  - menu (`67-3` mobile, `67-5` desktop);
  - users (`3-738` mobile, `3-853` mobile search state, `3-441` desktop);
  - settings (`3-1128` mobile, `3-969` desktop).
- Responsive backoffice shell scope is now explicit: implement both mobile (`TabBar`) and desktop (`SideNav`) variants.
- Menu loading, validation, and save-error feedback may be implemented from shared backoffice interaction rules and contract-driven validation without dedicated Figma frames.

## Remaining Blocker Summary

Frontend issue `#14` is no longer blocked by missing menu-tab mapping. The direct full-screen menu surfaces are now available for both shells:

- mobile menu: `node-id=67-3`;
- desktop menu: `node-id=67-5`.

## Why This Blocks #14

Issue `#14` definition of done requires:

- orders, availability, and administrator tabs;
- role-based tab visibility;
- reject-reason flow and status transitions;
- frontend verification artifacts for downstream QA.

The canonical mapping is now sufficient for orders, availability, menu, users, settings, and responsive shell behavior. `#14` can resume without guessing UI structure.

## Evidence

- Canonical mapping source: `docs/analysis/ui-specification.md`
- Verified valid orders frame: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-455`
- Verified valid reject modal: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-721`
- Verified corrected backoffice tab frames:
  - availability: `3-281` (mobile), `3-2` (desktop)
  - menu: `67-3` (mobile), `67-5` (desktop)
  - users: `3-738` and `3-853` (mobile), `3-441` (desktop)
  - settings: `3-1128` (mobile), `3-969` (desktop)
- Verified desktop menu frame:
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=67-5`

## Required Unblock Output

Unblock output is complete. No further external input is required for `#14` from issue `#21`.

## New Blocker Discovered During Frontend Execution

### Date

- 2026-03-28

### Summary

Frontend execution for `#14` is blocked again by a contract gap in the availability flow for barista users.

### Verified Finding

- `Availability` must be visible to both `barista` and `administrator` per `docs/analysis/ui-specification.md`.
- The approved API set exposes write-only availability mutations through `POST /backoffice/availability/*`.
- The only menu read-model that includes inactive or temporarily unavailable entities is `POST /admin/menu/list`.
- `POST /admin/menu/list` is administrator-only in the implemented backend contract, so a barista cannot load the full availability dataset required to disable and re-enable products or addons.
- `GET /customer/menu` is not a valid fallback because it omits unavailable items and therefore cannot support re-enabling them from the backoffice availability screen.

### Delivery Impact

- Frontend cannot implement the barista `Availability` tab without inventing an undocumented read contract or shipping a broken partial flow.
- `#14` must remain blocked until system analysis and backend contract ownership define a barista-capable availability read path or explicitly change the role scope.

### Required Follow-Up

- Linked follow-up `system_analysis` issue: `#22`.
- Keep `#14` in `Blocked` until that follow-up is resolved in canonical docs and implemented by the owning contour if needed.
