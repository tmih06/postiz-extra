# shadcn/ui Library Utilization

Guide for composing, extending, and structuring UI using shadcn/ui components, Radix primitives, and Tailwind CSS.

## Component Inventory & Aliases

In this workspace, shadcn primitives are located in `@/components/ui/*`, and utility helpers in `@/lib/utils`:

- **Actions**: `Button`, `DropdownMenu`
- **Form Controls**: `Input`, `Field`, `Label`
- **Containers**: `Card`, `Separator`
- **Overlays**: `Dialog`, `Sheet` (Radix Dialog / Popover)
- **Feedback & Loading**: `Skeleton`, `Spinner`, `Alert`, `Badge`, `Avatar`
- **Text Morphing**: `TextMorph` from `torph/react` (numeric counters, rolling values, and animated label transitions)
- **Animated Icons**: `@lucide-animated` primitives installed via `bun x --bun shadcn add @lucide-animated/<icon>` into `@/components/ui/<icon>.tsx`
- **Utility**: `cn(...inputs)` from `@/lib/utils`

## Core Composition Patterns

### 1. Slot Architecture & `asChild`
Radix primitives allow delegating DOM rendering to child elements via the `asChild` prop. Use this to render router links or custom anchors as styled buttons without invalid nested anchor tags:

```tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Correct: Link element styled with Button variant
<Button asChild variant="outline" size="sm">
  <Link to="/posts/new">
    Create Post
  </Link>
</Button>

// Avoid: Nested button inside link or link inside button
<Link to="/posts/new">
  <Button>Create Post</Button>
</Link>
```

### 2. Card Anatomy
Always structure complex content using the full Card primitive set rather than placing all markup inside a generic card wrapper:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

<Card className="border-border bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-base font-medium">Channel Settings</CardTitle>
    <CardDescription className="text-xs text-muted-foreground">
      Configure auto-publishing schedule for LinkedIn.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4 text-sm">
    {/* Main interactive content */}
  </CardContent>
  <CardFooter className="flex justify-between border-t border-border pt-4">
    <Button variant="ghost" size="sm">Reset</Button>
    <Button size="sm">Save Changes</Button>
  </CardFooter>
</Card>
```

### 3. Accessible Dialogs & Overlays
Modals must supply an accessible title and description to comply with screen reader requirements. If visually omitted, use `className="sr-only"`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Channel</DialogTitle>
      <DialogDescription>
        This action cannot be undone. All scheduled posts for this channel will be unassigned.
      </DialogDescription>
    </DialogHeader>
    {/* Body content */}
    <DialogFooter className="gap-2 sm:gap-0">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Form Fields & Validation States
Compose form fields using `Field`, `Label`, and `Input`. Express validation states with `aria-invalid` and `data-invalid`:

```tsx
<div className="space-y-1.5">
  <Label htmlFor="post-title" className="text-xs font-medium text-foreground">
    Post Title
  </Label>
  <Input
    id="post-title"
    placeholder="Enter title..."
    aria-invalid={Boolean(errors.title)}
    className={cn(
      "h-9 text-sm",
      errors.title && "border-destructive focus-visible:ring-destructive"
    )}
  />
  {errors.title && (
    <p className="text-xs text-destructive font-medium">
      {errors.title.message}
    </p>
  )}
</div>
```
### 5. Animated Text with TextMorph
Compose `TextMorph` inside `Button`, `Badge`, and `Card` components for fluid numeric and label transitions:

```tsx
import { TextMorph } from "torph/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Morphing metrics inside a Card
<Card className="border-border bg-card">
  <CardContent className="p-4">
    <span className="text-xs text-muted-foreground">Active Followers</span>
    <TextMorph as="div" className="text-2xl font-bold font-mono tracking-tight text-foreground">
      {followersCount.toLocaleString("en")}
    </TextMorph>
  </CardContent>
</Card>

// Morphing status badge
<Badge variant="secondary" className="font-mono text-xs">
  <TextMorph duration={150}>
    {statusLabel}
  </TextMorph>
</Badge>
```


### 6. Animated Icons (@lucide-animated)
Use animated Lucide icons for interactive highlights, buttons, and nav bars. Add individual animated icons via the shadcn CLI:

```bash
bun x --bun shadcn add @lucide-animated/<icon-name>
# Examples:
bun x --bun shadcn add @lucide-animated/bell
bun x --bun shadcn add @lucide-animated/sparkles
bun x --bun shadcn add @lucide-animated/layers
bun x --bun shadcn add @lucide-animated/settings
```

#### Basic Usage (Auto-Hover)
Icons animate automatically on mouse enter:

```tsx
import { BellIcon } from "@/components/ui/bell";
import { Button } from "@/components/ui/button";

<Button variant="ghost" size="icon" className="size-8" aria-label="Notifications">
  <BellIcon size={16} />
</Button>
```

#### Programmatic Control via Ref
Control animation timing on events (e.g. new post queued, sync finished, alert triggered):

```tsx
import { BellIcon, type BellIconHandle } from "@/components/ui/bell";
import { useRef } from "react";

export function NotificationCenter() {
  const bellRef = useRef<BellIconHandle>(null);

  const onNewAlert = () => {
    bellRef.current?.startAnimation();
  };

  return (
    <button onClick={onNewAlert} className="p-2">
      <BellIcon ref={bellRef} size={18} />
    </button>
  );
}
```
## Styling & Variant Hygiene

- **Class Merging**: Always use `cn()` from `@/lib/utils` when combining base classes with dynamic expressions:
  ```tsx
  import { cn } from "@/lib/utils";

  <div className={cn(
    "flex items-center gap-2 rounded-md border border-border p-3 transition-colors",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
  )} />
  ```
- **Spacing**: Use flex containers with `gap-*` (`gap-2`, `gap-3`, `gap-4`). Avoid `space-x-*` or `space-y-*` inside flex containers to prevent layout collisions with conditional children.
- **Icons**: Import icons from `lucide-react`. Use proportional sizing (`size-4` for 16px, `size-5` for 20px) and pass them as JSX elements:
  ```tsx
  import { Calendar, Plus } from "lucide-react";

  <Button size="sm" className="gap-2">
    <Plus className="size-4" />
    <span>Schedule</span>
  </Button>
  ```

## Anti-Patterns & Solutions

| Anti-Pattern | Correct Approach |
|---|---|
| Hand-rolling custom `div` buttons with `onClick` | Use `<Button variant="..." size="...">` with proper keyboard focus |
| Hardcoding raw color overrides (`bg-black text-white hover:bg-zinc-800`) | Use semantic variants (`variant="default"`) |
| Writing custom loading spinners inside buttons | Compose `<Button disabled><Spinner className="size-4 mr-2" /> Saving...</Button>` |
| Stacking overlays with arbitrary `z-50`, `z-[999]` | Let Dialog, Sheet, and Popover manage their own stacking layers |
| Inlining multi-condition string concatenations | Use `cn("base-classes", condition && "active-class")` |

## Completion Criteria

Library utilization is complete when:
- [ ] All interactive buttons, inputs, dialogs, and cards reuse existing shadcn primitives from `@/components/ui/`.
- [ ] Router navigation leverages `asChild` on buttons instead of nested buttons/links.
- [ ] Conditional class styling is routed through `cn()` without redundant or conflicting utility classes.
- [ ] Modals and sheets include accessible Title and Description nodes.
- [ ] Animated icons are installed via `bun x --bun shadcn add @lucide-animated/<icon>` with proportional sizing (`size={16}` for inline/buttons, `size={20}` for cards).
