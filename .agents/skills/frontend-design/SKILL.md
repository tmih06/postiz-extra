---
name: frontend-design
description: Design clean, tactile, high-contrast dashboard UI using the Beautiful UI design system, shadcn/ui, Tailwind CSS, and AI harness primitives. Use when creating or reshaping views, sourcing open-source components, composing design tokens, styling collapsible sidebars, or building agent workflows.
license: Complete terms in LICENSE.txt
---

# Frontend Design System

A modern, tactile, high-contrast design system built on Beautiful UI tokens, shadcn/ui, Radix primitives, and Tailwind CSS, tailored for the Postiz publishing workspace.

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

### 1. Check Installed Libraries & Prebuilt Sourcing (`Installed > Online > Rebuild`)
Always inspect existing installed libraries and local components before searching externally or authoring custom components:
- **Check Installed Dependencies First**: Inspect `package.json` dependencies and existing workspace components (`components/ui`, `components/atoms`, `components/primitives`). If an installed library (e.g., `@radix-ui/react-*`, `lucide-react`, `motion`) or local component already satisfies or composes the requested UI element, use it directly.
- **No Unneeded Research**: If an installed library or workspace component fulfills the requirement, proceed directly to implementation. Do not perform external research unless the user explicitly asked for research.
- **External Research (Only When Missing or Explicitly Requested)**:
  - Run external research only when installed libraries lack the required component, or when the user explicitly requested research.
  - Query component registries and repositories (e.g., shadcn registries, 21st.dev, v0, Radix, Tailwind UI open-source implementations, GitHub) for existing implementations fulfilling the requirement.
  - Verify candidate license compatibility: accept permissive licenses only (e.g., MIT, Apache-2.0, BSD, ISC, Unlicense); reject copyleft or proprietary terms.
  - Surface qualifying candidates to the user with component name, source URL, and verified license before writing custom code.
- **Proceed by User Choice**:
  - **Adopt**: Bring in the prebuilt component, adapt styling to Beautiful UI tokens (`bg-surface`, `text-ink`, `border-line`, `shadow-card`), and wire props.
  - **Rebuild or Not Found**: If no suitable prebuilt implementation exists, or if the user explicitly prefers a custom build, proceed to Step 2.

### 2. Structure the View
- Determine user workflow, primary call-to-action, and data states (loading, empty, populated).
- Organize content into cards (`bg-surface rounded-card border border-line shadow-card`).

### 3. Apply Design System Tokens
- Utilize semantic utilities (`bg-surface`, `bg-page`, `text-ink`, `text-ink-2`, `border-line`, `shadow-card`).
- Use the fixed diagonal stripe background on the viewport container.
- Establish hierarchy via font weight (`font-semibold`) and ink contrast rather than heavy background washes.

### 4. Leverage Atoms and Primitives
- Use `StatusPill` for channel or publishing status (`green`, `orange`, `red`, `accent`, `neutral`).
- Use `ValuePill` for inline counts, dates, and metrics within running text.
- Use `EntityChip` for customer profiles and social account badges.
- Use `SegmentedControl` for mode and timeframe toggles.

### 5. Provide Tactile Interactive Feedback
- Ensure clickable surfaces support hover (`hover:bg-hover`), active press feedback (`active:scale-[0.98]`), and focus rings (`focus-visible:ring-1`).
- Animate agent interactions with `ThinkingState`, `StreamingText`, and `LoadingState`.
- Incorporate `GlideMenu` for cursor-following hover highlights on list items.

## Quality Floor & Critique Checklist

Before finalizing any frontend implementation, verify against this bar:
- [ ] **Component Sourcing Audit (`Installed > Online > Rebuild`)**: Checked installed libraries and workspace components first. Skipped external research when an installed package already satisfied the requirement; verified permissive license only when external research was required or requested.
- [ ] **Design Token Hygiene**: All surfaces, text, borders, and shadows use the design tokens (`--page`, `--surface`, `--ink`, `--line`, `--shadow-card`).
- [ ] **Accessibility & Contrast**: Text contrast meets WCAG AA standards (minimum 4.5:1). Keyboard navigation works smoothly across all controls.
- [ ] **Collapsible Layout**: Sidebar transitions cleanly between expanded (240px) and collapsed (56px) without icon drift or text clipping.
- [ ] **Theme Parity**: Light and dark themes switch cleanly with identical spatial geometry.
