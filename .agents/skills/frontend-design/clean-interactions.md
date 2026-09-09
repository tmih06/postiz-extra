# Clean Interactive Design & Micro-Interactions

Principles and patterns for building responsive, accessible, and understated micro-interactions in monochrome interfaces.

## Interaction Ethos: Purposeful & Restrained

Interactivity should confirm action and guide orientation without drawing attention to the animation itself. Every transition must feel instantaneous and tactile.

- **Speed**: Durations capped at 150ms–200ms with ease-out curves (`duration-150 ease-out`).
- **Tactility**: Micro-feedback on press (`active:scale-[0.98]`) or subtle tone shifts (`hover:bg-muted/70`).
- **Restraint**: Avoid bouncy springs, rotating accents, and staggered scroll-triggered entrance animations.
- **Accessibility**: Provide visible focus rings for keyboard navigation and respect `prefers-reduced-motion`.

## The Five States of Every Interactive Element

Every interactive surface (buttons, menu items, table rows, cards) must define five distinct states:

```tsx
<button
  className={cn(
    // 1. Idle
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150",
    "border border-border bg-background px-4 py-2 text-foreground",
    // 2. Hover
    "hover:bg-muted hover:text-foreground",
    // 3. Focus-Visible (Keyboard only)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // 4. Active (Pressed)
    "active:scale-[0.98] active:bg-muted/80",
    // 5. Disabled
    "disabled:pointer-events-none disabled:opacity-50"
  )}
>
  Confirm Schedule
</button>
```

### Focus Ring Standardization
Focus indicators must be distinct and unclipped:
- Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- Never remove focus outlines with `outline-none` unless accompanied by `focus-visible:ring-*`.

## Motion Restraint & Reduced Motion

Use subtle transformations strictly to communicate spatial hierarchy:

```tsx
// Dropdown menu / Popover entrance
"transition-all duration-150 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"

// Slide panel / Sheet entrance
"transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out duration-200"

// Reduced motion guard
"motion-reduce:transition-none motion-reduce:animate-none"
```

## Animated Text Morphing (torph)

For dynamic headlines, changing metric counters, and interactive button state transitions, use `torph/react` (`TextMorph`). `torph` is a dependency-free animated text morphing component that matches characters and place-values with zero layout thrashing, built-in spring physics, and automatic `prefers-reduced-motion` compliance.

### 1. Dynamic Metric & Numeric Readouts
Numeric words morph automatically by place value: digits slide along the block axis, and symbols (currency, commas, signs) travel with the places they belong to:

```tsx
import { TextMorph } from "torph/react";

// 1,204 → 1,318 rolls the hundreds and tens while leaving the thousands alone
<div className="flex items-baseline gap-2">
  <TextMorph className="text-2xl font-bold tracking-tight text-foreground font-mono">
    {impressions.toLocaleString("en")}
  </TextMorph>
  <span className="text-xs text-muted-foreground">views</span>
</div>
```

### 2. State-Changing Action Buttons
Morph button text smoothly across idle, pending, and completed states without jarring layout pops:

```tsx
import { TextMorph } from "torph/react";
import { Button } from "@/components/ui/button";

<Button disabled={isSubmitting} size="sm">
  <TextMorph duration={200}>
    {isSubmitting ? "Publishing..." : isSuccess ? "Published" : "Publish Post"}
  </TextMorph>
</Button>
```

### 3. Spring Physics & Tactile Easing
Pass spring parameters to `ease` for a tactile, physics-based animation. The duration is computed automatically by spring physics:

```tsx
<TextMorph
  as="h2"
  className="text-lg font-semibold tracking-tight text-foreground"
  ease={{ stiffness: 220, damping: 22 }}
>
  {activeTabTitle}
</TextMorph>
```

### 4. Input Caret-Aware Matching
When rendering text that a user is actively typing, pass `cursorIndex` so the morph matches at the caret position rather than by place value:

