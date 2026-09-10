import React, { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Configuration properties for the `GlideMenu` component.
 */
export interface GlideMenuProps {
  /** Menu content containing rows selectable by hover/focus. */
  children: ReactNode;
  /** Optional class name applied to the outer wrapper container. */
  className?: string;
  /** Class name customizing highlight pill appearance (e.g. background, borders, radius). Defaults to `inset-x-0 rounded-[8px] bg-hover`. */
  highlightClassName?: string;
  /** Selector used to identify target items for highlight alignment. Defaults to `[data-menu-row]`. */
  rowSelector?: string;
}

/**
 * Wraps interactive menu lists with a smooth gliding background indicator pill
 * that tracks hovered or focused items matching `rowSelector`.
 *
 * Features & Mechanics:
 * - Listens for `mouseOver` and `focusCapture` events to identify target items.
 * - Measures target row bounding rect relative to container and slides highlight with cubic-bezier easing.
 * - Handles `mouseLeave` and `blurCapture` to fade out highlight when focus/pointer moves outside.
 *
 * @param props - Children, styling classes, and row selector.
 * @returns Rendered container element with sliding highlight pill.
 */
export function GlideMenu({
  children,
  className = '',
  highlightClassName = 'inset-x-0 rounded-[8px] bg-hover',
  rowSelector = '[data-menu-row]',
}: GlideMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);

  /**
   * Moves the highlight box to encompass the closest row element matching `rowSelector`.
   *
   * @param target - Event target from mouse movement or focus event.
   */
  const moveTo = (target: EventTarget | null) => {
    const container = ref.current;
    if (!(target instanceof Element) || !container) return;
    const row = target.closest(rowSelector);
    if (!(row instanceof HTMLElement) || !container.contains(row)) return;
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setBox({ top: rowRect.top - containerRect.top, height: rowRect.height });
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      onMouseOver={(event) => moveTo(event.target)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={(event) => moveTo(event.target)}
      onBlurCapture={(event) => {
        if (!ref.current?.contains(event.relatedTarget as Node | null)) setVisible(false);
      }}
      className={cn('group/glide-menu relative', className)}
    >
      <span
        aria-hidden
        className={cn('pointer-events-none absolute transition-[top,height,opacity]', highlightClassName)}
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: box && visible ? 1 : 0,
          transition:
            'top 200ms cubic-bezier(0.23,1,0.32,1), height 200ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease',
        }}
      />
      {children}
    </div>
  );
}

export default GlideMenu;
