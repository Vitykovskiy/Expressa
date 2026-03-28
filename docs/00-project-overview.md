# Project Overview

## Purpose

This file is the high-signal entry point for a new agent session.

Use it to identify:

- the current repository mode;
- the active initiative;
- the active issue signal;
- which canonical artifacts exist;
- where each role must read next.

## Workflow Summary

The repository follows a fixed 2-mode workflow tracked in `.ai-dev-template.workflow-state.json`:

1. `setup`
2. `issue_driven`

Mode semantics:

- `setup`: the technical agent prepares workflow assets, GitHub operating infrastructure, and the seeded starting backlog;
- `issue_driven`: all post-setup work routes through the active GitHub Issue, its task metadata, its owner contour, its dependencies, and GitHub Project state.

See `AGENTS.md` for routing and `docs/07-workflow.md` for the canonical workflow rules.

## Current Status

- Workflow state file: `.ai-dev-template.workflow-state.json`
- Current mode: `issue_driven`
- Active initiative: `#1 [Initiative] Стартовая delivery-цепочка и baseline-спецификация Expressa`
- Active issue signal: `#11 [Block Delivery] Slice B frontend customer/backoffice integration`
- Current owner role: `system-analyst`
- Delivery status: `Slice A complete; frontend frame mapping in #10 is complete; slice-B delivery chain #11-#18 is published`

## Canonical Artifact Map

### Intake And Product Context

- `docs/01-product-vision.md`
- `docs/02-business-requirements.md`
- `docs/03-scope-and-boundaries.md`

### Analysis Package

- `docs/analysis/problem-context.md`
- `docs/analysis/user-scenarios.md`
- `docs/analysis/version-scope-and-acceptance.md`
- `docs/analysis/system-modules.md`
- `docs/analysis/domain-model.md`
- `docs/analysis/integration-contracts.md`
- `docs/analysis/ui-specification.md`
- `docs/analysis/cross-cutting-concerns.md`

### Development Handoff

- `docs/delivery/contour-task-matrix.md`

### Operating Documents

- `docs/05-architecture.md`
- `docs/06-decision-log.md`
- `docs/07-workflow.md`
- `docs/09-integrations.md`
- `docs/11-workflow-configuration.md`

## Reading Policy

- Start with `AGENTS.md`.
- Read `.ai-dev-template.workflow-state.json`.
- Read only the branch selected by the router.
- Load only the canonical artifacts required for the current mode, task type, and role.
- If the active issue signal is missing, duplicated, or not resolvable by the documented rules, treat that as a blocker.
- If an implementation, deploy, or e2e role needs to infer behavior from unrelated code or documents, treat that as a blocker and route the gap back into `system_analysis` through the issue workflow.

## GitHub Backbone

- Initiative and task tracking: GitHub Issues
- Delivery status: GitHub Project
- Integration metadata: `docs/09-integrations.md`

## Notes

Keep this file concise. It should orient a new session without duplicating the detailed stage artifacts.