```tsx
const [value, setValue] = useState("");
const [caret, setCaret] = useState<number>();

<input
  value={value}
  onChange={(e) => {
    setCaret(e.target.selectionStart ?? undefined);
    setValue(e.target.value);
  }}
/>
<TextMorph cursorIndex={caret}>{value}</TextMorph>
```

## Micro-Animation with Animated Icons (@lucide-animated)

Animated Lucide icons provide subtle, delightful tactile feedback in a monochrome interface where color cannot be used for emphasis. The icon's motion provides status feedback and visual delight while maintaining a clean aesthetic.

### Guidelines
1. **Discreet Delight**: Use animated icons on high-value interactive anchors: notifications (`BellIcon`), AI or live status (`SparklesIcon`), navigation tabs (`LayersIcon`), and configuration settings (`SettingsIcon`).
2. **Bounded Duration**: Animations must self-settle within 0.5 seconds. Never loop icon animations indefinitely.
3. **Size Discipline**: Match icon scale to the surrounding typographic measure:
   - `size={14}`–`size={16}`: Inline within buttons, dropdown items, or badges.
   - `size={18}`–`size={20}`: Card headers and navigation rails.
   - `size={24}`+: Empty states and hero callouts.

### Hover & Programmatic Examples
```tsx
import { BellIcon, type BellIconHandle } from "@/components/ui/bell";
import { SparklesIcon } from "@/components/ui/sparkles";
import { useRef } from "react";

// Automatic hover trigger on button
<Button variant="ghost" size="icon" className="size-8" aria-label="Alerts">
  <BellIcon size={16} />
</Button>

// Programmatically triggered on save or background sync
export function SyncIndicator({ isSyncing }: { isSyncing: boolean }) {
  const sparklesRef = useRef<SparklesIconHandle>(null);

  useEffect(() => {
    if (isSyncing) sparklesRef.current?.startAnimation();
  }, [isSyncing]);

  return <SparklesIcon ref={sparklesRef} size={16} className="text-primary inline-flex" />;
}
```

## Loading States: Skeletons Over Spinners

Avoid full-page blocking spinners that cause layout shifts. Use `<Skeleton>` components mirroring the exact geometry of incoming content:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}
```

### Inline Button Loading
When an action is underway, retain button dimensions and replace or prefix the icon with `<Spinner>`:

```tsx
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

<Button disabled={isSubmitting} size="sm" className="min-w-24">
  {isSubmitting ? (
    <>
      <Spinner className="mr-2 size-3.5" />
      <span>Saving...</span>
    </>
  ) : (
    "Save Post"
  )}
</Button>
```

## Actionable Empty States

Empty screens must direct users toward their next productive action rather than merely stating absence:

```tsx
import { Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyChannelsView({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Radio className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">No connected channels</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
        Connect social accounts like LinkedIn, X, or YouTube to start planning and publishing content.
      </p>
      <Button onClick={onConnect} size="sm" className="mt-6 gap-2">
        <Plus className="size-4" />
        Connect Channel
      </Button>
    </div>
  );
}
```

## Interactive Tables & Lists

For clickable rows or dense lists:
- Apply `hover:bg-muted/40 transition-colors` on `<tr>` or row containers.
- Retain hover indication across entire row bounds, keeping actions pinned on the trailing edge.
- Keep selection checkboxes keyboard-operable with clear focus states.

## Completion Criteria

Interactive design is verified when:
- [ ] Every clickable control exposes distinct idle, hover, focus-visible, active, and disabled styles.
- [ ] Keyboard navigation (Tab, Enter, Space, Escape) reliably accesses and closes all interactive elements.
- [ ] Loading views render layout-stable skeletons matching target component dimensions.
- [ ] Transitions complete within 200ms and respect `motion-reduce:transition-none`.
- [ ] Dynamic text updates and numeric counters use `<TextMorph>` for place-value animations without layout shift.
- [ ] Interactive highlights, nav items, and notification triggers utilize `@lucide-animated` icons sized proportionally (`size={16}` / `size={20}`).
- [ ] Empty states contain an icon, a descriptive sentence, and a primary action trigger.
