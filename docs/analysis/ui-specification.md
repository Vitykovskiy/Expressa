# UI Specification

## Bounded Slice Note

Issue `#10` resolves the frontend frame-mapping gate for Slice B decomposition.

Source design files:

- Customer: `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer`
- Administrator/Barista: `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin`

## Screens And Interfaces

| Screen / interface | User | Goal | States | Notes |
| --- | --- | --- | --- | --- |
| Customer menu catalog | Customer | Browse categories and open products | Loading, populated, empty, blocked user, unavailable items | Use mapped customer catalog/group frames with direct `node-id` links |
| Product details / configuration | Customer | Select size and addons before adding to cart | Default, invalid config, unavailable option | Drinks require size `S/M/L`; addon groups may allow multiple or mutually exclusive choices |
| Cart | Customer | Review and edit selected items | Empty, populated, validation error | Cart remains editable before order placement through quantity controls and contract-defined cart mutations |
| Slot selection / checkout | Customer | Choose an available current-day pickup slot and place the order | Loading, available slots, full slots, submission error, success | Slots are 10-minute intervals within configured working hours |
| Order history | Customer | Review current and past orders | Empty, populated | Must show current user's orders only on a dedicated history screen |
| Backoffice orders tab | Barista, Administrator | Review incoming orders and perform status actions | Empty, queue present, action in progress, transition error | Actions include confirm, reject with reason, ready, close |
| Backoffice availability tab | Barista, Administrator | Toggle temporary availability for items, options, and addons | Loading, editable, save error | Barista can change availability only, not structure or pricing |
| Backoffice menu tab | Administrator | Manage categories, products, sizes, addons, and prices | Loading, editable, validation error | Hidden from barista; mobile frame is now mapped, but desktop frame and explicit error/save states are still missing in issue `#21` |
| Backoffice users tab | Administrator | Assign barista role and block users | Loading, editable, validation error | Hidden from barista |
| Backoffice settings tab | Administrator | Manage working hours and slot capacity | Loading, editable, validation error | Hidden from barista |

## Exact Figma Frame Mapping

Customer file base:
`https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer`

Backoffice file base:
`https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin`

| Screen / interface | Direct frame link (`node-id=`) | Notes |
| --- | --- | --- |
| Customer menu catalog | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=1-3` | Main catalog landing screen |
| Customer menu group (drinks) | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=1-74` | Group-level listing state |
| Customer menu group (food/other) | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=12-315` | Alternate group listing state |
| Product details / configuration | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=1-130` | Product detail with size/addon selectors and add-to-cart controls |
| Cart (populated) | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=1-196` | Populated cart state |
| Cart (empty) | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=12-276` | Empty cart state |
| Slot selection / checkout | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=1-196` | Checkout CTA is present on this frame; slot picker behavior is specified by contract and scenarios |
| Order history | `https://www.figma.com/design/VrpRnba18dTC80u5XfRfXh/Expressa-Customer?node-id=12-4` | Dedicated history screen composition |
| Backoffice orders tab (mobile) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-455` | Includes queue, status actions, and filter tabs |
| Backoffice orders tab (desktop) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=1-2` | Desktop orders composition with side navigation |
| Backoffice reject-reason modal | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-721` | Reject flow reason requirement UI |
| Backoffice availability tab (mobile) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-281` | Full mobile availability screen |
| Backoffice availability tab (desktop) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-2` | Full desktop availability screen |
| Backoffice menu tab (mobile) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=67-3` | Full mobile menu screen with admin tab selection and category list |
| Backoffice menu tab (desktop) | `missing (current file still has desktop nav-link only: https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=2-830)` | Dedicated full-screen desktop menu surface is still not present in current Admin Figma source |
| Backoffice users tab (mobile) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-738` | Full mobile users screen |
| Backoffice users tab (mobile search state) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-853` | Mobile users search state |
| Backoffice users tab (desktop) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-441` | Full desktop users screen |
| Backoffice settings tab (mobile) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-1128` | Full mobile settings screen |
| Backoffice settings tab (desktop) | `https://www.figma.com/design/gFucXna9RTbuxNmyVukOYD/Expressa-Admin?node-id=3-969` | Full desktop settings screen |

