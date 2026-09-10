import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Root context container for custom select dropdowns built on Radix Select.
 *
 * Manages open/closed state, selected value, focus trapping, and ARIA listbox accessibility.
 * Supports both controlled (`value`, `onValueChange`) and uncontrolled (`defaultValue`) modes.
 *
 * @example
 * ```tsx
 * <Select value={role} onValueChange={setRole}>
 *   <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="admin">Admin</SelectItem>
 *     <SelectItem value="member">Member</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
export const Select = SelectPrimitive.Root;

/**
 * Groups related {@link SelectItem} options under an accessible section.
 *
 * Typically paired with {@link SelectLabel} to categorize options within large lists.
 */
export const SelectGroup = SelectPrimitive.Group;

/**
 * Renders the active selection value or a fallback placeholder inside {@link SelectTrigger}.
 *
 * Automatically updates text content when a {@link SelectItem} is chosen.
 */
export const SelectValue = SelectPrimitive.Value;

/**
 * Interactive trigger button that toggles the select dropdown menu.
 *
 * Displays the current value, truncates overflowing text with `line-clamp-1`, renders a trailing
 * chevron icon, and handles keyboard interactions (Space, Enter, Arrow keys).
 *
 * @param className - Optional CSS classes for custom sizing, background, or borders.
 * @param children - Trigger content, usually {@link SelectValue}.
 * @param props - Radix Trigger props forwarded to the button element.
 * @param ref - Forwarded ref to the underlying HTML button element.
 * @returns Styled select trigger button.
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * Scroll control button appearing at the top of the select viewport when options overflow upwards.
 *
 * Automatically managed by Radix Select primitive during mouse hover or keyboard scrolling.
 *
 * @param className - Optional CSS classes.
 * @param props - Radix ScrollUpButton props.
 * @param ref - Forwarded ref.
 * @returns Scroll up indicator button.
 */
export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

/**
 * Scroll control button appearing at the bottom of the select viewport when options overflow downwards.
 *
 * Automatically managed by Radix Select primitive during mouse hover or keyboard scrolling.
 *
 * @param className - Optional CSS classes.
 * @param props - Radix ScrollDownButton props.
 * @param ref - Forwarded ref.
 * @returns Scroll down indicator button.
 */
export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

/**
 * Floating popover container holding the selectable listbox items.
 *
 * Portalled to `document.body` to avoid parent clipping/overflow issues. Configured by default
 * with `position="popper"` for floating alignment, dynamic viewport sizing, and animated
 * entrance/exit transitions (`animate-in`, `zoom-in-95`, directional slide).
 *
 * @param className - Optional CSS classes for custom dimensions or padding.
 * @param children - Group, Item, Label, and Separator children.
 * @param position - Positioning strategy: 'popper' (default) or 'item-aligned'.
 * @param props - Remaining Radix Content props.
 * @param ref - Forwarded ref to the content container.
 * @returns Portalled select dropdown content.
 */
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/**
 * Non-interactive label heading for grouping items within {@link SelectGroup}.
 *
 * @param className - Optional CSS classes.
 * @param props - Radix Label props.
 * @param ref - Forwarded ref.
 * @returns Styled group header label.
 */
export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/**
 * Selectable item option within {@link SelectContent}.
 *
 * Includes keyboard navigation support, focus highlighting (`focus:bg-accent`), disabled state
 * handling, and an absolute right-aligned checkmark indicator when selected.
 *
 * @param value - Unique string value assigned to this option.
 * @param disabled - Optional boolean to disable selection of this option.
 * @param className - Optional CSS classes.
 * @param children - Display label or custom JSX rendered inside the option.
 * @param props - Radix Item props.
 * @param ref - Forwarded ref.
 * @returns Styled select item element.
 */
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/**
 * Visual separator divider line placed between select options or groups.
 *
 * @param className - Optional CSS classes.
 * @param props - Radix Separator props.
 * @param ref - Forwarded ref.
 * @returns Styled separator rule.
 */
export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
