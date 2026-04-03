# Scope And Boundaries

This document captures intake-level version boundaries and feeds the analysis package.

## In Scope

- Telegram-centric pickup ordering for customers.
- Customer-facing web interface launched from the customer Telegram bot.
- Unified backoffice web interface for baristas and administrators.
- Separate Telegram bot for backoffice access.
- Administrator-driven user blocking.
- Catalog with drink sizes, inherited additional-option groups, free additional options, and mutually exclusive options inside a group.
- Current-day pickup slots only.
- Customer order history.
- Barista reminders.
- Audit of key barista actions.
- Project documentation sufficient for continued development.

## Out Of Scope

- In-app payment and online payments.
- Promotions, discounts, loyalty, coupons, or bonus mechanics.
- Pickup-slot horizons beyond the current day.
- Free-form modifiers outside the explicit additional-option-group model.
- Advanced reporting and analytical dashboards.
- Advanced inventory constraints beyond simple item availability.
- Customer order cancellation after submission.
- Production deployment.

## First Version Constraints

- Timeline constraints: deliver an MVP-focused v1 with hard scope boundaries.
- Budget constraints: not defined in the intake package.
- Team constraints: barista and administrator share a single backoffice surface with role restrictions instead of separate products.
- Data or integration constraints: Telegram is mandatory for access and identity; backend must use NestJS; customer and backoffice frontends must use Vue 3 and Vuetify; slot step is 10 minutes; default operating hours are `09:00-20:00`; default slot capacity is 5; currency is RUB with integer rounding.

## Deferred Scope

- Online payment processing.
- Promotions and discounts.
- Multi-day slot booking.
- Expanded inventory management and stock-aware reservation rules.
- Extended analytics and reporting.
- Production rollout concerns beyond the test VPS stream.

## Boundary Notes

Use this file to stop scope drift during intake. Analysis should convert these boundaries into delivery-ready scope and acceptance artifacts.
