# Slice B Frontend Backoffice Blocker

## Task

- Blocked issue: `#14`
- Follow-up analysis: `#21`
- Scope: backoffice tabs and role UX for barista and administrator

## Blocker Summary

Frontend implementation cannot proceed truthfully from the current canonical inputs because the direct Figma frame links for the non-order backoffice tabs are not implementation-ready.

Validated mismatch:

- `node-id=2-455` is a real backoffice orders screen and is usable.
- `node-id=2-721` is a real reject-reason modal and is usable.
- `node-id=2-560`, `2-566`, `2-572`, and `2-580` resolve to bottom-tab `Link` nodes inside the orders screen, not to full tab surfaces for availability, menu, users, or settings.

## Why This Blocks #14

Issue `#14` definition of done requires:

- orders, availability, and administrator tabs;
- role-based tab visibility;
- reject-reason flow and status transitions;
- frontend verification artifacts for downstream QA.

The current Figma mapping is sufficient only for:

- orders tab layout;
- reject modal layout.

It is not sufficient for:

- availability tab composition and editable states;
- menu tab composition and validation states;
- users tab composition and role/block controls;
- settings tab composition and editable states;
- the intended responsive scope for shared backoffice UX beyond the visible mobile orders frame and desktop reject-modal composition.

## Evidence

- Canonical mapping source: `docs/analysis/ui-specification.md`
- Verified valid frame: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-455`
- Verified valid modal: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-721`
- Verified invalid tab targets:
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-560`
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-566`
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-572`
  - `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-580`

## Required Unblock Output

Follow-up issue `#21` must provide:

- corrected direct frame links for each required backoffice tab surface;
- explicit screen-state coverage for loading, empty, editable, save error, and validation error states where applicable;
- explicit role visibility rules mapped to the corrected frames;
- confirmed responsive scope for the shared backoffice shell.
