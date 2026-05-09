# Contributing

Open Browser Use is an agent-first repository, but the collaboration rules apply to both people and agents.

## Start With The Local Docs

Begin with `AGENTS.md`, then follow the task-specific links into `docs/`. The repository's durable knowledge should live in versioned files, not only in chat history, private notes, or pull request comments.

For most changes, read at least:

- `docs/REPO_COLLAB_GUIDE.md`
- `docs/ARCHITECTURE.md`
- `docs/design-docs/core-beliefs.md`

Before finishing code or workflow changes, also check:

- `docs/HISTORY_GUIDE.md`
- `docs/QUALITY_SCORE.md`

## Keep Changes Coherent

- Prefer small, clearly scoped changes.
- Update code, tests, docs, release notes, and history together when behavior changes.
- Do not hide required setup steps in one-off comments or local scripts.
- If a task is broad, risky, or likely to span multiple rounds, create an execution plan under `docs/exec-plans/active/`.
- Keep `AGENTS.md` short and use `docs/` for detailed repository knowledge.

## Before Opening A Pull Request

Run:

```sh
make ci
```

Also verify:

- Relevant docs match the final behavior.
- A history entry was added or updated when the change touched code or repository workflow.
- User-visible changes have release notes where appropriate.
- Examples, scripts, and setup instructions still match the implementation.
- No secrets, private local paths, cookies, browser data, or credentials were committed.

## Review Expectations

- Split large work into reviewable pull requests.
- Call out risks, migration impact, and follow-up tasks explicitly.
- Link the relevant plan, spec, history entry, or docs when context is not obvious.
- Prefer concrete file references over background knowledge that only one contributor has.

## Security Reports

Do not publish exploit details in public issues. Follow `docs/SECURITY.md` for private reporting, redaction, and maintainer handling expectations.
