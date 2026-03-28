# Version Scope And Acceptance

## Bounded Analysis Slice For Issue #2

Issue `#2` closes only the first delivery slice:

- `Slice A - Infrastructure and backend foundation for customer ordering and backoffice operations`.
- This slice is intentionally frontend-excluded because direct Figma frame links are not yet available per screen.
- Frontend delivery and any UI-bound acceptance criteria are routed to a follow-up `system_analysis` issue.

## Version Boundary

### In Scope

- Telegram-centric pickup ordering.
- Customer web app for menu, configuration, cart, slots, and order history.
- Shared backoffice for barista and administrator with role-based tabs.
- Separate Telegram bot for backoffice access.
- User blocking by administrator.
- Menu model with drink sizes, addon groups, paid and free addons, and mutually exclusive options.
- Current-day pickup slots with 10-minute increments and configurable capacity.
- Telegram order-status notifications for customers.
- Telegram reminders for baristas.
- Audit fields for key barista order actions.
- VPS-based push validation with smoke and e2e coverage.

### Out Of Scope

- In-app payment and online payment providers.
- Promotions, discounts, loyalty, or coupon logic.
- Pickup-slot windows beyond the current day.
- Free-form modifiers outside the explicit addon-group model.
- Advanced analytics and reporting dashboards.
- Advanced stock or inventory reservation logic beyond simple availability toggles.

## Acceptance Criteria

| Criterion | Source scenario | How to validate |
| --- | --- | --- |
| Customer can browse menu, configure a product, add it to cart, select a slot, and create an order | `CUS-01` | Smoke and e2e test the end-to-end customer flow from menu to `Created` order |
| Customer can view order history and receives status notifications including rejection reason | `CUS-02` | E2E validates history visibility and contract tests validate notification payload content |
| Barista can confirm, reject with reason, mark ready, and close an order | `BAR-01` | Smoke and e2e validate status transitions and UI actions in backoffice |
| Slot-capacity accounting follows status rules | `CUS-01`, `BAR-01` | Backend tests and e2e validate capacity consumption for active statuses only |
| Barista can change temporary availability without changing menu structure or prices | `BAR-02` | Backoffice UI and API tests validate access boundaries and behavior |
| Administrator can manage menu, prices, working hours, slot capacity, roles, and blocked users | `ADM-01`, `ADM-02` | E2E validates restricted tabs and successful admin actions |
| Audit data stores the responsible barista for confirm, ready, and reject actions | `BAR-01` | Backend tests and smoke verification inspect persisted audit fields |
| Empty database bootstrap creates administrator and seed data required for smoke flow | Supporting setup | Smoke test initializes empty DB and verifies seeded baseline entities |
| Push pipeline deploys or updates test environment and runs build, smoke, and e2e | Release process | CI validation on VPS is required before merge |

## Slice A Acceptance Criteria

| Criterion | Source scenario | How to validate |
| --- | --- | --- |
| Infrastructure baseline is ready for delivery execution (VPS target, CI pipeline, secrets wiring, runtime bootstrap) | Supporting setup | Infrastructure issue evidence and successful pipeline run |
| Backend APIs for customer ordering and backoffice order lifecycle are contract-defined and implementation-ready | `CUS-01`, `BAR-01` | Backend implementation tasks consume contracts in `integration-contracts.md` without additional analysis |
| Backend rules for slot capacity, rejection reason, role checks, and audit fields are fully specified for implementation | `CUS-01`, `BAR-01`, `ADM-02` | Backend tests can be derived directly from `domain-model.md` and `cross-cutting-concerns.md` |
| Block-level validation path is defined via child implementation, deploy, and e2e tasks | Release process | GitHub dependency chain exists and is project-tracked |

## Deferred To Follow-Up Analysis

- Reminder cadence and escalation policy for `order.awaiting_action`.

## Release Gate

The initiative may be closed only after:

1. contour development is complete;
2. deployment succeeds;
3. e2e validation passes.
