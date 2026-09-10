import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

/**
 * Root container for user or entity avatar presentation.
 *
 * Provides an accessible circular container wrapping an image and its fallback representation.
 * Constrains layout dimensions to a fixed size with overflow clipping and standard border styling.
 *
 * @param className - Optional CSS class overrides for dimensions, borders, or shape.
 * @param props - Native Radix Avatar root properties forwarded to the container element.
 * @param ref - Forwarded DOM reference to the root `span` element.
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="/user.png" alt="User profile" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Image component for the avatar with automatic loading lifecycle handling.
 *
 * Renders the image asset maintaining square aspect ratio and cover fit.
 * Remains hidden until the source image successfully loads, allowing the fallback to display seamlessly.
 *
 * @param className - Additional styling classes for the image element.
 * @param src - Source URL string for the avatar graphic.
 * @param alt - Accessible textual description of the image content.
 * @param props - Additional Radix Avatar Image properties forwarded to the underlying `img` element.
 * @param ref - Forwarded DOM reference to the HTML `img` element.
 */
export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square size-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Fallback representation displayed when avatar image is missing, loading, or fails to load.
 *
 * Renders initials, monograms, or placeholder icons centered within the circular boundary
 * using a muted background and monospace typography.
 *
 * @param className - Class overrides for background color, typography, or alignment.
 * @param delayMs - Optional delay in milliseconds before displaying the fallback to prevent flash of content.
 * @param props - Additional Radix Avatar Fallback properties forwarded to the element.
 * @param ref - Forwarded DOM reference to the fallback `span` element.
 */
export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex size-full items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
