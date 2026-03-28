# Tech Stack

## Current Decision Status

Status: `Partially defined for Slice A; backend baseline selected, frontend remains TBD`

The agent must not finalize this file before the business problem and delivery constraints are understood.

## Candidate Stack Summary

| Area | Selected | Why | Alternatives | Risks |
| --- | --- | --- | --- | --- |
| Frontend | TBD | TBD | TBD | TBD |
| Backend | Node.js 20 + Express 4 | Fast deterministic delivery of Slice A contracts with low integration overhead | Fastify, NestJS | No framework-level contract generation; must keep API contracts explicit in docs/tests |
| Data | In-memory store for Slice A backend baseline | Enables immediate contract validation before full persistence decisions in later slices | PostgreSQL-first persistence, SQLite | Data resets on restart; production persistence must be introduced before release closure |
| Infra | GitHub Actions + VPS (Docker Engine + Docker Compose plugin) | Provides deterministic CI and remote runtime bootstrap before feature implementation | Manual VPS setup, self-hosted CI | Root-password-based access is temporary and should be replaced with SSH key flow |

## Official Documentation And Best Practices

Record only official or primary sources for selected technologies.

Example format:

- Technology:
  Official docs:
  Key best practices:
  Project conventions:

## Project Conventions

- Document language-specific conventions after stack selection.
- Record testing expectations.
- Record migration or deployment conventions.
- Record versioning or dependency update policies.

## Risks

- In-memory Slice A backend is not production-safe for durable order history and must be replaced with persistent storage in a follow-up slice before release closure.
- Backend API currently uses header-based actor identity in test mode; production Telegram signature validation path must be enforced in deploy/e2e stages.

## Review Trigger

Update this file whenever the selected stack, runtime constraints, or critical practices change.
