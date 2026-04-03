# Business Requirements

This document captures intake-level requirements. Analysis must refine these into canonical system, UI, and contract artifacts in `docs/analysis/`.

## Business Requirements

- `BR-001`: The product must allow customers to place pickup orders through a mobile Telegram-based flow.
- `BR-002`: The product must provide a unified backoffice web interface for baristas and administrators with role-based access separation.
- `BR-003`: Access to the backoffice must be provided through a dedicated Telegram bot separate from the customer bot.
- `BR-004`: The system must be correctly split into a shared backend and two independent clients: customer and backoffice.
- `BR-005`: Repository documentation must remain the canonical source of truth for requirements, architecture, and delivery decisions.

## Functional Requirements

- `FR-001`: Customers can browse menu positions grouped by menu group.
- `FR-002`: In the menu-position card, customers can choose quantity and additional options before adding the position to the cart.
- `FR-003`: Drink positions support a mandatory size choice `S`, `M`, or `L`; size is a fixed enum and each price is stored directly on the menu position. Non-drink positions have a single price.
- `FR-004`: Menu positions may have additional-option groups that are not exposed as standalone menu positions.
- `FR-005`: Additional options may be paid or free.
- `FR-006`: Customers may choose at most one additional option from each group, and group selection is optional.
- `FR-007`: All additional options inside one group are mutually exclusive by definition; no separate exclusivity flag is required.
- `FR-008`: Additional-option groups are assigned to a menu group and inherited by all menu positions in that menu group. A menu group may have multiple additional-option groups. Position-level inheritance overrides are out of scope for v1.
- `FR-009`: Customers can review and edit the cart before order placement.
- `FR-010`: Customers can create an order from the cart and select an available pickup slot.
- `FR-011`: Pickup slots are 10-minute intervals within configured operating hours.
- `FR-012`: Slots are available only for the current day.
- `FR-013`: Default operating hours are `09:00-20:00`, and an administrator can change them.
- `FR-014`: Default slot capacity is 5 active orders, and an administrator can change it.
- `FR-015`: Orders in `Created`, `Confirmed`, and `Ready for pickup` consume slot capacity.
- `FR-016`: Orders in `Rejected` and `Closed` do not consume slot capacity.
- `FR-017`: Order statuses are `Created`, `Confirmed`, `Rejected`, `Ready for pickup`, and `Closed`.
- `FR-018`: A newly created order immediately receives status `Created`.
- `FR-019`: Only a barista can reject an order, and the system must store the rejection reason.
- `FR-020`: A barista can confirm an order, mark it `Ready for pickup`, and close it after offline pickup.
- `FR-021`: Customers can view their order history.
- `FR-022`: Payment happens offline on pickup; in-app payment is out of scope for v1.
- `FR-023`: Customers receive Telegram notifications when order status changes; rejection notifications include the rejection reason.
- `FR-024`: Identity is based on Telegram; any user who activates the customer bot automatically receives customer access.
- `FR-025`: A user blocked by an administrator cannot create new orders or use the application. Active orders created before blocking stay in the queue and are processed normally by baristas.
- `FR-026`: The initial administrator is defined at deployment time by `ADMIN_TELEGRAM_ID`; on startup the backend must ensure that this user exists in the database with role `administrator`, repeated startup must remain idempotent, and only one initial administrator is created from env. After startup, any administrator may assign other administrators and baristas.
- `FR-027`: Baristas receive periodic Telegram reminders about orders that are waiting for action.
- `FR-028`: Administrators can manage menu structure, menu positions, prices, and operating hours.
- `FR-029`: Administrators can assign users to `barista` and `administrator` roles.
- `FR-030`: Administrators can block users.
- `FR-031`: Baristas can change temporary availability of menu positions and additional options, but cannot change prices or menu structure.
- `FR-032`: The system records which barista confirmed an order.
- `FR-033`: The system records which barista marked an order `Ready for pickup`.
- `FR-034`: The system records which barista rejected an order.
- `FR-035`: The backoffice is tab-based with role-restricted access: `Orders` and `Availability` for `barista` and `administrator`; `Menu`, `Users`, and `Settings` only for `administrator`.
- `FR-036`: Slots whose time has already passed are hidden from customers during checkout. Orders linked to expired slots continue through the normal barista flow with no automatic system action.

## Non-Functional Requirements

- `NFR-001`: Backend must use NestJS.
- `NFR-002`: Frontend applications must use Vue 3 and Vuetify.
- `NFR-003`: The system must be organized as independent services.
- `NFR-004`: Architecture must prioritize maintainability, modularity, and clear responsibility boundaries.
- `NFR-005`: Deployment must be transparent, controllable, and easy to operate.
- `NFR-006`: Documentation must be sufficient to continue work without relying on unrecorded session context for either humans or AI agents.
- `NFR-007`: Public UX and business behavior must match agreed product scenarios.
- `NFR-008`: Monetary values are in Russian rubles and rounded to integer values.
- `NFR-009`: Promotions and discount logic are out of scope for v1.
- `NFR-010`: User interfaces must be simple, clear, and adaptive for mobile screens.
- `NFR-011`: The backoffice must support daily operational use by baristas inside the Telegram flow and preserve role separation for administrators.
- `NFR-012`: Every push must deploy or update a VPS-based test environment with database, frontend, and backend containers, then run smoke and e2e tests against it.
- `NFR-013`: Build, smoke, and e2e checks on the VPS test environment must be required for merge.
- `NFR-014`: After merge, the system must perform a dev-mode build and deploy to the test VPS stream.
- `NFR-015`: In the test environment, Telegram authorization is disabled through `DISABLE_TG_AUTH=true`; when enabled, the backend accepts requests without Telegram validation and uses seeded identifiers.
- `NFR-016`: After deployment, the test environment acts as a shared stand: backend, frontend, and database are network-accessible for local development and e2e testing without bringing dependencies up locally.

## Acceptance Expectations

- The customer flow covers menu -> menu-position configuration -> cart -> slot selection -> order history.
- The barista flow covers review -> confirm or reject -> ready -> close, including reminders for orders waiting for action.
- The administrator flow covers menu management, price management, operating hours, slot capacity, barista and administrator assignment, and user blocking.
- The menu model supports menu groups, drink sizes, additional-option groups, free additional options, and mutually exclusive additional options within a group.
- Baristas can temporarily enable or disable menu positions and additional options without changing prices or menu structure.
- Audit history stores which barista confirmed, prepared, or rejected the order.
- Push-based VPS validation runs build, smoke, and e2e before merge.

Detailed implementation-ready acceptance criteria should be fixed in `docs/analysis/version-scope-and-acceptance.md`.

## Open Questions

- What exact reminder interval should be used for barista Telegram reminders in v1?
- How should the system behave when a menu position or additional option becomes unavailable after it was added to the cart but before order submission?
- Should temporary availability changes reset automatically on a schedule, or remain in effect until changed manually?

## Assumptions

- Telegram is the primary identity and access channel for v1.
- A menu position inherits additional-option groups from its menu group.
- The API is designed around the current product behavior and current scenarios rather than generic commerce abstractions.
- The data model is intentionally shaped around the current business rules of v1.
