# Domain docs

## Layout

This repository uses a single context across its applications and libraries:

- Root `CONTEXT.md`: shared domain glossary.
- Root `docs/adr/`: architecture decision records.

Application or package boundaries do not automatically define separate
domain contexts.

## Before exploration or design

Read the root glossary and ADRs relevant to the work.

If these documents do not exist, proceed silently. Do not create empty
placeholders. Use domain modeling to record terms and decisions when
they are resolved.

## Vocabulary

Use the glossary's canonical terms in specs, issue titles, code proposals,
and tests. If a needed concept is absent, distinguish a real glossary gap
from an unnecessary synonym.

## Decision conflicts

Surface any conflict with an existing ADR explicitly, naming the decision
and explaining why reopening it may be warranted. Do not silently override it.
