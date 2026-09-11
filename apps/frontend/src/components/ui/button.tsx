import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * Props for configuring the interactive Button component.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * When true, delegates rendering to its child element using Radix Slot composition,
   * merging styles and props onto the child (e.g. Next.js Link or custom anchor tags).
   * @defaultValue `false`
   */
  asChild?: boolean;
  /**
   * Visual style variant representing intent, hierarchy, or visual weight.
   * @defaultValue `'default'`
   */
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  /**
   * Size presets configuring height, padding, typography, and icon dimensions.
   * @defaultValue `'default'`
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Mapping of visual intent variants to corresponding Tailwind token classes.
 */
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline:
    'border border-border bg-background hover:bg-muted hover:text-foreground',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted hover:text-foreground',
  link: 'text-foreground underline-offset-4 hover:underline',
};

/**
 * Mapping of button size presets to layout and padding classes.
 */
const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8 text-base',
  icon: 'size-9',
};

/**
 * Core interactive button component supporting multiple variants, sizes, and slot composition.
 *
 * Handles focus-visible rings, disabled opacity/pointer states, active micro-scaling,
 * and standard SVG icon sizing. When `asChild` is enabled, delegates rendering to the direct child.
 *
 * @param className - Optional CSS class overrides merged with computed variant and size styles.
 * @param variant - Visual style variant determining color and hover treatment.
 * @param size - Size preset determining dimensions, padding, and text scale.
 * @param asChild - When true, delegates rendering to child via Radix Slot.
 * @param props - Standard HTML button attributes forwarded to the underlying element.
 * @param ref - Forwarded DOM reference to the HTML button or slot element.
 *
 * @example
 * ```tsx
 * <Button variant="outline" size="sm" onClick={handleSave}>
 *   Save Changes
 * </Button>
 *
 * <Button asChild variant="ghost" size="icon">
 *   <a href="/settings" aria-label="Settings"><SettingsIcon /></a>
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
