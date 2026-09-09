# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `tmih06/postiz-extra`.
Use the `gh` CLI, specifying `--repo tmih06/postiz-extra` on issue commands.

## Operations

- Publish a spec: create a GitHub issue.
- Read a ticket: fetch its body, labels, and comments.
- Create or update long issue bodies with `--body-file`.
- Apply triage labels using the mapping in `docs/agents/triage-labels.md`.
- Before creating an issue, check for an existing ticket covering the same work.

## Parent issues and sub-issues

Use a parent issue for the overall specification and native GitHub
sub-issues for separately actionable work.

Link children through the GitHub sub-issues API using each child's
numeric database ID, not its issue number or node ID.

If native sub-issues are unavailable, put a child task list in the
parent and a `Part of #<parent>` reference in each child. Report the fallback.

## Dependencies

Use native GitHub issue dependencies for blocking relationships.
The blocked-by API takes the blocker's numeric database ID.

If native dependencies are unavailable, use a `Blocked by: #<number>`
line in the blocked issue. A ticket is unblocked when all blockers are closed.

## Pull requests as a triage surface

PRs as a request surface: no.

If enabled later, use the equivalent `gh pr` operations for external
requests. GitHub issues and pull requests share a number space;
resolve which resource a number identifies before acting.

## Wayfinding

For wayfinder sessions, use a parent issue labelled `wayfinder:map`.
Child types use `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`.

Choose the first open, unassigned child in parent order with no open
blockers. Claim it by assignment before working. On completion, comment
with the result, close the child, and record the decision and link in
the parent.
