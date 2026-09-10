# Component Inventory, Primitives & Architecture

Guide for composing, extending, and structuring UI across the Postiz publishing workspace using Beautiful UI primitives, design tokens, and shadcn components.

## Component Inventory

### 1. Atoms (`@/components/atoms/*`)
Lightweight, reusable building blocks for inline text, status, and meters:

- **`StatusPill`**: Status badge with leading dot (`tone`: `'green' | 'orange' | 'red' | 'accent' | 'neutral'`). Used for channel connection status, post publishing states, and system health.
- **`ValuePill`**: Inline pill for numbers, dates, and names in running text. Features a crisp hairline border ring.
- **`EntityChip`**: Monogram colored disc + entity name in a soft field pill. Used for brand profiles and social accounts.
- **`SegmentedControl`**: Equal-width tab segments with an animated sliding thumb pill. Used for timeframes (`7d`, `30d`, `90d`) and filters.
- **`ProgressRing`**: SVG circular progress meter with central numeric readout. Used for character counts and queue quotas.
- **`Shimmer`**: Subtle linear-gradient shimmer on text. Signals background AI processing.

---

### 2. Primitives (`@/components/primitives/*`)
Specialized interaction primitives extracted from the Beautiful UI template:

- **`SidebarNav`**: Collapsible primary sidebar (240px expanded, 56px collapsed). Includes brand switcher popover, search trigger, navigation links, theme toggle, and user profile row.
- **`GlideMenu`**: Container that renders a single floating hover indicator tracking cursor position between rows.
- **`ThinkingState`**: Expandable agent trace displaying elapsed time in tenths of seconds and sequential checkmark states.
- **`StreamingText`**: Paced word-by-word streaming text renderer with an animated blinking cursor (`.stream-caret`).
- **`ToolChips`**: Compact list of agent tool invocations with status pills and expandable detail diffs.
- **`ApprovalCard`**: Human-in-the-loop review card for selecting destinations, confirming publication timing, and scheduling batches.
- **`RecommendationCard`**: Actionable AI suggestion card with signal strength indicators and drawer alternatives.
- **`DiffTable`**: Interactive comparison table showing line-by-line post copy edits with inclusion/exclusion toggles.
- **`InsightCards`**: Carousel of metric cards with smooth SVG sparklines, trend percentages, and executive summaries.
- **`LoadingState`**: 3×3 pixel grid loader with staggered chevron wavefront animations and elapsed timer.
- **`PromptBar`**: Bottom-pinned composer input featuring `@channel` tags, `/command` shortcuts, quick action chips, and submit triggers.

---

### 3. Harness & Feature Views
Primary application routes wired into the navigation shell:

- **`PostizHarness` (`/agent`)**: Interactive AI Studio workspace orchestrating `PromptBar`, `ThinkingState`, `ToolChips`, `StreamingText`, and `ApprovalCard`.
- **`Composer` (`/`)**: Multi-platform publishing workspace with group-backed channel preselection, character counters, media upload, and scheduling options.
- **`PostList` (`/scheduled`, `/list`, `/drafts`)**: High-density table and card views of queued, published, and drafted posts.
- **`CalendarView` (`/calendar`)**: Visual month and week calendar displaying scheduled slots with quick-edit capabilities.
- **`MediaView` (`/media`)**: Dedicated asset library supporting drag-and-drop upload, type filtering (images/videos), search, and composer insertion.
- **`AnalyticsView` (`/analytics`)**: Cross-platform performance dashboard tracking impressions, engagements, clicks, followers, and top posts.
- **`ChannelsView` (`/channels`)**: Directory of supported networks (X, LinkedIn, Instagram, Facebook, YouTube, TikTok, Threads, Pinterest, Reddit, Bluesky) with real-time status.
- **`PlugsView` (`/plugs`)**: Integrations catalog for third-party AI video tools (HeyGen, ReelFarm), social scrapers (NanoClaw), and automation webhooks.
- **`SettingsView` (`/settings`)**: Tabbed preferences for general workspace settings, brand profiles, team roles, post signatures, and notifications.

---

## Core Composition Guidelines

### 1. Card Layout
Containers must combine `bg-surface`, `rounded-card`, `border border-line`, and `shadow-card`:
```tsx
<div className="rounded-card border border-line bg-surface p-4 shadow-card">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-[14px] font-bold text-ink">Section Title</h3>
    <StatusPill tone="green">Active</StatusPill>
  </div>
  {/* Content */}
</div>
```

### 2. Slot Composition & Buttons
Use standard slot patterns (`asChild`) on buttons when wrapping links, and ensure distinct interactive feedback:
```tsx
<Button
  size="sm"
  className="rounded-control bg-foreground text-background font-semibold shadow-btn hover:opacity-90 active:scale-[0.98]"
>
  Publish Now
</Button>
```

### 3. Open-Source Sourcing & Adaptation (`Existing > Rebuild`)
Prioritize finding and adopting existing permissive open-source components before custom recreation:
- Query open registries and repositories (e.g. shadcn registries, 21st.dev, Radix UI) for components matching design requirements.
- Verify open-source license compatibility (MIT, Apache-2.0, BSD, ISC, Unlicense).
- Restyle imported markup with local design tokens (`bg-surface`, `text-ink`, `border-line`, `shadow-card`) to preserve Beautiful UI aesthetic consistency.
