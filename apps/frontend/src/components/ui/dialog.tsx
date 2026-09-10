import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Root state container managing open/closed state and keyboard focus trap for modal dialogs.
 * Direct alias for Radix Dialog `Root`.
 */
export const Dialog = DialogPrimitive.Root;

/**
 * Interactive button or element that toggles the dialog open state on click.
 * Direct alias for Radix Dialog `Trigger`.
 */
export const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Portals dialog overlay and content to the document body to prevent stacking context clipping.
 * Direct alias for Radix Dialog `Portal`.
 */
export const DialogPortal = DialogPrimitive.Portal;

/**
 * Element that closes the dialog when triggered.
 * Direct alias for Radix Dialog `Close`.
 */
export const DialogClose = DialogPrimitive.Close;

/**
 * Fullscreen backdrop overlay behind the active modal dialog.
 *
 * Implements backdrop blur and darkened background token with fade in/out animation transitions.
 *
 * @param className - Optional styling class overrides.
 * @param props - Radix Dialog Overlay properties.
 * @param ref - Forwarded DOM reference to the overlay element.
 */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Centered modal dialog content card with automated backdrop rendering, zoom/fade animations, and dismiss button.
 *
 * Traps focus, handles Escape key dismissals, and renders a top-right close icon.
 *
 * @param className - Class overrides for modal dimensions, layout grid, or paddings.
 * @param children - Modal body contents (typically DialogHeader, form fields, DialogFooter).
 * @param props - Radix Dialog Content properties.
 * @param ref - Forwarded DOM reference to the modal container element.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild><Button>Open Dialog</Button></DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Edit Profile</DialogTitle>
 *       <DialogDescription>Update account preferences here.</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter><Button type="submit">Save</Button></DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Header section of a dialog containing title and description elements with responsive alignment.
 *
 * @param className - Class overrides for header alignment and spacing.
 * @param props - HTML div attributes forwarded to the header container.
 */
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col gap-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Footer action container positioned at the bottom of the dialog.
 *
 * Stacks action buttons vertically on mobile screens and aligns them to the right on desktop views.
 *
 * @param className - Class overrides for action alignment.
 * @param props - HTML div attributes forwarded to the footer container.
 */
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Accessible title heading for the dialog.
 *
 * Automatically announces itself as the modal's primary label for screen readers via aria-labelledby.
 *
 * @param className - Class overrides for typography or text colors.
 * @param props - Radix Dialog Title properties.
 * @param ref - Forwarded DOM reference to the title heading element.
 */
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Accessible description paragraph providing secondary explanatory text for the dialog modal.
 *
 * Linked to the dialog container via aria-describedby for accessibility.
 *
 * @param className - Class overrides for description text styles.
 * @param props - Radix Dialog Description properties.
 * @param ref - Forwarded DOM reference to the description element.
 */
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
