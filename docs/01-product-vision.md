# Product Vision

This document captures intake-level product context. It is an input to `analysis`, not an implementation specification.

## Problem

Expressa addresses friction in the pickup-order flow for a cafeteria bar. Customers should be able to choose menu positions, configure drinks or food with allowed additional options, select an available pickup slot, and place an order without queueing at the counter or waiting for cashier-driven interaction.

The operational side has a related problem: baristas and administrators need a predictable tool for order handling, temporary availability changes, menu administration, operating settings, and access control. Without a unified backoffice workflow, order processing becomes inconsistent, status communication is delayed, and service availability is hard to control.

## Value Proposition

- Primary business outcome: customers can place pickup orders quickly through a Telegram-native mobile flow with minimal friction.
- Secondary business outcome: baristas and administrators receive a controllable backoffice tool for orders, menu availability, and user administration.
- Why now: the product is being established with explicit architecture, automated deployment, and canonical documentation before implementation accelerates.

## Target Users

- Primary users: cafeteria customers placing pickup orders through the customer Telegram bot web app.
- Secondary users: baristas processing orders in the backoffice Telegram bot web app.
- Internal stakeholders: administrators managing menu groups, menu positions, prices, operating hours, slot capacity, role assignments, and user blocking.

## High-Level Use Cases

1. Customer opens the Telegram web app, browses menu groups, configures a menu position including quantity and allowed additional options, adds it to the cart, selects a pickup slot, and creates an order.
2. Barista opens the backoffice web app, reviews incoming orders and totals, confirms or rejects them, marks orders ready, closes them after pickup, and manages temporary availability of menu positions and additional options.
3. Administrator uses the same backoffice to manage menu groups, menu positions, prices, operating hours, slot capacity, administrator and barista assignments, and blocked users.

## Constraints

- Budget: not specified at intake.
- Timeline: MVP-oriented v1 scope with explicit out-of-scope limits.
- Compliance or regulatory constraints: no special regulatory constraints were defined at intake.
- Technical or operational constraints: Telegram is the mandatory access channel in production flows; backend must use NestJS; both frontend clients must use Vue 3 and Vuetify; the system must be split into a shared backend and two independent frontend clients; push-based VPS test environments with smoke and e2e checks are required.

## Success Criteria

- Quantitative success signal: customer, barista, and administrator core flows work end-to-end; slot logic supports 10-minute intervals with default capacity 5; menu model supports size-based drinks and single-choice additional-option groups inherited from menu groups.
- Qualitative success signal: architecture remains modular and maintainable, deployment is transparent, and repository documentation is sufficient to continue work without hidden session context for either humans or AI agents.
- Review cadence: refine during analysis and track through issue-driven delivery and acceptance.
