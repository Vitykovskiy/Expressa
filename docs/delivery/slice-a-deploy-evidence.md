# Slice A Deploy Evidence (Issue #8)

This document records rollout evidence for deploy task `#8`.

## Deployment Run

- Workflow: `.github/workflows/slice-a-deploy.yml`
- Run URL: `https://github.com/Vitykovskiy/expressa/actions/runs/23678475499`
- Commit: `bf33967bb03dcdc675dd860ea13759cd1226f498`
- Result: `success`

## Rolled Out Artifact

- Backend image: `ghcr.io/vitykovskiy/expressa-backend:slice-a-bf33967bb03dcdc675dd860ea13759cd1226f498`

## Target Runtime

- Environment: `staging`
- VPS host: `216.57.105.133`
- Slice A backend endpoint: `http://216.57.105.133:18081`
- Health endpoint check: `GET /healthz -> 200`
- Contract endpoint check: `GET /customer/menu` with `x-telegram-id: 3001 -> 200`

## Notes For E2E Task #9

- Deploy task `#8` is the deployment evidence source for integrated validation.
- `#9` should use this deployment evidence together with `docs/delivery/slice-a-qa-handoff.md`.
