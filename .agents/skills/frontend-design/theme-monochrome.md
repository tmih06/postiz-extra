# Monochrome Theme & Minimal Aesthetic

Black and white visual design system for clean, high-contrast, distraction-free interfaces using Tailwind CSS and shadcn/ui.

## Visual Ethos: Pure Monochrome

The interface expresses hierarchy entirely through value, scale, weight, and whitespace—never chromatic accents. Every screen remains crisp, legible, and uncluttered.

- **Primary Canvas**: Pure white (`oklch(1 0 0)`) in light mode; deep black (`oklch(0.145 0 0)`) in dark mode.
- **Surface Elevation**: Convey depth with hairline borders (`border-border`) or subtle fills (`bg-muted/40`), never heavy drop shadows or gradient washes.
- **Hierarchy by Contrast**: Use high-contrast headings (`text-foreground`), readable body text, and subdued metadata (`text-muted-foreground`).
- **Restraint Over Decoration**: Omit colored status pills, gradient buttons, and decorative badges. Let content and typography command attention.

## Token Mapping

Always use semantic Tailwind utility classes mapped to the project's OKLCH CSS variables.

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `bg-background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Primary page background |
| `text-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text, titles, prominent icons |
| `bg-card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Elevated surfaces, modals, popovers |
| `text-card-foreground`| `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside cards and elevated panels |
| `bg-muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Subtle table rows, badge fills, input backgrounds |
| `text-muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary labels, timestamps, placeholders |
| `border-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | 1px dividers, card boundaries, input outlines |
| `bg-primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Inverted emphasis for primary action buttons |
| `text-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | High-contrast text on primary buttons |
| `ring-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focused control outlines |

### Accent Exceptions
Reserve color strictly for semantic alerts (e.g., `text-destructive` / `bg-destructive/10` for errors). Present warnings, success, and info states using monochrome treatments: icon plus clear text rather than saturated color blocks.

## Typography Scale & Hierarchy

Express information density through typography scale and font weight:

```tsx
// Page title: prominent, high-contrast, tight tracking
<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
  Scheduled Posts
</h1>

// Section heading: clear demarcation
<h2 className="text-lg font-medium text-foreground">
  Connected Channels
</h2>

// Body copy: comfortable reading measure (< 75 characters)
<p className="text-sm text-foreground/90 leading-relaxed max-w-prose">
  Configure posting times and account credentials for each social channel.
</p>

// Subtitle / meta information: muted, small
<span className="text-xs text-muted-foreground">
  Last synced 5 minutes ago
</span>

// Numerical data / metrics: bold numerals with muted descriptor
<div className="flex items-baseline gap-2">
  <span className="text-2xl font-bold tracking-tight text-foreground">1,248</span>
  <span className="text-xs text-muted-foreground">impressions</span>
</div>
```

## Spatial Rhythm & Whitespace

Whitespace is an active structural element, not dead space.

1. **Section Spacing**: Separate major layout sections with `space-y-8` or `gap-8` (32px).
2. **Component Spacing**: Group related controls with `gap-3` (12px) or `gap-4` (16px).
3. **Internal Padding**: Use consistent padding on containers: `p-4 sm:p-6`.
4. **Hairline Dividers**: Use shadcn `<Separator />` or `border-b border-border` when whitespace alone is insufficient to separate distinct data sets.

## Minimal Chrome Rules

- **Borders over Shadows**: Use `border border-border` with `rounded-lg` or `rounded-md`. Prefer clean line work over multi-layered drop shadows.
- **Muted Badge Patterns**: Status badges use monochrome variants (`variant="secondary"` or `variant="outline"`):
  ```tsx
  // Published / Active
  <Badge variant="secondary" className="font-mono text-xs font-normal">
    PUBLISHED
  </Badge>

  // Draft / Inactive
  <Badge variant="outline" className="text-muted-foreground font-mono text-xs">
    DRAFT
  </Badge>
  ```
- **Iconography**: Render icons using `lucide-react` with thin or regular stroke weights (`strokeWidth={1.5}` or `1.75`), sized proportionally (`size-4` for inline text, `size-5` for action bars).

## Completion Criteria

Monochrome design is verified when:
- [ ] No chromatic Tailwind color classes (`bg-blue-*`, `text-emerald-*`, `border-amber-*`) appear outside isolated destructive actions.
- [ ] Contrast meets WCAG AA standards (minimum 4.5:1 for body copy, 3:1 for large headers).
- [ ] Both light mode and dark mode render crisp, readable text with correct token inversion.
- [ ] Layout uses borders and whitespace for hierarchy without relying on heavy box shadows or gradient backgrounds.
