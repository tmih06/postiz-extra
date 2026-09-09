---
name: frontend-design
description: Design clean, tactile, high-contrast dashboard UI using the Beautiful UI design system, shadcn/ui, Tailwind CSS, and AI harness primitives. Use when creating or reshaping views, composing design tokens, styling collapsible sidebars, or building agent workflows.
license: Complete terms in LICENSE.txt
---

# Frontend Design System
A modern, tactile, high-contrast design system built on Beautiful UI tokens, shadcn/ui, Radix primitives, and Tailwind CSS, tailored for the Meltiply publishing workspace.
## Visual Ethos: Cool Canvas, Restrained Ink, and Tactile Depth

The interface relies on crisp hairline boundaries, layered single-digit opacity shadows, a neutral ink ramp, a subtle diagonal striped background canvas, and semantic color used strictly as an intentional condiment.

- **Canvas & Background**: Cool, blue-tinted neutral page canvas with a fixed 45-degree repeating diagonal stripe texture (`--stripe-bg`, `--stripe`). White elevated cards in light mode; deep layered surfaces in dark mode.
- **Surfaces & Radii**: Disciplined radii scale:
  - 6px: Chips and small tags (`rounded-chip`)
  - 8px: Form controls, buttons, and row items (`rounded-control`)
  - 10px: Cards, containers, and modules (`rounded-card`)
  - 14px: Windows, floating modals, and overlays (`rounded-window`)
- **Borders & Shadows**: Crisp 1px solid hairline rings (`--shadow-hairline`) combined with soft, layered shadow stacks (`--shadow-card`, `--shadow-raised`, `--shadow-overlay`).
- **Typography & Ink**: High-contrast, legible hierarchy via the ink ramp:
  - `--ink`: Primary text and high-contrast emphasis
  - `--ink-2`: Secondary explanations and metadata
  - `--ink-3`: Subtle labels, timestamps, and placeholders
- **AI Agent Studio & Harness**: Interactive human-in-the-loop workflow using dedicated primitives:
  - `ThinkingState` with live elapsed tenths-of-a-second timer and stage checkmarks
  - `ToolChips` showing agent tool executions with expandable diff lines
  - `StreamingText` with typewriter pacing and blinking animated stream caret
  - `ApprovalCard` for interactive multi-destination review and schedule confirmation
  - `DiffTable` for line-by-line post copy comparisons
  - `RecommendationCard` with confidence signals and alternative drawer options
  - `PromptBar` with `@channel` mentions and `/command` shortcuts

## Detailed Sub-Skills & Reference Guides

Consult these specialized sub-files for specific implementation domains:

- **[theme-monochrome.md](./theme-monochrome.md)** — **Theme Tokens & Visual Description**: OKLCH semantic surface tokens, ink ramp, hairline borders, layered shadow scale, stripe texture, and light/dark mode contrast hierarchy.
- **[shadcn-library.md](./shadcn-library.md)** — **Component Inventory & Primitives**: Atoms (`StatusPill`, `ValuePill`, `EntityChip`, `SegmentedControl`, `ProgressRing`), Primitives (`SidebarNav`, `GlideMenu`, `ThinkingState`, `StreamingText`, `ToolChips`, `ApprovalCard`, `DiffTable`, `InsightCards`, `PromptBar`), and feature views.
- **[clean-interactions.md](./clean-interactions.md)** — **Interactive Design & Micro-Interactions**: Collapsible sidebar with cubic-bezier spring easing, `GlideMenu` hover tracking, typing caret animations, pixel wavefront loaders, and tactile button feedback.
- **[component-logic.md](./component-logic.md)** — **Component Logic & Workspace State**: Clean presenter/container separation, workspace context, group-backed brand profiles, channel selection invariants, and optimistic UI updates.

## Design & Implementation Workflow

Execute frontend tasks using this disciplined sequence:

### 1. Structure the View
- Determine user workflow, primary call-to-action, and data states (loading, empty, populated).
- Organize content into cards (`bg-surface rounded-card border border-line shadow-card`).

### 2. Apply Design System Tokens
- Utilize semantic utilities (`bg-surface`, `bg-page`, `text-ink`, `text-ink-2`, `border-line`, `shadow-card`).
- Use the fixed diagonal stripe background on the viewport container.
- Establish hierarchy via font weight (`font-semibold`) and ink contrast rather than heavy background washes.

### 3. Leverage Atoms and Primitives
- Use `StatusPill` for channel or publishing status (`green`, `orange`, `red`, `accent`, `neutral`).
- Use `ValuePill` for inline counts, dates, and metrics within running text.
- Use `EntityChip` for customer profiles and social account badges.
- Use `SegmentedControl` for mode and timeframe toggles.

### 4. Provide Tactile Interactive Feedback
- Ensure clickable surfaces support hover (`hover:bg-hover`), active press feedback (`active:scale-[0.98]`), and focus rings (`focus-visible:ring-1`).
- Animate agent interactions with `ThinkingState`, `StreamingText`, and `LoadingState`.
- Incorporate `GlideMenu` for cursor-following hover highlights on list items.

## Quality Floor & Critique Checklist

Before finalizing any frontend implementation, verify against this bar:
- [ ] **Design Token Hygiene**: All surfaces, text, borders, and shadows use the design tokens (`--page`, `--surface`, `--ink`, `--line`, `--shadow-card`).
- [ ] **Accessibility & Contrast**: Text contrast meets WCAG AA standards (minimum 4.5:1). Keyboard navigation works smoothly across all controls.
- [ ] **Collapsible Layout**: Sidebar transitions cleanly between expanded (240px) and collapsed (56px) without icon drift or text clipping.
- [ ] **Theme Parity**: Light and dark themes switch cleanly with identical spatial geometry.
