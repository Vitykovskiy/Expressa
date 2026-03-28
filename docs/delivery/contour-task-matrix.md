# Contour Task Matrix

Use this file to decompose approved analysis into contour-specific execution tasks.

## Rules

- one row per task
- one task owns one contour
- one `block_delivery` row represents one integrated deliverable and acts as the parent for child implementation rows
- cross-contour work is split into linked tasks
- dependencies must reference the upstream task names or issue IDs explicitly
- deploy and e2e work are separate rows, not hidden inside implementation rows
- child implementation rows must reference their parent block task explicitly
- rows may depend on a specific bounded `system_analysis` slice and should name that slice explicitly when it is not the only analysis issue for the initiative
- when implementation is blocked by missing specification, record a linked `system_analysis` follow-up row or issue with explicit clarification scope

## Matrix

| Task | Task type | Owner contour | Parent block task | Depends on | Input artifacts | Expected result |
| --- | --- | --- | --- | --- | --- | --- |
| `#2 Baseline analysis package` | `system_analysis` | `system-analyst` | `n/a` | `none` | `README.md`, `docs/00-project-overview.md`, `docs/07-workflow.md`, `docs/09-integrations.md`, `docs/analysis/*` | `Slice A analysis package and downstream issue chain are published` |
| `#3 Stage 0 CI/CD and VPS baseline for Slice A` | `infrastructure` | `devops` | `n/a` | `#2` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/system-modules.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/09-integrations.md` | `Infrastructure baseline is ready and unblocks implementation` |
| `#4 Slice A backend and runtime foundation (frontend excluded)` | `block_delivery` | `system-analyst` | `n/a` | `#2, #3` | `docs/analysis/problem-context.md`, `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/system-modules.md`, `docs/analysis/domain-model.md`, `docs/analysis/integration-contracts.md`, `docs/analysis/cross-cutting-concerns.md` | `Integrated slice boundary tracked through child implementation, deploy, and e2e tasks` |
| `#5 Slice A customer/backoffice APIs and order rules` | `implementation` | `backend` | `#4` | `#2, #3` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/system-modules.md`, `docs/analysis/domain-model.md`, `docs/analysis/integration-contracts.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/delivery/slice-a-backend-handoff.md` | `Contract-compliant backend for slice A with rule coverage and runnable verification path` |
| `#6 Slice A runtime, CI, and validation path` | `implementation` | `devops` | `#4` | `#2, #3, #4` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/09-integrations.md`, `docs/delivery/stage0-infrastructure-baseline.md`, `docs/delivery/slice-a-runtime-validation-path.md` | `Runtime manifests, VPS deploy path, and CI smoke/e2e entrypoints for downstream validation` |
| `#7 Slice A fixtures and automated validation assets` | `implementation` | `qa-e2e` | `#4` | `#2, #5, #6` | `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/delivery/slice-a-runtime-validation-path.md`, `docs/delivery/slice-a-backend-handoff.md`, `docs/delivery/slice-a-qa-handoff.md` | `Reusable QA assets for block-level validation` |
| `#8 Slice A rollout to test environment` | `deploy` | `devops` | `#4` | `#5, #6` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/delivery/slice-a-runtime-validation-path.md`, `docs/delivery/slice-a-backend-handoff.md` | `Slice A deployment evidence in target test environment, recorded in docs/delivery/slice-a-deploy-evidence.md` |
| `#9 Slice A integrated validation` | `e2e` | `qa-e2e` | `#4` | `#8, #7` | `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/delivery/slice-a-deploy-evidence.md`, `docs/delivery/slice-a-qa-handoff.md` | `Integrated validation decision for block_delivery #4` |
| `#10 UI frame mapping and frontend slice decomposition` | `system_analysis` | `system-analyst` | `n/a` | `#2` | `docs/analysis/ui-specification.md`, `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md` | `Direct Figma frame links and frontend-ready follow-up decomposition` |
| `#11 Slice B frontend customer/backoffice integration` | `block_delivery` | `system-analyst` | `n/a` | `#10, #5, #6` | `docs/analysis/ui-specification.md`, `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/integration-contracts.md`, `docs/analysis/cross-cutting-concerns.md` | `Integrated frontend slice boundary tracked through child implementation, deploy, and e2e tasks` |
| `#12 Slice B admin contracts for frontend tabs` | `implementation` | `backend` | `#11` | `#10, #5` | `docs/analysis/integration-contracts.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/analysis/ui-specification.md` | `Backend admin contracts required by frontend tabs are implementation-ready and testable` |
| `#13 Slice B customer app flow` | `implementation` | `frontend` | `#11` | `#10, #5, #6` | `docs/analysis/ui-specification.md`, `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/integration-contracts.md` | `Customer frontend flow is implemented from mapped frames with contract-bound behavior` |
| `#14 Slice B backoffice tabs and role UX` | `implementation` | `frontend` | `#11` | `#10, #5, #12, #6` | `docs/analysis/ui-specification.md`, `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/integration-contracts.md` | `Backoffice frontend tabs and role UX are implemented from mapped frames with admin/barista constraints` |
| `#15 Slice B frontend runtime and CI path` | `implementation` | `devops` | `#11` | `#6, #13, #14` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `docs/09-integrations.md`, `docs/analysis/ui-specification.md` | `Frontend runtime and CI path is available for integrated validation` |
| `#16 Slice B frontend validation assets` | `implementation` | `qa-e2e` | `#11` | `#13, #14, #15` | `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/ui-specification.md`, `docs/analysis/cross-cutting-concerns.md` | `Reusable QA assets exist for integrated frontend validation` |
| `#17 Slice B rollout to test environment` | `deploy` | `devops` | `#11` | `#12, #13, #14, #15` | `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/cross-cutting-concerns.md`, `runtime artifacts from slice-B implementation tasks` | `Slice B deployment evidence is recorded for downstream e2e` |
| `#18 Slice B integrated validation` | `e2e` | `qa-e2e` | `#11` | `#16, #17` | `docs/analysis/user-scenarios.md`, `docs/analysis/version-scope-and-acceptance.md`, `docs/analysis/ui-specification.md`, `deploy evidence for #17` | `Integrated validation decision for block_delivery #11` |
