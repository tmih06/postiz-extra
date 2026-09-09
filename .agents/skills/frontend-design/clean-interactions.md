# Clean Interactive Design & Micro-Interactions

Principles and patterns for building tactile, responsive, and delightful micro-interactions across the Postiz workspace.

## Interaction Ethos

Every transition must feel instantaneous and tactile, confirming actions without causing layout shift or drawing undue attention to the animation.

- **Speed**: Durations capped at 150ms–250ms using strong cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.23, 1, 0.32, 1)`).
- **Tactility**: Distinct press feedback on buttons (`active:scale-[0.98]`) and soft hover fills (`hover:bg-hover`).
- **Restraint**: Restrict looping animations strictly to active loaders or streaming carets.

---

## 1. Collapsible Sidebar Kinematics

The navigation shell transitions between an expanded rail (240px) and a collapsed compact bar (56px) while preserving exact icon centering:

```tsx
<aside
  className={cn(
    "relative flex flex-col border-r border-line bg-surface select-none transition-[width] duration-250",
    collapsed ? "w-[56px]" : "w-[240px]"
  )}
  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
>
  {/* Header, Search, Navigation List, and Footer */}
</aside>
```

- In expanded mode: items show leading icon, label, and optional badge (`badge="AI"`).
- In collapsed mode: labels hide smoothly, and buttons center icons (`justify-center px-0`).

---

## 2. GlideMenu: Cursor-Tracking Highlight

The `GlideMenu` component renders a single floating hover indicator that smoothly glides between interactive items rather than flashing individual backgrounds:

```tsx
<GlideMenu
  rowSelector="[data-nav-row]"
  highlightClassName="rounded-[7px] bg-hover"
  className="flex flex-col gap-0.5"
>
  {items.map((item) => (
    <button data-nav-row key={item.id} onClick={() => onNavigate(item.id)}>
      {item.label}
    </button>
  ))}
</GlideMenu>
```

The sliding background animates using:
```css
transition: top 200ms cubic-bezier(0.23,1,0.32,1), height 200ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease;
```

---

## 3. AI Agent Studio Primitives

### ThinkingState
Displays live agent trace operations while processing complex multi-platform scheduling tasks:
- **Elapsed Timer**: Computes duration in tenths of a second (`2.8s`).
- **Step Transitions**: Progresses sequentially from spinner to checkmark (`Check` icon in green).
- **Expandable Trace**: Accordion toggle reveals detailed sub-tasks and code diff snippets.

### StreamingText
Provides word-by-word typewriter pacing for AI output, concluding with an animated blinking cursor:
```css
.stream-caret {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: var(--accent);
  margin-left: 2px;
  vertical-align: -0.15em;
  border-radius: 1px;
}
.stream-caret.is-streaming {
  animation: caret-blink 750ms ease-in-out infinite;
}
```

### LoadingState: Pixel Grid Wavefront
For long-running uploads or media processing, use a 3×3 pixel grid with staggered wavefront delays:
```tsx
<LoadingState label="Processing publishing queue" variant="Dots" />
```
The animation runs `pixel-on 650ms ease-in-out` staggered along chevron diagonals.

---

## 4. Human-in-the-Loop Interactivity

### ApprovalCard
Used for post batch confirmation before scheduling:
- Multi-destination toggles with individual checkboxes.
- Quick timing selectors (`Next optimal slot`, `Publish now`, `Save drafts`).
- Smooth transition to success state upon confirmation.

### DiffTable
Allows creators to review and selectively include or exclude AI-generated copy improvements:
- Line-by-line toggle buttons (`Included` / `Excluded`).
- High-contrast green additions (`+`) and red deletions (`-`).

---

## 5. Five States of Interactive Controls

Every button, select, and interactive row must support:
1. **Idle**: `border border-line bg-surface text-ink`
2. **Hover**: `hover:border-line-strong hover:bg-hover hover:text-ink`
3. **Focus-Visible**: `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong`
4. **Active**: `active:scale-[0.98]`
5. **Disabled**: `disabled:opacity-40 disabled:pointer-events-none`
