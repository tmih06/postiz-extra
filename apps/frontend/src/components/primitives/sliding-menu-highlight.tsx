'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Configuration properties for the `SlidingMenuHighlight` component.
 */
export interface SlidingMenuHighlightProps {
  /** React ref attached to the scrollable or portalled menu container whose items are tracked. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** CSS selector identifying selectable items within the container. Defaults to `[data-dropdown-item]`. */
  itemSelector?: string;
  /** Optional additional CSS class names applied to the motion highlight element. */
  className?: string;
}

/**
 * Coordinate and dimension bounding box for positioning the sliding highlight pill.
 */
interface TargetBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Renders a physics-spring gliding highlight pill behind active items inside dropdown menus and selects.
 *
 * Feature & Architecture:
 * - Detects active item changes via direct pointer tracking and a `MutationObserver` watching Radix UI
 *   `data-highlighted` and checked state attributes on menu items.
 * - Supports mouse hover, touch interaction, and keyboard arrow key navigation seamlessly.
 * - Computes relative bounding coordinates within the menu container, accounting for scroll offsets and padding.
 * - Applies a spring-based physics transition on subsequent item transitions while snapping instantly on first entry.
 * - Adheres to Beautiful UI theme tokens (`var(--hover)` and `var(--line-soft)`) matching the sidebar navigation glide.
 *
 * @param props - Target container ref, custom item selector, and optional styling overrides.
 * @returns An absolute motion-animated highlight element rendered behind menu items.
 */
export function SlidingMenuHighlight({
  containerRef,
  itemSelector = '[data-dropdown-item]',
  className,
}: SlidingMenuHighlightProps) {
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isFirstEntryRef = useRef(true);

  const updateBox = useCallback(
    (item: HTMLElement | null) => {
      const container = containerRef.current;
      if (!container || !item) {
        setIsVisible(false);
        isFirstEntryRef.current = true;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      setTargetBox({
        top: itemRect.top - containerRect.top + container.scrollTop,
        left: itemRect.left - containerRect.left + container.scrollLeft,
        width: itemRect.width,
        height: itemRect.height,
      });
      setIsVisible(true);
    },
    [containerRef]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const findItemUnderPointer = (clientX: number, clientY: number): HTMLElement | null => {
      const el = document.elementFromPoint(clientX, clientY);
      return el?.closest<HTMLElement>(itemSelector) ?? null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const item = findItemUnderPointer(e.clientX, e.clientY);
      if (item && container.contains(item)) {
        updateBox(item);
        isFirstEntryRef.current = false;
      }
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
      isFirstEntryRef.current = true;
    };

    // Watch for Radix attribute changes (e.g. data-highlighted when using keyboard or mouse)
    const observer = new MutationObserver(() => {
      const highlighted = container.querySelector<HTMLElement>(
        `${itemSelector}[data-highlighted], [data-highlighted]`
      );
      if (highlighted && container.contains(highlighted)) {
        updateBox(highlighted);
        isFirstEntryRef.current = false;
      } else {
        const anyHovered = container.querySelector<HTMLElement>(`${itemSelector}:hover`);
        if (anyHovered) {
          updateBox(anyHovered);
          isFirstEntryRef.current = false;
        }
      }
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['data-highlighted'],
      subtree: true,
    });

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Initial check on mount in case an item is pre-highlighted by Radix or hovered
    const initial = container.querySelector<HTMLElement>(
      `${itemSelector}[data-highlighted], ${itemSelector}:hover`
    );
    if (initial) {
      updateBox(initial);
    }

    return () => {
      observer.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [containerRef, itemSelector, updateBox]);

  return (
    <motion.div
      aria-hidden
      className={cn(
        'pointer-events-none absolute z-0 rounded-[6px] border shadow-xs',
        className
      )}
      style={{
        backgroundColor: 'var(--hover)',
        borderColor: 'var(--line-soft)',
      }}
      initial={false}
      animate={{
        top: targetBox?.top ?? 0,
        left: targetBox?.left ?? 0,
        width: targetBox?.width ?? 0,
        height: targetBox?.height ?? 0,
        opacity: isVisible && targetBox ? 1 : 0,
        scale: isVisible && targetBox ? 1 : 0.96,
      }}
      transition={{
        top: isFirstEntryRef.current
          ? { duration: 0 }
          : { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 },
        left: isFirstEntryRef.current
          ? { duration: 0 }
          : { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 },
        width: isFirstEntryRef.current
          ? { duration: 0 }
          : { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 },
        height: isFirstEntryRef.current
          ? { duration: 0 }
          : { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 },
        opacity: { duration: 0.14, ease: 'easeOut' },
        scale: { type: 'spring', stiffness: 400, damping: 28 },
      }}
    />
  );
}

export default SlidingMenuHighlight;
