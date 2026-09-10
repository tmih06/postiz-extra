# Postiz agent instructions

This is the repository-wide source of agent instructions. Postiz schedules social
media posts through workflows and provides calendars, analytics, teams, and media
management. Preserve production compatibility and in-flight work.

## Completion gate

Quality and performance take priority over finishing quickly. Before declaring a
code, build, dependency, or configuration task finished:

1. Compare the change with existing implementations. Reuse established patterns,
   remove duplication, and check every affected caller. Use a separate reviewer
   for substantial changes when available; reviewers must not launch concurrent
   builds or quality checks.
2. Exercise the changed behavior with a focused test or smoke command. A successful
   build or lint run alone does not prove the behavior works.
3. From the repository root, run the appropriate quality gate after the final edit:

   | Changed area | Required command |
   | --- | --- |
   | Frontend or shared React library only | `make check-frontend` |
   | Backend, orchestrator, commands, SDK, or NestJS library only | `make check-backend` |
   | Shared helpers, extension, multiple scopes, dependencies, or check/build configuration | `make check` |

   `make check` includes both scopes and the extension, with cross-scope duplicate
   detection. Do not run all three commands redundantly.
4. Fix introduced violations and rerun the affected check. Keep strict types,
   zero-warning lint, and duplication enforcement intact: do not weaken rules,
   add a baseline, exclude offending files, or suppress findings merely to pass.
5. In the final response, give the exact commands run and their outcomes. A task
   is complete only when required checks pass and the changed behavior is verified.
   Existing violations, unavailable prerequisites, timeouts, and resource failures
   mean **verification blocked**, not passed or finished. Report the blocker and
   distinguish existing findings from introduced ones only when evidence supports it.

For documentation-only tasks, verify edited content, paths, links, and command
references with lightweight checks; explicitly report that code gates were not
run. Do not start a full-project analysis just to validate prose.

### Protect the workstation

A previous heavy operation froze the workstation and required a reboot. Run only
one resource-intensive check/build/test process at a time, including across agents.
Use the Make targets rather than unbounded direct checker invocations. The runner
uses sequential Node processes, reduced CPU priority, a 512 MiB V8 old-space cap,
and a two-minute timeout per stage. The heap cap is not a total-process RAM limit.

On an out-of-memory error, timeout, signal, or system slowdown, stop heavy work and
report verification blocked. Do not repeatedly retry, raise limits, bypass the
runner, or start parallel workers without explicit user approval. If the user
reports a freeze, accept it; never reproduce it on their workstation to confirm it.
Use a suitably provisioned CI environment for checks that cannot finish safely.

## Architecture and workflow

- Bun workspaces: applications in `apps/`, shared code in `libraries/`.
- `apps/frontend`: Vite React UI, with legacy Next.js handlers/UI. Inspect the
  affected entry point rather than assuming all screens use the same router.
- `apps/backend`: NestJS API on Node. `apps/orchestrator`: Temporal workflows and
  activities on Node. Other apps are the browser extension, Node SDK, and commands.
- Shared helpers, React components, and NestJS services live in their respective
  `libraries/` directories. Put shared server logic in `libraries/nestjs-libraries`,
  not in controllers or a new parallel service layer.
- Prisma schema: `libraries/nestjs-libraries/src/database/prisma/schema.prisma`.
  Use Prisma rather than raw SQL. PostgreSQL stores data; Redis supports queues
  and caching. Integrations include social providers, Resend, Stripe, Make.com,
  and N8N.
- Use Bun 1.3.14 for dependency management and workspace scripts; supported Node is
  `>=22.12.0 <23.0.0` (CI pins 22.20.0). Backend and orchestrator execute on Node.
- Discover commands with `make help` and the relevant `package.json`. Install
  locked dependencies with `bun install --frozen-lockfile`; Prisma generation is
  required for type checks. Quality checks do not require a running database.
- Prefer the Makefile's isolated local-development setup. Inspect database targets
  before executing them: schema pushes and resets can destroy data. Require user
  authorization for destructive operations.
