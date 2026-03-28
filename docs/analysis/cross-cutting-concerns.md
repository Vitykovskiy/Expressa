# Cross-Cutting Concerns

## Concerns

| Concern | Requirement | Affected contours | Notes |
| --- | --- | --- | --- |
| Identity and access | Production access is Telegram-based; blocked users must be denied; backoffice permissions are role-based | frontend, backend, qa-e2e | Test environment bypasses Telegram auth through `DISABLE_TG_AUTH=true` |
| Auditability | Confirm, ready, and reject actions must persist responsible barista identity | backend, qa-e2e | Acceptance and smoke flow depend on this evidence |
| Availability consistency | Temporary availability changes must affect ordering behavior without altering structural menu data | frontend, backend, qa-e2e | Access boundaries differ for barista and administrator |
| Slot-capacity correctness | Capacity accounting must stay consistent with working hours, slot step, and active order statuses | backend, qa-e2e | Critical business rule for pickup promise reliability |
| Notification reliability | Customer status notifications and barista reminders must be observable and decoupled from core state changes | backend, devops, qa-e2e | Delivery failure must not corrupt order state |
| Documentation continuity | Product context and analysis must remain in repository docs as canonical source of truth | all contours | Prevents dependence on transient session memory |
| Deployment verification | Every push updates test environment and runs build, smoke, and e2e checks on VPS | devops, qa-e2e | Required merge gate for v1 |

## Shared Rules

- Direct URL access outside Telegram is out of scope and must not become an accidental supported path in v1.
- Customer and backoffice bots are separate access channels and should remain separate in contracts and operational setup.
- Currency values use integer rubles.
- Promotions and discount logic are intentionally excluded from v1.
- Smoke coverage must validate empty-database bootstrap, root admin creation, seed data, and the basic order lifecycle.

## Operational Notes

- The test environment must seed a barista and a customer with fixed Telegram identifiers for smoke and e2e execution.
- Smoke setup must set working hours to `00:00-23:59` to avoid time-window flakiness during execution.
- Reminder cadence is deferred from slice A and must be finalized in a follow-up `system_analysis` issue before reminder implementation tasks move to `Ready`.

## Slice A Guardrails

- Slice A remains backend/infrastructure-oriented; frontend delivery is decomposed as separate slice B tasks from system_analysis `#10`.
- Backend and devops tasks in slice A must not assume unapproved UI behavior beyond contracts already fixed in `integration-contracts.md`.