## Figma Frame Gating

| Screen group | Figma frame link status | Delivery impact |
| --- | --- | --- |
| Customer app screens | Mapped | Frontend customer implementation issues may be created with direct `figma_frame` links |
| Backoffice app screens | Partially mapped | Orders, availability, users, settings, and mobile menu have full-screen mappings; desktop menu mapping and menu-state coverage are still missing in issue `#21` |

## Backoffice Responsive Shell Scope

- Slice B backoffice UX target includes both mobile and desktop shell variants.
- Mobile shell is represented by `TabBar`-based compositions (for example `node-id=2-455`, `3-281`, `3-738`, `3-1128`).
- Desktop shell is represented by `SideNav`-based compositions (for example `node-id=1-2`, `3-2`, `3-441`, `3-969`).
- Frontend issue `#14` must implement both shell variants for mapped tabs and role visibility, but remains blocked for desktop menu mapping and menu-specific state coverage.

## Interaction Rules

- Direct browser URL access outside Telegram is not supported in v1.
- Customer-facing and backoffice surfaces are launched from different Telegram bots.
- Blocked users must be stopped before they can use customer or backoffice features available to them.
- Customer ordering must prevent checkout with invalid configuration, unavailable products, or unavailable slots.
- Rejection flow in backoffice must require a reason before the action is accepted.
- Role-based tab visibility and permission checks must match the backoffice access matrix.

## Customer Cart Mutation Semantics

- Cart entries are line-based and identified by `cartItemId` from `GET /customer/cart`.
- Cart edit controls on `node-id=1-196` map to line-quantity mutation:
  - `+` increments quantity by `1`.
  - `-` decrements quantity by `1`.
  - when quantity reaches `0`, the line is removed from the cart.
- In-place variant reconfiguration inside the cart is out of scope for Slice B customer flow. Replacement flow is explicit: add desired configuration from product details, then decrement or remove the obsolete cart line.
- Checkout must remain disabled when cart becomes empty after mutations.

## Validation And Error States

| Surface | Condition | Expected behavior |
| --- | --- | --- |
| Customer app | User is blocked | Access is denied and ordering actions are unavailable |
| Product configuration | Required size not selected | Add-to-cart is blocked with clear validation |
| Product configuration | Addon choice violates group rules | Add-to-cart is blocked with clear validation |
| Slot selection | Slot is full or unavailable | Slot cannot be selected or submitted |
| Cart / checkout | Item became unavailable before submission | Checkout is blocked and the user is prompted to resolve cart contents |
| Backoffice orders | Reject action without reason | Submission is blocked until a reason is provided |
| Backoffice tabs | User lacks required role | Tab is hidden and corresponding route or action is denied |

## Clarification Status

- Follow-up analysis issue `#19` resolves the customer-flow clarification gate.
- Remaining delivery dependency is implementation of the cart mutation contract by backend follow-up issue `#20`.
- Follow-up issue `#21` resolves corrected full-screen mappings for backoffice availability/users/settings and confirms dual-shell responsive scope (mobile + desktop).
- `#21` now includes the mobile menu screen at `node-id=67-3`, but remains blocked on missing dedicated desktop menu frame and explicit menu error/save-state coverage; frontend issue `#14` cannot resume until that external design input is provided.

## Accessibility / UX Notes

- Customer UX must remain simple, clear, and mobile-first inside Telegram web app constraints.
- Backoffice UX must minimize operational friction for daily use by baristas.
- Vuetify implementation should preserve role clarity and fast access to order actions rather than forcing deep navigation.
- Frontend implementation issues must inherit direct `figma_frame` links from this mapping table.
