# Integration Contracts

## API Contracts

| Contract | Producer | Consumer | Request | Response / Event | Notes |
| --- | --- | --- | --- | --- | --- |
| `GET /customer/menu` | Backend | Customer web app | Telegram-authenticated customer context | Categories with products, prices, sizes, addon groups, and availability | Must exclude unavailable ordering paths as defined by product rules |
| `POST /customer/cart/items` | Backend | Customer web app | Product id, selected size, selected addons | Updated cart snapshot | Rejects invalid size or addon combinations |
| `GET /customer/cart` | Backend | Customer web app | Customer context | Current editable cart | Cart remains editable before order placement |
| `GET /customer/slots` | Backend | Customer web app | Current date context | Available current-day 10-minute slots with capacity state | Uses configured working hours and slot capacity |
| `POST /customer/orders` | Backend | Customer web app | Cart snapshot reference or item payload plus selected slot | Created order summary with status `Created` | Fails when slot is full, cart invalid, or item unavailable |
| `GET /customer/orders` | Backend | Customer web app | Customer context | Customer order history | Must return only current user's orders |
| `GET /backoffice/orders` | Backend | Backoffice web app | Backoffice actor context | Order queue and actionable statuses | Available to barista and administrator according to final permissions |
| `POST /backoffice/orders/:id/confirm` | Backend | Backoffice web app | Actor context | Updated order status | Persists `confirmed_by` audit data |
| `POST /backoffice/orders/:id/reject` | Backend | Backoffice web app | Actor context and rejection reason | Updated order status | Persists `rejected_by` and reason |
| `POST /backoffice/orders/:id/ready` | Backend | Backoffice web app | Actor context | Updated order status | Persists `ready_by` audit data |
| `POST /backoffice/orders/:id/close` | Backend | Backoffice web app | Actor context | Updated order status | Completes pickup lifecycle |
| `POST /backoffice/availability/*` | Backend | Backoffice web app | Actor context and availability change payload | Updated availability state | Barista can modify availability but not structure or pricing |
| `POST /admin/menu/list` | Backend | Backoffice web app | Administrator context | Full editable menu snapshot (`categories`, `products`, `sizes`, `addonGroups`, `addons`) | Read-model for administrator menu tab |
| `POST /admin/menu/{category|product|size|addon-group|addon}` | Backend | Backoffice web app | Administrator context and target payload | Created or updated menu entity with `target`, `operation`, `entity` | Deterministic validation errors for missing/invalid fields and unknown references |
| `POST /admin/users/list` | Backend | Backoffice web app | Administrator context | List of users with role/block state | Read-model for administrator users tab |
| `POST /admin/users/{role|block}` | Backend | Backoffice web app | Administrator context, `telegramId`, and mutation payload | Updated user record with role or blocked state | Role mutation is limited to `customer`/`barista`; root administrator safeguards are enforced |
| `POST /admin/settings` | Backend | Backoffice web app | Administrator context and settings payload | Current or updated operating settings | Empty payload returns current settings; updates support `workingHoursStart`, `workingHoursEnd`, and `slotCapacity` |

## Event Contracts

| Event | Producer | Consumer | Payload | Notes |
| --- | --- | --- | --- | --- |
| `order.created` | Backend | Backoffice queue, reminder subsystem | Order id, slot, total, customer reference | Starts backoffice processing flow |
| `order.status_changed` | Backend | Customer Telegram notification sender | Order id, new status, rejection reason if present | Sent for status changes visible to customer |
| `order.awaiting_action` | Backend / scheduler | Barista reminder sender | Order id, current status, age | Used for periodic reminder processing |
| `availability.changed` | Backend | Customer-facing catalog readers | Entity type, entity id, new state | Affects future ordering attempts |

## External Integrations

| Integration | Purpose | Contract reference | Failure handling |
| --- | --- | --- | --- |
| Telegram customer bot | Entry point for customer web app and order-status notifications | Customer launch context plus `order.status_changed` notification payloads | Failed deliveries must not change order state; retry strategy to be finalized in analysis or delivery |
| Telegram backoffice bot | Entry point for backoffice web app and barista reminders | Backoffice launch context plus `order.awaiting_action` reminder payloads | Failed reminders must be observable; exact retry/escalation policy is deferred to follow-up system analysis |
| Telegram auth validation | Production request identity verification | Telegram WebApp auth contract | Test environment bypasses validation with `DISABLE_TG_AUTH=true` |

## Rule

Implementation contours must consume or produce contracts from this file. If a required contract is missing, return to `analysis`.
