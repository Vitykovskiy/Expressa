# AI Dev Template

Template repository for an AI team that uses `setup` as a one-time bootstrap step and then runs all delivery through GitHub Issues, block-level delivery tasks, contour-owned child issues, and GitHub Project state.

## Operating Model

The template uses two workflow modes recorded in `.ai-dev-template.workflow-state.json`:

1. `setup` - technical agent initializes the repository, issue templates, labels, project structure, and workflow rules.
2. `issue_driven` - all post-setup work is routed by GitHub task metadata, dependencies, owner contours, and GitHub Project state.

After `setup`, GitHub Issues become the primary execution objects:

- an initiating Epic anchors the initiative;
- one `business_analysis` issue starts the initiative;
- one or more bounded `system_analysis` issues produce the canonical specification package slice by slice and decompose only the delivery they fully specify;
- each `block_delivery` task represents one integrated deliverable and owns child implementation issues;
- every implementation issue has one owner contour and explicit dependencies;
- exactly one open issue is marked with `session: active` when a repository session is in flight;
- agents execute only tasks owned by their contour and only when task-linked inputs are sufficient;
- GitHub Project holds the canonical execution state for those issues.

## Core Principles

- Implementation starts after the required business-analysis and system-analysis tasks are complete.
- `system_analysis` remains the single source of truth for implementation inputs and block decomposition, but analysis may be split into bounded slices.
- User scenarios, interfaces, contracts, and acceptance expectations exist before contour-owned implementation starts.
- Each task has exactly one owner contour.
- Cross-contour delivery is decomposed into linked tasks with explicit ownership.
- Missing specification routes work into a linked `system_analysis` follow-up task with explicit clarification scope.
- Large initiatives may split `system_analysis` by version slice, capability slice, or explicit follow-up clarification scope.
- `qa-e2e` validates integrated block-level outcomes.
- An initiative closes after required block-level validation, deploy work, and e2e tasks finish successfully.

## Repository Layout

- `AGENTS.md` - router that decides between `setup` and post-setup issue-driven routing.
- `.ai-dev-template.workflow-state.json` - bootstrap guardrail that records whether setup is still active.
- `instructions/` - setup instructions plus task-type and contour-specific instructions.
- `docs/analysis/` - canonical analysis package that gates implementation, deploy, and e2e work.
- `docs/delivery/` - block decomposition and contour handoff artifacts.
- `templates/` - reusable templates for initiative, business-analysis, system-analysis, implementation, deploy, and e2e tasks.
- `tasks/` - local scratch space only; not a durable backlog.

## How A New Project Starts

1. Create a repository from this template and clone it locally.
2. Add `.ai-dev-template.config.json` to the root.
3. Keep `.ai-dev-template.workflow-state.json` in the root with `current_stage = "setup"`.
4. Connect the repository to GitHub Issues and a GitHub Project board. During `setup`, create or validate the required labels directly through `gh` or equivalent GitHub-integrated tooling, create and link the repository GitHub Project directly, and seed the initial initiative plus `business_analysis` backlog directly. If `project_tracking = github_project`, treat only a project already linked to this repository as an existing match. If no repository-linked project exists yet, create one and attach the repository before leaving `setup`. If the environment blocks GitHub-side setup, report the blocker immediately instead of adding ad hoc bootstrap scripts.
5. Give the agent access to the repository and the business request.
6. Start with `AGENTS.md`; the router will either keep the repository in `setup` or switch to issue-driven routing after setup is validated.

The repository must not leave `setup` until the starting backlog exists:

- at least one open `initiative` issue exists;
- exactly one open initial `business_analysis` issue exists;
- that `business_analysis` issue carries `session: active`.

## GitHub Workflow

GitHub Issues and GitHub Project are the operational backbone after setup.

Required GitHub Issue types:

- `initiative`
- `business_analysis`
- `system_analysis`
- `block_delivery`
- `implementation`
- `deploy`
- `e2e`

Required task attributes:

- task type
- owner contour
- parent initiative
- explicit dependencies
- definition of ready
- definition of done
- canonical inputs
- GitHub Project status

Canonical active-session marker:

- GitHub Issue label `session: active`
- exactly one open issue may carry it at a time
- if none is set, select from eligible `In Progress` issues first, then eligible `Ready` issues, then highest priority, then the lowest issue number

Required GitHub Project statuses:

- `Inbox`
- `Ready`
- `In Progress`
- `Blocked`
- `Waiting for Testing`
- `Testing`
- `Waiting for Fix`
- `In Review`
- `Done`

Required GitHub Project board fields:

- `Status`
- `Task Type`
- `Owner Contour`
- `Priority`

Required workflow labels:

- `session: active`
- `priority: high`
- `priority: medium`
- `priority: low`

Completed task handoffs must have verified evidence. Repository changes must be committed and pushed, and required GitHub-side workflow actions must be verified before completion is reported. When pull requests are disabled, the agent pushes directly to the assigned working branch.

Workflow text artifacts should be written in UTF-8. On Windows and in PowerShell, files passed to `gh`, `git`, or similar tools must use explicit UTF-8 encoding to avoid corrupted non-ASCII text.

## Bootstrap Guardrail

`.ai-dev-template.workflow-state.json` remains in the repository as a lightweight guardrail:

- `setup` keeps the repository in bootstrap preparation mode until the repository and GitHub operating model are ready;
- `issue_driven` activates post-setup routing through task metadata, dependencies, owner contours, and GitHub Project state.

The file records the active repository mode and the setup-to-operations transition.

## Configuration

Workflow policy is configured in `.ai-dev-template.config.json`.

The configuration governs language, execution mode, approval checkpoints, and PR/review behavior. It does not replace task ownership, dependencies, or GitHub Project state.

It also governs optional repository conventions such as `architecture.use_fsd`, which tells the template whether frontend work should explicitly follow Feature-Sliced Design.

Human-facing repository artifacts may follow configured language settings, but agent-only control files such as `AGENTS.md`, `instructions/`, routers, and role prompts must remain in English.
