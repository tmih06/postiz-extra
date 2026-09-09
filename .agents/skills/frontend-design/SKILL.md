---
name: frontend-design
description: Design clean, minimal, black & white UI using shadcn/ui, Tailwind, torph, and @lucide-animated. Use when creating or reshaping views, composing shadcn primitives, adding animated icons or text morphing, or structuring component state and logic.
license: Complete terms in LICENSE.txt
---

# Frontend Design System

A minimalist, high-contrast black and white design methodology built on shadcn/ui, Radix primitives, and Tailwind CSS.

## Visual Ethos: Pure Monochrome & Restraint

The interface relies strictly on value contrast, typography scale, and intentional whitespace rather than decorative colors, gradients, or heavy shadows.

- **Theme**: Pure black (`oklch(0.145 0 0)`) and white (`oklch(1 0 0)`) canvas with neutral gray steps.
- **Components**: shadcn/ui primitives (`@/components/ui/*`) and `@lucide-animated` icons composed via Radix slot architecture (`asChild`).
- **Interactivity**: Tactile micro-interactions (≤150ms), text morphing via torph, animated icon hover effects, and distinct hover/focus-visible/active feedback.
- **Logic**: Clean presenter/container separation, TanStack Query cache synchronization, and Zod-validated forms.

## Detailed Sub-Skills & Reference Guides

Consult these specialized sub-files for specific implementation domains:

- **[theme-monochrome.md](./theme-monochrome.md)** — **Monochrome Theme & Minimal Aesthetic**: OKLCH semantic tokens, light/dark mode contrast hierarchy, typography scale, whitespace rhythm, and minimal chrome rules. Read when styling views, picking colors, setting type hierarchy, or testing theme contrast.
- **[shadcn-library.md](./shadcn-library.md)** — **shadcn/ui Library Utilization**: Component inventory, Radix `asChild` composition, `@lucide-animated` CLI installation (`bun x --bun shadcn add @lucide-animated/<icon>`), Card/Dialog/Field anatomy, `cn()` variant hygiene, and icon sizing. Read when adding buttons, assembling forms, creating modals, or adding animated icons.
- **[clean-interactions.md](./clean-interactions.md)** — **Clean Interactive Design & Micro-Interactions**: The five interactive states (idle, hover, focus-visible, active, disabled), text & number morphing with torph, `@lucide-animated` icon micro-animations, layout-stable skeletons, and actionable empty states. Read when implementing interactive controls, text/counter morphing, icon animations, transitions, loading placeholders, or empty views.
- **[component-logic.md](./component-logic.md)** — **Clean Component Logic & State Architecture**: Presenter vs. container separation, TanStack Query lifecycle patterns, optimistic UI updates, Zod form validation, and custom UI hooks. Read when orchestrating data mutations, writing custom hooks, or handling edge cases.

> **Monorepo Skill Pre-requisites**: Complementary agent skills (`shadcn`, `tailwind-design-system`) already exist at the repository root (`.agents/skills/`). Do not run `skills add` or attempt to re-install skills into `apps/ui/` or any subpackage.

## Design & Implementation Workflow

Execute frontend tasks using this disciplined 5-step sequence:

### 1. Plan Structure & Content
- Identify the primary user action on the screen.
- Determine required data models and asynchronous states (loading, empty, error, populated).
- Outline the layout using semantic grid/flex containers before writing CSS.

### 2. Apply Monochrome Visual Hierarchy
- Use semantic token utilities (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-muted`).
- Build visual emphasis through font weight (`font-semibold`) and size rather than color.
- Demarcate sections with whitespace (`gap-6`, `space-y-6`) and hairline borders (`border-border`).
- *Reference*: [theme-monochrome.md](./theme-monochrome.md)

### 3. Assemble with shadcn Primitives
- Check `@/components/ui/` for existing primitives before writing raw HTML tags.
- Install animated icons as needed via `bun x --bun shadcn add @lucide-animated/<icon>`.
- Compose buttons, inputs, dropdowns, and cards using standard slot patterns (`asChild` on links).
- Route dynamic classes through `cn()` from `@/lib/utils`.

### 4. Wire Interactive Feedback & Micro-Interactions
- Ensure every clickable surface supports hover (`hover:bg-muted`), focus-visible rings (`ring-ring`), and press response (`active:scale-[0.98]`).
- Animate dynamic numbers, counters, and status transitions with `TextMorph` from `torph/react` to eliminate layout shift.
- Mirror target layout with `<Skeleton>` placeholders during data fetching to prevent layout shifts.
- Construct actionable empty states that provide an immediate call-to-action button.
- *Reference*: [clean-interactions.md](./clean-interactions.md)

### 5. Orchestrate Component Logic
- Decouple data fetching (TanStack Query) from presentational markup.
- Implement optimistic updates for status toggles and deletions.
- Validate form inputs with Zod schemas and display inline field errors.
- *Reference*: [component-logic.md](./component-logic.md)

## Quality Floor & Critique Checklist

Before finalizing any frontend implementation, verify against this bar:
- [ ] **Monochrome Integrity**: No non-neutral colors outside isolated destructive prompts.
- [ ] **Accessibility & Contrast**: All text satisfies WCAG AA contrast (≥4.5:1). Keyboard navigation (`Tab`, `Enter`, `Escape`) works seamlessly across all interactive controls.
- [ ] **No Layout Shift**: Page transitions and loading states use layout-accurate skeletons.
- [ ] **Component Reusability**: Interactive elements utilize shadcn primitives instead of ad-hoc styled divs.
- [ ] **Responsive Discipline**: Layout degrades gracefully down to mobile (`< 640px`) without horizontal overflow.
