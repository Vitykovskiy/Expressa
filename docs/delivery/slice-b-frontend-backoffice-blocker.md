# Slice B Frontend Backoffice Blocker

## Task

- Blocked issue: `#14`
- Follow-up analysis: `#21`
- Scope: backoffice tabs and role UX for barista and administrator

## Status

- Analysis issue `#21`: `partially resolved`
- Remaining blocker: only the mobile `menu` tab mapping is now present; desktop menu mapping and menu-state coverage are still absent

## Resolved By #21

- Corrected full-screen mappings for:
  - orders (`2-455` mobile, `1-2` desktop);
  - availability (`3-281` mobile, `3-2` desktop);
  - menu (`67-3` mobile);
  - users (`3-738` mobile, `3-853` mobile search state, `3-441` desktop);
  - settings (`3-1128` mobile, `3-969` desktop).
- Responsive backoffice shell scope is now explicit: implement both mobile (`TabBar`) and desktop (`SideNav`) variants.

## Remaining Blocker Summary

Frontend issue `#14` is still blocked because menu-tab composition cannot be mapped to a complete mobile+desktop implementation set:

- provided menu reference `node-id=67-3` resolves to a real full-screen mobile menu surface;
- current desktop menu reference `node-id=2-830` resolves to a `NavLink` node inside the desktop side navigation, not a dedicated menu surface;
- the current Admin Figma file still does not show menu-specific `loading`, `validation error`, or `save error` states.

## Why This Blocks #14

Issue `#14` definition of done requires:

- orders, availability, and administrator tabs;
- role-based tab visibility;
- reject-reason flow and status transitions;
- frontend verification artifacts for downstream QA.

The current canonical mapping is now sufficient for orders, availability, users, settings, responsive shell behavior, and the mobile menu layout. It is still insufficient for full menu-tab implementation without the desktop menu surface and explicit menu-state coverage.

## Evidence

- Canonical mapping source: `docs/analysis/ui-specification.md`
- Verified valid orders frame: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-455`
- Verified valid reject modal: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-721`
- Verified corrected backoffice tab frames:
  - availability: `3-281` (mobile), `3-2` (desktop)
  - menu: `67-3` (mobile)
  - users: `3-738` and `3-853` (mobile), `3-441` (desktop)
  - settings: `3-1128` (mobile), `3-969` (desktop)
- Verified unresolved desktop menu reference:
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-830` (`NavLink` node only)

## Required Unblock Output

To unblock `#14`, external design input must provide:

- direct full-screen Figma frame link (`node-id=`) for the backoffice `menu` tab in the desktop shell variant;
- screen-state coverage for the menu tab at least for `loading`, `validation error`, and `save error` (the provided mobile frame already covers the default editable state);
- explicit confirmation that the provided desktop/menu-state frames cover admin menu-management scope expected by `#14` and current `POST /admin/menu/*` contracts.
