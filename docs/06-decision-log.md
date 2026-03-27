# Decision Log

Use ADR-lite entries. Add new decisions to the top.

## 2026-03-13 - Establish template operating model

- Decision: Use repository docs as the source of truth for project context and GitHub Issues plus GitHub Project as the source of truth for delivery state.
- Reason: New agent sessions must be able to resume work predictably without relying on transient context.
- Consequences: Documentation and issue hygiene become mandatory parts of task completion.

## 2026-03-16 - Add configurable workflow policy

- Decision: Introduce `.ai-dev-template.config.json` as the workflow policy file for language, execution mode, PR policy, and artifact persistence.
- Reason: The template must support different collaboration models without hardcoding one fixed operating mode.
- Consequences: Agent behavior, docs, and setup scripts must honor the configuration before project execution starts.
