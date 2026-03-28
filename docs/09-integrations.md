# Integrations

## GitHub Project

- URL: `https://github.com/users/Vitykovskiy/projects/21`
- Board type: `Kanban`
- Required statuses present: `yes`
- Required fields present: `Status`, `Task Type`, `Owner Contour`, `Priority`
- Project item creation verified: `yes`
- Setup validation status: `Validated on 2026-03-28`
- Notes: Repository `Vitykovskiy/expressa` is linked to Project `expressa`; required fields `Status`, `Task Type`, `Owner Contour`, and `Priority` are configured.

## GitHub Issues

- Initiative issue creation verified: `yes`
- Initial seeded `system_analysis` issue verified: `yes`
- Operational issue templates verified: `yes`
- Required task metadata captured by forms: `yes`
- Active-session label `session: active` verified: `yes`
- Labels prepared for workflow use: `yes`
- Notes: Seeded backlog issues are `#1 https://github.com/Vitykovskiy/expressa/issues/1` and `#2 https://github.com/Vitykovskiy/expressa/issues/2`; downstream chain is tracked through `#3-#10`.

## Effective Workflow Policy

- Effective `.ai-dev-template.config.json` committed and pushed: `yes`
- Notes: The current setup commit includes the effective repository configuration used during bootstrap.

## Environment Variables

| Variable | Required | Purpose | Stage first needed | Status |
| --- | --- | --- | --- | --- |
| `ADMIN_TELEGRAM_ID` | Yes | Defines the single root administrator to upsert on backend startup | `implementation` | Configured in GitHub Secrets and consumed by backend bootstrap |
| `DISABLE_TG_AUTH` | Yes for test environment | Disables Telegram auth validation in test runs and switches backend to seeded identities | `e2e` | Configured in GitHub Secrets and propagated to `/opt/expressa/staging/.env` by Stage0 workflow |
| `BARISTA_TELEGRAM_ID` | Optional | Defines seeded barista identity for test mode | `implementation` | Optional for backend; defaults to `2001` when unset |
| `CUSTOMER_TELEGRAM_ID` | Optional | Defines seeded customer identity for test mode | `implementation` | Optional for backend; defaults to `3001` when unset |
| `POSTGRES_PASSWORD` | Yes for Slice A runtime deploy | Sets database password for the staging PostgreSQL container | `deploy` | Configured in GitHub Secrets for deploy workflow |
| `VPS_HOST` | Yes for VPS operations | Defines the target VPS host for deployment and operational access | `infrastructure` | Configured in local `.env` and GitHub Secrets |
| `VPS_ROOT_USER` | Yes for current VPS access flow | Defines the root SSH user for VPS administrative access | `infrastructure` | Configured in local `.env` and GitHub Secrets |
| `VPS_ROOT_PASSWORD` | Yes for current VPS access flow | Defines the root password used for VPS administrative access | `infrastructure` | Configured in local `.env` and GitHub Secrets |

## Tokens And Secrets

| Secret | Where It Lives | Purpose | Stage first needed | Status |
| --- | --- | --- | --- | --- |
| `gh` auth token | GitHub CLI auth store | Issues and Project automation | `setup` | Validated (`repo`, `project`, `read:org`, `workflow`) |
| `VPS_HOST` | GitHub Actions Secrets | Stage0 VPS deployment target | `infrastructure` | Set on 2026-03-28 |
| `VPS_ROOT_USER` | GitHub Actions Secrets | Stage0 SSH user for VPS automation | `infrastructure` | Set on 2026-03-28 |
| `VPS_ROOT_PASSWORD` | Local `.env` and GitHub Actions Secrets | Administrative VPS access for infrastructure automation | `infrastructure` | Set in GitHub Secrets on 2026-03-28; do not commit the value |
| `ADMIN_TELEGRAM_ID` | GitHub Actions Secrets | Runtime env value required for backend bootstrap | `implementation` | Stage0 baseline value set on 2026-03-28 |
| `DISABLE_TG_AUTH` | GitHub Actions Secrets | Test-env auth bypass flag used in staged env bootstrap | `e2e` | Set on 2026-03-28 |
| `POSTGRES_PASSWORD` | GitHub Actions Secrets | Runtime DB password for Slice A deploy workflow | `deploy` | Set on 2026-03-28 |

## GitHub Token Scope Baseline

Required scopes:

- `repo`
- `project`

Recommended scopes:

- `read:org`
- `workflow`

Validation note:

