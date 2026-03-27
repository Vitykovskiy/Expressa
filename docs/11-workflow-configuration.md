# Workflow Configuration

## Purpose

`.ai-dev-template.config.json` stores operational policy for the repository.

It configures how the agent executes work inside the template operating model while GitHub task ownership, dependencies, and GitHub Project state remain the routing inputs.

## Fixed Operating Model and Configurable Policy

The following parts of the operating model are fixed by the template:

- `setup` is the repository-wide bootstrap mode;
- `issue_driven` is the repository-wide post-setup execution mode;
- setup seeds one initial `initiative` plus one initial `business_analysis` issue before `issue_driven` begins;
- post-setup work starts from that single seeded `business_analysis` issue and then flows through one or more bounded `system_analysis` issues into block-level delivery tasks;
- explicit task types and owner contours are required after setup;
- `system_analysis` is the canonical source of truth for implementation inputs and delivery decomposition, even when analysis is split into bounded slices;
- each integrated deliverable is represented by a parent `block_delivery` task;
- one operational task has one owner contour;
- deploy runs as its own task type in the delivery chain;
- e2e runs as its own task type in the delivery chain;
- project status vocabulary includes explicit waiting-for-testing and waiting-for-fix states;
- initiative closure follows required block-level validation, deploy work, and e2e completion.

The following remain configurable:

- frontend architecture policy, including whether FSD is the expected frontend structure
- language for docs, issues, PR text, comments, and commits
- execution mode
- approval checkpoints
- PR, review, and merge behavior
- persistence policy for temporary work artifacts

Bundled bootstrap assets ship in English:

- issue templates, label vocabulary, and project vocabulary are provided in English by default;
- if a repository sets human-facing workflow languages to anything other than `en`, `setup` must localize those assets before leaving `setup`;
- setup must surface the language-policy mismatch immediately and localize the assets before completion.

Encoding rule is not configurable: workflow text artifacts are stored and exchanged in UTF-8 so Git and GitHub tooling interpret them consistently.

Agent-instruction language is also fixed:

- `language.agent_instructions` remains `en`;
- `AGENTS.md`, `instructions/`, router files, and role prompts remain stable agent-operational assets in English;
- repository documentation may be localized, but agent-control text must stay stable across repositories and sessions.

## Frontend Architecture Policy

Use `architecture.use_fsd` to decide whether the repository treats Feature-Sliced Design as the expected frontend structure.

- `true`: frontend guidance should explicitly use FSD layers, boundaries, and terminology.
- `false`: frontend guidance follows the team-approved structure configured for the repository.

Example:

```json
{
  "architecture": {
    "use_fsd": true
  }
}
```

## Execution Modes

- `autonomous`: continue through available tasks whose dependencies are resolved until a real blocker or configured checkpoint is reached.
- `staged`: pause between major task handoffs and wait for explicit human confirmation.

Execution mode affects pacing. Task routing still follows the initiative's required business analysis, system analysis, block decomposition, deploy, and e2e chain.

## Pull Request Policy

If `pull_requests.enabled` is `true`, PR policy applies to the tasks executed in the current owner contour.

Typical policy fields include:

- whether every task requires a PR
- whether drafts are required first
- whether review is mandatory
- reviewer type
- merge checks and approvals
- whether the agent may self-merge

PR policy changes the delivery mechanics while task readiness, dependency, and ownership rules stay the same.

If `pull_requests.enabled` is `false`, the agent must still persist repository-changing work by commit and push:

- commit completed task outputs to the assigned working branch;
- push directly to that working branch;
- treat local-only completed changes as unfinished work, not as a completed handoff.

## Artifact Persistence

Repository-persisted artifacts remain the source of truth for reusable knowledge:

- `.ai-dev-template.config.json`
- `AGENTS.md`
- `.ai-dev-template.workflow-state.json`
- `instructions/`
- `docs/`
- templates and workflow assets

Temporary local work artifacts may follow repository policy, but canonical workflow and task-governance documents must remain in the repository.

If setup consumed a modified `.ai-dev-template.config.json`, that file is mandatory committed evidence for the setup result unless a documented repository policy explicitly carves out an exception.

Operational side effects in GitHub or other delivery systems complement repository persistence requirements. If a task updates the operational system of record, the corresponding canonical repository evidence must also be updated, committed, and pushed.

On Windows or in PowerShell, temporary files passed to `gh`, `git`, or similar tools use explicit UTF-8 encoding.

## GitHub Token Requirements

Minimum expected scopes:

- `repo`
- `project`

Recommended additional scopes:

- `read:org`
- `workflow`

These scopes provide capability baseline only. Repository permissions, project permissions, and branch protections still apply.