- Keep `.env` private and update `.env.example` when introducing environment variables.

## Code quality and performance

- Use explicit domain names, precise types, and existing interfaces. Use `unknown`
  plus narrowing for untrusted values rather than `any` or unsafe assertions.
- Remove unused imports, variables, and obsolete code; import every referenced
  symbol. Check consumers when changing a contract.
- Prefer the existing implementation over duplicated logic, unnecessary algorithm
  files, or new abstractions. Explain complex logic and non-obvious invariants.
- Avoid avoidable allocations, repeated computation, unbounded queries, N+1 data
  access, and unnecessary React renders. Measure performance-sensitive changes;
  static checks cannot guarantee latency, throughput, or memory usage.
- Review ordering, transactions, concurrency limits, and provider rate limits before
  replacing sequential awaits with parallel work. A lint finding is not permission
  to change semantics. Any justified exception needs a local explanation.

## Backend and workflow contracts

- Follow `DTO -> Controller -> Service -> Repository`, or
  `DTO -> Controller -> Manager -> Service -> Repository` where established.
  Keep transport handling in controllers and database access in repositories.
- Preserve existing users and persisted data; identify migration requirements when
  changing schemas or public contracts.
- Keep provider-specific behavior in provider implementations. Extend the shared
  provider interface and call it generically rather than adding Facebook/Instagram
  or other provider branches to generic code.
- Preserve Temporal workflow implementations already merged into `origin/main`.
  Introduce a versioned workflow and migrate callers when changing behavior.
- Preserve merged activity parameter contracts for in-flight workflows. Introduce
  a new activity and a new workflow that uses it when parameters must change.

## Frontend conventions

- Inspect nearby components, active styles, and design tokens before adding UI.
  Reuse `apps/frontend/src/components/ui` and existing components; write native
  components rather than installing additional component packages.
- Use the Tailwind version/configuration of the affected surface; legacy styles
  include `apps/frontend/src/app/colors.scss` and `global.scss`. Deprecated
  `--color-custom*` variables must not be used for new styling.
- Fetch through SWR and the existing `useFetch` hook in
  `libraries/helpers/src/utils/custom.fetch.tsx`.
- Give each SWR operation its own custom hook. Call hooks at the top level of a
  component or custom hook, never inside callbacks returned by another hook.
  Follow `react-hooks/rules-of-hooks`; do not disable it.
- Run lint/quality commands from the repository root.

## Logging

Use the existing Sentry setup rather than creating another logging mechanism.
Where using `@sentry/nextjs`, import `* as Sentry`, enable logs in the existing
initialization with `enableLogs: true`, and use `const { logger } = Sentry`.
Use `logger.fmt` for interpolated structured messages and attach useful context as
fields. Sentry's `consoleLoggingIntegration` can capture selected console levels.

## Pull requests and task references

- Use conventional commit prefixes (`feat:`, `fix:`, `chore:`).
- Before writing a PR or PR description, read `.github/PULL_REQUEST_TEMPLATE.md`
  and follow it. Include related issues and UI screenshots/GIFs for visual changes.
- Every PR description must contain an exact `# QA` heading and real numbered
  checkbox steps (`1. [ ] ...`) covering setup, action, and expected result.
  Keep steps outside fenced code blocks. Replace placeholders; an empty section,
  `N/A`, `TBD`, `todo`, or `none` is not a QA plan.
- Under `# What kind of change does this PR introduce?`, state the change type,
  affected area, concrete functions/endpoints/files/fields changed, and what stayed
  unchanged. A bare category such as `Bug fix.` is insufficient.
- Before reading or publishing GitHub tickets, read `docs/agents/issue-tracker.md`.
  Track work in `tmih06/postiz-extra` using native sub-issues for child tickets.
- Before applying triage labels, read `docs/agents/triage-labels.md`.
- Before domain exploration or design, read `docs/agents/domain.md` for the shared
  glossary and ADR conventions.
- For project setup and external APIs, consult `README.md` and
  https://docs.postiz.com/ (developer guide: `/developer-guide`; API: `/public-api`).