- token scopes are necessary but not sufficient;
- repository membership, project write access, and branch protection rules must still be validated separately;
- record actual validation results in this file during `setup`;
- report setup or later GitHub-side workflow steps complete after the corresponding side effects are verified.

## Runtime And External Integrations

Document every external system that matters to development, deploy, or e2e validation.

| Integration | Purpose | Stage first needed | Status | Notes |
| --- | --- | --- | --- | --- |
| GitHub Issues | Workflow task tracking and active-session routing | `setup` | Configured | Seeded issues `#1` and `#2` plus downstream chain `#3-#10` are present |
| GitHub Project | Delivery status board and required workflow fields | `setup` | Configured | Project `expressa` linked to repository with validated custom fields and statuses |
| Telegram customer bot | Launches customer web app and sends customer order-status notifications | `implementation` | Planned | Direct URL access outside Telegram is not supported in v1 |
| Telegram backoffice bot | Launches backoffice web app and sends barista reminders and notifications | `implementation` | Planned | Separate bot from customer-facing access path |
| Telegram WebApp auth | Primary identity and access mechanism in production | `implementation` | Planned | Test environment bypasses Telegram validation with `DISABLE_TG_AUTH=true` |
| VPS host access | Deployment target and runtime environment for test and production flows | `infrastructure` | Validated | Stage0 workflow run `https://github.com/Vitykovskiy/expressa/actions/runs/23677665147` completed deploy and health-check on 2026-03-28 |

## Integration Status

- GitHub repository access: `Validated`
- GitHub Project access: `Validated`
- Deployment environment access: `Validated by Stage0 workflow and Slice A deploy workflow run 23678475499`
- E2E environment readiness: `Ready for #9; deploy evidence and QA assets are available`

## Stage0 Infrastructure Baseline

- Baseline workflow: `.github/workflows/stage0-infrastructure.yml`
- Baseline runtime contract: `docs/delivery/stage0-infrastructure-baseline.md`
- Evidence runs:
  - `https://github.com/Vitykovskiy/expressa/actions/runs/23677665147`
  - `https://github.com/Vitykovskiy/expressa/actions/runs/23677699654`
- Result: `ci-baseline` and `deploy-staging` passed; VPS health-check endpoint returned HTTP 200

## Slice A DevOps Validation Path

- Validation workflow: `.github/workflows/slice-a-devops-validation.yml`
- Runtime contract: `docs/delivery/slice-a-runtime-validation-path.md`
- Runtime manifest: `infra/staging/docker-compose.slice-a.yml`
- Deployment script: `infra/vps/deploy-slice-a-runtime.sh`
- Validation entrypoints: `infra/validation/run-smoke.sh`, `infra/validation/run-e2e.sh`
- CI runtime image for path validation: `traefik/whoami:v1.10.1` (temporary contract image before backend artifact publication)

## Slice A Backend Implementation Path

- Service sources: `backend/src/*`
- Tests: `backend/tests/api.test.js`
- Runtime image definition: `backend/Dockerfile`
- Backend handoff contract: `docs/delivery/slice-a-backend-handoff.md`

## Slice A QA Assets Path

- QA assets workflow: `.github/workflows/slice-a-qa-assets-validation.yml`
- QA entrypoint: `tests/e2e/run.sh`
- QA scenario runner: `tests/e2e/slice-a-api.e2e.mjs`
- QA fixtures: `tests/e2e/fixtures/*`
- QA handoff contract: `docs/delivery/slice-a-qa-handoff.md`

## Slice A Deploy Path

- Deploy workflow: `.github/workflows/slice-a-deploy.yml`
- Deploy evidence contract: `docs/delivery/slice-a-deploy-evidence.md`
- Latest evidence run: `https://github.com/Vitykovskiy/expressa/actions/runs/23678475499`
- Target endpoint verification:
  - `http://216.57.105.133:18081/healthz` -> `200`
  - `http://216.57.105.133:18081/customer/menu` with `x-telegram-id` -> `200`

## Setup Notes

- Update this file as integrations are connected or changed.
- During `setup`, validate GitHub Issues access and GitHub Project access, and record the actual result here.
- Record verification evidence for the GitHub operating model prepared in `setup`, including project readiness, issue creation ability, and required labels or project fields.
- Do not store production secrets in committed files.
- VPS access variables currently live in local `.env`; document variable names in the repository, but never commit secret values.
- If the project uses a separate secret manager, document the reference location here.
